<?php

namespace App\Services\Detection;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIOrNotService
{
    private string $apiKey;
    private string $endpoint = 'https://api.aiornot.com/v2';

    public function __construct()
    {
        $this->apiKey = trim(config('services.aiornot.key') ?? env('AIORNOT_API_KEY', ''));
    }

    public function analyzeText(string $text): array
    {
        return $this->handleResponse(
            $this->sendMultipartRequest('text/sync', ['text' => $text]),
            'text'
        );
    }

    public function analyzeImage(string $imageBase64): array
    {
        return $this->handleResponse(
            $this->sendMultipartRequest('image/sync', ['image' => $this->decodeBase64($imageBase64)]),
            'image'
        );
    }

    public function analyzeAudio(string $audioBase64): array
    {
        return $this->handleResponse(
            $this->sendMultipartRequest('audio/sync', ['audio' => $this->decodeBase64($audioBase64)]),
            'audio'
        );
    }

    public function analyzeVideo(string $videoBase64): array
    {
        return $this->handleResponse(
            $this->sendMultipartRequest('video/sync', ['video' => $this->decodeBase64($videoBase64)]),
            'video'
        );
    }

    private function sendMultipartRequest(string $path, array $payload): array
    {
        if (empty($this->apiKey)) {
            throw new \RuntimeException('AIorNot API key is not configured.');
        }

        $request = Http::withToken($this->apiKey)
            ->timeout(120)
            ->acceptJson()
            ->asMultipart();

        foreach ($payload as $field => $value) {
            $filename = match ($field) {
                'image' => 'image.png',
                'audio' => 'audio.mp3',
                'video' => 'video.mp4',
                default => 'payload.txt',
            };

            $request = $request->attach($field, $value, $filename);
        }

        $response = $request->post("{$this->endpoint}/{$path}");

        if ($response->failed()) {
            $payload = $response->json() ?? [];
            $message = $payload['message'] ?? $payload['error'] ?? $response->body();
            $code = $response->status();

            Log::warning('AIorNot API request failed', ['path' => $path, 'status' => $code, 'response' => $payload]);

            if ($code === 403 || str_contains(strtolower($message), 'ai_video')) {
                throw new \RuntimeException('AI video model disabled or not available.');
            }

            throw new \RuntimeException("AIorNot request failed ({$code}): {$message}");
        }

        return $response->json() ?? [];
    }

    private function handleResponse(array $payload, string $mediaType): array
    {
        $report = Arr::get($payload, 'report', $payload);
        $normal = $this->normalizeReport($report, $mediaType);

        return array_merge($normal, [
            'service_name' => 'AIorNot',
            'raw_report' => $report,
        ]);
    }

    private function normalizeReport(array $report, string $mediaType): array
    {
        $aiValue = $this->firstNumeric($report, [
            'ai_generated.ai.confidence',
            'ai_text.confidence',
            'ai_percentage',
            'ai_score',
            'confidence',
        ]);

        $aiPercent = min(max(round($aiValue * 100, 2), 0), 100);
        if ($aiPercent === 0 && isset($report['ai_percentage'])) {
            $aiPercent = min(max(round(floatval($report['ai_percentage']), 2), 0), 100);
        }

        $humanPercent = max(0, 100 - $aiPercent);
        $classification = $aiPercent >= 50 ? 'AI-generated' : 'Human-written';
        $confidence = max($aiPercent, $humanPercent);

        return [
            'classification' => $classification,
            'ai_percentage' => $aiPercent,
            'human_percentage' => $humanPercent,
            'confidence' => $confidence,
            'explanation' => "{$mediaType} analysis returned {$aiPercent}% AI likelihood.",
        ];
    }

    private function firstNumeric(array $data, array $paths): float
    {
        foreach ($paths as $path) {
            $value = Arr::get($data, $path);
            if ($value !== null && is_numeric($value)) {
                return floatval($value);
            }
            if (is_string($value) && is_numeric(trim($value))) {
                return floatval(trim($value));
            }
        }

        return 0.0;
    }

    private function decodeBase64(string $payload): string
    {
        if (preg_match('/^data:.*;base64,(.*)$/', $payload, $matches)) {
            return base64_decode($matches[1]);
        }

        $decoded = base64_decode($payload, true);

        return $decoded !== false ? $decoded : $payload;
    }
}
