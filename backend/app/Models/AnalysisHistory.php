<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnalysisHistory extends Model
{
    use HasFactory;

    protected $table = 'analysis_history';

    protected $fillable = [
        'user_id',
        'media_type',
        'content',
        'result_status',
        'confidence_score',
        'explanation',
        'metadata',
    ];

    protected $casts = [
        'confidence_score' => 'integer',
        'metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
