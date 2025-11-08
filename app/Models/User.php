<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'email_verified_at',
        'username',
        'lastname',
        'phone',
        'address',
        'city',
        'state',
        'zip_code',
        'profile_picture',
        'cover_photo',
        'last_login',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'email_verified_at',
        'last_login',

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
            'last_login' => 'datetime',
        ];
    }

    // Relationships
    public function provider()
    {
        return $this->hasOne(Provider::class);
    }

    public function hirer()
    {
        return $this->hasOne(Hirer::class);
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function sentReviews()
    {
        return $this->hasMany(Review::class, 'sender_id');
    }

    public function receivedReviews()
    {
        return $this->hasMany(Review::class, 'receiver_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function sentContractRevisions()
    {
        return $this->hasMany(ContractRevision::class, 'sender_id');
    }

    public function receivedContractRevisions()
    {
        return $this->hasMany(ContractRevision::class, 'receiver_id');
    }
}
