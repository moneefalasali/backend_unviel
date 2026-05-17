<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AnalyzeImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => 'required_without:image_file|string',
            'image_file' => 'required_without:image|file|mimetypes:image/jpeg,image/png,image/webp,image/gif|max:10240',
        ];
    }
}
