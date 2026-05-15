<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AnalysisController extends Controller
{
    public function analyzeImage(Request $request)
    {
        $request->validate(['image' => 'required|string']);

        $hiveResult = null;
        $aiorResult = null;

        if (!empty($this->getHiveAuthToken())) {
            $hiveResult = $this->detectImageWithHive($request->image);
        }

        if (!empty($this->getAiorNotApiKey())) {
            $aiorResult = $this->detectImageWithAiorNot($request->image);
        }

        if ($hiveResult && $aiorResult && $this->isValidDetectionResult($hiveResult) && $this->isValidDetectionResult($aiorResult)) {
            return response()->json($this->combineDetectionResults($hiveResult, $aiorResult, 'image'));
        }

        if ($hiveResult && $this->isValidDetectionResult($hiveResult)) {
            return response()->json($hiveResult);
        }

        if ($aiorResult && $this->isValidDetectionResult($aiorResult)) {
            return response()->json($aiorResult);
        }

        if ($aiorResult && !empty($aiorResult['explanation'])) {
            return response()->json($aiorResult, 400);
        }

        if ($hiveResult && !empty($hiveResult['explanation'])) {
            return response()->json($hiveResult, 400);
        }

        return response()->json([
            'error' => 'Image detection service is not configured or failed. Set HIVE_API_KEY or AIORNOT_API_KEY in backend/.env.',
        ], 500);
    }

    public function analyzeText(Request $request)
    {
        $request->validate(['text' => 'required|string']);

        $hiveResult = null;
        $aiorResult = null;

        if (!empty($this->getHiveAuthToken())) {
            $hiveResult = $this->detectTextWithHive($request->text);
        }

        if (!empty($this->getAiorNotApiKey())) {
            $aiorResult = $this->detectTextWithAiorNot($request->text);
        }

        if ($hiveResult && $aiorResult && $this->isValidDetectionResult($hiveResult) && $this->isValidDetectionResult($aiorResult)) {
            return response()->json($this->combineDetectionResults($hiveResult, $aiorResult, 'text'));
        }

        if ($hiveResult && $this->isValidDetectionResult($hiveResult)) {
            return response()->json($hiveResult);
        }

        if ($aiorResult && $this->isValidDetectionResult($aiorResult)) {
            return response()->json($aiorResult);
        }

        if ($aiorResult && !empty($aiorResult['explanation'])) {
            return response()->json($aiorResult, 400);
        }

        if ($hiveResult && !empty($hiveResult['explanation'])) {
            return response()->json($hiveResult, 400);
        }

        return response()->json([
            'type' => 'text',
            'classification' => 'Unknown',
            'ai_percentage' => 0,
            'human_percentage' => 0,
            'confidence' => 0,
            'explanation' => 'Text detection service is not configured or failed. Set HIVE_API_KEY or AIORNOT_API_KEY in backend/.env.',
        ], 500);
    }

    public function analyzeAudio(Request $request)
    {
        $request->validate(['audio' => 'required|string']);

        $hiveResult = null;
        $aiorResult = null;

        if (!empty($this->getHiveAuthToken())) {
            $hiveResult = $this->detectAudioWithHive($request->audio);
        }

        if (!empty($this->getAiorNotApiKey())) {
            $aiorResult = $this->detectAudioWithAiorNot($request->audio);
        }

        if ($hiveResult && $aiorResult && $this->isValidDetectionResult($hiveResult) && $this->isValidDetectionResult($aiorResult)) {
            return response()->json($this->combineDetectionResults($hiveResult, $aiorResult, 'audio'));
        }

        if ($hiveResult && $this->isValidDetectionResult($hiveResult)) {
            return response()->json($hiveResult);
        }

        if ($aiorResult && $this->isValidDetectionResult($aiorResult)) {
            return response()->json($aiorResult);
        }

        if ($aiorResult && !empty($aiorResult['explanation'])) {
            return response()->json($aiorResult, 400);
        }

        if ($hiveResult && !empty($hiveResult['explanation'])) {
            return response()->json($hiveResult, 400);
        }

        return response()->json([
            'error' => 'Audio detection service is not configured or failed. Set HIVE_API_KEY or AIORNOT_API_KEY in backend/.env.',
        ], 500);
    }

    public function analyzeVideo(Request $request)
    {
        $videoData = null;

        if ($request->hasFile('video')) {
            $videoFile = $request->file('video');
            if (!$videoFile->isValid()) {
                return response()->json(['error' => 'Uploaded video file is invalid.'], 400);
            }
            $videoData = base64_encode(file_get_contents($videoFile->getRealPath()));
        } else {
            $request->validate(['video' => 'required|string']);
            $videoData = $request->input('video');
        }

        if (empty($videoData)) {
            return response()->json(['error' => 'Video content is required.'], 400);
        }

        $hiveResult = null;
        $aiorResult = null;

        if (!empty($this->getHiveAuthToken())) {
            $hiveResult = $this->detectVideoWithHive($videoData);
        }

        if (!empty($this->getAiorNotApiKey())) {
            $aiorResult = $this->detectVideoWithAiorNot($videoData);
        }

        if ($hiveResult && $aiorResult && $this->isValidDetectionResult($hiveResult) && $this->isValidDetectionResult($aiorResult)) {
            return response()->json($this->combineDetectionResults($hiveResult, $aiorResult, 'video'));
        }

        if ($hiveResult && $this->isValidDetectionResult($hiveResult)) {
            return response()->json($hiveResult);
        }

        if ($aiorResult && $this->isValidDetectionResult($aiorResult)) {
            return response()->json($aiorResult);
        }

        if ($aiorResult && !empty($aiorResult['explanation'])) {
            return response()->json($aiorResult, 400);
        }

        if ($hiveResult && !empty($hiveResult['explanation'])) {
            return response()->json($hiveResult, 400);
        }

        return response()->json([
            'error' => 'Video detection service is not configured or failed. Set HIVE_API_KEY or AIORNOT_API_KEY in backend/.env.',
        ], 500);
    }

    public function analyzeSocialPost(Request $request)
    {
        $request->validate(['url' => 'required|url']);
        $url = $request->url;

        $platform = $this->detectPlatform($url);
        if (!$platform) {
            return response()->json(['error' => 'Unsupported platform'], 400);
        }

        $content = $this->fetchSocialContent($url);
        if (!$content) {
            return response()->json(['error' => 'Unable to extract post content from the provided URL.'], 422);
        }

        $result = $this->detectText($content);

        return response()->json(array_merge([
            'platform' => $platform,
            'post_type' => 'text',
            'source_url' => $url,
        ], $result));
    }

    public function submitHiveTaskAsync(Request $request)
    {
        $request->validate([
            'url' => 'required_without:text_data|nullable|url',
            'text_data' => 'required_without:url|nullable|string',
            'callback_url' => 'nullable|url',
            'metadata' => 'nullable|string',
        ]);

        if (empty($this->getHiveAuthToken())) {
            return response()->json([
                'error' => 'Hive API key is not configured. Set HIVE_API_KEY in backend/.env.',
            ], 500);
        }

        $payload = [];
        if ($request->filled('url')) {
            $payload['url'] = $request->url;
        }
        if ($request->filled('text_data')) {
            $payload['text_data'] = $request->text_data;
        }
        if ($request->filled('callback_url')) {
            $payload['callback_url'] = $request->callback_url;
        }
        if ($request->filled('metadata')) {
            $payload['metadata'] = $request->metadata;
        }

        $response = Http::withHeaders([
            'authorization' => 'token ' . $this->getHiveAuthToken(),
            'accept' => 'application/json',
            'content-type' => 'application/json',
        ])->asJson()->post('https://api.thehive.ai/api/v2/task/async', $payload);

        return response()->json($response->json(), $response->status());
    }

    public function getHiveTaskSummary(Request $request)
    {
        $request->validate([
            'task_id' => 'required|string',
            'frame_offset' => 'nullable|integer|min:0',
            'frame_limit' => 'nullable|integer|min:1',
        ]);

        if (empty($this->getHiveAuthToken())) {
            return response()->json([
                'error' => 'Hive API key is not configured. Set HIVE_API_KEY in backend/.env.',
            ], 500);
        }

        $query = [
            'task_id' => $request->task_id,
        ];

        if ($request->filled('frame_offset')) {
            $query['frame_offset'] = $request->frame_offset;
        }
        if ($request->filled('frame_limit')) {
            $query['frame_limit'] = $request->frame_limit;
        }

        $response = Http::withHeaders([
            'authorization' => 'token ' . $this->getHiveAuthToken(),
            'accept' => 'application/json',
        ])->get('https://api.thehive.ai/api/v2/task', $query);

        return response()->json($response->json(), $response->status());
    }

    public function getConnectedPosts()
    {
        return response()->json([
            [
                'id' => '1',
                'platform' => 'Twitter/X',
                'content' => 'Just finished a great project using AI tools! #innovation',
                'created_at' => now()->subHours(2)->toDateTimeString(),
                'text_ai_percentage' => 15,
                'image_ai_percentage' => 0,
                'overall_ai_probability' => 15,
                'human_probability' => 85,
                'classification' => 'Human Generated',
                'confidence' => 0.95
            ],
            [
                'id' => '2',
                'platform' => 'LinkedIn',
                'content' => 'The future of work is changing rapidly with the advent of large language models.',
                'created_at' => now()->subDays(1)->toDateTimeString(),
                'text_ai_percentage' => 88,
                'image_ai_percentage' => 0,
                'overall_ai_probability' => 88,
                'human_probability' => 12,
                'classification' => 'Likely AI Generated',
                'confidence' => 0.88
            ],
            [
                'id' => '3',
                'platform' => 'Instagram',
                'content' => 'Beautiful sunset today! #nature #photography',
                'created_at' => now()->subDays(2)->toDateTimeString(),
                'text_ai_percentage' => 5,
                'image_ai_percentage' => 92,
                'overall_ai_probability' => 48,
                'human_probability' => 52,
                'classification' => 'Mixed Content',
                'confidence' => 0.75
            ]
        ]);
    }

    private function detectPlatform($url)
    {
        if (Str::contains($url, ['twitter.com', 'x.com'])) return 'Twitter/X';
        if (Str::contains($url, 'linkedin.com')) return 'LinkedIn';
        if (Str::contains($url, 'instagram.com')) return 'Instagram';
        return null;
    }

    private function detectText(string $text): array
    {
        if (!empty($this->getHiveAuthToken())) {
            $result = $this->detectTextWithHive($text);
            if (empty($result['error']) || empty($this->getAiorNotApiKey())) {
                return $result;
            }
        }

        if (!empty($this->getAiorNotApiKey())) {
            return $this->detectTextWithAiorNot($text);
        }

        return [
            'type' => 'text',
            'classification' => 'Unknown',
            'ai_percentage' => 0,
            'human_percentage' => 0,
            'confidence' => 0,
            'explanation' => 'Text detection service is not configured. Set HIVE_API_KEY or AIORNOT_API_KEY.',
        ];
    }

    private function isValidDetectionResult(array $result): bool
    {
        return empty($result['error']) && isset($result['ai_percentage'], $result['confidence'], $result['classification']);
    }

    private function combineDetectionResults(array $primary, array $secondary, string $mediaType): array
    {
        $primaryAi = $primary['ai_percentage'] ?? 0;
        $secondaryAi = $secondary['ai_percentage'] ?? 0;
        $primaryHuman = $primary['human_percentage'] ?? max(0, 100 - $primaryAi);
        $secondaryHuman = $secondary['human_percentage'] ?? max(0, 100 - $secondaryAi);
        $primaryConfidence = $primary['confidence'] ?? 0;
        $secondaryConfidence = $secondary['confidence'] ?? 0;

        $combinedAi = round(($primaryAi + $secondaryAi) / 2, 2);
        $combinedHuman = round(($primaryHuman + $secondaryHuman) / 2, 2);
        $combinedConfidence = round(max($primaryConfidence, $secondaryConfidence), 2);
        $classification = $combinedAi > 50 ? 'AI-generated' : 'Human-written';

        $explanation = 'Combined analysis from Hive and AIorNot. ';
        $explanation .= $classification === 'AI-generated'
            ? 'Both services indicate a higher probability of AI generation.'
            : 'Both services indicate a lower probability of AI generation.';

        return [
            'type' => $mediaType,
            'classification' => $classification,
            'ai_percentage' => $combinedAi,
            'human_percentage' => $combinedHuman,
            'confidence' => $combinedConfidence,
            'explanation' => $explanation,
            'analysis_source' => 'Hive+AIorNot',
            'primary_service' => $primary['service'] ?? 'Hive',
            'secondary_service' => $secondary['service'] ?? 'AIorNot',
            'service_results' => [
                [
                    'service' => $primary['service'] ?? 'Hive',
                    'result' => $primary,
                ],
                [
                    'service' => $secondary['service'] ?? 'AIorNot',
                    'result' => $secondary,
                ],
            ],
        ];
    }

    private function detectTextWithHive(string $text): array
    {
        $apiKey = $this->getHiveAuthToken();
        try {
            $response = Http::withHeaders([
                'authorization' => 'token ' . $apiKey,
                'accept' => 'application/json',
                'content-type' => 'application/json',
            ])->asJson()->post('https://api.thehive.ai/api/v2/task/sync', [
                'text_data' => $text,
            ]);
        } catch (\Exception $e) {
            return [
                'service' => 'Hive',
                'type' => 'text',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'Unable to reach Hive AI service: ' . $e->getMessage(),
                'error' => true,
            ];
        }

        if ($response->failed()) {
            return [
                'service' => 'Hive',
                'type' => 'text',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'Unable to reach Hive AI service: ' . $response->body(),
                'error' => true,
            ];
        }

        $data = $response->json();
        $result = $data['result'] ?? [];

        if (empty($result)) {
            return [
                'service' => 'Hive',
                'type' => 'text',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'Hive AI returned no results.',
                'error' => true,
            ];
        }

        // Parse Hive AI response for text detection
        $aiScore = 0;
        $confidence = 0;

        foreach ($result as $modelResult) {
            if (isset($modelResult['ai_generated_probability'])) {
                $aiScore = round($modelResult['ai_generated_probability'] * 100, 2);
                $confidence = $modelResult['confidence'] ?? $aiScore / 100;
                break;
            }
        }

        return [
            'service' => 'Hive',
            'type' => 'text',
            'classification' => $aiScore > 50 ? 'AI-generated' : 'Human-written',
            'ai_percentage' => $aiScore,
            'human_percentage' => round(100 - $aiScore, 2),
            'confidence' => round($confidence * 100, 2),
            'explanation' => 'Analysis completed using Hive AI.',
        ];
    }

    private function getAiorNotApiKey(): string
    {
        return trim(env('AIORNOT_API_KEY', ''));
    }

    private function detectImageWithAiorNot(string $dataUrl): array
    {
        $apiKey = $this->getAiorNotApiKey();
        if (empty($apiKey)) {
            return [
                'type' => 'image',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'AIorNot API key is not configured. Set AIORNOT_API_KEY in backend/.env.',
            ];
        }

        try {
            $response = Http::withToken($apiKey, 'Bearer')
                ->attach('image', $this->decodeDataUrl($dataUrl), 'image.jpg')
                ->post('https://api.aiornot.com/v2/image/sync');
        } catch (\Exception $e) {
            return [
                'service' => 'AIorNot',
                'type' => 'image',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'Unable to reach AIorNot service: ' . $e->getMessage(),
                'error' => true,
            ];
        }

        if ($response->failed()) {
            return [
                'service' => 'AIorNot',
                'type' => 'image',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'Unable to reach AIorNot service: ' . $response->body(),
                'error' => true,
            ];
        }

        return $this->normalizeAiorNotResponse($response->json(), 'image');
    }

    private function detectAudioWithAiorNot(string $dataUrl): array
    {
        $apiKey = $this->getAiorNotApiKey();
        if (empty($apiKey)) {
            return [
                'type' => 'audio',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'AIorNot API key is not configured. Set AIORNOT_API_KEY in backend/.env.',
            ];
        }
        try {
            $response = Http::withToken($apiKey, 'Bearer')
                ->attach('file', $this->decodeDataUrl($dataUrl), 'audio.mp3')
                ->post('https://api.aiornot.com/v1/reports/voice');
        } catch (\Exception $e) {
            return [
                'service' => 'AIorNot',
                'type' => 'audio',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'Unable to reach AIorNot service: ' . $e->getMessage(),
                'error' => true,
            ];
        }

        if ($response->failed()) {
            return [
                'service' => 'AIorNot',
                'type' => 'audio',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'Unable to reach AIorNot service: ' . $response->body(),
                'error' => true,
            ];
        }

        return $this->normalizeAiorNotResponse($response->json(), 'audio');
    }

    private function detectVideoWithAiorNot(string $dataUrl): array
    {
        $apiKey = $this->getAiorNotApiKey();
        if (empty($apiKey)) {
            return [
                'type' => 'video',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'AIorNot API key is not configured. Set AIORNOT_API_KEY in backend/.env.',
            ];
        }
        try {
            $response = Http::withToken($apiKey, 'Bearer')
                ->attach('video', $this->decodeDataUrl($dataUrl), 'video.mp4')
                ->post('https://api.aiornot.com/v2/video/sync');
        } catch (\Exception $e) {
            return [
                'service' => 'AIorNot',
                'type' => 'video',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'Unable to reach AIorNot service: ' . $e->getMessage(),
                'error' => true,
            ];
        }

        if ($response->failed()) {
            return [
                'service' => 'AIorNot',
                'type' => 'video',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'Unable to reach AIorNot service: ' . $response->body(),
                'error' => true,
            ];
        }

        return $this->normalizeAiorNotResponse($response->json(), 'video');
    }

    private function detectTextWithAiorNot(string $text): array
    {
        $apiKey = $this->getAiorNotApiKey();
        if (empty($apiKey)) {
            return [
                'type' => 'text',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'AIorNot API key is not configured. Set AIORNOT_API_KEY in backend/.env.',
            ];
        }
        try {
            $response = Http::withToken($apiKey, 'Bearer')
                ->attach('text', $text)
                ->post('https://api.aiornot.com/v2/text/sync');
        } catch (\Exception $e) {
            return [
                'service' => 'AIorNot',
                'type' => 'text',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'Unable to reach AIorNot service: ' . $e->getMessage(),
                'error' => true,
            ];
        }

        if ($response->failed()) {
            $body = $response->json();
            $details = $response->body();
            if (is_array($body)) {
                $details = $body['message'] ?? $body['error'] ?? json_encode($body);
            }

            return [
                'service' => 'AIorNot',
                'type' => 'text',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'Unable to reach AIorNot service: ' . $details,
                'error' => true,
            ];
        }

        return $this->normalizeAiorNotResponse($response->json(), 'text');
    }

    private function normalizeAiorNotResponse(array $data, string $mediaType): array
    {
        $report = $data['report'] ?? [];
        if (empty($report) || !is_array($report)) {
            return [
                'service' => 'AIorNot',
                'type' => $mediaType,
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'AIorNot returned an unexpected response.',
                'error' => true,
            ];
        }

        $aiGenerated = $report['ai_generated'] ?? null;
        $confidence = 0;
        $aiProbability = 0;

        if (is_array($aiGenerated)) {
            if (isset($aiGenerated['ai']['confidence'])) {
                $aiProbability = floatval($aiGenerated['ai']['confidence']);
                $confidence = max($confidence, $aiProbability);
            }
            if (isset($aiGenerated['human']['confidence'])) {
                $confidence = max($confidence, floatval($aiGenerated['human']['confidence']));
            }
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
            'explanation' => 'Analysis completed using AIorNot fallback service.',
        ];
    }

    private function getHiveAuthToken(): string
    {
        return trim(env('HIVE_API_TOKEN', env('HIVE_API_KEY', env('HIVE_API_SECRET', ''))));
    }

    private function detectAudioWithHive(string $dataUrl): array
    {
        try {
            $response = Http::withHeaders([
                'authorization' => 'token ' . $this->getHiveAuthToken(),
                'accept' => 'application/json',
                'content-type' => 'application/json',
            ])->asJson()->post('https://api.thehive.ai/api/v3/hive/ai-generated-and-deepfake-content-detection', [
                'media_metadata' => true,
                'input' => [
                    ['media_base64' => $dataUrl],
                ],
            ]);
        } catch (\Exception $e) {
            return [
                'service' => 'Hive',
                'type' => 'audio',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'Unable to reach Hive AI service: ' . $e->getMessage(),
                'error' => true,
            ];
        }

        if ($response->failed()) {
            return [
                'service' => 'Hive',
                'type' => 'audio',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'Unable to reach Hive AI service: ' . $response->body(),
                'error' => true,
            ];
        }

        $data = $response->json();
        $parsed = $this->parseHiveMediaResponse($data, 'audio');

        return array_merge([
            'service' => 'Hive',
            'type' => 'audio',
        ], $parsed);
    }

    private function detectVideoWithHive(string $dataUrl): array
    {
        try {
            $response = Http::withHeaders([
                'authorization' => 'token ' . $this->getHiveAuthToken(),
                'accept' => 'application/json',
                'content-type' => 'application/json',
            ])->asJson()->post('https://api.thehive.ai/api/v3/hive/ai-generated-and-deepfake-content-detection', [
                'media_metadata' => true,
                'input' => [
                    ['media_base64' => $dataUrl],
                ],
            ]);
        } catch (\Exception $e) {
            return [
                'service' => 'Hive',
                'type' => 'video',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'Unable to reach Hive AI service: ' . $e->getMessage(),
                'error' => true,
            ];
        }

        if ($response->failed()) {
            return [
                'service' => 'Hive',
                'type' => 'video',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'Unable to reach Hive AI service: ' . $response->body(),
                'error' => true,
            ];
        }

        $data = $response->json();
        $parsed = $this->parseHiveMediaResponse($data, 'video');

        return array_merge([
            'service' => 'Hive',
            'type' => 'video',
        ], $parsed);
    }

    private function detectImageWithHive(string $dataUrl): array
    {
        try {
            $response = Http::withHeaders([
                'authorization' => 'token ' . $this->getHiveAuthToken(),
                'accept' => 'application/json',
                'content-type' => 'application/json',
            ])->asJson()->post('https://api.thehive.ai/api/v3/hive/ai-generated-and-deepfake-content-detection', [
                'media_metadata' => true,
                'input' => [
                    ['media_base64' => $dataUrl],
                ],
            ]);
        } catch (\Exception $e) {
            return [
                'service' => 'Hive',
                'type' => 'image',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'Unable to reach Hive AI service: ' . $e->getMessage(),
                'error' => true,
            ];
        }

        if ($response->failed()) {
            return [
                'service' => 'Hive',
                'type' => 'image',
                'classification' => 'Unknown',
                'ai_percentage' => 0,
                'human_percentage' => 0,
                'confidence' => 0,
                'explanation' => 'Unable to reach Hive AI service: ' . $response->body(),
                'error' => true,
            ];
        }

        $data = $response->json();
        $parsed = $this->parseHiveMediaResponse($data, 'image');

        return array_merge([
            'service' => 'Hive',
            'type' => 'image',
        ], $parsed);
    }

    private function parseHiveMediaResponse(array $data, string $mediaType): array
    {
        $outputs = $data['output'] ?? [];
        $merged = [
            'ai_percentage' => 0,
            'human_percentage' => 0,
            'confidence' => 0,
            'classification' => 'Unknown',
            'explanation' => 'Hive AI returned no results.',
        ];

        if (empty($outputs) || !is_array($outputs)) {
            return $merged;
        }

        $scores = [
            'ai_generated' => [],
            'not_ai_generated' => [],
            'deepfake' => [],
            'ai_generated_audio' => [],
            'not_ai_generated_audio' => [],
        ];

        foreach ($outputs as $output) {
            if (empty($output['classes']) || !is_array($output['classes'])) {
                continue;
            }

            foreach ($output['classes'] as $class) {
                $name = $class['name'] ?? $class['class'] ?? null;
                $confidence = floatval($class['confidence'] ?? $class['value'] ?? 0);

                if (!$name) {
                    continue;
                }

                if (array_key_exists($name, $scores)) {
                    $scores[$name][] = $confidence;
                }
            }
        }

        $aiGenerated = $this->averageScore($scores['ai_generated']);
        $notAiGenerated = $this->averageScore($scores['not_ai_generated']);
        $deepfake = $this->averageScore($scores['deepfake']);
        $aiAudio = $this->averageScore($scores['ai_generated_audio']);
        $notAiAudio = $this->averageScore($scores['not_ai_generated_audio']);

        $aiProbability = max($aiGenerated, $deepfake, $aiAudio);
        $humanProbability = max($notAiGenerated, $notAiAudio, 1 - $aiProbability);
        $classification = 'Real ' . ucfirst($mediaType);

        if ($aiProbability >= 0.5) {
            $classification = $deepfake >= 0.5 && $mediaType !== 'text'
                ? 'Deepfake / AI-generated'
                : 'AI-generated';
        }

        $merged['ai_percentage'] = round($aiProbability * 100, 2);
        $merged['human_percentage'] = round($humanProbability * 100, 2);
        $merged['confidence'] = round(max($aiProbability, $humanProbability) * 100, 2);
        $merged['classification'] = $classification;
        $merged['explanation'] = 'Analysis completed using Hive AI.';

        return $merged;
    }

    private function averageScore(array $scores): float
    {
        if (empty($scores)) {
            return 0.0;
        }

        return array_sum($scores) / count($scores);
    }

    private function fetchSocialContent(string $url): ?string
    {
        try {
            $response = Http::timeout(10)->get($url);
            if ($response->failed()) {
                return null;
            }

            $html = $response->body();
            $title = $this->extractHtmlTag($html, 'title');
            $description = $this->extractMetaTag($html, 'og:description') ?? $this->extractMetaTag($html, 'description');

            if (!$title && !$description) {
                return null;
            }

            return trim($title . '\n' . $description);
        } catch (\Exception $exception) {
            return null;
        }
    }

    private function extractHtmlTag(string $html, string $tag): string
    {
        if (preg_match("/<{$tag}[^>]*>(.*?)<\\/{$tag}>/si", $html, $matches)) {
            return trim(strip_tags($matches[1]));
        }

        return '';
    }

    private function extractMetaTag(string $html, string $name): ?string
    {
        if (preg_match('/<meta[^>]*(?:property|name)=["\']' . preg_quote($name, '/') . '["\'][^>]*content=["\']([^"\']+)["\']/i', $html, $matches)) {
            return trim($matches[1]);
        }

        return null;
    }

    private function decodeDataUrl(string $dataUrl): string
    {
        if (preg_match('/^data:.*?;base64,(.*)$/', $dataUrl, $matches)) {
            return base64_decode($matches[1]);
        }

        // Accept raw base64 strings as well.
        return base64_decode($dataUrl);
    }

    private function extractOpenAIResponseText(array $body): string
    {
        $content = '';

        if (isset($body['output']) && is_array($body['output'])) {
            foreach ($body['output'] as $outputItem) {
                if (!empty($outputItem['content']) && is_array($outputItem['content'])) {
                    foreach ($outputItem['content'] as $contentItem) {
                        if (isset($contentItem['type']) && $contentItem['type'] === 'output_text') {
                            $content .= $contentItem['text'] ?? '';
                        }
                    }
                }
            }
        }

        if (!$content && isset($body['output_text'])) {
            $content = $body['output_text'];
        }

        return trim($content);
    }

    private function parseDetectionResult(string $raw, string $type): array
    {
        $json = $this->extractJson($raw);
        if ($json) {
            return [
                'type' => $type,
                'classification' => $json['classification'] ?? 'Unknown',
                'ai_percentage' => isset($json['ai_percentage']) ? round($json['ai_percentage'], 2) : 0,
                'human_percentage' => isset($json['human_percentage']) ? round($json['human_percentage'], 2) : (100 - ($json['ai_percentage'] ?? 0)),
                'confidence' => $json['confidence'] ?? 0,
                'explanation' => $json['explanation'] ?? 'Detection completed successfully.',
            ];
        }

        $score = $this->guessScoreFromText($raw);
        return [
            'type' => $type,
            'classification' => $score >= 50 ? 'Likely AI Generated' : 'Likely Human Generated',
            'ai_percentage' => $score,
            'human_percentage' => 100 - $score,
            'confidence' => min(max($score / 100, 0), 1),
            'explanation' => 'Detection service returned non-JSON output. Raw response: ' . trim($raw),
        ];
    }

    private function extractJson(string $raw): ?array
    {
        if (preg_match('/\{.*\}/s', $raw, $matches)) {
            $parsed = json_decode($matches[0], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $parsed;
            }
        }

        return null;
    }

    private function guessScoreFromText(string $raw): int
    {
        $raw = strtolower($raw);
        if (strpos($raw, 'ai generated') !== false || strpos($raw, 'ai-generated') !== false) {
            return 90;
        }
        if (strpos($raw, 'likely ai') !== false || strpos($raw, 'probably ai') !== false) {
            return 70;
        }
        if (strpos($raw, 'human generated') !== false || strpos($raw, 'human-written') !== false) {
            return 15;
        }

        return 50;
    }
}
