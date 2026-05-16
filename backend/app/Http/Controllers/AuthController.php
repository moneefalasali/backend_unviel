<?php

namespace App\Http\Controllers;

use App\Models\AnalysisHistory;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Throwable;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $data = $request->validate([
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'full_name' => 'required|string|max:255',
                'gender' => 'nullable|string|max:50',
                'age' => 'nullable|integer|min:13|max:120',
            ]);

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
                'user' => $user,
                'profile' => $profile,
                'token' => $token,
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            $data = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            if (!Auth::attempt(['email' => $data['email'], 'password' => $data['password']])) {
                return response()->json(['message' => 'Invalid credentials'], 401);
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
                'user' => $user,
                'profile' => $profile,
                'token' => $token,
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Login failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function user(Request $request)
    {
        try {
            $user = $request->user();

            return response()->json([
                'user' => $user,
                'profile' => $user?->profile,
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Unable to fetch user data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function profile(Request $request)
    {
        try {
            $profile = $request->user()?->profile;
            return response()->json($profile);
        } catch (Throwable $e) {
            return response()->json([
                'message' => 'Unable to fetch profile',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        $data = $request->validate([
            'full_name' => 'required|string|max:255',
            'gender' => 'nullable|string|max:50',
            'age' => 'nullable|integer|min:13|max:120',
        ]);

        $profile = $request->user()?->profile;

        if (! $profile) {
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

        return response()->json($profile);
    }

    public function history(Request $request)
    {
        $history = $request->user()->analysisHistory()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($history);
    }

    public function saveHistory(Request $request)
    {
        $data = $request->validate([
            'media_type' => 'required|string',
            'content' => 'required|string',
            'result_status' => 'required|string',
            'confidence_score' => 'required|integer|min:0|max:100',
            'explanation' => 'nullable|string',
            'metadata' => 'nullable|array',
        ]);

        $history = AnalysisHistory::create([
            'user_id' => $request->user()->id,
            'media_type' => $data['media_type'],
            'content' => $data['content'],
            'result_status' => $data['result_status'],
            'confidence_score' => $data['confidence_score'],
            'explanation' => $data['explanation'] ?? '',
            'metadata' => $data['metadata'] ?? [],
        ]);

        return response()->json($history);
    }

    public function activateSubscription(Request $request)
    {
        $profile = $request->user()->profile;
        if (! $profile) {
            $profile = UserProfile::create([
                'user_id' => $request->user()->id,
                'full_name' => $request->user()->name ?? '',
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

        return response()->json($profile);
    }

    public function cancelSubscription(Request $request)
    {
        $profile = $request->user()->profile;
        if (! $profile) {
            return response()->json(['message' => 'No profile found'], 404);
        }

        $profile->update([
            'plan_type' => 'free',
            'subscription_status' => 'cancelled',
            'subscription_expires_at' => null,
        ]);

        return response()->json($profile);
    }
}
