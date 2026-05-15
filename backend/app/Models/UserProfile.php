<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'full_name',
        'gender',
        'age',
        'plan_type',
        'subscription_status',
        'subscription_started_at',
        'subscription_expires_at',
    ];

    protected $casts = [
        'age' => 'integer',
        'subscription_started_at' => 'datetime',
        'subscription_expires_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
