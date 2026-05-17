<?php

namespace App\Services\Detection;

class AudioDetectionEngine implements DetectionEngineInterface
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
        $audio = $input['audio'] ?? '';
        $audio = trim($audio);

        $serviceResult = $this->aiService->analyzeAudio($audio);
        $heuristicResult = $this->heuristic->analyzeAudio($audio);

        $finalScore = $this->confidence->calculate([
            'service' => $serviceResult['ai_percentage'] ?? 50,
            'heuristic' => $heuristicResult['score'] ?? 50,
        ], [
            'strong_ai' => $serviceResult['ai_percentage'] >= 70,
            'strong_human' => $heuristicResult['score'] < 40,
            'ambiguous' => abs(($serviceResult['ai_percentage'] ?? 0) - ($heuristicResult['score'] ?? 0)) < 20,
        ]);

        $explain = $this->explainability->build('audio', $serviceResult, $heuristicResult, $finalScore);

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

    private function buildExplanation(array $explain, array $serviceResult, array $heuristicResult): string
    {
        return implode(' ', [
            $explain['explanation'],
            'AIorNot verdict: ' . ($serviceResult['classification'] ?? 'unknown') . '.',
            'Heuristic signal set: ' . count($heuristicResult['signals']) . ' indicators.',
        ]);
    }
}
