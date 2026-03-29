<?php

namespace App\Http\Controllers\API\V1;

use App\Enums\Provider;
use App\Http\Controllers\Controller;
use App\Http\Resources\User\UserResource;
use App\Services\AuthService;
use Illuminate\Http\RedirectResponse;
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

        return Socialite::driver($provider)->stateless()->redirect();
    }

    public function callback(Request $request, string $provider)
    {
        $this->validateProvider($provider);

        try {
            $socialiteUser = Socialite::driver($provider)->stateless()->user();
        } catch (InvalidStateException $e) {
            if (!$this->isMobile($request)) {
                return $this->redirectToFrontendLogin($provider, 'invalid_state');
            }

            throw $e;
        } catch (\Exception $e) {
            if (!$this->isMobile($request)) {
                return $this->redirectToFrontendLogin($provider, 'provider_user_fetch_failed');
            }

            throw new UnprocessableEntityHttpException('Failed to retrieve user from ' . $provider . '.');
        }

        if (!$socialiteUser->getEmail()) {
            if (!$this->isMobile($request)) {
                return $this->redirectToFrontendLogin($provider, 'email_missing');
            }

            throw new UnprocessableEntityHttpException(
                'No email address returned from ' . $provider . '. Please ensure your ' . $provider . ' account has a public email.'
            );
        }

        $result = $this->authService->loginWithOAuth($provider, $socialiteUser);

        if (!$this->isMobile($request)) {
            return $this->redirectToFrontend($provider, $result['refresh_token']);
        }

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
                'refresh_token',
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

    private function redirectToFrontend(
        string $provider,
        string $refreshToken
    ): RedirectResponse {
        $frontendUrl = rtrim(config('app.frontend_url'), '/');
        $query = http_build_query([
            'provider' => $provider,
        ]);

        return redirect()->away("{$frontendUrl}/auth/callback?{$query}")
            ->cookie(
                'refresh_token',
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

    private function redirectToFrontendLogin(string $provider, string $error): RedirectResponse
    {
        $frontendUrl = rtrim(config('app.frontend_url'), '/');
        $query = http_build_query([
            'provider' => $provider,
            'oauth_error' => $error,
        ]);

        return redirect()->away("{$frontendUrl}/login?{$query}");
    }
}
