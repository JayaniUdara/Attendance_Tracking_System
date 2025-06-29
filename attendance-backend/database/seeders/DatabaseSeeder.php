<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Subject;
use App\Models\Student;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@deakin.edu.au',
            'password' => bcrypt('password'),
            'role' => 'admin'
        ]);

        // Create teacher user
        User::create([
            'name' => 'Teacher',
            'email' => 'teacher@deakin.edu.au',
            'password' => bcrypt('password'),
            'role' => 'teacher'
        ]);

        // Create subjects
        $subjects = [
            ['subject_code' => 'CS101', 'subject_name' => 'Introduction to Computer Science'],
            ['subject_code' => 'MATH101', 'subject_name' => 'Calculus I'],
            ['subject_code' => 'ENG101', 'subject_name' => 'English Composition'],
            ['subject_code' => 'PHYS101', 'subject_name' => 'Physics I'],
            ['subject_code' => 'CHEM101', 'subject_name' => 'General Chemistry']
        ];

        foreach ($subjects as $subject) {
            Subject::create($subject);
        }
    }
}