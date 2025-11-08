<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Provider extends Model
{
    protected $fillable = [
        'cover_letter',
        'cover_video_url',
        'hourly_rate',
        'years_experience',
        'user_id',
        'job_title_id',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function jobTitle()
    {
        return $this->belongsTo(JobTitle::class);
    }

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }

    public function videoPortfolios()
    {
        return $this->hasMany(VideoPortfolio::class);
    }
}
