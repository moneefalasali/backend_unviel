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
            
            // Get the authenticated user ID from the request or use a default
            // In a real app with proper auth, this would be Auth::id()
            $userId = Auth::id() ?? request()->user()?->id ?? 1;

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

            // Redirect back to frontend dashboard with success message
            return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/dashboard?connected=' . $provider . '&success=true');
        } catch (\Exception $e) {
            return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/dashboard?error=' . urlencode($e->getMessage()));
        }
    }

    public function getConnectedAccounts(Request $request)
    {
        // Get the authenticated user ID
        $userId = Auth::id() ?? request()->user()?->id ?? 1;
        
        $accounts = SocialAccount::where('user_id', $userId)->get()->map(function($account) {
            return [
                'id' => $account->id,
                'platform' => $account->platform,
                'username' => $account->username,
                'avatar' => $account->metadata['avatar'] ?? null,
                'email' => $account->metadata['email'] ?? null,
                'connected_at' => $account->created_at->toDateTimeString(),
            ];
        });

        return response()->json($accounts);
    }

    public function disconnectAccount(Request $request, $accountId)
    {
        $userId = Auth::id() ?? request()->user()?->id ?? 1;
        
        $account = SocialAccount::where('id', $accountId)
            ->where('user_id', $userId)
            ->first();

        if (!$account) {
            return response()->json(['error' => 'Account not found'], 404);
        }

        $account->delete();

        return response()->json(['message' => 'Account disconnected successfully']);
    }
}
