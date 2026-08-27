<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\SubscriptionService;
use Illuminate\Console\Command;

class ExpireSubscriptions extends Command
{
    protected $signature = 'subscriptions:expire';
    protected $description = 'پایان خودکار اشتراک‌های منقضی‌شده';

    public function handle(SubscriptionService $service): int
    {
        $count = $service->expireOverdue();
        $this->info("{$count} اشتراک منقضی شد.");

        return self::SUCCESS;
    }
}
