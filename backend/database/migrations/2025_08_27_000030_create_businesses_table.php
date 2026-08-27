<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('name', 120);
            $table->string('name_normalized', 160)->index(); // برای تشخیص کسب‌وکار تکراری
            $table->string('slug', 160)->unique();
            $table->foreignId('category_id')->constrained('categories');
            $table->foreignId('city_id')->constrained('cities');
            $table->string('district', 120)->nullable();
            $table->string('tagline', 220)->nullable();
            $table->text('description')->nullable();
            $table->text('address')->nullable();
            $table->string('phone', 40)->nullable()->index(); // در تشخیص تکرار نقش دارد
            $table->string('mobile', 40)->nullable();
            $table->string('email', 120)->nullable();
            $table->string('website', 160)->nullable();
            $table->text('logo_url')->nullable();
            $table->text('cover_url')->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->string('instagram', 160)->nullable();
            $table->string('telegram', 160)->nullable();
            $table->string('whatsapp', 40)->nullable();
            $table->string('work_hours', 200)->nullable();
            $table->boolean('has_license')->default(false);
            $table->boolean('union_member')->default(false);
            $table->boolean('has_guarantee')->default(false);
            $table->boolean('has_showcase')->default(false);
            $table->string('status', 20)->default('pending')->index(); // pending | active | suspended | rejected
            $table->string('reject_reason', 250)->nullable();
            // سوابق مدیریتی روی خود رکورد
            $table->foreignId('approved_by')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->softDeletes(); // حذف نرم
            $table->timestamps();
        });

        // ستون مکانی PostGIS (مختصات جغرافیایی) + ایندکس فضایی
        DB::statement('ALTER TABLE businesses ADD COLUMN location geography(Point, 4326)');
        DB::statement('CREATE INDEX businesses_location_gix ON businesses USING GIST (location)');
    }

    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};
