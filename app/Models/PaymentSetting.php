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
    ];

    protected $casts = [
        'is_sandbox' => 'boolean',
        'is_active' => 'boolean',
        'settings' => 'array',
    ];

    /**
     * Get the active payment settings
     */
    public static function getActive()
    {
        return self::where('is_active', true)->first();
    }
}
