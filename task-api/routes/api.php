<?php

use App\Http\Controllers\API\V1\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->group(function () {

        Route::middleware('throttle:5,1')->group(function () {
            Route::post('login', [AuthController::class, 'login']);
            Route::post('register/verify', [AuthController::class, 'verifyRegisterOtp']);
            Route::post('forgot-password/verify', [AuthController::class, 'forgotPasswordVerify']);
            Route::post('forgot-password/reset', [AuthController::class, 'forgotPasswordReset']);
        });

        Route::middleware('throttle:3,1')->group(function () {
            Route::post('otp/resend', [AuthController::class, 'resendOtp']);
            Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
            Route::post('forgot-password/resend', [AuthController::class, 'forgotPasswordResend']);
        });

        Route::middleware('throttle:5,1')->group(function () {
            Route::post('register', [AuthController::class, 'register']);
            Route::post('refresh-token', [AuthController::class, 'refresh']);
        });

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::get('sessions', [AuthController::class, 'sessions']);
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('logout-all', [AuthController::class, 'logoutAll']);
        });

    });
});
