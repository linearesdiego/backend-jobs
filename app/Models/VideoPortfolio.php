<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VideoPortfolio extends Model
{
    protected $fillable = [
        'title',
        'description',
        'video_url',
        'published_at',
        'provider_id',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    // Relationships
    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }
}
