<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Child extends Model
{
    use HasFactory;

    protected static function boot()
    {
        parent::boot();

        // When a child is deleted, also delete the associated student record
        static::deleting(function ($child) {
            // Delete associated student record using query builder to avoid infinite loop
            $child->student()->delete();
        });
    }

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
        'payment_slip',
        'guardian_name',
        'guardian_occupation',
        'guardian_ic_number',
        'guardian_age',
        'guardian_phone',
        'address',
        'postcode',
        'city',
        'state',
        'phone_number',
        'school_name',
        'school_class',
        'registration_type',
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
     * Get monthly payments for this child
     */
    public function monthlyPayments()
    {
        return $this->hasMany(MonthlyPayment::class);
    }

    /**
     * Get the belt level in Bahasa Malaysia
     */
    public function getBeltLevelMalayAttribute(): string
    {
        $levels = [
            'white' => 'Putih (Gred 9)',
            'yellow_1' => 'Kuning 1 (Gred 8)',
            'yellow_2' => 'Kuning 2 (Gred 7)',
            'green_1' => 'Hijau 1 (Gred 6)',
            'green_2' => 'Hijau 2 (Gred 5)',
            'blue_1' => 'Biru 1 (Gred 4)',
            'blue_2' => 'Biru 2 (Gred 3)',
            'red_1' => 'Merah 1 (Gred 2)',
            'red_2' => 'Merah 2 (Gred 1)',
            'poom_1' => '1st Poom',
            'poom_2' => '2nd Poom',
            'dan_1' => '1st DAN',
            'dan_2' => '2nd DAN',
            'dan_3' => '3rd DAN',
            // Legacy/Fallback mapping
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

    /**
     * Get the age based on date of birth
     */
    public function getAgeAttribute()
    {
        return $this->date_of_birth ? $this->date_of_birth->age : null;
    }
}
