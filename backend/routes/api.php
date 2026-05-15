<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AnalysisController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SocialAuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');
Route::get('/profile', [AuthController::class, 'profile'])->middleware('auth:sanctum');
Route::put('/profile', [AuthController::class, 'updateProfile'])->middleware('auth:sanctum');
Route::get('/history', [AuthController::class, 'history'])->middleware('auth:sanctum');
Route::post('/history', [AuthController::class, 'saveHistory'])->middleware('auth:sanctum');
Route::post('/subscription/activate', [AuthController::class, 'activateSubscription'])->middleware('auth:sanctum');
Route::post('/subscription/cancel', [AuthController::class, 'cancelSubscription'])->middleware('auth:sanctum');

Route::post('/analyze-image', [AnalysisController::class, 'analyzeImage']);
Route::post('/analyze-text', [AnalysisController::class, 'analyzeText']);
Route::post('/analyze-audio', [AnalysisController::class, 'analyzeAudio']);
Route::post('/analyze-video', [AnalysisController::class, 'analyzeVideo']);
Route::post('/analyze-social-post', [AnalysisController::class, 'analyzeSocialPost']);
Route::post('/hive/task-async', [AnalysisController::class, 'submitHiveTaskAsync']);
Route::get('/hive/task-summary', [AnalysisController::class, 'getHiveTaskSummary']);

// Social OAuth Routes
Route::get('/auth/{provider}/redirect', [SocialAuthController::class, 'redirectToProvider']);
Route::get('/auth/{provider}/callback', [SocialAuthController::class, 'handleProviderCallback']);
Route::get('/social/accounts', [SocialAuthController::class, 'getConnectedAccounts']);
Route::get('/social/posts', [AnalysisController::class, 'getConnectedPosts']);
