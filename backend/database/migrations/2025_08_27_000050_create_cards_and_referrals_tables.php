<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // حداقل سه قالب پویای کارت (سید می‌شود)
        Schema::create('card_templates', function (Blueprint $table): void {
            $table->id();
            $table->string('key', 40)->unique();
            $table->string('name', 80);
            $table->text('description')->nullable();
            $table->json('config')->nullable(); // رنگ‌ها/چیدمان قالب
            $table->unsignedSmallInteger('sort')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('business_cards', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('business_id')->constrained('businesses')->cascadeOnDelete();
            $table->foreignId('template_id')->constrained('card_templates');
            $table->string('slug', 160)->unique(); // لینک/QR اختصاصی کارت
            $table->json('data')->nullable();      // داده‌های نمایشی کارت
            $table->string('print_file_path')->nullable();      // بارگذاری طرح چاپی موجود
            $table->string('print_original_name')->nullable();
            $table->foreignId('designer_id')->nullable(); // طراح معرف کارت
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // پورسانت معرف طراح از اشتراک‌های فعال‌شده
        Schema::create('referral_rewards', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('designer_id')->constrained('designer_profiles')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete(); // خریدار معرفی‌شده
            $table->foreignId('subscription_id')->constrained('subscriptions')->cascadeOnDelete();
            $table->unsignedBigInteger('amount_irr');
            $table->unsignedTinyInteger('percent');
            $table->string('status', 16)->default('pending')->index(); // pending | paid | cancelled
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referral_rewards');
        Schema::dropIfExists('business_cards');
        Schema::dropIfExists('card_templates');
    }
};
