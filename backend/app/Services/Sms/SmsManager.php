<?php

declare(strict_types=1);

namespace App\Services\Sms;

use App\Services\Sms\Drivers\GhasedakDriver;
use App\Services\Sms\Drivers\KavenegarDriver;
use App\Services\Sms\Drivers\LogDriver;
use App\Services\Sms\Drivers\SmsIrDriver;
use InvalidArgumentException;

/** انتخاب درایور پیامک بر اساس config/kasbyab.php — اتصال پیامک واقعی */
class SmsManager
{
    public function driver(?string $name = null): SmsSender
    {
        $name ??= (string) config('kasbyab.sms.driver', 'log');

        return match ($name) {
            'log' => new LogDriver,
            'kavenegar' => new KavenegarDriver((string) config('kasbyab.sms.kavenegar.api_key'), config('kasbyab.sms.kavenegar.sender')),
            'ghasedak' => new GhasedakDriver((string) config('kasbyab.sms.ghasedak.api_key'), (string) config('kasbyab.sms.ghasedak.linenumber', '10008000')),
            'smsir' => new SmsIrDriver((string) config('kasbyab.sms.smsir.api_key')),
            default => throw new InvalidArgumentException("SMS driver [{$name}] پشتیبانی نمی‌شود."),
        };
    }

    public function send(string $phone, string $message, ?string $template = null): bool
    {
        return $this->driver()->send($phone, $message, $template);
    }
}
