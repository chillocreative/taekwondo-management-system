<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\FeeSetting;

class Student extends Model
{
    use HasFactory;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($student) {
            if (empty($student->no_siri)) {
                $student->no_siri = self::generateNoSiri();
            }
        });

        // When a student is deleted, also delete the associated child record
        static::deleting(function ($student) {
            // Delete associated child record using query builder to avoid infinite loop
            // while still triggering database cascades (monthly payments, etc.)
            $student->child()->delete();
        });
    }


    /**
     * Generate unique No Siri with year prefix (ANZ260001, ANZ260002, ..., ANZ270001, ...)
     * Format: ANZ{YY}{XXXX} where YY = last 2 digits of year, XXXX = running number
     */
    public static function generateNoSiri(): string
    {
        $currentYear = date('Y');
        $yearSuffix = substr($currentYear, -2); // Get last 2 digits (e.g., "26" for 2026)
        $prefix = 'ANZ' . $yearSuffix;
        
        // Find the last student with the same year prefix
        $lastStudent = self::where('no_siri', 'LIKE', $prefix . '%')
            ->orderBy('no_siri', 'desc')
            ->first();
        
        if ($lastStudent && preg_match('/^ANZ\d{2}(\d+)$/', $lastStudent->no_siri, $matches)) {
            $nextNumber = intval($matches[1]) + 1;
        } else {
            $nextNumber = 1;
        }

        // Format: ANZ260001, ANZ260002, etc.
        return $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    protected $fillable = [
        'no_siri',
        'nama_pelajar',
        'nama_penjaga',
        'alamat',
        'no_tel',
        'kategori',
        'status_bayaran',
        'tarikh_kemaskini',
    ];

    protected $casts = [
        'tarikh_kemaskini' => 'datetime',
        'status_bayaran' => 'integer',
    ];

    /**
     * Get the monthly fee based on category from settings
     */
    public function getMonthlyFeeAttribute(): float
    {
        // Check if special center (Sek Ren Islam Bahrul Ulum)
        if ($this->child && $this->child->trainingCenter && 
            $this->child->trainingCenter->name === 'Sek Ren Islam Bahrul Ulum') {
            return 0.00;
        }

        $feeSetting = FeeSetting::current();
        
        // Map kategori to age-based fee setting
        // 'kanak-kanak' maps to below_18, 'dewasa' maps to above_18
        return $this->kategori === 'kanak-kanak' 
            ? (float) $feeSetting->monthly_fee_below_18 
            : (float) $feeSetting->monthly_fee_above_18;
    }

    /**
     * Get the total payment for the year
     */
    public function getTotalPaymentAttribute(): float
    {
        // If we have detailed payments loaded or available, use them
        if ($this->relationLoaded('payments') || $this->payments()->exists()) {
            return (float) $this->payments()->sum('total');
        }
        
        // Fallback to old calculation (though this might be inaccurate if mixed categories)
        return (float) ($this->monthly_fee * $this->status_bayaran);
    }

    /**
     * Get the outstanding amount (12 months - paid months)
     */
    public function getOutstandingMonthsAttribute(): int
    {
        return max(0, 12 - $this->status_bayaran);
    }

    /**
     * Get the outstanding amount in RM
     */
    public function getOutstandingAmountAttribute(): int
    {
        return $this->monthly_fee * $this->outstanding_months;
    }

    /**
     * Scope for filtering by category
     */
    public function scopeByCategory($query, $category)
    {
        if ($category) {
            return $query->where('kategori', $category);
        }
        return $query;
    }

    /**
     * Get the payments for the student
     */
    public function payments()
    {
        return $this->hasMany(StudentPayment::class);
    }

    /**
     * Get the linked child profile
     */
    public function child()
    {
        return $this->hasOne(Child::class);
    }

    /**
     * Get the attendance records for the student
     */
    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Scope for searching
     */
    public function scopeSearch($query, $search)
    {
        if ($search) {
            return $query->where(function($q) use ($search) {
                $q->where('nama_pelajar', 'like', "%{$search}%")
                  ->orWhere('no_siri', 'like', "%{$search}%")
                  ->orWhere('nama_penjaga', 'like', "%{$search}%")
                  ->orWhere('no_tel', 'like', "%{$search}%");
            });
        }
        return $query;
    }
}
