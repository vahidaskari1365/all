<?php

declare(strict_types=1);

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * در هر درخواست تستی، گاردهای احراز هویت از نو ساخته شوند.
     * گارد sanctum (از نوع RequestGuard) کاربر درخواست اول را کش می‌کند و
     * در درخواست دومِ همان تست با توکن کاربر دیگر، همان کاربر قبلی برمی‌گردد.
     */
    public function call($method, $uri, $parameters = [], $cookies = [], $files = [], $server = [], $content = null)
    {
        if ($this->app->bound('auth')) {
            $this->app->make('auth')->forgetGuards();
        }

        return parent::call($method, $uri, $parameters, $cookies, $files, $server, $content);
    }
}
