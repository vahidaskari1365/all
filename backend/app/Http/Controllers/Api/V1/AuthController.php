<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Models\SecurityLog;
use App\Http\Controllers\Controller;
use App\Models\DesignerProfile;
use App\Services\OtpService;
use App\Services\SecurityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function __construct(private readonly OtpService $otp) {}

    /** POST /auth/otp/request — ارسال کد به شماره موبایل */
    public function requestOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'regex:/^(\+98|0098|98|0)?9\d{9}$/'],
        ]);
        $phone = \App\Models\Business::normalizePhone($data['phone']);

        try {
            $result = $this->otp->request($phone);
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 429);
        }

        return response()->json([
            'message' => 'کد تأیید ارسال شد.',
            'expires_in' => (int) config('kasbyab.otp.ttl_seconds'),
            // فقط در محیط توسعه (SMS_FAKE_MODE=true) برای قابلیت آزمون
            'debug_code' => $result['code'],
        ]);
    }

    /** POST /auth/otp/verify — تأیید کد، ورود/ثبت‌نام خودکار و صدور توکن */
    public function verifyOtp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'phone' => ['required', 'string', 'regex:/^(\+98|0098|98|0)?9\d{9}$/'],
            'code' => ['required', 'digits:'.config('kasbyab.otp.length')],
            'name' => ['nullable', 'string', 'max:120'],
            'ref_code' => ['nullable', 'string', 'exists:designer_profiles,code'], // کد معرف طراح
        ]);
        $phone = \App\Models\Business::normalizePhone($data['phone']);

        if (! $this->otp->verify($phone, $data['code'])) {
            return response()->json(['message' => 'کد وارد شده نامعتبر یا منقضی است.'], 422);
        }

        $designerId = null;
        if (! empty($data['ref_code'])) {
            $designerId = DesignerProfile::where('code', $data['ref_code'])->value('id');
        }

        $user = $this->otp->findOrCreateUser($phone, $data['name'] ?? null, $designerId);
        abort_unless($user->is_active !== false, 403, 'حساب کاربری غیرفعال است.');

        $token = $user->createToken('mobile', ['*'], now()->addDays(30));

        SecurityLogger::log(SecurityLog::EVT_LOGIN, ['new_user' => $user->wasRecentlyCreated], $user, $phone);

        return response()->json([
            'token' => $token->plainTextToken,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'role' => $user->role,
                'lat' => $user->lat,
                'lng' => $user->lng,
                'has_saved_location' => $user->location_updated_at !== null,
            ],
        ]);
    }

    /** GET /auth/me */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'phone' => $user->phone,
            'role' => $user->role,
            'lat' => $user->lat,
            'lng' => $user->lng,
            'location_updated_at' => $user->location_updated_at,
            'has_saved_location' => $user->location_updated_at !== null,
            'designer_profile' => $user->designerProfile ? [
                'code' => $user->designerProfile->code,
                'title' => $user->designerProfile->title,
            ] : null,
        ]);
    }

    /** PUT /auth/location — ذخیره موقعیت انتخابی کاربر (تا تغییر دستی بعدی) */
    public function saveLocation(Request $request): JsonResponse
    {
        $data = $request->validate([
            'lat' => ['required', 'numeric', 'between:20,42'],
            'lng' => ['required', 'numeric', 'between:40,64'],
        ]);

        $request->user()->saveLocation((float) $data['lat'], (float) $data['lng']);

        return response()->json(['message' => 'موقعیت ذخیره شد.', 'lat' => $data['lat'], 'lng' => $data['lng']]);
    }

    /** POST /auth/logout */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'خارج شدید.']);
    }
}
