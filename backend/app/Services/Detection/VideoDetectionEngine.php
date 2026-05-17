<?php

namespace App\Services\Detection;

use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

class VideoDetectionEngine implements DetectionEngineInterface
{
    private AIOrNotService $aiService;
    private HeuristicEngine $heuristic;
    private ConfidenceEngine $confidence;
    private ExplainabilityEngine $explainability;

    public function __construct()
    {
        $this->aiService = new AIOrNotService();
        $this->heuristic = new HeuristicEngine();
        $this->confidence = new ConfidenceEngine();
        $this->explainability = new ExplainabilityEngine();
    }

    public function analyze(array $input): array
    {
        $video = $input['video'] ?? '';
        $video = trim($video);
        $localPath = $input['local_path'] ?? null;

        try {
            $serviceResult = $this->aiService->analyzeVideo($video);
            $heuristicResult = $this->heuristic->analyzeVideo($video, $localPath);
        } catch (\RuntimeException $exception) {
            Log::warning('Fallback video analysis activated: ' . $exception->getMessage());
            return $this->runFallbackAnalysis($video, $localPath, $exception->getMessage());
        }

        $finalScore = $this->confidence->calculate([
            'service' => $serviceResult['ai_percentage'] ?? 50,
            'heuristic' => $heuristicResult['score'] ?? 50,
            'secondary' => ($serviceResult['confidence'] ?? 0) / 1.0,
        ], [
            'strong_ai' => $serviceResult['ai_percentage'] >= 70,
            'strong_human' => $heuristicResult['score'] < 40,
            'ambiguous' => abs(($serviceResult['ai_percentage'] ?? 0) - ($heuristicResult['score'] ?? 0)) < 18,
        ]);

        $explain = $this->explainability->build('video', $serviceResult, $heuristicResult, $finalScore);

        return [
            'classification' => $explain['classification'],
            'ai_percentage' => round($finalScore, 2),
            'human_percentage' => round(100 - $finalScore, 2),
            'confidence' => round($finalScore, 2),
            'explanation' => $this->buildExplanation($explain, $serviceResult, $heuristicResult),
            'service_results' => [
                $serviceResult,
                $heuristicResult,
            ],
            'signals' => array_merge($serviceResult['signals'] ?? [], $heuristicResult['signals'] ?? []),
            'analysis_source' => $explain['analysis_source'],
            'primary_service' => $explain['primary_service'],
            'secondary_service' => $explain['secondary_service'],
            'fallback_notice' => null,
        ];
    }

    private function runFallbackAnalysis(string $videoBase64, ?string $localPath, string $failureReason): array
    {
        $fallbackPath = $localPath ?: $this->writeTempFile($videoBase64, 'video');
        $heuristicResult = $this->heuristic->analyzeVideo($videoBase64, $fallbackPath);
        $finalScore = $this->confidence->calculate([
            'service' => $heuristicResult['score'] ?? 50,
            'heuristic' => $heuristicResult['score'] ?? 50,
        ], [
            'strong_ai' => $heuristicResult['score'] >= 70,
            'strong_human' => $heuristicResult['score'] < 40,
            'ambiguous' => true,
        ]);

        $classification = $finalScore >= 50 ? 'AI-generated' : 'Human-written';
        $explain = $this->explainability->build('video', ['service_name' => 'Fallback', 'classification' => $classification, 'explanation' => $failureReason], $heuristicResult, $finalScore);

        if (!$localPath && file_exists($fallbackPath)) {
            @unlink($fallbackPath);
        }

        return [
            'classification' => $explain['classification'],
            'ai_percentage' => round($finalScore, 2),
            'human_percentage' => round(100 - $finalScore, 2),
            'confidence' => round($finalScore, 2),
            'explanation' => $this->buildExplanation($explain, ['explanation' => $failureReason], $heuristicResult),
            'service_results' => [
                ['service_name' => 'Fallback', 'explanation' => $failureReason],
                $heuristicResult,
            ],
            'signals' => $heuristicResult['signals'] ?? [],
            'analysis_source' => 'Video fallback engine',
            'primary_service' => 'Fallback',
            'secondary_service' => 'Heuristic Ensemble',
            'fallback_notice' => 'AI video model unavailable. Using frame extraction and heuristics instead.',
        ];
    }

    private function buildExplanation(array $explain, array $serviceResult, array $heuristicResult): string
    {
        return implode(' ', [
            $explain['explanation'] ?? 'Video analysis completed.',
            'Frame heuristic classification: ' . ($heuristicResult['classification'] ?? 'unknown') . '.',
            'Fallback note: ' . ($explain['fallback_notice'] ?? 'none'),
        ]);
    }

    private function writeTempFile(string $binaryBase64, string $type): string
    {
        $binary = base64_decode($binaryBase64, true) ?: $binaryBase64;
        $path = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'detection_' . $type . '_' . uniqid() . '.bin';
        file_put_contents($path, $binary);
        return $path;
    }
}
