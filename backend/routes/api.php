<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AnalysisController;

Route::post('/analyze-image', [AnalysisController::class, 'analyzeImage']);
Route::post('/analyze-text', [AnalysisController::class, 'analyzeText']);
Route::post('/analyze-audio', [AnalysisController::class, 'analyzeAudio']);
Route::post('/analyze-social-post', [AnalysisController::class, 'analyzeSocialPost']);

// Social OAuth Routes
Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);
Route::get('/social/accounts', [SocialAuthController::class, 'getConnectedAccounts']);
Route::get('/social/posts', [AnalysisController::class, 'getConnectedPosts']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
