<?php

namespace App\Http\Controllers\API\V1;

use App\Enums\OtpType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordResendRequest;
use App\Http\Requests\Auth\ForgotPasswordResetRequest;
use App\Http\Requests\Auth\ForgotPasswordVerifyRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResendOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Http\Resources\User\UserResource;
use App\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\UnauthorizedException;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function register(RegisterRequest $request)
    {
        $this->authService->register($request->validated());

        return $this->apiResponse(
            'Registration successful. Please verify your email.',
            null,
            Response::HTTP_CREATED
        );
    }

    public function login(LoginRequest $request)
    {
        $result = $this->authService->login($request->validated());

        return $this->tokenResponse(
            $result['access_token'],
            $result['refresh_token'],
            'Logged in successfully.',
            ['user' => new UserResource($result['user'])]
        );
    }

    public function refresh(Request $request)
    {
        // Mobile sends refresh token in body, web sends via cookie
        $refreshToken = $this->isMobile($request)
            ? $request->input('refresh_token')
            : $request->cookie('refreshToken');

        if (!$refreshToken) {
            throw new UnauthorizedException('Refresh token not found.');
        }

        $result = $this->authService->refreshAccessToken($refreshToken);

        $data = [
            'access_token' => $result['accessToken'],
            'expires_in'   => $result['expiresIn'],
        ];

        // Mobile: return new refresh token in body
        if ($this->isMobile($request)) {
            $data['refresh_token'] = $result['refreshToken'];
            return $this->apiResponse('Token refreshed successfully.', $data);
        }

        // Web: set new refresh token in cookie
        return $this->apiResponse('Token refreshed successfully.', $data)
            ->cookie(
                'refreshToken',
                $result['refreshToken'],
                $this->refreshTokenTtlMinutes(),
                '/',
                null,
                app()->isProduction(),
                true,
                false,
                app()->isProduction() ? 'Strict' : 'Lax'
            );
    }

    public function verifyRegisterOtp(VerifyOtpRequest $request)
    {
        $result = $this->authService->verifyRegisterOtp($request->validated());

        return $this->tokenResponse(
            $result['access_token'],
            $result['refresh_token'],
            'Email verified successfully.',
            ['user' => new UserResource($result['user'])]
        );
    }

    public function resendOtp(ResendOtpRequest $request)
    {
        $this->authService->resendOtp($request->email, OtpType::from($request->type));

        return $this->apiResponse('If an account exists with that email, a new OTP has been sent.');
    }

    public function forgotPassword(ForgotPasswordRequest $request)
    {
        $this->authService->sendForgotPasswordOtp($request->email);

        return $this->apiResponse(
            'If an account exists with that email, you will receive a password reset OTP shortly.'
        );
    }

    public function forgotPasswordResend(ForgotPasswordResendRequest $request)
    {
        $this->authService->resendForgotPasswordOtp($request->email);

        return $this->apiResponse('If an account exists with that email, a new OTP has been sent.');
    }

    public function forgotPasswordVerify(ForgotPasswordVerifyRequest $request)
    {
        $this->authService->verifyForgotPasswordOtp($request->validated());

        return $this->apiResponse('OTP verified. You may now reset your password.');
    }

    public function forgotPasswordReset(ForgotPasswordResetRequest $request)
    {
        $this->authService->resetPassword($request->validated());

        return $this->apiResponse('Password reset successfully.');
    }

    public function me(Request $request)
    {
        return $this->apiResponse('User data retrieved successfully.', new UserResource($request->user()));
    }

    public function sessions(Request $request)
    {
        return $this->apiResponse(
            'User sessions retrieved successfully.',
            $this->authService->getSessions($request->user())
        );
    }

    public function logout(Request $request)
    {
        $refreshToken = $this->isMobile($request)
            ? $request->input('refresh_token')
            : $request->cookie('refreshToken');

        $this->authService->logout($request->user(), $refreshToken ?? '');

        $response = $this->apiResponse('Logged out successfully.');

        return $this->isMobile($request)
            ? $response
            : $response->cookie('refreshToken', '', -1);
    }

    public function logoutAll(Request $request)
    {
        $this->authService->logoutAll($request->user());

        $response = $this->apiResponse('Logged out from all devices.');

        return $this->isMobile($request)
            ? $response
            : $response->cookie('refreshToken', '', -1);
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
