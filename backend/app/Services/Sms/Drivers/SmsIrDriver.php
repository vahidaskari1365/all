<?php

declare(strict_types=1);

namespace App\Services\Sms\Drivers;

use App\Models\SmsLog;
use App\Services\Sms\SmsSender;

class SmsIrDriver implements SmsSender
{
    public function __construct(private readonly string $apiKey) {}

    public function send(string $phone, string $message, ?string $template = null): bool
    {
        $payload = json_encode(['mobile' => $phone, 'text' => $message, 'lineNumber' => config('kasbyab.sms.smsir.line', '3000...')], JSON_UNESCAPED_UNICODE);
        $ctx = stream_context_create(['http' => ['method' => 'POST', 'timeout' => 10, 'ignore_errors' => true, 'header' => "x-api-key: {$this->apiKey}\r\nContent-Type: application/json\r\nAccept: text/plain\r\n", 'content' => $payload]]);
        $body = @file_get_contents('https://api.sms.ir/v1/send/bulk', false, $ctx);
        $ok = $body !== false;

        SmsLog::create(['phone' => $phone, 'template' => $template, 'message' => $message, 'driver' => 'smsir', 'status' => $ok ? 'sent' : 'failed']);

        return $ok;
    }

    public function driver(): string
    {
        return 'smsir';
    }
}
