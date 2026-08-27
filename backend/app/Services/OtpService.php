<?php

declare(strict_types=1);

namespace App\Services;

use App\Services\Sms\SmsManager;
use App\Models\SecurityLog;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use RuntimeException;

/**
 * ورود با شماره موبایل و کد یک‌بارمصرف:
 * - کد هش‌شده در کش (Redis در تولید) با TTL
 * - محدودیت تلاش و بازارسال
 */
class OtpService
{
    public function request(string $phone): array
    {
        $key = 'otp:req:'.$phone;

        if (RateLimiter::tooManyAttempts($key, 1)) {
            SecurityLogger::log(SecurityLog::EVT_OTP_RATE_LIMITED, [], null, $phone);
            $seconds = RateLimiter::availableIn($key);

            throw new RuntimeException("برای دریافت کد جدید {$seconds} ثانیه صبر کنید.");
        }
        RateLimiter::hit($key, config('kasbyab.otp.resend_cooldown_seconds'));

        $code = str_pad((string) random_int(0, 10 ** config('kasbyab.otp.length') - 1), (int) config('kasbyab.otp.length'), '0', STR_PAD_LEFT);

        Cache::put('otp:code:'.$phone, [
            'hash' => hash('sha256', $code.$phone),
            'attempts' => 0,
        ], now()->addSeconds((int) config('kasbyab.otp.ttl_seconds')));

        $sms = app(SmsManager::class);
        $sms->send($phone, "کد ورود شما به کسب‌یاب: {$code}\nاعتبار: ".((int) config('kasbyab.otp.ttl_seconds') / 60).' دقیقه', 'otp');

        SecurityLogger::log(SecurityLog::EVT_OTP_REQUESTED, [], null, $phone);

        return ['code' => config('kasbyab.sms.fake_mode') ? $code : null];
    }

    public function verify(string $phone, string $code): bool
    {
        $entry = Cache::get('otp:code:'.$phone);

        if (! $entry) {
            SecurityLogger::log(SecurityLog::EVT_OTP_FAILED, ['reason' => 'expired_or_missing'], null, $phone);

            return false;
        }

        if (! hash_equals((string) $entry['hash'], hash('sha256', $code.$phone))) {
            $entry['attempts']++;
            if ($entry['attempts'] >= (int) config('kasbyab.otp.max_attempts')) {
                Cache::forget('otp:code:'.$phone);
            } else {
                Cache::put('otp:code:'.$phone, $entry, now()->addSeconds((int) config('kasbyab.otp.ttl_seconds')));
            }
            SecurityLogger::log(SecurityLog::EVT_OTP_FAILED, ['attempts' => $entry['attempts']], null, $phone);

            return false;
        }

        Cache::forget('otp:code:'.$phone);
        SecurityLogger::log(SecurityLog::EVT_OTP_VERIFIED, [], null, $phone);

        return true;
    }

    /** یافتن یا ساخت کاربر (با نقش پیش‌فرض مالک) */
    public function findOrCreateUser(string $phone, ?string $name = null, ?int $referredByDesignerId = null): User
    {
        return User::firstOrCreate(
            ['phone' => $phone],
            [
                'name' => $name,
                'role' => User::ROLE_OWNER,
                'phone_verified_at' => now(),
                'referred_by_designer_id' => $referredByDesignerId,
            ]
        );
    }
}
