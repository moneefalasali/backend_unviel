<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnalyzeVideoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'video' => 'required_without:video_file|string',
            'video_file' => 'required_without:video|file|mimetypes:video/mp4,video/quicktime,video/webm,video/ogg|max:102400',
        ];
    }
}
