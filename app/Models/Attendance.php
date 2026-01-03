<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'coach_id',
        'training_center_id',
        'attendance_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'attendance_date' => 'date',
    ];

    /**
     * Get the student that owns the attendance
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the coach who marked the attendance
     */
    public function coach()
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    /**
     * Get the training center where attendance was taken
     */
    public function trainingCenter()
    {
        return $this->belongsTo(TrainingCenter::class);
    }
}
