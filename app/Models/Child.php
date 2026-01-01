<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Child extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'student_id',
        'training_center_id',
        'name',
        'date_of_birth',
        'ic_number',
        'belt_level',
        'is_active',
        'from_other_club',
        'tm_number',
        'belt_certificate',
        'payment_completed',
        'payment_method',
        'registration_fee',
        'payment_date',
        'payment_reference',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'is_active' => 'boolean',
        'from_other_club' => 'boolean',
        'payment_completed' => 'boolean',
        'payment_date' => 'datetime',
        'registration_fee' => 'decimal:2',
    ];

    /**
     * Get the parent (user) of this child
     */
    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    /**
     * Get the training center of this child
     */
    public function trainingCenter()
    {
        return $this->belongsTo(TrainingCenter::class);
    }

    /**
     * Get the linked student record
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the belt level in Bahasa Malaysia
     */
    public function getBeltLevelMalayAttribute(): string
    {
        $levels = [
            'white' => 'Putih',
            'yellow' => 'Kuning',
            'green' => 'Hijau',
            'blue' => 'Biru',
            'red' => 'Merah',
            'black_1' => 'Hitam 1 Dan',
            'black_2' => 'Hitam 2 Dan',
            'black_3' => 'Hitam 3 Dan',
            'black_4' => 'Hitam 4 Dan',
            'black_5' => 'Hitam 5 Dan',
        ];

        return $levels[$this->belt_level] ?? $this->belt_level;
    }
}
