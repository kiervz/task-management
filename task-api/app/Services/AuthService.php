<?php

namespace App\Services;

use App\Enums\OtpType;
use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\UnauthorizedException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Carbon\Carbon;
use App\Models\UserAccount;
use Laravel\Socialite\Contracts\User as SocialiteUser;

class AuthService
{
    private const USER_NOT_FOUND = 'User not found.';

    public function __construct(private UserOtpService $userOtpService) {}

    public function register(array $data): void
    {
        DB::transaction(function () use ($data) {
            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            $this->userOtpService->sendOtp($user, OtpType::REGISTER);
        });
    }

    public function login(array $data): array
    {
        if (!Auth::attempt(['email' => $data['email'], 'password' => $data['password']])) {
            throw new UnauthorizedException('Invalid email or password.');
        }

        $user = Auth::user();

        if (!$user->email_verified_at) {
            throw new AccessDeniedHttpException(
                'Email is not verified. Please check your email for the verification code.'
            );
        }

        $accessToken  = $this->createAccessToken($user);
        $refreshToken = $this->createRefreshToken($user);

        return [
            'user'          => $user,
            'access_token'  => $accessToken,
            'refresh_token' => $refreshToken,
        ];
    }

    public function refreshAccessToken(string $rawToken): array
    {
        $refreshToken = RefreshToken::where('token', hash('sha256', $rawToken))->first();

        // Replay attack: token exists but is already revoked
        if ($refreshToken && $refreshToken->isRevoked()) {
            $this->revokeAllRefreshTokens($refreshToken->user_id);
            $refreshToken->user->tokens()->delete();

            throw new UnauthorizedException('Suspicious activity detected. All sessions have been revoked.');
        }

        if (!$refreshToken || $refreshToken->isExpired()) {
            throw new UnauthorizedException('Invalid or expired refresh token.');
        }

        $user = $refreshToken->user;

        return DB::transaction(function () use ($user, $refreshToken) {
            $refreshToken->update([
                'revoked_at'   => Carbon::now(),
                'last_used_at' => Carbon::now(),
            ]);

            $newAccessToken  = $this->createAccessToken($user);
            $newRefreshToken = $this->createRefreshToken($user);

            return [
                'accessToken'  => $newAccessToken,
                'refreshToken' => $newRefreshToken,
                'expiresIn'    => config('sanctum.access_token_ttl') * 60,
            ];
        });
    }

    public function verifyRegisterOtp(array $data): array
    {
        $user = DB::transaction(function () use ($data) {
            $user = User::where('email', $data['email'])->firstOrFail();
            $this->userOtpService->validateOtp($user, $data['otp_code'], OtpType::REGISTER);
            $user->update(['email_verified_at' => Carbon::now()]);
            return $user;
        });

        return [
            'user'          => $user,
            'access_token'  => $this->createAccessToken($user),
            'refresh_token' => $this->createRefreshToken($user),
        ];
    }

    public function resendOtp(string $email, OtpType $type): void
    {
        $user = User::where('email', $email)->first();
        if (!$user) return;
        $this->userOtpService->resendOtp($user, $type);
    }

    public function sendForgotPasswordOtp(string $email): void
    {
        $user = User::where('email', $email)->first();
        if (!$user) return;
        $this->userOtpService->sendOtp($user, OtpType::FORGOT_PASSWORD);
    }

    public function resendForgotPasswordOtp(string $email): void
    {
        $user = User::where('email', $email)->first();
        if (!$user) return;
        $this->userOtpService->resendOtp($user, OtpType::FORGOT_PASSWORD);
    }

    public function verifyForgotPasswordOtp(array $data): void
    {
        $user = User::where('email', $data['email'])->first();
        if (!$user) return;

        $this->userOtpService->validateOtp($user, $data['otp_code'], OtpType::FORGOT_PASSWORD, false);
    }

    public function resetPassword(array $data): void
    {
        DB::transaction(function () use ($data) {
            $user = User::where('email', $data['email'])->first();

            if (!$user) {
                throw new NotFoundHttpException(self::USER_NOT_FOUND);
            }

            $this->userOtpService->validateOtp($user, $data['otp_code'], OtpType::FORGOT_PASSWORD, true);

            $user->update(['password' => Hash::make($data['new_password'])]);

            $user->tokens()->delete();
            $this->revokeAllRefreshTokens($user->id);
        });
    }

    public function getSessions(User $user)
    {
        return RefreshToken::where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->where('expires_at', '>', Carbon::now())
            ->select(['id', 'device_info', 'ip_address', 'last_used_at', 'created_at', 'expires_at'])
            ->orderBy('last_used_at', 'desc')
            ->get();
    }

    public function logout(User $user, string $rawToken): void
    {
        RefreshToken::where('user_id', $user->id)
            ->where('token', hash('sha256', $rawToken))
            ->whereNull('revoked_at')
            ->update(['revoked_at' => Carbon::now()]);

        $user->currentAccessToken()->delete();
    }

    public function logoutAll(User $user): void
    {
        $user->tokens()->delete();
        $this->revokeAllRefreshTokens($user->id);
    }

    private function createAccessToken(User $user): string
    {
        return $user->createToken(
            'auth',
            ['*'],
            now()->addMinutes(config('sanctum.access_token_ttl'))
        )->plainTextToken;
    }

    private function createRefreshToken(User $user): string
    {
        $rawToken = Str::random(128);

        RefreshToken::create([
            'user_id'     => $user->id,
            'token'       => hash('sha256', $rawToken),
            'device_info' => request()->header('User-Agent'),
            'ip_address'  => request()->ip(),
            'expires_at'  => Carbon::now()->addDays(config('sanctum.refresh_token_ttl')),
        ]);

        return $rawToken;
    }

    private function revokeAllRefreshTokens(string $userId): void
    {
        RefreshToken::where('user_id', $userId)
            ->whereNull('revoked_at')
            ->update(['revoked_at' => Carbon::now()]);
    }

    public function loginWithOAuth(string $provider, SocialiteUser $socialiteUser): array
    {
        $account = UserAccount::where('provider', $provider)
            ->where('provider_id', $socialiteUser->getId())
            ->first();

        $user = DB::transaction(function () use ($account, $provider, $socialiteUser) {
            if ($account) {
                return $account->user;
            }

            $user = User::firstOrCreate(
                ['email' => $socialiteUser->getEmail()],
                [
                    'name'              => $socialiteUser->getName(),
                    'email_verified_at' => Carbon::now(),
                    'password'          => null,
                ]
            );

            $user->userAccounts()->create([
                'provider'    => $provider,
                'provider_id' => $socialiteUser->getId(),
            ]);

            return $user;
        });

        return [
            'user'          => $user,
            'access_token'  => $this->createAccessToken($user),
            'refresh_token' => $this->createRefreshToken($user),
        ];
    }

}
