<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\Business;
use App\Models\BusinessObserver;
use App\Services\Sms\SmsManager;
use App\Services\Sms\SmsSender;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(SmsSender::class, fn () => app(SmsManager::class)->driver());
    }

    public function boot(): void
    {
        Business::observe(BusinessObserver::class);

        // مدیر کل همه‌جا دسترسی دارد؛ بقیه نقش‌ها با middleware کنترل می‌شوند
        Gate::before(fn ($user, $ability) => $user->role === 'admin' ? true : null);

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)->by($request->user()?->id ?: $request->ip());
        });
    }
}
