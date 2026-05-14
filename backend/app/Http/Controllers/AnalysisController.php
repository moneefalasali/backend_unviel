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
        return response()->json($this->mockImageResult());
    }

    public function analyzeText(Request $request)
    {
        $request->validate(['text' => 'required|string']);
        return response()->json($this->mockTextResult());
    }

    public function analyzeAudio(Request $request)
    {
        $request->validate(['audio' => 'required|string']);
        return response()->json($this->mockAudioResult());
    }

    public function analyzeSocialPost(Request $request)
    {
        $request->validate(['url' => 'required|url']);
        $url = $request->url;
        
        $platform = $this->detectPlatform($url);
        if (!$platform) {
            return response()->json(['error' => 'Unsupported platform'], 400);
        }

        // In a real scenario, we would scrape or use API to get content
        // For this implementation, we simulate the extraction and analysis
        $text_ai = 84;
        $image_ai = 91;
        $overall = 88;

        return response()->json([
            'platform' => $platform,
            'post_type' => 'text + image',
            'text_ai_percentage' => $text_ai,
            'image_ai_percentage' => $image_ai,
            'overall_ai_probability' => $overall,
            'human_probability' => 100 - $overall,
            'classification' => 'Likely AI Generated',
            'confidence' => 0.89,
            'explanation' => "Analysis of the $platform post shows high probability of AI involvement in both text and visual elements."
        ]);
    }

    public function getConnectedPosts()
    {
        // Mock data for connected posts analysis
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

    private function mockImageResult() {
        return [
            'type' => 'image',
            'classification' => 'AI Generated',
            'ai_percentage' => 91,
            'human_percentage' => 9,
            'confidence' => 0.91,
            'explanation' => 'High probability of AI generation detected in image patterns.'
        ];
    }

    private function mockTextResult() {
        return [
            'type' => 'text',
            'classification' => 'Likely AI',
            'ai_percentage' => 84,
            'human_percentage' => 16,
            'confidence' => 0.84,
            'explanation' => 'The text exhibits patterns consistent with AI language models.'
        ];
    }

    private function mockAudioResult() {
        return [
            'type' => 'audio',
            'classification' => 'Human Voice',
            'ai_percentage' => 12,
            'human_percentage' => 88,
            'confidence' => 0.88,
            'explanation' => 'The audio characteristics match natural human speech patterns.'
        ];
    }
}
