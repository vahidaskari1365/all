<?php

declare(strict_types=1);

namespace App\Services\Sms\Drivers;

use App\Models\SmsLog;
use App\Services\Sms\SmsSender;
use Illuminate\Support\Facades\Log;

/** درایور توسعه: پیامک در لاگ و جدول sms_logs ثبت می‌شود (اتصال واقعی ندارد) */
class LogDriver implements SmsSender
{
    public function send(string $phone, string $message, ?string $template = null): bool
    {
        Log::info("[SMS:log] to={$phone} template={$template}: {$message}");

        SmsLog::create(['phone' => $phone, 'template' => $template, 'message' => $message, 'driver' => 'log', 'status' => 'sent']);

        return true;
    }

    public function driver(): string
    {
        return 'log';
    }
}
