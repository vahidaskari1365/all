<?php

declare(strict_types=1);

namespace App\Services\Sms\Drivers;

use App\Models\SmsLog;
use App\Services\Sms\SmsSender;

/**
 * درایور واقعی کاوه‌نگار (REST).
 * نکته: برای اتصال واقعی به HTTPS از curl استفاده می‌شود؛ در استقرار تولیدی
 * (docker-compose با php:8.3-fpm) اکستنشن curl فعال است.
 */
class KavenegarDriver implements SmsSender
{
    public function __construct(private readonly string $apiKey, private readonly ?string $sender = null) {}

    public function send(string $phone, string $message, ?string $template = null): bool
    {
        $url = 'https://api.kavenegar.com/v1/'.rawurlencode($this->apiKey).'/sms/send.json?'
            .http_build_query(['receptor' => $phone, 'message' => $message, 'sender' => $this->sender]);

        $ok = $this->httpGet($url);

        SmsLog::create(['phone' => $phone, 'template' => $template, 'message' => $message, 'driver' => 'kavenegar', 'status' => $ok ? 'sent' : 'failed']);

        return $ok;
    }

    public function driver(): string
    {
        return 'kavenegar';
    }

    private function httpGet(string $url): bool
    {
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10, CURLOPT_CONNECTTIMEOUT => 5]);
            curl_exec($ch);
            $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
            curl_close($ch);

            return $code >= 200 && $code < 300;
        }

        $ctx = stream_context_create(['http' => ['timeout' => 10, 'ignore_errors' => true]]);
        $body = @file_get_contents($url, false, $ctx);

        return $body !== false && str_contains((string) ($http_response_header[0] ?? ''), '200');
    }
}
