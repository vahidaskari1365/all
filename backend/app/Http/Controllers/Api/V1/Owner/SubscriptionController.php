<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Owner;

use App\Models\SecurityLog;
use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\SubscriptionRequest;
use App\Services\SecurityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** پنل مالک — درخواست اشتراک و رسید پرداخت آفلاین */
class SubscriptionController extends Controller
{
    /** GET /owner/plans */
    public function plans(): JsonResponse
    {
        return response()->json(['data' => Plan::where('is_active', true)->orderBy('sort')->get()]);
    }

    /** POST /owner/subscription-requests — ثبت درخواست اشتراک */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'plan_id' => ['required', 'integer', 'exists:plans,id'],
        ]);

        $active = Subscription::where('user_id', $request->user()->id)
            ->where('status', Subscription::STATUS_ACTIVE)
            ->where('ends_at', '>', now())
            ->exists();

        if ($active) {
            return response()->json(['message' => 'شما یک اشتراک فعال دارید.'], 422);
        }

        $req = SubscriptionRequest::create([
            'user_id' => $request->user()->id,
            'plan_id' => $data['plan_id'],
            'status' => SubscriptionRequest::STATUS_PENDING_REVIEW,
        ]);

        return response()->json(['data' => $req->load('plan'), 'message' => 'درخواست ثبت شد؛ اکنون رسید پرداخت را بارگذاری کنید.'], 201);
    }

    /** POST /owner/subscription-requests/{id}/receipt — بارگذاری رسید پرداخت آفلاین */
    public function uploadReceipt(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'receipt' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'], // حداکثر ۵ مگابایت
            'tracking_code' => ['nullable', 'string', 'max:60'],
        ]);

        $req = SubscriptionRequest::where('user_id', $request->user()->id)->findOrFail($id);

        if ($req->status !== SubscriptionRequest::STATUS_PENDING_REVIEW) {
            return response()->json(['message' => 'این درخواست قابل تغییر نیست.'], 422);
        }

        $path = $request->file('receipt')->store("receipts/{$request->user()->id}", 'local');

        $req->forceFill([
            'receipt_path' => $path,
            'receipt_original_name' => $request->file('receipt')->getClientOriginalName(),
            'tracking_code' => $data['tracking_code'] ?? null,
        ])->save();

        SecurityLogger::log(SecurityLog::EVT_RECEIPT_UPLOADED, ['request_id' => $req->id], $request->user());

        return response()->json(['data' => $req->fresh(), 'message' => 'رسید بارگذاری شد و در انتظار تأیید مدیر است.']);
    }

    /** GET /owner/subscription-requests */
    public function index(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()->subscriptionRequests()->with('plan')->latest()->get()]);
    }

    /** GET /owner/subscriptions */
    public function subscriptions(Request $request): JsonResponse
    {
        return response()->json(['data' => $request->user()->subscriptions()->with('plan')->latest()->get()]);
    }
}
