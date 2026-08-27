<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** کنترل دسترسی نقش‌محور: role:admin / role:owner / role:admin,designer */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        abort_unless($user !== null, 401, 'احراز هویت لازم است.');
        abort_if($user->is_active === false, 403, 'حساب کاربری غیرفعال است.');

        if ($user->isAdmin()) {
            return $next($request); // مدیر کل به همه نقش‌ها دسترسی دارد
        }

        abort_unless(in_array($user->role, $roles, true), 403, 'دسترسی به این بخش مجاز نیست.');

        return $next($request);
    }
}
