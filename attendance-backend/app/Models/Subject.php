<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Student;
use App\Models\Attendance;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_code',
        'subject_name',
        'description'
    ];

    public function students()
{
    return $this->belongsToMany(Student::class, 'student_subjects');
}


    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }
}