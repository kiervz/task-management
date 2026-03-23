<?php

use App\Http\Controllers\API\V1\AuthController;
use App\Http\Controllers\API\V1\OAuthController;
use App\Http\Controllers\API\V1\ProjectController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::prefix('auth')->middleware('client.type')->group(function () {

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

        Route::get('{provider}/redirect', [OAuthController::class, 'redirect']);
        Route::get('{provider}/callback', [OAuthController::class, 'callback']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('me', [AuthController::class, 'me']);
            Route::get('sessions', [AuthController::class, 'sessions']);
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('logout-all', [AuthController::class, 'logoutAll']);
        });

    });

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('projects/{projectCode}/members', [ProjectController::class, 'members']);
        Route::post('projects/{projectCode}/invites', [ProjectController::class, 'inviteMember']);
        Route::get('projects/invites/confirm', [ProjectController::class, 'confirmInvite']);
        Route::apiResource('projects', ProjectController::class);
    });
});
