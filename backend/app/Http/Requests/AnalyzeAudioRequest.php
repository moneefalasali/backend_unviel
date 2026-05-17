<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnalyzeAudioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'audio' => 'required_without:audio_file|string',
            'audio_file' => 'required_without:audio|file|mimetypes:audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/x-wav|max:51200',
        ];
    }
}
