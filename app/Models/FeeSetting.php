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

    /**
     * Sync updated fees with existing unpaid records
     */
    public function syncWithExistingRecords()
    {
        // 1. Update MonthlyPayment records for all children who haven't paid yet
        $unpaidMonthlyPayments = MonthlyPayment::where('is_paid', false)->get();
        foreach ($unpaidMonthlyPayments as $mp) {
            $child = $mp->child;
            if (!$child) continue;

            // Check if special center (Sek Ren Islam Bahrul Ulum)
            $isSpecialCenter = $child->trainingCenter && 
                              $child->trainingCenter->name === 'Sek Ren Islam Bahrul Ulum';

            if ($isSpecialCenter) {
                $newAmount = 0;
            } else {
                $newAmount = $this->getMonthlyFeeByDob($child->date_of_birth);
            }

            if ($mp->amount != $newAmount) {
                $mp->update(['amount' => $newAmount]);
            }
        }

        // 2. Update registration_fee for children who haven't completed registration payment
        $unpaidChildren = Child::where('payment_completed', false)->get();
        foreach ($unpaidChildren as $child) {
            $newRegFee = $this->getYearlyFeeByDob($child->date_of_birth);
            if ($child->registration_fee != $newRegFee) {
                $child->update(['registration_fee' => $newRegFee]);
            }
        }
    }
}
