<?php

use App\Helpers\ApiResponse;
use App\Http\Middleware\ValidateClientType;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Two\InvalidStateException;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'client.type' => ValidateClientType::class,
        ]);
        $middleware->trustProxies(
            at: '*', // trust all proxies (Cloudflare + Vultr LB)
            headers: Request::HEADER_X_FORWARDED_FOR
                | Request::HEADER_X_FORWARDED_HOST
                | Request::HEADER_X_FORWARDED_PORT
                | Request::HEADER_X_FORWARDED_PROTO
        );
    })
    ->withExceptions(function (Exceptions $exceptions): void {

        $exceptions->render(function (ThrottleRequestsException $e) {
            $retryAfter = $e->getHeaders()['Retry-After'] ?? 60;
            return ApiResponse::error(
                "Too many attempts. Please try again in {$retryAfter} seconds.",
                null,
                Response::HTTP_TOO_MANY_REQUESTS
            );
        });

        $exceptions->render(function (ValidationException $e) {
            $errors = $e->errors();
            $firstMessage = collect($errors)->flatten()->first();

            return ApiResponse::error(
                $firstMessage,
                $errors,
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        });

        $exceptions->render(function (InvalidStateException $e) {
            return ApiResponse::error(
                'OAuth state invalid. Please try again.',
                null,
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        });

        // Catch-all for remaining HTTP exceptions — must be last
        $exceptions->render(function (HttpException $e) {
            return ApiResponse::error($e->getMessage(), null, $e->getStatusCode());
        });
    })->create();
