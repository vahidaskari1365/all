<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\DesignerProfile;
use App\Models\Plan;
use App\Models\ReferralReward;
use App\Models\SubscriptionRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** نقش‌ها و دسترسی‌ها + کد/لینک معرف طراح */
class RoleAndReferralTest extends TestCase
{
    use RefreshDatabase;

    public function test_roles_are_enforced(): void
    {
        $admin = User::create(['name' => 'مدیر', 'phone' => '09121110005', 'role' => 'admin', 'phone_verified_at' => now()]);
        $owner = User::create(['name' => 'مالک', 'phone' => '09121110006', 'role' => 'owner', 'phone_verified_at' => now()]);

        // مالک: دسترسی به پنل خودش ولی نه طراح/مدیر
        $t = $owner->createToken('t')->plainTextToken;
        $this->withToken($t)->getJson('/api/v1/owner/businesses')->assertOk();
        $this->withToken($t)->getJson('/api/v1/designer/referrals')->assertStatus(403);
        $this->withToken($t)->getJson('/api/v1/admin/users')->assertStatus(403);

        // کاربر مهمان: ۴۰۱ (حذف هدر توکنِ باقی‌مانده از درخواست قبل)
        $this->withoutToken()->getJson('/api/v1/admin/users')->assertStatus(401);

        // مدیر: به همه دسترسی دارد
        $a = $admin->createToken('t')->plainTextToken;
        $this->withToken($a)->getJson('/api/v1/admin/users')->assertOk();
        $this->withToken($a)->getJson('/api/v1/owner/businesses')->assertOk();
    }

    public function test_referral_link_and_commission_on_approval(): void
    {
        $designerUser = User::create(['name' => 'طراح', 'phone' => '09121110007', 'role' => 'designer', 'phone_verified_at' => now()]);
        $designer = DesignerProfile::create(['user_id' => $designerUser->id, 'code' => 'TESTCODE', 'commission_percent' => 15]);
        $plan = Plan::create(['name' => 'ویترین', 'slug' => 'showcase', 'price_irr' => 1000000, 'duration_days' => 30]);

        // لندینگ معرف
        $this->getJson('/api/v1/referrals/TESTCODE')->assertOk()->assertJson(['code' => 'TESTCODE']);

        // ثبت‌نام مالک با کد معرف
        $code = $this->postJson('/api/v1/auth/otp/request', ['phone' => '09121110008'])->json('debug_code');
        $token = $this->postJson('/api/v1/auth/otp/verify', [
            'phone' => '09121110008',
            'code' => $code,
            'ref_code' => 'TESTCODE',
        ])->assertOk()->json('token');

        $this->assertDatabaseHas('users', ['phone' => '09121110008', 'referred_by_designer_id' => $designer->id]);

        // درخواست و تأیید اشتراک → پورسانت ۱۵٪
        $req = SubscriptionRequest::create(['user_id' => User::where('phone', '09121110008')->value('id'), 'plan_id' => $plan->id, 'receipt_path' => 'x.jpg']);
        $admin = User::create(['name' => 'مدیر', 'phone' => '09121110009', 'role' => 'admin', 'phone_verified_at' => now()]);

        $this->withToken($admin->createToken('t')->plainTextToken)
            ->postJson("/api/v1/admin/subscription-requests/{$req->id}/approve")
            ->assertOk();

        $this->assertDatabaseHas('referral_rewards', [
            'designer_id' => $designer->id,
            'amount_irr' => 150000,
            'percent' => 15,
            'status' => 'pending',
        ]);

        // پنل طراح: مشاهده پورسانت‌ها
        $dt = $designerUser->createToken('t')->plainTextToken;
        $this->withToken($dt)->getJson('/api/v1/designer/referrals')
            ->assertOk()
            ->assertJsonPath('totals.pending_irr', 150000);
    }
}
