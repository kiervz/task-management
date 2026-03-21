<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

abstract class Controller
{
    protected function apiResponse(
        string $message,
        mixed $response = null,
        int $code = Response::HTTP_OK,
    ): JsonResponse {
        return ApiResponse::success($message, $response, $code);
    }

    protected function apiError(
        string $message,
        mixed $response = null,
        int $code = Response::HTTP_INTERNAL_SERVER_ERROR,
    ): JsonResponse {
        return ApiResponse::error($message, $response, $code);
    }
}
