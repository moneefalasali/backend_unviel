<?php

namespace App\Jobs;

use App\Repositories\AnalysisHistoryRepository;
use App\Services\Detection\AudioDetectionEngine;
use App\Services\Detection\ImageDetectionEngine;
use App\Services\Detection\TextDetectionEngine;
use App\Services\Detection\VideoDetectionEngine;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessAnalysisJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;
    public int $timeout = 180;

    public function __construct(
        public string $mediaType,
        public string $payload,
        public ?int $userId = null,
        public array $metadata = []
    ) {
    }

    public function handle(AnalysisHistoryRepository $historyRepository)
    {
        $engine = $this->selectEngine();
        $analysis = $engine->analyze([$this->mediaType => $this->payload]);

        if ($this->userId) {
            $historyRepository->create([
                'user_id' => $this->userId,
                'media_type' => $this->mediaType,
                'content' => $this->metadata['content'] ?? 'queued analysis',
                'result_status' => strtoupper($analysis['classification'] ?? 'UNKNOWN'),
                'confidence_score' => min(max(intval(round($analysis['confidence'] ?? 0)), 0), 100),
                'explanation' => $analysis['explanation'] ?? '',
                'metadata' => array_merge($this->metadata, ['queued' => true, 'fallback' => $analysis['fallback_notice'] ?? null]),
            ]);
        }

        Log::info('ProcessAnalysisJob completed', ['media_type' => $this->mediaType, 'user_id' => $this->userId]);
    }

    private function selectEngine(): object
    {
        return match ($this->mediaType) {
            'text' => new TextDetectionEngine(),
            'image' => new ImageDetectionEngine(),
            'audio' => new AudioDetectionEngine(),
            'video' => new VideoDetectionEngine(),
            default => throw new \RuntimeException('Unsupported media type for queued analysis.'),
        };
    }
}
