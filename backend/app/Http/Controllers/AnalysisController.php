<?php

namespace App\Http\Controllers;

use App\Http\Requests\AnalyzeAudioRequest;
use App\Http\Requests\AnalyzeImageRequest;
use App\Http\Requests\AnalyzeTextRequest;
use App\Http\Requests\AnalyzeVideoRequest;
use App\Http\Resources\AnalysisResultResource;
use App\Jobs\ProcessAnalysisJob;
use App\Services\Detection\AudioDetectionEngine;
use App\Services\Detection\ImageDetectionEngine;
use App\Services\Detection\TextDetectionEngine;
use App\Services\Detection\VideoDetectionEngine;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AnalysisController extends Controller
{
    public function analyzeImage(AnalyzeImageRequest $request)
    {
        $payload = $this->resolveFilePayload($request, 'image', 'image_file');

        $result = (new ImageDetectionEngine())->analyze(['image' => $payload]);

        return response()->json([
            'success' => true,
            'data' => (new AnalysisResultResource($result))->resolve(),
        ]);
    }

    public function analyzeText(AnalyzeTextRequest $request)
    {
        $result = (new TextDetectionEngine())->analyze(['text' => $request->input('text')]);

        return response()->json([
            'success' => true,
            'data' => (new AnalysisResultResource($result))->resolve(),
        ]);
    }

    public function analyzeAudio(AnalyzeAudioRequest $request)
    {
        $payload = $this->resolveFilePayload($request, 'audio', 'audio_file');

        $result = (new AudioDetectionEngine())->analyze(['audio' => $payload]);

        return response()->json([
            'success' => true,
            'data' => (new AnalysisResultResource($result))->resolve(),
        ]);
    }

    public function analyzeVideo(AnalyzeVideoRequest $request)
    {
        $videoPayload = $this->resolveFilePayload($request, 'video', 'video_file');
        $localPath = null;

        if ($request->hasFile('video_file')) {
            $localPath = $request->file('video_file')->getRealPath();
        }

        $result = (new VideoDetectionEngine())->analyze([
            'video' => $videoPayload,
            'local_path' => $localPath,
        ]);

        if (!empty($result['fallback_notice'])) {
            ProcessAnalysisJob::dispatch('video', $videoPayload, null, ['fallback' => true]);
        }

        return response()->json([
            'success' => true,
            'data' => (new AnalysisResultResource($result))->resolve(),
        ]);
    }

    public function analyzeSocialPost(Request $request)
    {
        try {
            $request->validate(['url' => 'required|url']);
            $url = $request->url;
            $platform = $this->detectPlatform($url);
            $content = $this->fetchSocialContent($url);

            if (!$content) {
                return response()->json([
                    'success' => false,
                    'error' => 'Unable to extract content',
                    'message' => 'Could not fetch or parse social media content from the provided URL.',
                ], 422);
            }

            $result = (new TextDetectionEngine())->analyze(['text' => $content]);

            return response()->json([
                'success' => true,
                'data' => array_merge([
                    'platform' => $platform,
                    'post_type' => 'text',
                    'source_url' => $url,
                ], $result),
            ]);
        } catch (\Throwable $e) {
            Log::error('Social Analysis Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Social analysis failed',
                'message' => $e->getMessage(),
            ], $this->httpStatusFromException($e));
        }
    }

    public function getConnectedPosts()
    {
        return response()->json([
            'success' => true,
            'data' => [
                ['id' => '1', 'platform' => 'Twitter/X', 'content' => 'Sample post 1', 'ai_percentage' => 15, 'classification' => 'Human-written'],
                ['id' => '2', 'platform' => 'LinkedIn', 'content' => 'Sample post 2', 'ai_percentage' => 88, 'classification' => 'AI-generated'],
            ],
        ]);
    }

    private function resolveFilePayload(Request $request, string $fieldKey, string $fileKey): ?string
    {
        if ($request->hasFile($fileKey)) {
            return base64_encode(file_get_contents($request->file($fileKey)->getRealPath()));
        }

        return $request->input($fieldKey);
    }

    private function getAiorNotApiKey(): string
    {
        return trim(env('AIORNOT_API_KEY', ''));
    }

    private function detectImageWithAiorNot(string $dataUrl): array
    {
        $apiKey = $this->getAiorNotApiKey();
        $imageData = $this->decodeDataUrl($dataUrl);

        $response = Http::withToken($apiKey, 'Bearer')
            ->timeout(60)
            ->attach('image', $imageData, 'image.jpg')
            ->post('https://api.aiornot.com/v2/image/sync');

        if ($response->failed()) {
            throw new \Exception('AIorNot Image API failed: ' . $response->status() . ' ' . $response->body());
        }

        return $this->normalizeAiorNotResponse($response->json(), 'image');
    }

    private function detectTextWithAiorNot(string $text): array
    {
        $apiKey = $this->getAiorNotApiKey();

        $response = Http::withToken($apiKey, 'Bearer')
            ->timeout(60)
            ->asMultipart()
            ->attach('text', $text)
            ->post('https://api.aiornot.com/v2/text/sync');

        if ($response->failed()) {
            throw new \Exception('AIorNot Text API failed: ' . $response->status() . ' ' . $response->body());
        }

        return $this->normalizeAiorNotResponse($response->json(), 'text');
    }

    private function detectAudioWithAiorNot(string $dataUrl): array
    {
        $apiKey = $this->getAiorNotApiKey();

        $response = Http::withToken($apiKey, 'Bearer')
            ->timeout(60)
            ->attach('audio', $this->decodeDataUrl($dataUrl), 'audio.mp3')
            ->post('https://api.aiornot.com/v2/audio/sync');

        if ($response->failed()) {
            throw new \Exception('AIorNot Audio API failed: ' . $response->status() . ' ' . $response->body());
        }

        return $this->normalizeAiorNotResponse($response->json(), 'audio');
    }

    private function detectVideoWithAiorNot(string $dataUrl): array
    {
        $apiKey = $this->getAiorNotApiKey();

        $response = Http::withToken($apiKey, 'Bearer')
            ->timeout(120)
            ->attach('video', $this->decodeDataUrl($dataUrl), 'video.mp4')
            ->post('https://api.aiornot.com/v2/video/sync');

        if ($response->failed()) {
            throw new \Exception('AIorNot Video API failed: ' . $response->status() . ' ' . $response->body());
        }

        return $this->normalizeAiorNotResponse($response->json(), 'video');
    }

    private function normalizeAiorNotResponse(array $data, string $mediaType): array
    {
        $report = $data['report'] ?? $data;
        $aiProbability = 0;
        $confidence = 0;

        if (isset($report['ai_generated'])) {
            $aiData = $report['ai_generated'];
            $aiProbability = floatval($aiData['ai']['confidence'] ?? $aiData['confidence'] ?? 0);
            $confidence = max($aiProbability, floatval($aiData['human']['confidence'] ?? 0));
        } elseif (isset($report['ai_text'])) {
            $aiProbability = floatval($report['ai_text']['confidence'] ?? 0);
            $confidence = $aiProbability;
        } else {
            $aiProbability = floatval($report['ai_percentage'] ?? $report['ai_score'] ?? 0);
            if ($aiProbability > 1) {
                $aiProbability /= 100;
            }
            $confidence = $aiProbability;
        }

        $aiScore = round($aiProbability * 100, 2);
        $humanScore = round(100 - $aiScore, 2);
        $classification = $aiScore > 50 ? 'AI-generated' : 'Human-written';

        return [
            'service' => 'AIorNot',
            'type' => $mediaType,
            'classification' => $classification,
            'ai_percentage' => $aiScore,
            'human_percentage' => $humanScore,
            'confidence' => round($confidence * 100, 2),
            'explanation' => "Analysis completed. Probability of AI: {$aiScore}%",
            'raw_report' => $report,
        ];
    }

    private function decodeDataUrl(string $dataUrl): string
    {
        if (preg_match('/^data:.*?;base64,(.*)$/', $dataUrl, $matches)) {
            return base64_decode($matches[1]);
        }

        $decoded = base64_decode($dataUrl, true);
        return $decoded !== false ? $decoded : $dataUrl;
    }

    private function httpStatusFromException(\Throwable $exception): int
    {
        if (str_contains($exception->getMessage(), '401')) {
            return 401;
        }
        if (str_contains($exception->getMessage(), '403')) {
            return 403;
        }
        if (str_contains($exception->getMessage(), '422')) {
            return 422;
        }
        return 500;
    }

    private function detectPlatform(string $url): ?string
    {
        $host = parse_url($url, PHP_URL_HOST);
        if (str_contains($host, 'twitter.com') || str_contains($host, 'x.com')) {
            return 'Twitter/X';
        }
        if (str_contains($host, 'linkedin.com')) {
            return 'LinkedIn';
        }
        return 'Social Media';
    }

    private function fetchSocialContent(string $url): ?string
    {
        try {
            $response = Http::timeout(10)->get($url);
            return $response->successful() ? Str::limit(strip_tags($response->body()), 1000) : null;
        } catch (\Exception $e) {
            Log::warning('Social fetch failed: ' . $e->getMessage());
            return null;
        }
    }
}
