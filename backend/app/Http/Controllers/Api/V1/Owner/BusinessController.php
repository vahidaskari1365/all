<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Owner;

use App\Models\SecurityLog;
use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Services\DuplicateBusinessDetector;
use App\Services\SecurityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/** پنل مالک — مدیریت کسب‌وکارها */
class BusinessController extends Controller
{
    public function __construct(private readonly DuplicateBusinessDetector $detector) {}

    /** GET /owner/businesses */
    public function index(Request $request): JsonResponse
    {
        $businesses = $request->user()->businesses()->with(['category:id,name,slug', 'city:id,name,slug'])->latest()->get();

        return response()->json(['data' => $businesses]);
    }

    /** POST /owner/businesses — با تشخیص کسب‌وکار تکراری */
    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        $duplicates = $this->detector->find($data['name'], $data['phone'] ?? null, (int) $data['city_id']);

        if ($duplicates !== [] && ! ($data['force'] ?? false)) {
            SecurityLogger::log(SecurityLog::EVT_DUPLICATE_ATTEMPT, ['candidates' => $duplicates], $request->user());

            return response()->json([
                'message' => 'کسب‌وکار مشابهی قبلاً ثبت شده است.',
                'duplicates' => $duplicates,
            ], 409);
        }

        $business = Business::create($this->payload($request->user(), $data));

        return response()->json(['data' => $business, 'message' => 'کسب‌وکار ثبت شد و در انتظار تأیید مدیریت است.'], 201);
    }

    /** PUT /owner/businesses/{id} */
    public function update(Request $request, int $id): JsonResponse
    {
        $business = $request->user()->businesses()->findOrFail($id);
        $data = $this->validated($request, $business->id);

        if ($business->status === Business::STATUS_SUSPENDED) {
            return response()->json(['message' => 'کسب‌وکار تعلیق‌شده قابل ویرایش نیست؛ با پشتیبانی تماس بگیرید.'], 422);
        }

        $oldStatus = $business->status;
        $business->update($this->payload($request->user(), $data, $business));

        // هر ویرایش، وضعیت بررسی را به «در انتظار تأیید» برمی‌گرداند
        if ($oldStatus === Business::STATUS_ACTIVE) {
            $business->forceFill(['status' => Business::STATUS_PENDING])->save();
        }

        return response()->json(['data' => $business->refresh()]);
    }

    /** DELETE /owner/businesses/{id} — حذف نرم */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $business = $request->user()->businesses()->findOrFail($id);
        $business->delete();

        return response()->json(['message' => 'کسب‌وکار حذف شد (حذف نرم — سوابق حفظ می‌شود).']);
    }

    private function validated(Request $request, ?int $excludeId = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'city_id' => ['required', 'integer', 'exists:cities,id'],
            'district' => ['nullable', 'string', 'max:120'],
            'tagline' => ['nullable', 'string', 'max:220'],
            'description' => ['nullable', 'string', 'max:5000'],
            'address' => ['nullable', 'string', 'max:500'],
            'phone' => ['nullable', 'string', 'max:40'],
            'mobile' => ['nullable', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:120'],
            'website' => ['nullable', 'string', 'max:160'],
            'logo_url' => ['nullable', 'string', 'max:500'],
            'cover_url' => ['nullable', 'string', 'max:500'],
            'lat' => ['nullable', 'numeric', 'between:20,42'],
            'lng' => ['nullable', 'numeric', 'between:40,64'],
            'instagram' => ['nullable', 'string', 'max:160'],
            'telegram' => ['nullable', 'string', 'max:160'],
            'whatsapp' => ['nullable', 'string', 'max:40'],
            'work_hours' => ['nullable', 'string', 'max:200'],
            'has_license' => ['nullable', 'boolean'],
            'union_member' => ['nullable', 'boolean'],
            'has_guarantee' => ['nullable', 'boolean'],
            'has_showcase' => ['nullable', 'boolean'],
            'force' => ['nullable', 'boolean'], // ثبت علیرغم تکراری بودن (با ثبت در لاگ امنیتی)
        ]);
    }

    private function payload($user, array $data, ?Business $existing = null): array
    {
        unset($data['force']);

        $payload = $data;
        $payload['owner_id'] = $user->id;
        $payload['phone'] = Business::normalizePhone($data['phone'] ?? null);
        $payload['mobile'] = Business::normalizePhone($data['mobile'] ?? null);
        $payload['name_normalized'] = Business::normalizeName($data['name']);

        if ($existing === null) {
            $payload['slug'] = $this->uniqueSlug($data['name']);
        }

        return $payload;
    }

    private function uniqueSlug(string $name): string
    {
        $base = Str::slug($name, '-', null) ?: 'business';
        $slug = $base;
        $i = 1;
        while (Business::withTrashed()->where('slug', $slug)->exists()) {
            $slug = $base.'-'.(++$i);
        }

        return $slug;
    }
}
