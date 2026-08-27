<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/** لینک کوتاه کارت — مقصد QR اختصاصی */
Route::get('/c/{slug}', function (string $slug) {
    return response()->json([
        'card' => $slug,
        'api' => url("/api/v1/cards/{$slug}"),
    ]);
});

/** لندینگ لینک معرف طراح */
Route::get('/r/{code}', function (Request $request, string $code) {
    return redirect()->away(rtrim((string) config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/').'/register?ref='.$code);
});
