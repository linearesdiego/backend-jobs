<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContractRevision extends Model
{
    protected $fillable = [
        'sender_id',
        'receiver_id',
        'description',
        'amount',
        'status',
        'provider_signature_hash',
        'hirer_signature_hash',
        'provider_signed',
        'hirer_signed',
        'contract_id',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'provider_signed' => 'boolean',
        'hirer_signed' => 'boolean',
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
