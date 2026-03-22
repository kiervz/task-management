<?php

namespace App\Http\Middleware;

use App\Helpers\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response as SymfonyResponse;

class ValidateClientType
{
    private const ALLOWED = ['web', 'mobile'];

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (SymfonyResponse)  $next
     */
    public function handle(Request $request, Closure $next): SymfonyResponse
    {
        $clientType = $request->header('X-Client-Type');

        if (!$clientType) {
            $request->headers->set('X-Client-Type', 'web');
            return $next($request);
        }

        if (!in_array($clientType, self::ALLOWED)) {
            return ApiResponse::error(
                'Invalid X-Client-Type header. Allowed values: ' . implode(', ', self::ALLOWED) . '.',
                null,
                SymfonyResponse::HTTP_BAD_REQUEST
            );
        }

        $request->headers->set('X-Client-Type', strtolower($clientType));

        return $next($request);
    }
}
