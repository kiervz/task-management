<?php

namespace App\Http\Controllers\API\V1;

use App\Enums\Provider;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\UserResource;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class OAuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function redirect(string $provider)
    {
        $this->validateProvider($provider);

        return $this->apiResponse(
            'Redirect URL generated.',
            [
                'url' => Socialite::driver($provider)->stateless()->redirect()->getTargetUrl()
            ]
        );
    }

    public function callback(Request $request, string $provider)
    {
        $this->validateProvider($provider);

        try {
            $socialiteUser = Socialite::driver($provider)->stateless()->user();
        } catch (InvalidStateException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new UnprocessableEntityHttpException('Failed to retrieve user from ' . $provider . '.');
        }

        if (!$socialiteUser->getEmail()) {
            throw new UnprocessableEntityHttpException(
                'No email address returned from ' . $provider . '. Please ensure your ' . $provider . ' account has a public email.'
            );
        }

        $result = $this->authService->loginWithOAuth($provider, $socialiteUser);

        return $this->tokenResponse(
            $result['access_token'],
            $result['refresh_token'],
            'Logged in with ' . ucfirst($provider) . ' successfully.',
            ['user' => new UserResource($result['user'])]
        );
    }

    private function validateProvider(string $provider): void
    {
        if (!in_array(strtolower($provider), array_map('strtolower', array_column(Provider::cases(), 'value')))) {
            throw new UnprocessableEntityHttpException(
                'Unsupported provider. Allowed: ' . implode(', ', array_column(Provider::cases(), 'value')) . '.'
            );
        }
    }

    protected function tokenResponse(
        string $accessToken,
        string $refreshToken,
        string $message,
        mixed $response = null
    ) {
        $data = array_merge(
            [
                'access_token' => $accessToken,
                'expires_in'   => config('sanctum.access_token_ttl') * 60,
            ],
            $response ?? []
        );

        // Mobile: include refresh token in body, no cookie
        if ($this->isMobile(request())) {
            $data['refresh_token'] = $refreshToken;
            return $this->apiResponse($message, $data);
        }

        // Web: refresh token in HttpOnly cookie only
        return $this->apiResponse($message, $data)
            ->cookie(
                'refreshToken',
                $refreshToken,
                $this->refreshTokenTtlMinutes(),
                '/',
                null,
                app()->isProduction(),
                true,
                false,
                app()->isProduction() ? 'Strict' : 'Lax'
            );
    }

    private function refreshTokenTtlMinutes(): int
    {
        return config('sanctum.refresh_token_ttl') * 24 * 60;
    }

    private function isMobile(Request $request): bool
    {
        return strtolower($request->header('X-Client-Type', 'web')) === 'mobile';
    }
}
