<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Plan;
use App\Models\Subscription;
use App\Models\SubscriptionRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/** چرخه کامل اشتراک: درخواست → رسید آفلاین → تأیید مدیر → شروع/پایان خودکار → یادآوری */
class SubscriptionFlowTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private User $admin;

    private Plan $plan;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = User::create(['name' => 'مالک', 'phone' => '09121110001', 'role' => 'owner', 'phone_verified_at' => now()]);
        $this->admin = User::create(['name' => 'مدیر', 'phone' => '09121110002', 'role' => 'admin', 'phone_verified_at' => now()]);
        $this->plan = Plan::create(['name' => 'ویترین', 'slug' => 'showcase', 'price_irr' => 1290000, 'duration_days' => 90]);
    }

    private function token(User $u): string
    {
        return $u->createToken('t')->plainTextToken;
    }

    public function test_full_subscription_cycle(): void
    {
        Storage::fake('local');
        $ownerToken = $this->token($this->owner);

        // ۱) ثبت درخواست اشتراک
        $reqId = $this->withToken($ownerToken)
            ->postJson('/api/v1/owner/subscription-requests', ['plan_id' => $this->plan->id])
            ->assertCreated()
            ->json('data.id');

        // ۲) بارگذاری رسید پرداخت آفلاین
        $this->withToken($ownerToken)
            ->postJson("/api/v1/owner/subscription-requests/{$reqId}/receipt", [
                // بدون GD: فایل جعلی ساده (اعتبارسنجی فقط فرمت/اندازه را می‌سنجد)
                'receipt' => UploadedFile::fake()->createWithContent('receipt.jpg', "JFIF-fake-receipt"),
                'tracking_code' => 'TRK-123',
            ])
            ->assertOk();

        $this->assertDatabaseHas('security_logs', ['event' => 'receipt_uploaded']);

        // ۳) تأیید مدیر → شروع خودکار اشتراک
        $sub = $this->withToken($this->token($this->admin))
            ->postJson("/api/v1/admin/subscription-requests/{$reqId}/approve", ['note' => 'رسید بررسی شد'])
            ->assertOk()
            ->json('data');

        $this->assertDatabaseHas('subscriptions', [
            'id' => $sub['id'],
            'status' => 'active',
            'user_id' => $this->owner->id,
        ]);
        $this->assertDatabaseHas('subscription_requests', ['id' => $reqId, 'status' => 'approved']);
        $this->assertDatabaseHas('security_logs', ['event' => 'subscription_approved']);

        // تاریخ پایان = امروز + ۹۰ روز
        $endsAt = Subscription::find($sub['id'])->ends_at;
        $this->assertEqualsWithDelta(now()->addDays(90)->startOfDay(), $endsAt->copy()->startOfDay(), 1);
    }

    public function test_admin_cannot_approve_without_receipt(): void
    {
        $req = SubscriptionRequest::create(['user_id' => $this->owner->id, 'plan_id' => $this->plan->id]);

        $this->withToken($this->token($this->admin))
            ->postJson("/api/v1/admin/subscription-requests/{$req->id}/approve")
            ->assertStatus(422);
    }

    public function test_expire_command_expires_overdue_subscriptions(): void
    {
        $sub = Subscription::create([
            'user_id' => $this->owner->id,
            'plan_id' => $this->plan->id,
            'starts_at' => now()->subDays(100),
            'ends_at' => now()->subDay(),
            'status' => 'active',
            'reminders_sent' => [],
        ]);

        $this->artisan('subscriptions:expire')->assertSuccessful();

        $this->assertSame('expired', $sub->fresh()->status);
    }

    public function test_renewal_reminder_is_sent_once_per_milestone(): void
    {
        Subscription::create([
            'user_id' => $this->owner->id,
            'plan_id' => $this->plan->id,
            'starts_at' => now()->subDays(83),
            'ends_at' => now()->addDays(7),
            'status' => 'active',
            'reminders_sent' => [],
        ]);

        $this->artisan('subscriptions:remind')->assertSuccessful();
        $this->artisan('subscriptions:remind')->assertSuccessful();

        // فقط یک پیامک برای هفت روز مانده
        $count = \App\Models\SmsLog::where('template', 'renewal_reminder')->count();
        $this->assertSame(1, $count);

        // ستون JSON در PostgreSQL با bind رشته‌ای قابل مقایسه نیست — در PHP بررسی می‌شود
        $reminders = DB::table('subscriptions')->whereNotNull('reminders_sent')->value('reminders_sent');
        $this->assertSame([7], json_decode((string) $reminders, true));
    }

    public function test_owner_cannot_access_admin_endpoints(): void
    {
        $this->withToken($this->token($this->owner))
            ->getJson('/api/v1/admin/stats')
            ->assertStatus(403);
    }
}
