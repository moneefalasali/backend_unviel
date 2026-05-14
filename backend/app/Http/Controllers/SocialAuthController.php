<?php

namespace App\Http\Controllers;

use App\Models\SocialAccount;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;

class SocialAuthController extends Controller
{
    public function redirectToProvider($provider)
    {
        if (!in_array($provider, ['twitter', 'linkedin', 'instagram'])) {
            return response()->json(['error' => 'Unsupported provider'], 400);
        }

        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function handleProviderCallback($provider)
    {
        try {
            $user = Socialite::driver($provider)->stateless()->user();
            
            // In a real app, we would get the authenticated user ID
            // For this demo, we use a mock user ID
            $userId = 1; 

            SocialAccount::updateOrCreate(
                [
                    'user_id' => $userId,
                    'platform' => $provider,
                    'platform_user_id' => $user->getId(),
                ],
                [
                    'username' => $user->getNickname() ?: $user->getName(),
                    'access_token' => Crypt::encryptString($user->token),
                    'refresh_token' => $user->refreshToken ? Crypt::encryptString($user->refreshToken) : null,
                    'expires_at' => isset($user->expiresIn) ? now()->addSeconds($user->expiresIn) : null,
                    'metadata' => [
                        'avatar' => $user->getAvatar(),
                        'email' => $user->getEmail(),
                    ]
                ]
            );

            // Redirect back to frontend dashboard
            return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/dashboard?connected=' . $provider);
        } catch (\Exception $e) {
            return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/dashboard?error=' . $e->getMessage());
        }
    }

    public function getConnectedAccounts()
    {
        $userId = 1; // Mock user ID
        $accounts = SocialAccount::where('user_id', $userId)->get()->map(function($account) {
            return [
                'platform' => $account->platform,
                'username' => $account->username,
                'avatar' => $account->metadata['avatar'] ?? null,
                'connected_at' => $account->created_at->toDateTimeString(),
            ];
        });

        return response()->json($accounts);
    }
}
