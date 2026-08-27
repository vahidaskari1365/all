<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;

/** ثبت سوابق مدیریتی: چه کسی، چه زمانی، چه چیزی را تغییر داد */
class AuditLogger
{
    public static function log(string $action, Model $subject, array $before = [], array $after = []): AuditLog
    {
        $user = auth()->user();

        return AuditLog::create([
            'user_id' => $user?->getAuthIdentifier(),
            'actor_role' => $user?->role,
            'action' => $action,
            'subject_type' => $subject::class,
            'subject_id' => $subject->getKey(),
            'before' => $before ?: null,
            'after' => $after ?: null,
            'ip' => request()?->ip(),
        ]);
    }

    /** diff رکورد برای ذخیره before/after */
    public static function diff(Model $model): array
    {
        return collect($model->getDirty())
            ->except(['updated_at'])
            ->map(fn ($v, $k) => ['from' => $model->getOriginal($k), 'to' => $v])
            ->all();
    }
}
