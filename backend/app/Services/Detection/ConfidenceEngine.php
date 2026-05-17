<?php

namespace App\Services\Detection;

class ConfidenceEngine
{
    public function calculate(array $scores, array $indicators = []): float
    {
        $serviceScore = $scores['service'] ?? 50;
        $heuristicScore = $scores['heuristic'] ?? 50;
        $secondaryScore = $scores['secondary'] ?? 50;

        $base = ($serviceScore * 0.6) + ($heuristicScore * 0.3) + ($secondaryScore * 0.1);

        $uncertainty = $this->calculateUncertainty($serviceScore, $heuristicScore);
        $adjustment = $this->calculateAdjustment($indicators);

        $final = $base - $uncertainty + $adjustment;

        return $this->normalize($final);
    }

    private function calculateUncertainty(float $serviceScore, float $heuristicScore): float
    {
        $gap = abs($serviceScore - $heuristicScore);
        return $gap > 25 ? 0 : (25 - $gap) * 0.15;
    }

    private function calculateAdjustment(array $indicators): float
    {
        $penalty = 0;

        if (!empty($indicators['ambiguous'])) {
            $penalty -= 6;
        }

        if (!empty($indicators['strong_ai'])) {
            $penalty += 4;
        }

        if (!empty($indicators['strong_human'])) {
            $penalty -= 4;
        }

        return $penalty;
    }

    private function normalize(float $value): float
    {
        $output = min(max($value, 0.5), 99.5);
        return round($output, 2);
    }
}
