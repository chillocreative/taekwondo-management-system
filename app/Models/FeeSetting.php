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
        'renewal_fee_gup',
        'renewal_fee_black_poom',
    ];

    protected $casts = [
        'yearly_fee_below_18' => 'decimal:2',
        'yearly_fee_above_18' => 'decimal:2',
        'monthly_fee_below_18' => 'decimal:2',
        'monthly_fee_above_18' => 'decimal:2',
        'renewal_fee_gup' => 'decimal:2',
        'renewal_fee_black_poom' => 'decimal:2',
    ];

    /**
     * Get the current fee settings
     */
    public static function current()
    {
        return self::first() ?? self::create([
            'yearly_fee_below_18' => 100.00,
            'yearly_fee_above_18' => 200.00,
            'monthly_fee_below_18' => 40.00,
            'monthly_fee_above_18' => 60.00,
            'renewal_fee_gup' => 30.00,
            'renewal_fee_black_poom' => 50.00,
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
     * Calculate renewal fee based on belt level
     */
    public function getRenewalFeeByBelt($beltLevel)
    {
        $gupLevels = [
            'white', 'yellow_1', 'yellow_2', 'green_1', 'green_2', 
            'blue_1', 'blue_2', 'red_1', 'red_2'
        ];
        
        $blackPoomLevels = [
            'poom_1', 'poom_2', 'dan_1', 'dan_2', 'dan_3'
        ];

        if (in_array($beltLevel, $gupLevels)) {
            return $this->renewal_fee_gup;
        }

        if (in_array($beltLevel, $blackPoomLevels)) {
            return $this->renewal_fee_black_poom;
        }

        return $this->renewal_fee_gup; // Default
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
