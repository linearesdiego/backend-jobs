<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProviderPost extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'job_title_id',
        'title',
        'description',
        'video_url',
        'status',
        'published_at'
    ];

    protected $casts = [
        'published_at' => 'datetime'
    ];

    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }

    public function jobTitle()
    {
        return $this->belongsTo(JobTitle::class);
    }
}