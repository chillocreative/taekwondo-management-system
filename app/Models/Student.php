<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
    }

    /**
     * Generate unique No Siri (ANZ0001, ANZ0002, ..., ANZ9999, ANZ10000, ...)
     */
    public static function generateNoSiri(): string
    {
        $lastStudent = self::orderBy('id', 'desc')->first();
        
        if ($lastStudent && preg_match('/^ANZ(\d+)$/', $lastStudent->no_siri, $matches)) {
            $nextNumber = intval($matches[1]) + 1;
        } else {
            $nextNumber = 1;
        }

        // Format: ANZ0001 for numbers 1-9999, then ANZ10000, ANZ10001, etc.
        if ($nextNumber <= 9999) {
            return 'ANZ' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        } else {
            return 'ANZ' . $nextNumber;
        }
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
     * Get the monthly fee based on category
     */
    public function getMonthlyFeeAttribute(): int
    {
        return $this->kategori === 'kanak-kanak' ? 30 : 50;
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
