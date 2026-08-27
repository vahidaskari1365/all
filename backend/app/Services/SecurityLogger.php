<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\SecurityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SecurityLogger
{
    public static function log(string $event, array $meta = [], mixed $user = null, ?string $phone = null): SecurityLog
    {
        /** @var Request $request */
        $request = request();

        return SecurityLog::create([
            'event' => $event,
            'user_id' => ($user ?? Auth::user())?->getAuthIdentifier(),
            'phone' => $phone,
            'ip' => $request?->ip(),
            'user_agent' => mb_substr((string) $request?->userAgent(), 0, 250),
            'meta' => $meta,
        ]);
    }
}
