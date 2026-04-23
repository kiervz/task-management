<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    abort(500, 'Something went wrong');
});

Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});
