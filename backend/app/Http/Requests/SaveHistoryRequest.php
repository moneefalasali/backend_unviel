<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveHistoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'media_type' => 'required|string|max:50',
            'content' => 'required|string',
            'result_status' => 'required|string|max:100',
            'confidence_score' => 'required|integer|min:0|max:100',
            'explanation' => 'nullable|string',
            'metadata' => 'nullable|array',
        ];
    }
}
