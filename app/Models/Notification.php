<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'title',
        'message',
        'is_read',
        'user_id',
        'child_id',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function child()
    {
        return $this->belongsTo(Child::class);
    }

    /**
     * Create a new user registration notification
     */
    public static function createRegistrationNotification($user)
    {
        return self::create([
            'type' => 'registration',
            'title' => 'Pendaftaran Baharu',
            'message' => $user->name . ' telah mendaftar sebagai pengguna baharu',
            'user_id' => $user->id,
        ]);
    }

    /**
     * Create a payment received notification
     */
    public static function createPaymentPaidNotification($child)
    {
        return self::create([
            'type' => 'payment_paid',
            'title' => 'Pembayaran Diterima',
            'message' => $child->name . ' telah membuat pembayaran yuran tahunan',
            'child_id' => $child->id,
        ]);
    }

    /**
     * Create monthly fee payment notification
     */
    public static function createMonthlyFeeNotification($studentName, $month)
    {
        return self::create([
            'type' => 'payment_paid',
            'title' => 'Bayaran Yuran Bulanan',
            'message' => "Bayaran yuran bulan $month telah diterima untuk $studentName",
        ]);
    }

    /**
     * Create absent warning notification
     */
    public static function createAbsentNotification($studentName)
    {
        return self::create([
            'type' => 'absent', // Ensure frontend handles 'absent' color or fallback
            'title' => 'Amaran Kehadiran',
            'message' => "$studentName tidak hadir ke kelas 3 kali berturut-turut.",
        ]);
    }

    /**
     * Get time ago string
     */
    public function getTimeAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }
}
