<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobTitle extends Model
{
    protected $fillable = [
        'name',
        'description',
    ];

    // Relationships
    public function providers()
    {
        return $this->hasMany(Provider::class);
    }
}
