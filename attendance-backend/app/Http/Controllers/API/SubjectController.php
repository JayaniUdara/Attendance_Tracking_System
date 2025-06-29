<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index()
    {
        $subjects = Subject::all();
        return response()->json($subjects);
    }

    public function store(Request $request)
    {
        $request->validate([
            'subject_code' => 'required|unique:subjects',
            'subject_name' => 'required|string|max:255',
            'description' => 'nullable|string'
        ]);

        $subject = Subject::create($request->all());

        return response()->json([
            'success' => true,
            'subject' => $subject
        ], 201);
    }
}