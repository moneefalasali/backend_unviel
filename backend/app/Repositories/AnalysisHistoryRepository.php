<?php

namespace App\Repositories;

use App\Models\AnalysisHistory;
use App\Models\User;

class AnalysisHistoryRepository
{
    public function listForUser(User $user)
    {
        return $user->analysisHistory()->orderBy('created_at', 'desc')->get();
    }

    public function create(array $data): AnalysisHistory
    {
        return AnalysisHistory::create($data);
    }
}
