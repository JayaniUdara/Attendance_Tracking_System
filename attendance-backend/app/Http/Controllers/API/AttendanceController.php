<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function markAttendance(Request $request)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'attendances' => 'required|array',
            'date' => 'required|date',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.status' => 'required|in:present,absent,late',
            'attendances.*.remarks' => 'nullable|string'
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->attendances as $attendanceData) {
                Attendance::updateOrCreate(
                    [
                        'student_id' => $attendanceData['student_id'],
                        'subject_id' => $request->subject_id,
                        'attendance_date' => $request->date
                    ],
                    [
                        'status' => $attendanceData['status'],
                        'marked_time' => now(),
                        'remarks' => $attendanceData['remarks'] ?? null
                    ]
                );
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Attendance marked successfully'
        ]);
    }

    public function getAttendanceReport(Request $request)
    {
        $request->validate([
            'subject_id' => 'nullable|exists:subjects,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'student_search' => 'nullable|string'
        ]);
    
        // Default date range: one week before to today
        $startDate = $request->start_date ?? Carbon::now()->subWeek()->format('Y-m-d');
        $endDate = $request->end_date ?? Carbon::now()->format('Y-m-d');
    
        $query = Student::query()
            ->select([
                'students.id',
                'students.registration_number',
                'students.name',
                'students.email'
            ])
            ->when($request->subject_id, function ($q) use ($request) {
                $q->whereHas('subjects', function ($subQuery) use ($request) {
                    $subQuery->where('subject_id', $request->subject_id);
                });
            })
            ->when($request->student_search, function ($q) use ($request) {
                $search = $request->student_search;
                $q->where(function ($subQuery) use ($search) {
                    $subQuery->where('registration_number', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            });
    
        $students = $query->get();
    
        // Calculate attendance percentage for each student
        $studentsWithAttendance = $students->map(function ($student) use ($startDate, $endDate, $request) {
            $attendanceQuery = Attendance::where('student_id', $student->id)
                ->whereBetween('attendance_date', [$startDate, $endDate]);
    
            // Get subject information
            $subjectName = 'All Subjects';
            if ($request->subject_id) {
                $attendanceQuery->where('subject_id', $request->subject_id);
                $subject = Subject::find($request->subject_id);
                $subjectName = $subject ? $subject->subject_name : 'Unknown Subject';
            }
    
            $totalClasses = $attendanceQuery->count();
            $presentClasses = $attendanceQuery->where('status', 'present')->count();
            $lateClasses = $attendanceQuery->where('status', 'late')->count();
    
            $attendancePercentage = $totalClasses > 0 
                ? round((($presentClasses + $lateClasses) / $totalClasses) * 100, 2)
                : 0;
    
            return [
                'id' => $student->id,
                'registration_number' => $student->registration_number,
                'name' => $student->name,
                'email' => $student->email,
                'subject_name' => $subjectName, // Added this field
                'total_classes' => $totalClasses,
                'attended_classes' => $presentClasses + $lateClasses, // Changed from present_classes
                'present_classes' => $presentClasses,
                'late_classes' => $lateClasses,
                'absent_classes' => $totalClasses - $presentClasses - $lateClasses,
                'attendance_percentage' => $attendancePercentage
            ];
        });
    
        return response()->json([
            'success' => true,
            'data' => $studentsWithAttendance,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'subject_id' => $request->subject_id
            ]
        ]);
    }

    public function getAttendanceForDate(Request $request)
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'date' => 'required|date'
        ]);

        $attendances = Attendance::where('subject_id', $request->subject_id)
            ->where('attendance_date', $request->date)
            ->get(['student_id', 'status']);

        return response()->json($attendances);
    }


}