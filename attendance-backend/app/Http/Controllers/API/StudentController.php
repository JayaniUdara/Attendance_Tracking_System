<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    public function index()
    {
        $students = Student::with(['subjects' => function ($query) {
            $query->select('subjects.id', 'subject_name'); 
        }])->get();
        
        // Ensure student_subjects is working
        return response()->json($students);
        
    }

    public function store(Request $request)
    {
        $request->validate([
            'registration_number' => 'required|unique:students',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:students',
            'phone' => 'nullable|string|max:15',
            'subject_ids' => 'required|array|min:3|max:5',
            'subject_ids.*' => 'exists:subjects,id'
        ]);

        DB::transaction(function () use ($request) {
            $student = Student::create($request->except('subject_ids'));
            $student->subjects()->attach($request->subject_ids);
        });

        return response()->json([
            'success' => true,
            'message' => 'Student registered successfully'
        ], 201);
    }

    public function show($id)
    {
        $student = Student::with('subjects')->findOrFail($id);
        return response()->json($student);
    }

    public function getBySubject($subjectId)
    {
        $students = Student::whereHas('subjects', function ($query) use ($subjectId) {
            $query->where('subject_id', $subjectId);
        })->get();

        return response()->json($students);
    }
}