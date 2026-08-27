<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\Admin\AdminController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DesignerController;
use App\Http\Controllers\Api\V1\Owner\BusinessController as OwnerBusinessController;
use App\Http\Controllers\Api\V1\Owner\CardController;
use App\Http\Controllers\Api\V1\Owner\SubscriptionController;
use App\Http\Controllers\Api\V1\PublicController;
use App\Http\Controllers\Api\V1\QrController;
use App\Http\Controllers\Api\V1\ReferralController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {

    // ── عمومی ─────────────────────────────────────────────
    Route::get('/bootstrap', [PublicController::class, 'bootstrap']);
    Route::get('/businesses/search', [PublicController::class, 'searchBusinesses']);
    Route::get('/businesses/{slug}', [PublicController::class, 'showBusiness']);
    Route::get('/cards/{slug}', [PublicController::class, 'showCard']);
    Route::get('/cards/{slug}/qr.png', [QrController::class, 'show']);
    Route::get('/referrals/{code}', [ReferralController::class, 'show']);

    // ── احراز هویت با شماره موبایل (OTP) ──────────────────
    Route::post('/auth/otp/request', [AuthController::class, 'requestOtp'])->middleware('throttle:10,1');
    Route::post('/auth/otp/verify', [AuthController::class, 'verifyOtp'])->middleware('throttle:10,1');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/location', [AuthController::class, 'saveLocation']); // ذخیره موقعیت تا تغییر دستی
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // ── پنل مالک ──────────────────────────────────────
        Route::prefix('owner')->middleware('role:owner,designer,user')->group(function (): void {
            Route::get('/businesses', [OwnerBusinessController::class, 'index']);
            Route::post('/businesses', [OwnerBusinessController::class, 'store']);
            Route::put('/businesses/{id}', [OwnerBusinessController::class, 'update']);
            Route::delete('/businesses/{id}', [OwnerBusinessController::class, 'destroy']);

            Route::get('/plans', [SubscriptionController::class, 'plans']);
            Route::post('/subscription-requests', [SubscriptionController::class, 'store']);
            Route::post('/subscription-requests/{id}/receipt', [SubscriptionController::class, 'uploadReceipt']);
            Route::get('/subscription-requests', [SubscriptionController::class, 'index']);
            Route::get('/subscriptions', [SubscriptionController::class, 'subscriptions']);

            Route::get('/cards', [CardController::class, 'index']);
            Route::post('/cards', [CardController::class, 'store']);
            Route::put('/cards/{id}', [CardController::class, 'update']);
            Route::post('/cards/{id}/print', [CardController::class, 'uploadPrint']);
        });

        // ── پنل طراح ──────────────────────────────────────
        Route::prefix('designer')->middleware('role:designer')->group(function (): void {
            Route::get('/profile', [DesignerController::class, 'profile']);
            Route::put('/profile', [DesignerController::class, 'update']);
            Route::get('/referrals', [DesignerController::class, 'referrals']);
        });

        // ── پنل مدیریت ────────────────────────────────────
        Route::prefix('admin')->middleware('role:admin')->group(function (): void {
            Route::get('/stats', [AdminController::class, 'stats']);
            Route::get('/subscription-requests', [AdminController::class, 'subscriptionRequests']);
            Route::post('/subscription-requests/{id}/approve', [AdminController::class, 'approveRequest']);
            Route::post('/subscription-requests/{id}/reject', [AdminController::class, 'rejectRequest']);
            Route::get('/businesses', [AdminController::class, 'businesses']);
            Route::patch('/businesses/{id}/status', [AdminController::class, 'setBusinessStatus']);
            Route::post('/businesses/{id}/restore', [AdminController::class, 'restoreBusiness']);
            Route::delete('/businesses/{id}', [AdminController::class, 'deleteBusiness']);
            Route::get('/users', [AdminController::class, 'users']);
            Route::patch('/users/{id}/role', [AdminController::class, 'setRole']);
            Route::get('/audit-logs', [AdminController::class, 'auditLogs']);
            Route::get('/security-logs', [AdminController::class, 'securityLogs']);
        });
    });
});
