<?php

use App\Http\Controllers\API\V1\AuthController;
use App\Http\Controllers\API\V1\OAuthController;
use App\Http\Controllers\API\V1\ProjectController;
use App\Http\Controllers\API\V1\TaskCatalogController;
use App\Http\Controllers\API\V1\TaskController;
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
        Route::delete('projects/{projectCode}/members/{userId}', [ProjectController::class, 'removeMember']);
        Route::post('projects/{projectCode}/transfer-ownership', [ProjectController::class, 'transferOwnership']);
        Route::post('projects/{projectCode}/invites', [ProjectController::class, 'inviteMember']);
        Route::post('projects/invites/confirm', [ProjectController::class, 'confirmInvite']);

        Route::prefix('projects/{projectCode}')->group(function () {
            Route::get('task-types', [TaskCatalogController::class, 'taskTypes']);
            Route::post('task-types', [TaskCatalogController::class, 'storeTaskType']);

            Route::get('task-statuses', [TaskCatalogController::class, 'taskStatuses']);
            Route::post('task-statuses', [TaskCatalogController::class, 'storeTaskStatus']);

            Route::get('task-priorities', [TaskCatalogController::class, 'taskPriorities']);
            Route::post('task-priorities', [TaskCatalogController::class, 'storeTaskPriority']);

            Route::get('tasks', [TaskController::class, 'index']);
            Route::post('tasks', [TaskController::class, 'store']);
        });

        Route::put('task-types/{taskTypeId}', [TaskCatalogController::class, 'updateTaskType']);
        Route::delete('task-types/{taskTypeId}', [TaskCatalogController::class, 'destroyTaskType']);

        Route::put('task-statuses/{taskStatusId}', [TaskCatalogController::class, 'updateTaskStatus']);
        Route::delete('task-statuses/{taskStatusId}', [TaskCatalogController::class, 'destroyTaskStatus']);

        Route::put('task-priorities/{taskPriorityId}', [TaskCatalogController::class, 'updateTaskPriority']);
        Route::delete('task-priorities/{taskPriorityId}', [TaskCatalogController::class, 'destroyTaskPriority']);

        Route::put('tasks/{taskId}', [TaskController::class, 'update']);
        Route::delete('tasks/{taskId}', [TaskController::class, 'destroy']);
        Route::get('tasks/{taskId}', [TaskController::class, 'show']);

        Route::get('tasks/{taskId}/assignees', [TaskController::class, 'assignees']);
        Route::post('tasks/{taskId}/assignees', [TaskController::class, 'assignAssignee']);
        Route::delete('tasks/{taskId}/assignees/{userId}', [TaskController::class, 'unassignAssignee']);

        Route::apiResource('projects', ProjectController::class);
    });
});
