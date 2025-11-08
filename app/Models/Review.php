<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'comment',
        'rating',
        'contract_id',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    // Relationships
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }
}
