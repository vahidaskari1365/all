<?php

declare(strict_types=1);

namespace App\Models;

use App\Services\AuditLogger;
use Illuminate\Support\Str;

class BusinessObserver
{
    public function created(Business $business): void
    {
        AuditLogger::log('created', $business, [], ['name' => $business->name, 'status' => $business->status]);
    }

    public function updated(Business $business): void
    {
        AuditLogger::log('updated', $business, AuditLogger::diff($business), []);
    }

    public function deleted(Business $business): void
    {
        // حذف نرم
        AuditLogger::log('deleted', $business, ['status' => $business->getOriginal('status')], ['deleted_at' => (string) $business->deleted_at]);
    }

    public function restored(Business $business): void
    {
        AuditLogger::log('restored', $business, [], ['deleted_at' => null]);
    }

    public function forceDeleted(Business $business): void
    {
        AuditLogger::log('force_deleted', $business, ['name' => $business->name], []);
    }
}
