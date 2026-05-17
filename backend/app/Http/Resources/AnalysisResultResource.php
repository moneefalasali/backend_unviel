<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AnalysisResultResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'classification' => $this['classification'] ?? $this->resource['classification'] ?? null,
            'ai_percentage' => $this['ai_percentage'] ?? $this->resource['ai_percentage'] ?? null,
            'human_percentage' => $this['human_percentage'] ?? $this->resource['human_percentage'] ?? null,
            'confidence' => $this['confidence'] ?? $this->resource['confidence'] ?? null,
            'explanation' => $this['explanation'] ?? $this->resource['explanation'] ?? null,
            'signals' => $this['signals'] ?? $this->resource['signals'] ?? [],
            'service_results' => $this['service_results'] ?? $this->resource['service_results'] ?? [],
            'analysis_source' => $this['analysis_source'] ?? $this->resource['analysis_source'] ?? null,
            'primary_service' => $this['primary_service'] ?? $this->resource['primary_service'] ?? null,
            'secondary_service' => $this['secondary_service'] ?? $this->resource['secondary_service'] ?? null,
            'fallback_notice' => $this['fallback_notice'] ?? $this->resource['fallback_notice'] ?? null,
        ];
    }
}
