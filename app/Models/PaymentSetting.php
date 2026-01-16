<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider',
        'is_sandbox',
        'secret_key',
        'category_code',
        'settings',
        'is_active',
        // Bayarcash
        'bayarcash_access_token',
        'bayarcash_portal_key',
        'bayarcash_is_sandbox',
        'bayarcash_is_active',
        // SenangPay
        'senangpay_merchant_id',
        'senangpay_secret_key',
        'senangpay_is_sandbox',
        'senangpay_is_active',
    ];

    protected $casts = [
        'is_sandbox' => 'boolean',
        'is_active' => 'boolean',
        'settings' => 'array',
        'bayarcash_is_sandbox' => 'boolean',
        'bayarcash_is_active' => 'boolean',
        'senangpay_is_sandbox' => 'boolean',
        'senangpay_is_active' => 'boolean',
    ];

    /**
     * Get the active payment settings
     */
    public static function getActive()
    {
        return self::where('is_active', true)->first();
    }
}
