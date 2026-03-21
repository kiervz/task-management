<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class ApiResponse
{
    public static function success(
        string $message,
        mixed $response = null,
        int $code = Response::HTTP_OK,
    ): JsonResponse {
        return response()->json([
            'code' => $code,
            'success' => true,
            'message' => $message,
            'response' => $response,
        ], $code);
    }

    public static function error(
        string $message,
        mixed $response = null,
        int $code = Response::HTTP_INTERNAL_SERVER_ERROR,
    ): JsonResponse {
        return response()->json([
            'code' => $code,
            'success' => false,
            'message' => $message,
            'response' => $response,
        ], $code);
    }
}
