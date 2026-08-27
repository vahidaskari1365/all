<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Business;
use App\Models\Category;
use App\Models\City;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * جست‌وجوی شعاعی مبتنی بر PostGIS + مرتب‌سازی نزدیک‌ترین
 * این تست نیاز به PostgreSQL + PostGIS دارد (docker-compose یا دیتابیس توسعه).
 */
class RadiusSearchTest extends TestCase
{
    use RefreshDatabase;

    private User $owner;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = User::create(['name' => 'مالک', 'phone' => '09121110000', 'role' => 'owner', 'phone_verified_at' => now()]);
        $cat = Category::create(['name' => 'کافه', 'slug' => 'cafe']);
        $city = City::create(['name' => 'تهران', 'slug' => 'tehran', 'lat' => 35.7, 'lng' => 51.4]);

        // سه نقطه با فاصله‌های مشخص از مرکز تهران (میدان آزادی ~35.6997, 51.3380)
        foreach ([['نزدیک', 35.7100, 51.3500], ['متوسط', 35.7300, 51.3800], ['دور', 35.7800, 51.4400]] as $i => [$name, $lat, $lng]) {
            Business::create([
                'owner_id' => $this->owner->id,
                'name' => $name,
                'name_normalized' => Business::normalizeName($name),
                'slug' => "b$i",
                'category_id' => $cat->id,
                'city_id' => $city->id,
                'lat' => $lat,
                'lng' => $lng,
                'status' => 'active',
            ]);
        }
    }

    public function test_results_are_sorted_by_distance_from_center(): void
    {
        // مرکز: میدان آزادی تهران
        $response = $this->getJson('/api/v1/businesses/search?lat=35.6997&lng=51.3380&radius=20000');

        $response->assertOk();
        $names = collect($response->json('data'))->pluck('name')->all();

        $this->assertSame(['نزدیک', 'متوسط', 'دور'], $names, 'ترتیب نزدیک‌ترین به دورترین');
        $this->assertGreaterThan(0, $response->json('data.0.distance_m'));
    }

    public function test_radius_filters_far_businesses(): void
    {
        // شعاع ۲ کیلومتری فقط «نزدیک» را شامل می‌شود
        $response = $this->getJson('/api/v1/businesses/search?lat=35.6997&lng=51.3380&radius=2000');

        $names = collect($response->json('data'))->pluck('name')->all();
        $this->assertContains('نزدیک', $names);
        $this->assertNotContains('دور', $names);
    }

    public function test_saved_user_location_is_used_when_coords_missing(): void
    {
        $this->owner->saveLocation(35.6997, 51.3380);
        $token = $this->owner->createToken('test')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/v1/businesses/search');

        $response->assertOk();
        $this->assertSame('saved', $response->json('center.source'));
        $this->assertEqualsWithDelta(35.6997, $response->json('center.lat'), 0.0001);
    }

    public function test_location_is_persisted_until_manual_change(): void
    {
        $token = $this->owner->createToken('test')->plainTextToken;

        $this->withToken($token)->putJson('/api/v1/auth/location', ['lat' => 35.75, 'lng' => 51.40])
            ->assertOk();

        $this->owner->refresh();
        $this->assertEqualsWithDelta(35.75, $this->owner->lat, 0.0001);
        $this->assertNotNull($this->owner->location_updated_at);
    }

    public function test_search_without_location_and_without_user_fails(): void
    {
        $this->getJson('/api/v1/businesses/search')->assertStatus(422);
    }
}
