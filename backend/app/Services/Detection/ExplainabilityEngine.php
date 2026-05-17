<?php

namespace App\Services\Detection;

class ExplainabilityEngine
{
    public function build(string $mediaType, array $serviceResult, array $heuristicResult, float $finalScore): array
    {
        $classification = $finalScore >= 50 ? 'AI-generated' : 'Human-written';
        $source = $serviceResult['service_name'] ?? 'AIorNot';

        $primary = $serviceResult['classification'] ?? $classification;
        $secondary = $heuristicResult['classification'] ?? $classification;

        $reasons = [];

        if (!empty($heuristicResult['signals'])) {
            foreach ($heuristicResult['signals'] as $signal) {
                $reasons[] = $signal['name'] . ': ' . $signal['value'];
            }
        }

        if (!empty($serviceResult['explanation'])) {
            $reasons[] = $serviceResult['explanation'];
        }

        if (empty($reasons)) {
            $reasons[] = 'The detection combined service and heuristic indicators to generate a balanced score.';
        }

        return [
            'analysis_source' => $mediaType === 'text' ? 'Hybrid Text Engine' : ucfirst($mediaType) . ' Hybrid Engine',
            'primary_service' => $source,
            'secondary_service' => 'Heuristic Ensemble',
            'classification' => $classification,
            'confidence' => $finalScore,
            'explanation' => "{$mediaType} analysis produced a {$classification} classification with {$finalScore}% confidence.",
            'reasons' => $reasons,
        ];
    }
}
