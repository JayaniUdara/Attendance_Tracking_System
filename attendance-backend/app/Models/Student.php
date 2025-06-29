<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Attendance;
use App\Models\Subject;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'registration_number',
        'name',
        'email',
        'phone',

    ];

    protected $casts = [
        'date_of_birth' => 'date'
    ];

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'student_subjects');
    }


    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function getFullNameAttribute()
    {
        return $this->first_name . ' ' . $this->last_name;
    }
}