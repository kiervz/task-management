<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller as BaseController;

abstract class Controller extends BaseController
{
    use AuthorizesRequests;

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
