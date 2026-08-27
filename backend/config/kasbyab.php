<?php

declare(strict_types=1);

return [
    // جست‌وجوی شعاعی مبتنی بر PostGIS
    'search' => [
        'default_radius_m' => (int) env('KASBYAB_DEFAULT_RADIUS_M', 3000),
        'max_radius_m' => (int) env('KASBYAB_MAX_RADIUS_M', 50000),
        'limit' => (int) env('KASBYAB_SEARCH_LIMIT', 50),
    ],

    'otp' => [
        'ttl_seconds' => (int) env('OTP_TTL_SECONDS', 300),
        'max_attempts' => (int) env('OTP_MAX_ATTEMPTS', 5),
        'resend_cooldown_seconds' => (int) env('OTP_RESEND_COOLDOWN_SECONDS', 60),
        'length' => 6,
    ],

    'sms' => [
        // درایور فعال: log | kavenegar | ghasedak | smsir
        'driver' => env('SMS_DRIVER', 'log'),
        'fake_mode' => env('SMS_FAKE_MODE', false),
        'kavenegar' => [
            'api_key' => env('KAVENEGAR_API_KEY'),
            'sender' => env('KAVENEGAR_SENDER', '10004346'),
        ],
        'ghasedak' => [
            'api_key' => env('GHASEDAK_API_KEY'),
            'linenumber' => env('GHASEDAK_LINENUMBER', '10008000'),
        ],
        'smsir' => [
            'api_key' => env('SMSIR_API_KEY'),
        ],
    ],

    // یادآوری تمدید اشتراک (روزهای مانده → پیام)
    'renewal_reminders' => [7, 3, 1],
];
