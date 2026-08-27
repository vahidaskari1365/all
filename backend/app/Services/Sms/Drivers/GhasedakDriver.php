<?php

declare(strict_types=1);

namespace App\Services\Sms\Drivers;

use App\Models\SmsLog;
use App\Services\Sms\SmsSender;

class GhasedakDriver extends KavenegarDriver
{
    public function __construct(private readonly string $apiKey, private readonly string $linenumber = '10008000')
    {
        parent::__construct($apiKey, $linenumber);
    }

    public function send(string $phone, string $message, ?string $template = null): bool
    {
        // Ghasedak REST v2 — از همان مسیر HTTP درایور پایه استفاده می‌شود
        $url = 'https://api.ghasedak.me/v2/sms/send/simple'
            .'?message='.urlencode($message).'&receptor='.urlencode($phone).'&linenumber='.urlencode($this->linenumber);

        $ctx = stream_context_create(['http' => ['method' => 'POST', 'timeout' => 10, 'ignore_errors' => true, 'header' => "apikey: {$this->apiKey}\r\nContent-Type: application/x-www-form-urlencoded\r\n"]]);
        $body = @file_get_contents($url, false, $ctx);
        $ok = $body !== false;

        \App\Models\SmsLog::create(['phone' => $phone, 'template' => $template, 'message' => $message, 'driver' => 'ghasedak', 'status' => $ok ? 'sent' : 'failed']);

        return $ok;
    }

    public function driver(): string
    {
        return 'ghasedak';
    }
}
