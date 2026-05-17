<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAnalysisHistoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'media_type' => 'required|string|in:text,image,video,audio',
            'content' => 'required|string|max:2000',
            'result_status' => 'required|string|max:50',
            'confidence_score' => 'required|numeric|min:0|max:100',
            'explanation' => 'nullable|string|max:5000',
            'metadata' => 'nullable|array',
        ];
    }
}
