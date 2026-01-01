<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'month',
        'kategori',
        'quantity',
        'amount',
        'total',
        'receipt_number',
        'transaction_ref',
        'payment_method',
        'status',
        'payment_date',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'amount' => 'decimal:2',
        'total' => 'decimal:2',
        'payment_date' => 'datetime',
    ];

    /**
     * Get the student that owns the payment
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
