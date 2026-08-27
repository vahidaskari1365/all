<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Business;
use App\Models\BusinessCard;
use App\Models\CardTemplate;
use App\Models\Category;
use App\Models\City;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/** تشخیص کسب‌وکار تکراری + کارت‌ها + QR + حذف نرم */
class DuplicateAndCardsTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    private User $admin;

    private int $catId;

    private int $cityId;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = User::create(['name' => 'مالک', 'phone' => '09121110003', 'role' => 'owner', 'phone_verified_at' => now()]);
        $this->admin = User::create(['name' => 'مدیر', 'phone' => '09121110004', 'role' => 'admin', 'phone_verified_at' => now()]);
        $this->catId = Category::create(['name' => 'کافه', 'slug' => 'cafe'])->id;
        $this->cityId = City::create(['name' => 'تهران', 'slug' => 'tehran', 'lat' => 35.7, 'lng' => 51.4])->id;
    }

    private function token(User $u): string
    {
        return $u->createToken('t')->plainTextToken;
    }

    private function payload(array $over = []): array
    {
        return array_merge([
            'name' => 'کافه لیمو',
            'category_id' => $this->catId,
            'city_id' => $this->cityId,
            'phone' => '02188776655',
        ], $over);
    }

    public function test_duplicate_phone_is_rejected(): void
    {
        $token = $this->token($this->owner);
        $this->withToken($token)->postJson('/api/v1/owner/businesses', $this->payload())->assertCreated();

        $response = $this->withToken($token)->postJson('/api/v1/owner/businesses', $this->payload(['name' => 'کافه پرتقال']));

        $response->assertStatus(409)->assertJsonStructure(['duplicates' => [['id', 'name', 'reason']]]);
        $this->assertDatabaseHas('security_logs', ['event' => 'duplicate_business_attempt']);
    }

    public function test_similar_name_is_rejected_but_admin_can_force(): void
    {
        $token = $this->token($this->owner);
        $this->withToken($token)->postJson('/api/v1/owner/businesses', $this->payload(['name' => 'کافه لیمو/tree']))->assertCreated();

        // نام خیلی مشابه
        $this->withToken($token)->postJson('/api/v1/owner/businesses', $this->payload(['name' => 'کافه لیموها', 'phone' => '02111223344']))
            ->assertStatus(409);

        // ثبت با force توسط مالک (ثبت در لاگ امنیتی)
        $this->withToken($token)->postJson('/api/v1/owner/businesses', $this->payload(['name' => 'کافه لیموها', 'phone' => '02111223344', 'force' => true]))
            ->assertCreated();
    }

    public function test_soft_delete_keeps_record_and_hides_from_public(): void
    {
        $token = $this->token($this->owner);
        $id = $this->withToken($token)->postJson('/api/v1/owner/businesses', $this->payload())->json('data.id');

        // تأیید مدیر برای نمایش عمومی
        $this->withToken($this->token($this->admin))->patchJson("/api/v1/admin/businesses/{$id}/status", ['status' => 'active'])->assertOk();

        $business = Business::find($id);
        $slug = $business->slug;

        $this->getJson("/api/v1/businesses/{$slug}")->assertOk();

        // حذف نرم توسط مالک
        $this->withToken($token)->deleteJson("/api/v1/owner/businesses/{$id}")->assertOk();
        $this->assertSoftDeleted('businesses', ['id' => $id]);
        $this->getJson("/api/v1/businesses/{$slug}")->assertNotFound();

        // سوابق مدیریتی ثبت شده است
        $this->assertDatabaseHas('audit_logs', ['action' => 'deleted', 'subject_type' => Business::class, 'subject_id' => $id]);

        // بازیابی توسط مدیر
        $this->withToken($this->token($this->admin))->postJson("/api/v1/admin/businesses/{$id}/restore")->assertOk();
        $this->assertDatabaseHas('businesses', ['id' => $id, 'deleted_at' => null]);
    }

    public function test_card_creation_with_template_qr_and_print_upload(): void
    {
        $token = $this->token($this->owner);
        $bid = $this->withToken($token)->postJson('/api/v1/owner/businesses', $this->payload())->json('data.id');

        $t1 = CardTemplate::create(['key' => 'classic', 'name' => 'کلاسیک']);
        $t2 = CardTemplate::create(['key' => 'modern', 'name' => 'مدرن']);
        $t3 = CardTemplate::create(['key' => 'minimal', 'name' => 'مینیمال']);
        $this->assertTrue(CardTemplate::count() >= 3, 'حداقل سه قالب پویا');

        $card = $this->withToken($token)->postJson('/api/v1/owner/cards', [
            'business_id' => $bid,
            'template_id' => $t2->id,
            'data' => ['slogan' => 'قهوه تازه'],
        ])->assertCreated()->json('data');

        $this->assertNotEmpty($card['slug']);

        // QR اختصاصی به‌صورت PNG
        $this->get("/api/v1/cards/{$card['slug']}/qr.png")
            ->assertOk()
            ->assertHeader('Content-Type', 'image/png');

        // بارگذاری طرح چاپی موجود
        $this->withToken($token)->post("/api/v1/owner/cards/{$card['id']}/print", [
            'print' => \Illuminate\Http\UploadedFile::fake()->create('print.pdf', 100, 'application/pdf'),
        ])->assertOk();

        $this->assertNotNull(BusinessCard::find($card['id'])->print_file_path);
    }
}
