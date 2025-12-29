<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingCenter extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'contact_number',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get users registered at this training center
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Scope to get only active training centers
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
