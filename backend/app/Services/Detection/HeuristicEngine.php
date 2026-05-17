<?php

namespace App\Services\Detection;

use Illuminate\Support\Arr;
use Symfony\Component\Process\Process;

class HeuristicEngine
{
    public function analyzeText(string $text): array
    {
        $words = $this->tokenize($text);
        $sentences = $this->splitSentences($text);
        $wordCount = max(1, count($words));
        $sentenceCount = max(1, count($sentences));

        $promptScore = $this->measurePromptDensity($text);
        $repetitionScore = $this->measureRepetition($words);
        $entropyScore = $this->measureEntropy($words);
        $burstScore = $this->measureBurstiness($sentences);
        $structureScore = $this->measureStructureConsistency($sentences);
        $instructionScore = $this->measureInstructionDensity($text);
        $varianceScore = $this->measureHumanVariance($text);

        $score = ($promptScore * 0.22)
            + ($repetitionScore * 0.18)
            + ($entropyScore * 0.17)
            + ($burstScore * 0.15)
            + ($structureScore * 0.12)
            + ($instructionScore * 0.08)
            + ($varianceScore * 0.08);

        $score = min(max($score, 0), 100);

        return [
            'classification' => $score >= 55 ? 'AI-generated' : 'Human-like',
            'score' => round($score, 2),
            'signals' => [
                ['name' => 'Prompt-like patterns', 'impact' => $promptScore >= 50 ? 'increased' : 'decreased', 'value' => "{$promptScore}%"],
                ['name' => 'Repetition density', 'impact' => $repetitionScore >= 50 ? 'increased' : 'decreased', 'value' => "{$repetitionScore}%"],
                ['name' => 'Entropy footprint', 'impact' => $entropyScore <= 35 ? 'increased' : 'decreased', 'value' => "{$entropyScore}%"],
                ['name' => 'Sentence uniformity', 'impact' => $structureScore >= 50 ? 'increased' : 'decreased', 'value' => "{$structureScore}%"],
            ],
            'details' => [
                'prompt_density' => $promptScore,
                'repetition_score' => $repetitionScore,
                'entropy_score' => $entropyScore,
                'burstiness' => $burstScore,
                'instruction_density' => $instructionScore,
                'human_variance' => $varianceScore,
            ],
        ];
    }

    public function analyzeImage(string $imageBase64): array
    {
        $binary = $this->decodeBase64($imageBase64);
        $sizeKb = max(1, strlen($binary) / 1024);
        $entropy = $this->measureBinaryEntropy($binary);
        $smoothness = $this->measureSmoothness($binary);
        $noise = $this->measureTextureVariance($binary);
        $metadataScore = $this->measureMetadataPresence($binary);

        $score = ($entropy < 4 ? 70 : 40)
            + ($smoothness < 30 ? 15 : 0)
            + ($noise < 35 ? 10 : 0)
            + ($metadataScore < 20 ? 5 : 0);

        $score = min(max($score, 0), 100);

        return [
            'classification' => $score >= 55 ? 'AI-generated' : 'Human-like',
            'score' => round($score, 2),
            'signals' => [
                ['name' => 'Compression entropy', 'impact' => $entropy < 4 ? 'increased' : 'decreased', 'value' => "{$entropy}"],
                ['name' => 'Texture coherence', 'impact' => $smoothness < 30 ? 'increased' : 'decreased', 'value' => "{$smoothness}%"],
                ['name' => 'Metadata trace', 'impact' => $metadataScore < 20 ? 'increased' : 'decreased', 'value' => "{$metadataScore}%"],
            ],
            'details' => [
                'size_kb' => round($sizeKb, 2),
                'entropy' => round($entropy, 2),
                'smoothness' => round($smoothness, 2),
                'texture_variance' => round($noise, 2),
                'metadata_score' => round($metadataScore, 2),
            ],
        ];
    }

    public function analyzeAudio(string $audioBase64): array
    {
        $binary = $this->decodeBase64($audioBase64);
        $duration = $this->probeDuration($binary, 'audio');
        $spectral = $this->estimateSpectralFlatness($binary);
        $breath = $this->measureBreathPattern($binary);
        $tts = $this->detectTtsSignature($binary);

        $score = 40 + ($spectral < 25 ? 15 : 0) + ($breath < 45 ? 15 : 0) + ($tts ? 20 : 0);
        $score = min(max($score, 0), 100);

        return [
            'classification' => $score >= 55 ? 'AI-generated' : 'Human-like',
            'score' => round($score, 2),
            'signals' => [
                ['name' => 'Spectral flatness', 'impact' => $spectral < 25 ? 'increased' : 'decreased', 'value' => "{$spectral}%"],
                ['name' => 'Breath cadence', 'impact' => $breath < 45 ? 'increased' : 'decreased', 'value' => "{$breath}%"],
                ['name' => 'TTS signature', 'impact' => $tts ? 'increased' : 'decreased', 'value' => $tts ? 'present' : 'absent'],
            ],
            'details' => [
                'duration_seconds' => round($duration, 2),
                'spectral_flatness' => round($spectral, 2),
                'breath_pattern' => round($breath, 2),
                'tts_detected' => $tts,
            ],
        ];
    }

    public function analyzeVideo(string $videoBase64, string $localPath = null): array
    {
        $binary = $this->decodeBase64($videoBase64);
        $duration = $this->probeDuration($binary, 'video', $localPath);
        $frameRate = $this->probeFrameRate($localPath);
        $motionScore = $this->estimateMotionConsistency($duration, $frameRate);
        $frameAccuracy = $this->analyzeFrameSamples($localPath);

        $score = 35 + ($motionScore < 40 ? 20 : 0) + ($frameAccuracy > 60 ? 20 : 0);
        $score = min(max($score, 0), 100);

        return [
            'classification' => $score >= 55 ? 'AI-generated' : 'Human-like',
            'score' => round($score, 2),
            'signals' => [
                ['name' => 'Motion consistency', 'impact' => $motionScore < 40 ? 'increased' : 'decreased', 'value' => "{$motionScore}%"],
                ['name' => 'Frame artifact detection', 'impact' => $frameAccuracy > 60 ? 'increased' : 'decreased', 'value' => "{$frameAccuracy}%"],
            ],
            'details' => [
                'duration_seconds' => round($duration, 2),
                'frame_rate' => round($frameRate, 2),
                'motion_score' => round($motionScore, 2),
                'frame_accuracy' => round($frameAccuracy, 2),
            ],
        ];
    }

    private function tokenize(string $text): array
    {
        return preg_split('/\s+/u', trim($text)) ?: [];
    }

    private function splitSentences(string $text): array
    {
        return array_values(array_filter(preg_split('/(?<=[.!?])\s+/', trim($text)) ?: []));
    }

    private function measurePromptDensity(string $text): float
    {
        $keywords = ['write', 'generate', 'compare', 'analyse', 'analysis', 'summarize', 'explain', 'create', 'tell me', 'output'];
        $score = 0;

        foreach ($keywords as $keyword) {
            if (stripos($text, $keyword) !== false) {
                $score += 12;
            }
        }

        return min(max($score, 0), 100);
    }

    private function measureRepetition(array $words): float
    {
        $wordCount = max(1, count($words));
        $unique = count(array_unique($words));
        $ratio = 1 - ($unique / $wordCount);

        return min(max(round($ratio * 100, 2), 0), 100);
    }

    private function measureEntropy(array $words): float
    {
        $distribution = [];

        foreach ($words as $word) {
            $token = mb_strtolower(preg_replace('/[^\p{L}\p{N}]/u', '', $word));
            if ($token === '') {
                continue;
            }
            $distribution[$token] = ($distribution[$token] ?? 0) + 1;
        }

        $total = array_sum($distribution);
        if ($total === 0) {
            return 0;
        }

        $entropy = 0;

        foreach ($distribution as $count) {
            $p = $count / $total;
            $entropy -= $p * log($p, 2);
        }

        return min(max(round($entropy * 10, 2), 0), 100);
    }

    private function measureBurstiness(array $sentences): float
    {
        $lengths = array_map(fn ($sentence) => mb_strlen(trim($sentence)), $sentences);
        $mean = array_sum($lengths) / max(1, count($lengths));
        $variance = array_sum(array_map(fn ($len) => pow($len - $mean, 2), $lengths)) / max(1, count($lengths));
        $burstiness = min(max(round(($variance / max(1, $mean)) * 10, 2), 0), 100);

        return $burstiness;
    }

    private function measureStructureConsistency(array $sentences): float
    {
        $lengths = array_map(fn ($sentence) => mb_strlen(trim($sentence)), $sentences);
        if (count($lengths) < 2) {
            return 40;
        }

        $coefficient = (max($lengths) - min($lengths)) / max(1, array_sum($lengths) / count($lengths));

        return min(max(round($coefficient * 100, 2), 0), 100);
    }

    private function measureInstructionDensity(string $text): float
    {
        $instructions = preg_match_all('/\b(should|must|need to|required to|follow|step|first|second|then|finally)\b/i', $text);
        return min(max(round(($instructions / max(1, str_word_count($text))) * 100, 2), 0), 100);
    }

    private function measureHumanVariance(string $text): float
    {
        $vowels = preg_match_all('/[aeiouy]/i', $text);
        $consonants = preg_match_all('/[bcdfghjklmnpqrstvwxyz]/i', $text);

        if ($consonants === 0) {
            return 0;
        }

        $ratio = $vowels / $consonants;
        return min(max(round(abs(1 - $ratio) * 100, 2), 0), 100);
    }

    private function decodeBase64(string $payload): string
    {
        if (preg_match('/^data:.*;base64,(.*)$/', $payload, $matches)) {
            return base64_decode($matches[1]);
        }

        return base64_decode($payload, true) ?: $payload;
    }

    private function measureBinaryEntropy(string $binary): float
    {
        $length = strlen($binary);
        if ($length === 0) {
            return 0;
        }

        $counts = array_fill(0, 256, 0);
        for ($i = 0; $i < $length; $i++) {
            $counts[ord($binary[$i])]++;
        }

        $entropy = 0;
        foreach ($counts as $count) {
            if ($count === 0) {
                continue;
            }
            $p = $count / $length;
            $entropy -= $p * log($p, 2);
        }

        return min(max(round($entropy, 2), 0), 100);
    }

    private function measureSmoothness(string $binary): float
    {
        if (!function_exists('imagecreatefromstring')) {
            return 50;
        }

        $image = @imagecreatefromstring($binary);
        if (!$image) {
            return 50;
        }

        $width = imagesx($image);
        $height = imagesy($image);
        $differences = 0;
        $total = 0;

        for ($x = 0; $x < min(80, $width - 1); $x += max(1, floor($width / 40))) {
            for ($y = 0; $y < min(80, $height - 1); $y += max(1, floor($height / 40))) {
                $rgb = imagecolorat($image, $x, $y);
                $rgb2 = imagecolorat($image, min($width - 1, $x + 1), $y);
                $differences += abs(($rgb & 0xFF) - ($rgb2 & 0xFF));
                $total++;
            }
        }

        imagedestroy($image);

        return min(max(round(100 - ($differences / max(1, $total)), 2), 0), 100);
    }

    private function measureTextureVariance(string $binary): float
    {
        return min(max(round($this->measureBinaryEntropy($binary) * 0.7, 2), 0), 100);
    }

    private function measureMetadataPresence(string $binary): float
    {
        if (strpos($binary, 'Exif') !== false || strpos($binary, 'ICC_PROFILE') !== false) {
            return 80;
        }

        return 15;
    }

    private function probeDuration(string $binary, string $type, string $localPath = null): float
    {
        $path = $localPath ?: $this->writeTempFile($binary, $type);
        $details = $this->runProbe($path);
        $duration = floatval(Arr::get($details, 'format.duration', 0));

        if (!$localPath) {
            @unlink($path);
        }

        return $duration;
    }

    private function probeFrameRate(?string $localPath): float
    {
        if (!$localPath || !file_exists($localPath)) {
            return 24.0;
        }

        $details = $this->runProbe($localPath);
        $rFrameRate = Arr::get($details, 'streams.0.r_frame_rate', '24/1');

        if (str_contains($rFrameRate, '/')) {
            [$numerator, $denominator] = explode('/', $rFrameRate);
            return $denominator > 0 ? floatval($numerator) / floatval($denominator) : 24.0;
        }

        return floatval($rFrameRate) ?: 24.0;
    }

    private function estimateMotionConsistency(float $duration, float $frameRate): float
    {
        if ($duration <= 0) {
            return 50;
        }

        $frames = $duration * max($frameRate, 1);
        return min(max(round(100 - abs($frames / 30 - 60), 2), 0), 100);
    }

    private function analyzeFrameSamples(?string $localPath): float
    {
        if (!$localPath || !file_exists($localPath)) {
            return 50;
        }

        $tmpDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'video_frame_samples_' . uniqid();
        mkdir($tmpDir, 0755, true);

        $command = ['ffmpeg', '-y', '-i', $localPath, '-vf', 'fps=1', '-frames:v', '3', $tmpDir . DIRECTORY_SEPARATOR . 'frame_%02d.png'];
        $process = new Process($command);
        $process->setTimeout(30);
        $process->run();

        $scores = [];
        foreach (glob($tmpDir . DIRECTORY_SEPARATOR . 'frame_*.png') as $imagePath) {
            $binary = file_get_contents($imagePath);
            $scores[] = 100 - $this->measureSmoothness($binary);
        }

        array_map('unlink', glob($tmpDir . DIRECTORY_SEPARATOR . '*'));
        @rmdir($tmpDir);

        return count($scores) ? min(max(round(array_sum($scores) / count($scores), 2), 0), 100) : 50;
    }

    private function runProbe(string $path): array
    {
        $process = new Process(['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', $path]);
        $process->setTimeout(15);
        $process->run();

        if (!$process->isSuccessful()) {
            return [];
        }

        return json_decode($process->getOutput(), true) ?: [];
    }

    private function writeTempFile(string $binary, string $type): string
    {
        $path = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'detection_' . $type . '_' . uniqid();
        file_put_contents($path, $binary);

        return $path;
    }
}
