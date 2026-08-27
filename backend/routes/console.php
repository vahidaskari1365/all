<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Schedule;

// پایان خودکار اشتراک‌های منقضی + یادآوری تمدید — روزانه ساعت ۰۳:۰۰
Schedule::command('subscriptions:expire')->dailyAt('03:00');
Schedule::command('subscriptions:remind')->dailyAt('09:00');
