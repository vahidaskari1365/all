<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BusinessCard;
use App\Services\QrGeneratorService;
use Illuminate\Support\Facades\Cache;

/** QR اختصاصی کارت — خروجی PNG */
class QrController extends Controller
{
    public function show(string $slug, QrGeneratorService $qr)
    {
        $card = BusinessCard::query()->where('slug', $slug)->where('is_active', true)->firstOrFail();

        $png = Cache::remember("qr:{$slug}", now()->addDay(), fn () => $qr->pngBinary(url("/c/{$slug}")));

        return response($png, 200, ['Content-Type' => 'image/png', 'Cache-Control' => 'public, max-age=86400']);
    }
}
