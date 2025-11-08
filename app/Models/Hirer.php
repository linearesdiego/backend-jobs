<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hirer extends Model
{
    protected $fillable = [
        'cover_letter',
        'user_id',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }
}
