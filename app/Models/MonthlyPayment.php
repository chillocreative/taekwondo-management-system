<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class MonthlyPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'child_id',
        'year',
        'month',
        'amount',
        'due_date',
        'is_paid',
        'paid_date',
        'payment_method',
        'payment_reference',
        'receipt_number',
    ];

    protected $casts = [
        'is_paid' => 'boolean',
        'due_date' => 'date',
        'paid_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function child()
    {
        return $this->belongsTo(Child::class);
    }

    /**
     * Check if payment is overdue
     */
    public function isOverdue()
    {
        return !$this->is_paid && Carbon::now()->isAfter($this->due_date);
    }

    /**
     * Get status text
     */
    public function getStatusAttribute()
    {
        if ($this->is_paid) {
            return 'Sudah Dibayar';
        }
        
        if ($this->isOverdue()) {
            return 'Tertunggak';
        }

        return 'Belum Dibayar';
    }

    /**
     * Get month name in Malay
     */
    public function getMonthNameAttribute()
    {
        $months = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Mac', 4 => 'April',
            5 => 'Mei', 6 => 'Jun', 7 => 'Julai', 8 => 'Ogos',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Disember'
        ];
        
        return $months[$this->month] ?? '';
    }

    /**
     * Generate monthly payments for a child for the current year
     */
    public static function generateForChild(Child $child, $year = null)
    {
        $year = $year ?? Carbon::now()->year;
        $feeSettings = FeeSetting::current();
        
        // Determine if special center (Sek Ren Islam Bahrul Ulum)
        $isSpecialCenter = $child->trainingCenter && 
                          $child->trainingCenter->name === 'Sek Ren Islam Bahrul Ulum';

        // Get monthly fee based on child's age or special center status
        if ($isSpecialCenter) {
            $monthlyFee = 0;
        } else if ($child->date_of_birth) {
            $monthlyFee = $feeSettings->getMonthlyFeeByDob($child->date_of_birth);
        } else {
            $monthlyFee = $feeSettings->monthly_fee_below_18;
        }

        // Generate for all 12 months
        for ($month = 1; $month <= 12; $month++) {
            // Get last day of the month
            $dueDate = Carbon::create($year, $month, 1)->endOfMonth();
            
            // Create or update monthly payment record
            self::updateOrCreate(
                [
                    'child_id' => $child->id,
                    'year' => $year,
                    'month' => $month,
                ],
                [
                    'amount' => $monthlyFee,
                    'due_date' => $dueDate,
                ]
            );
        }
    }
}
