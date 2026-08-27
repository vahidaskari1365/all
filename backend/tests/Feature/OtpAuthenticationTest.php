<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\SmsLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** ورود با شماره موبایل و کد یک‌بارمصرف */
class OtpAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_otp_request_creates_sms_log_and_returns_fake_code_in_dev(): void
    {
        $response = $this->postJson('/api/v1/auth/otp/request', ['phone' => '09121234567']);

        $response->assertOk()->assertJsonStructure(['message', 'expires_in', 'debug_code']);

        $this->assertDatabaseHas('sms_logs', ['phone' => '09121234567', 'driver' => 'log']);
        $this->assertDatabaseHas('security_logs', ['event' => 'otp_requested', 'phone' => '09121234567']);
    }

    public function test_otp_verify_creates_user_and_returns_token(): void
    {
        $code = $this->postJson('/api/v1/auth/otp/request', ['phone' => '09121234567'])->json('debug_code');

        $response = $this->postJson('/api/v1/auth/otp/verify', [
            'phone' => '09121234567',
            'code' => $code,
            'name' => 'مالک آزمون',
        ]);

        $response->assertOk()->assertJsonStructure(['token', 'user' => ['id', 'phone', 'role']]);
        $this->assertDatabaseHas('users', ['phone' => '09121234567', 'role' => 'owner']);
        $this->assertDatabaseHas('security_logs', ['event' => 'otp_verified']);
    }

    public function test_wrong_code_is_rejected_and_logged(): void
    {
        $this->postJson('/api/v1/auth/otp/request', ['phone' => '09121234567']);

        $this->postJson('/api/v1/auth/otp/verify', ['phone' => '09121234567', 'code' => '000000'])
            ->assertStatus(422);

        $this->assertDatabaseHas('security_logs', ['event' => 'otp_failed']);
    }

    public function test_existing_user_login_does_not_duplicate(): void
    {
        User::create(['name' => 'قبلی', 'phone' => '09121234567', 'role' => 'designer', 'phone_verified_at' => now()]);

        $code = $this->postJson('/api/v1/auth/otp/request', ['phone' => '09121234567'])->json('debug_code');
        $response = $this->postJson('/api/v1/auth/otp/verify', ['phone' => '09121234567', 'code' => $code]);

        $this->assertSame('designer', $response->json('user.role'));
        $this->assertSame(1, User::where('phone', '09121234567')->count());
    }

    public function test_resend_is_rate_limited(): void
    {
        $this->postJson('/api/v1/auth/otp/request', ['phone' => '09121234567'])->assertOk();

        $this->postJson('/api/v1/auth/otp/request', ['phone' => '09121234567'])
            ->assertStatus(429);
    }

    public function test_invalid_phone_format_is_rejected(): void
    {
        $this->postJson('/api/v1/auth/otp/request', ['phone' => '12345'])
            ->assertStatus(422);
    }
}
