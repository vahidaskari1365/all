<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\SubscriptionService;
use Illuminate\Console\Command;

class RemindRenewals extends Command
{
    protected $signature = 'subscriptions:remind';
    protected $description = 'ارسال یادآوری تمدید اشتراک (۷، ۳ و ۱ روز مانده)';

    public function handle(SubscriptionService $service): int
    {
        $count = $service->sendRenewalReminders();
        $this->info("{$count} یادآوری ارسال شد.");

        return self::SUCCESS;
    }
}
