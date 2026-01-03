<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeeSetting extends Model
{
    protected $fillable = [
        'yearly_fee_below_18',
        'yearly_fee_above_18',
        'monthly_fee_below_18',
        'monthly_fee_above_18',
    ];

    protected $casts = [
        'yearly_fee_below_18' => 'decimal:2',
        'yearly_fee_above_18' => 'decimal:2',
        'monthly_fee_below_18' => 'decimal:2',
        'monthly_fee_above_18' => 'decimal:2',
    ];

    /**
     * Get the current fee settings
     */
    public static function current()
    {
        return self::first() ?? self::create([
            'yearly_fee_below_18' => 100.00,
            'yearly_fee_above_18' => 200.00,
            'monthly_fee_below_18' => 30.00,
            'monthly_fee_above_18' => 50.00,
        ]);
    }

    /**
     * Calculate yearly fee based on age
     */
    public function getYearlyFee($age)
    {
        return $age < 18 ? $this->yearly_fee_below_18 : $this->yearly_fee_above_18;
    }

    /**
     * Calculate monthly fee based on age
     */
    public function getMonthlyFee($age)
    {
        return $age < 18 ? $this->monthly_fee_below_18 : $this->monthly_fee_above_18;
    }

    /**
     * Calculate yearly fee based on date of birth
     */
    public function getYearlyFeeByDob($dateOfBirth)
    {
        $age = \Carbon\Carbon::parse($dateOfBirth)->age;
        return $this->getYearlyFee($age);
    }

    /**
     * Calculate monthly fee based on date of birth
     */
    public function getMonthlyFeeByDob($dateOfBirth)
    {
        $age = \Carbon\Carbon::parse($dateOfBirth)->age;
        return $this->getMonthlyFee($age);
    }
}
