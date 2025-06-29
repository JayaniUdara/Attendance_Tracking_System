<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\StudentController;
use App\Http\Controllers\API\SubjectController;
use App\Http\Controllers\API\AttendanceController;

Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    
    // Students
    Route::apiResource('students', StudentController::class);
    Route::get('students/by-subject/{subjectId}', [StudentController::class, 'getBySubject']);
    
    // Subjects
    Route::apiResource('subjects', SubjectController::class);
    
    // Attendance
    Route::post('attendance/mark', [AttendanceController::class, 'markAttendance']);
    Route::get('attendance/report', [AttendanceController::class, 'getAttendanceReport']);
    Route::post('/attendance/for-date', [AttendanceController::class, 'getAttendanceForDate']);

});