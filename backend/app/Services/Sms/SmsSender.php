<?php

declare(strict_types=1);

namespace App\Services\Sms;

interface SmsSender
{
    /** ارسال پیامک؛ خروجی: وضعیت موفقیت */
    public function send(string $phone, string $message, ?string $template = null): bool;

    public function driver(): string;
}
