<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AnalysisController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SocialAuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::get('/history', [AuthController::class, 'history']);
    Route::post('/history', [AuthController::class, 'saveHistory']);
    Route::post('/subscription/activate', [AuthController::class, 'activateSubscription']);
    Route::post('/subscription/cancel', [AuthController::class, 'cancelSubscription']);
});

Route::post('/analyze-image', [AnalysisController::class, 'analyzeImage']);
Route::post('/analyze-text', [AnalysisController::class, 'analyzeText']);
Route::post('/analyze-audio', [AnalysisController::class, 'analyzeAudio']);
Route::post('/analyze-video', [AnalysisController::class, 'analyzeVideo']);
Route::post('/analyze-social-post', [AnalysisController::class, 'analyzeSocialPost']);

// Social OAuth Routes
Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);
Route::get('/social/accounts', [SocialAuthController::class, 'getConnectedAccounts']);
Route::delete('/social/accounts/{accountId}', [SocialAuthController::class, 'disconnectAccount']);
Route::get('/social/posts', [AnalysisController::class, 'getConnectedPosts']);
