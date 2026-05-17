<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\SaveHistoryRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\AnalysisHistoryResource;
use App\Http\Resources\ProfileResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\UserProfile;
use App\Repositories\AnalysisHistoryRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Throwable;

class AuthController extends Controller
{
    protected AnalysisHistoryRepository $analysisHistoryRepo;

    public function __construct(AnalysisHistoryRepository $analysisHistoryRepo)
    {
        $this->analysisHistoryRepo = $analysisHistoryRepo;
    }

    public function register(RegisterRequest $request)
    {
        try {
            $data = $request->validated();

            $user = User::create([
                'name' => $data['full_name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            $profile = UserProfile::create([
                'user_id' => $user->id,
                'full_name' => $data['full_name'],
                'gender' => $data['gender'] ?? null,
                'age' => $data['age'] ?? null,
                'plan_type' => 'free',
                'subscription_status' => 'active',
            ]);

            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => new UserResource($user),
                    'profile' => new ProfileResource($profile),
                    'token' => $token,
                ],
            ], 201);
        } catch (Throwable $e) {
            Log::error('Registration Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Registration failed',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function login(LoginRequest $request)
    {
        try {
            $data = $request->validated();

            if (!Auth::attempt(['email' => $data['email'], 'password' => $data['password']])) {
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid credentials',
                    'message' => 'Invalid email or password',
                ], 401);
            }

            $user = Auth::user();
            $profile = $user->profile;

            if (!$profile) {
                $profile = UserProfile::create([
                    'user_id' => $user->id,
                    'full_name' => $user->name ?? '',
                    'plan_type' => 'free',
                    'subscription_status' => 'active',
                ]);
            }

            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => new UserResource($user),
                    'profile' => new ProfileResource($profile),
                    'token' => $token,
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('Login Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Login failed',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Logged out successfully',
        ]);
    }

    public function user(Request $request)
    {
        try {
            $user = $request->user();
            $profile = $user?->profile;

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => new UserResource($user),
                    'profile' => $profile ? new ProfileResource($profile) : null,
                ],
            ]);
        } catch (Throwable $e) {
            Log::error('Fetch User Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Unable to fetch user data',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function profile(Request $request)
    {
        try {
            $profile = $request->user()?->profile;
            return response()->json([
                'success' => true,
                'data' => $profile ? new ProfileResource($profile) : null,
            ]);
        } catch (Throwable $e) {
            Log::error('Profile Fetch Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Unable to fetch profile',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        try {
            $data = $request->validated();

            $profile = $request->user()?->profile;

            if (!$profile) {
                $profile = UserProfile::create([
                    'user_id' => $request->user()->id,
                    'full_name' => $data['full_name'],
                    'gender' => $data['gender'] ?? null,
                    'age' => $data['age'] ?? null,
                    'plan_type' => 'free',
                    'subscription_status' => 'active',
                ]);
            } else {
                $profile->update($data);
            }

            return response()->json([
                'success' => true,
                'data' => new ProfileResource($profile),
            ]);
        } catch (Throwable $e) {
            Log::error('Update Profile Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Update profile failed',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function history(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'error' => 'Unauthorized',
                    'message' => 'Authentication is required to load history.',
                ], 401);
            }

            $history = $this->analysisHistoryRepo->listForUser($user);

            return response()->json([
                'success' => true,
                'data' => AnalysisHistoryResource::collection($history),
            ]);
        } catch (Throwable $e) {
            Log::error('Load History Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Unable to load history',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function saveHistory(SaveHistoryRequest $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'error' => 'Unauthorized',
                    'message' => 'You must be logged in to save history.',
                ], 401);
            }

            $data = $request->validate([
                'media_type' => 'required|string',
                'content' => 'required|string',
                'result_status' => 'required|string',
                'confidence_score' => 'required|integer|min:0|max:100',
                'explanation' => 'nullable|string',
                'metadata' => 'nullable|array',
            ]);

            $history = $this->analysisHistoryRepo->create([
                'user_id' => $user->id,
                'media_type' => $data['media_type'],
                'content' => $data['content'],
                'result_status' => $data['result_status'],
                'confidence_score' => $data['confidence_score'],
                'explanation' => $data['explanation'] ?? '',
                'metadata' => $data['metadata'] ?? [],
            ]);

            return response()->json([
                'success' => true,
                'data' => new AnalysisHistoryResource($history),
            ]);
        } catch (Throwable $e) {
            Log::error('Save History Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Unable to save history',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function activateSubscription(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'error' => 'Unauthorized',
                    'message' => 'Please log in to activate subscription.',
                ], 401);
            }

            $profile = $user->profile;
            if (!$profile) {
                $profile = UserProfile::create([
                    'user_id' => $user->id,
                    'full_name' => $user->name ?? '',
                    'plan_type' => 'free',
                    'subscription_status' => 'active',
                ]);
            }

            $profile->update([
                'plan_type' => 'plus',
                'subscription_status' => 'active',
                'subscription_started_at' => now(),
                'subscription_expires_at' => now()->addDays(30),
            ]);

            return response()->json([
                'success' => true,
                'data' => new ProfileResource($profile),
            ]);
        } catch (Throwable $e) {
            Log::error('Activate Subscription Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Unable to activate subscription',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function cancelSubscription(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'error' => 'Unauthorized',
                    'message' => 'Please log in to cancel subscription.',
                ], 401);
            }

            $profile = $user->profile;
            if (!$profile) {
                return response()->json([
                    'success' => false,
                    'error' => 'No profile found',
                    'message' => 'Unable to find subscription profile.',
                ], 404);
            }

            $profile->update([
                'plan_type' => 'free',
                'subscription_status' => 'cancelled',
                'subscription_expires_at' => null,
            ]);

            return response()->json([
                'success' => true,
                'data' => new ProfileResource($profile),
            ]);
        } catch (Throwable $e) {
            Log::error('Cancel Subscription Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Unable to cancel subscription',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
