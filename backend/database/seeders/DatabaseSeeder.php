<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Business;
use App\Models\CardTemplate;
use App\Models\Category;
use App\Models\City;
use App\Models\DesignerProfile;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Database\Seeder;

/** داده‌های اولیه MVP */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── کاربران نمونه ────────────────────────────────
        $admin = User::create(['name' => 'مدیر کسب‌یاب', 'phone' => '09120000000', 'role' => 'admin', 'phone_verified_at' => now()]);
        $designerUser = User::create(['name' => 'طراح نمونه', 'phone' => '09120000001', 'role' => 'designer', 'phone_verified_at' => now()]);
        $owner = User::create(['name' => 'مالک نمونه', 'phone' => '09120000002', 'role' => 'owner', 'phone_verified_at' => now()]);

        $designer = DesignerProfile::create([
            'user_id' => $designerUser->id,
            'code' => 'DEMO2024',
            'title' => 'استودیو طراحی کارت',
            'commission_percent' => 10,
            'is_verified' => true,
        ]);

        // ── دسته‌بندی‌ها ─────────────────────────────────
        $categories = collect([
            ['name' => 'رستوران و فست‌فود', 'slug' => 'restaurant', 'icon' => 'utensils'],
            ['name' => 'آرایشگاه و زیبایی', 'slug' => 'beauty', 'icon' => 'scissors'],
            ['name' => 'پزشکی و درمان', 'slug' => 'medical', 'icon' => 'stethoscope'],
            ['name' => 'تعمیرگاه خودرو', 'slug' => 'auto-repair', 'icon' => 'wrench'],
            ['name' => 'پوشاک', 'slug' => 'clothing', 'icon' => 'shirt'],
            ['name' => 'آموزش', 'slug' => 'education', 'icon' => 'book'],
            ['name' => 'خدمات ساختمانی', 'slug' => 'construction', 'icon' => 'hammer'],
            ['name' => 'کافی‌شاپ', 'slug' => 'cafe', 'icon' => 'coffee'],
        ])->map(fn ($c) => Category::create($c));

        // ── شهرها (با مختصات واقعی) ─────────────────────
        $cities = collect([
            ['name' => 'تهران', 'slug' => 'tehran', 'province' => 'تهران', 'lat' => 35.6892, 'lng' => 51.3890],
            ['name' => 'کرج', 'slug' => 'karaj', 'province' => 'البرز', 'lat' => 35.8400, 'lng' => 50.9391],
            ['name' => 'مشهد', 'slug' => 'mashhad', 'province' => 'خراسان رضوی', 'lat' => 36.2605, 'lng' => 59.6168],
            ['name' => 'اصفهان', 'slug' => 'isfahan', 'province' => 'اصفهان', 'lat' => 32.6539, 'lng' => 51.6660],
            ['name' => 'شیراز', 'slug' => 'shiraz', 'province' => 'فارس', 'lat' => 29.5918, 'lng' => 52.5837],
            ['name' => 'تبریز', 'slug' => 'tabriz', 'province' => 'آذربایجان شرقی', 'lat' => 38.0800, 'lng' => 46.2919],
            ['name' => 'اهواز', 'slug' => 'ahvaz', 'province' => 'خوزستان', 'lat' => 31.3183, 'lng' => 48.6706],
            ['name' => 'رشت', 'slug' => 'rasht', 'province' => 'گیلان', 'lat' => 37.2808, 'lng' => 49.5832],
        ])->map(fn ($c) => City::create($c));

        // ── پلن‌های اشتراک ───────────────────────────────
        $plans = collect([
            ['name' => 'پایه', 'slug' => 'basic', 'price_irr' => 490000, 'duration_days' => 30, 'features' => ['صفحه معرفی', 'اطلاعات تماس', 'مسیریابی'], 'sort' => 1],
            ['name' => 'ویترین', 'slug' => 'showcase', 'price_irr' => 1290000, 'duration_days' => 90, 'features' => ['همه امکانات پایه', 'ویترین حرفه‌ای', 'کارت ویزیت پویا', 'QR اختصاصی'], 'sort' => 2],
            ['name' => 'سالانه', 'slug' => 'yearly', 'price_irr' => 3900000, 'duration_days' => 365, 'features' => ['همه امکانات ویترین', 'پشتیبانی ویژه', 'گزارش بازدید'], 'sort' => 3],
        ])->map(fn ($p) => Plan::create($p));

        // ── قالب‌های کارت (حداقل سه قالب پویا) ───────────
        collect([
            ['key' => 'classic', 'name' => 'کلاسیک', 'description' => 'قالب رسمی با حاشیه تیره', 'config' => ['bg' => '#ffffff', 'accent' => '#1f2937', 'layout' => 'border'], 'sort' => 1],
            ['key' => 'modern', 'name' => 'مدرن', 'description' => 'گرادیان مدرن با فونت درشت', 'config' => ['bg' => 'gradient', 'accent' => '#7c3aed', 'layout' => 'centered'], 'sort' => 2],
            ['key' => 'minimal', 'name' => 'مینیمال', 'description' => 'ساده و تمیز', 'config' => ['bg' => '#fafafa', 'accent' => '#111827', 'layout' => 'left'], 'sort' => 3],
            ['key' => 'bold', 'name' => 'پررنگ', 'description' => 'رنگ‌های زنده برای مشاغل خدماتی', 'config' => ['bg' => '#0ea5e9', 'accent' => '#ffffff', 'layout' => 'centered'], 'sort' => 4],
        ])->each(fn ($t) => CardTemplate::create($t));

        // ── کسب‌وکارهای نمونه تهران (برای جست‌وجوی شعاعی PostGIS) ──
        $demo = [
            ['رستوران شهرزاد', 'restaurant', 0, 35.7000, 51.4100],
            ['کافه لمیز ونک', 'cafe', 0, 35.7570, 51.4100],
            ['آرایشگاه آقای تهران', 'beauty', 0, 35.7200, 51.3900],
            ['درمانگاه شبانه‌روزی مهر', 'medical', 0, 35.7400, 51.3800],
            ['تعمیرگاه خودرو امین', 'auto-repair', 0, 35.6900, 51.4300],
            ['بوتیک پوشاک ریحان', 'clothing', 0, 35.7600, 51.4400],
            ['آموزشگاه زبان البرز', 'education', 0, 35.7300, 51.3500],
            ['خدمات ساختمانی سازه‌گستر', 'construction', 0, 35.6800, 51.3600],
            ['رستوران ایتالیایی پاستا', 'restaurant', 0, 35.7450, 51.3750],
            ['کافه کتاب تهران', 'cafe', 0, 35.7100, 51.4200],
            ['فست‌فود برگرلند', 'restaurant', 1, 35.8400, 50.9400],
            ['رستوران شاندیز مشهد', 'restaurant', 2, 36.2605, 59.6168],
        ];
        $i = 0;
        foreach ($demo as [$name, $catSlug, $cityIdx, $lat, $lng]) {
            Business::create([
                'owner_id' => $owner->id,
                'name' => $name,
                'name_normalized' => Business::normalizeName($name),
                'slug' => 'demo-'.(++$i),
                'category_id' => $categories->firstWhere('slug', $catSlug)->id,
                'city_id' => $cities[$cityIdx]->id,
                'tagline' => 'نمونه برای آزمون جست‌وجوی شعاعی',
                'address' => 'آدرس نمونه',
                'phone' => '0211234567'.str_pad((string) $i, 2, '0', STR_PAD_LEFT),
                'lat' => $lat,
                'lng' => $lng,
                'status' => 'active',
                'approved_by' => $admin->id,
                'approved_at' => now(),
            ]);
        }
    }
}
