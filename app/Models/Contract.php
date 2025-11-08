<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    protected $fillable = [
        'start_date',
        'end_date',
        'description',
        'amount',
        'status',
        'hirer_id',
        'provider_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'amount' => 'decimal:2',
    ];

    // Relationships
    public function hirer()
    {
        return $this->belongsTo(Hirer::class);
    }

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function revisions()
    {
        return $this->hasMany(ContractRevision::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }
}
