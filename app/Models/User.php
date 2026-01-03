<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'phone_number',
        'address',
        'email',
        'password',
        'role',
        'training_center_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the training center this user belongs to
     */
    public function trainingCenter()
    {
        return $this->belongsTo(TrainingCenter::class);
    }

    /**
     * Get the children of this parent user
     */
    public function children()
    {
        return $this->hasMany(Child::class, 'parent_id');
    }

    /**
     * Check if user is admin
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is coach
     */
    public function isCoach(): bool
    {
        return $this->role === 'coach';
    }

    /**
     * Check if user is regular user/parent
     */
    public function isUser(): bool
    {
        return $this->role === 'user';
    }
}
