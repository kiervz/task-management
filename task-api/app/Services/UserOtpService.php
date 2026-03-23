<?php

namespace App\Services;

use App\Enums\OtpType;
use App\Jobs\SendOtpEmailJob;
use App\Models\User;
use App\Models\UserOtp;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class UserOtpService
{
    public function sendOtp(User $user, OtpType $type): UserOtp
    {
        return DB::transaction(function () use ($user, $type) {
            UserOtp::where('user_id', $user->id)
                ->where('type', $type->value)
                ->whereNull('used_at')
                ->whereNull('deleted_at')
                ->update(['deleted_at' => Carbon::now()]);

            $code = $this->generateCode();

            $otp = UserOtp::create([
                'user_id' => $user->id,
                'otp_code' => Hash::make($code),
                'type' => $type->value,
                'attempts' => 0,
                'expires_at' => Carbon::now()->addMinutes(config('otp.expires_minutes')),
                'resend_at' => Carbon::now()->addSeconds(config('otp.resend_seconds')),
                'used_at' => null,
                'created_at' => Carbon::now(),
            ]);

            SendOtpEmailJob::dispatch(
                $user->email,
                $user->name,
                $code,
                $type,
                config('otp.expires_minutes'),
            );

            return $otp;
        });
    }

    public function resendOtp(User $user, OtpType $type): UserOtp
    {
        $existing = UserOtp::where('user_id', $user->id)
            ->where('type', $type->value)
            ->whereNull('used_at')
            ->whereNull('deleted_at')
            ->latest('created_at')
            ->first();

        if ($existing && $existing->isOnCooldown()) {
            $seconds = Carbon::now()->diffInSeconds($existing->resend_at, false);
            throw new TooManyRequestsHttpException(
                "Please wait {$seconds} seconds before resending."
            );
        }

        return $this->sendOtp($user, $type);
    }

    public function validateOtp(
        User $user,
        string $code,
        OtpType $type,
        bool $markUsed = true
    ): UserOtp {
        $otp = UserOtp::where('user_id', $user->id)
            ->where('type', $type->value)
            ->whereNull('used_at')
            ->whereNull('deleted_at')
            ->latest('created_at')
            ->first();

        if (!$otp) {
            throw new UnprocessableEntityHttpException('No active OTP found.');
        }

        if ($otp->isExpired()) {
            throw new UnprocessableEntityHttpException('OTP has expired.');
        }

        if ($otp->attempts >= config('otp.max_attempts')) {
            $otp->update(['deleted_at' => Carbon::now()]);
            throw new UnprocessableEntityHttpException(
                'Maximum OTP attempts exceeded. Please request a new OTP.'
            );
        }

        if (!Hash::check($code, $otp->otp_code)) {
            $otp->increment('attempts');
            $attemptsLeft = config('otp.max_attempts') - $otp->attempts;

            if($attemptsLeft <= 0) {
                $otp->update(['deleted_at' => Carbon::now()]);

                throw new UnprocessableEntityHttpException(
                    'Maximum OTP attempts exceeded. Please request a new OTP.'
                );
            }

            throw new UnprocessableEntityHttpException(
                "Invalid OTP code. You have {$attemptsLeft} attempt" . ($attemptsLeft > 1 ? 's' : '') . " left."
            );
        }

        if ($markUsed) {
            $otp->update(['used_at' => Carbon::now()]);
        }

        return $otp;
    }

    private function generateCode(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}
