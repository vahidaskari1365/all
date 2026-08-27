<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Business;
use App\Models\SecurityLog;
use App\Models\Subscription;
use App\Models\SubscriptionRequest;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\SecurityLogger;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** پنل مدیریت — بررسی درخواست‌ها، تعدیل محتوا، نقش‌ها، لاگ‌ها */
class AdminController extends Controller
{
    /** GET /admin/stats */
    public function stats(): JsonResponse
    {
        return response()->json([
            'users' => User::count(),
            'businesses' => ['total' => Business::count(), 'active' => Business::where('status', 'active')->count(), 'pending' => Business::where('status', 'pending')->count(), 'trashed' => Business::onlyTrashed()->count()],
            'subscriptions' => ['active' => Subscription::where('status', 'active')->count(), 'expired' => Subscription::where('status', 'expired')->count()],
            'pending_requests' => SubscriptionRequest::where('status', 'pending_review')->count(),
        ]);
    }

    /** GET /admin/subscription-requests?status= */
    public function subscriptionRequests(Request $request): JsonResponse
    {
        $q = SubscriptionRequest::with(['user:id,name,phone', 'plan']);

        if ($status = $request->query('status')) {
            $q->where('status', $status);
        }

        return response()->json(['data' => $q->latest()->get()]);
    }

    /** POST /admin/subscription-requests/{id}/approve — تأیید مدیر؛ شروع خودکار اشتراک */
    public function approveRequest(Request $request, int $id, SubscriptionService $service): JsonResponse
    {
        $data = $request->validate(['note' => ['nullable', 'string', 'max:500']]);
        $req = SubscriptionRequest::findOrFail($id);

        abort_unless($req->status === SubscriptionRequest::STATUS_PENDING_REVIEW, 422, 'این درخواست قبلاً بررسی شده است.');
        abort_unless($req->receipt_path !== null, 422, 'رسید پرداخت بارگذاری نشده است.');

        $subscription = $service->approve($req, $request->user(), $data['note'] ?? null);

        return response()->json(['data' => $subscription->load('plan'), 'message' => 'اشتراک فعال شد.']);
    }

    /** POST /admin/subscription-requests/{id}/reject */
    public function rejectRequest(Request $request, int $id, SubscriptionService $service): JsonResponse
    {
        $data = $request->validate(['note' => ['required', 'string', 'max:500']]);
        $req = SubscriptionRequest::findOrFail($id);

        abort_unless($req->status === SubscriptionRequest::STATUS_PENDING_REVIEW, 422, 'این درخواست قبلاً بررسی شده است.');

        $service->reject($req, $request->user(), $data['note']);

        return response()->json(['message' => 'درخواست رد شد.']);
    }

    /** GET /admin/businesses?trashed=1&status= */
    public function businesses(Request $request): JsonResponse
    {
        $q = Business::withTrashed()->with(['owner:id,name,phone', 'category:id,name', 'city:id,name'])->latest();

        if ($request->boolean('trashed')) {
            $q->onlyTrashed();
        } elseif ($status = $request->query('status')) {
            $q->where('status', $status);
        }

        return response()->json(['data' => $q->get()]);
    }

    /** PATCH /admin/businesses/{id}/status — تأیید/تعلیق/رد کسب‌وکار */
    public function setBusinessStatus(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'in:active,pending,suspended,rejected'],
            'reason' => ['nullable', 'string', 'max:250'],
        ]);

        $business = Business::withTrashed()->findOrFail($id);
        $before = $business->only(['status', 'reject_reason']);

        $business->forceFill([
            'status' => $data['status'],
            'reject_reason' => $data['reason'] ?? null,
            'approved_by' => $data['status'] === 'active' ? $request->user()->id : $business->approved_by,
            'approved_at' => $data['status'] === 'active' ? now() : $business->approved_at,
        ])->save();

        AuditLogger::log('status_changed', $business, $before, $business->only(['status', 'reject_reason']));

        return response()->json(['data' => $business->fresh()]);
    }

    /** POST /admin/businesses/{id}/restore */
    public function restoreBusiness(Request $request, int $id): JsonResponse
    {
        $business = Business::onlyTrashed()->findOrFail($id);
        $business->restore();

        return response()->json(['data' => $business->fresh()]);
    }

    /** DELETE /admin/businesses/{id}?force=1 — حذف نرم یا قطعی */
    public function deleteBusiness(Request $request, int $id)
    {
        $business = Business::withTrashed()->findOrFail($id);

        if ($request->boolean('force')) {
            $business->forceDelete();

            return response()->json(['message' => 'کسب‌وکار به‌طور قطعی حذف شد.']);
        }
        $business->delete();

        return response()->json(['message' => 'کسب‌وکار حذف نرم شد.']);
    }

    /** GET /admin/users */
    public function users(): JsonResponse
    {
        return response()->json(['data' => User::with('designerProfile:code,user_id,title')->orderBy('id')->get(['id', 'name', 'phone', 'role', 'is_active', 'created_at'])]);
    }

    /** PATCH /admin/users/{id}/role — تعیین نقش و دسترسی */
    public function setRole(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'role' => ['required', 'in:'.implode(',', User::ROLES)],
        ]);

        $user = User::findOrFail($id);
        $before = $user->role;

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'نقش خودتان قابل تغییر نیست.'], 422);
        }

        $user->forceFill(['role' => $data['role']])->save();

        if ($data['role'] === User::ROLE_DESIGNER && ! $user->designerProfile) {
            $user->designerProfile()->create(['code' => \App\Models\DesignerProfile::generateUniqueCode()]);
        }

        AuditLogger::log('role_changed', $user, ['role' => $before], ['role' => $data['role']]);
        SecurityLogger::log('role_changed', ['target' => $user->id, 'from' => $before, 'to' => $data['role']], $request->user());

        return response()->json(['data' => $user->only(['id', 'name', 'phone', 'role'])]);
    }

    /** GET /admin/audit-logs — سوابق مدیریتی */
    public function auditLogs(Request $request): JsonResponse
    {
        $q = AuditLog::query()->latest();

        if ($subjectType = $request->query('subject_type')) {
            $q->where('subject_type', $subjectType);
        }
        if ($action = $request->query('action')) {
            $q->where('action', $action);
        }

        return response()->json(['data' => $q->limit((int) $request->query('limit', 100))->get()]);
    }

    /** GET /admin/security-logs — لاگ امنیتی */
    public function securityLogs(Request $request): JsonResponse
    {
        $q = SecurityLog::query()->latest();

        if ($event = $request->query('event')) {
            $q->where('event', $event);
        }

        return response()->json(['data' => $q->limit((int) $request->query('limit', 100))->get()]);
    }
}
