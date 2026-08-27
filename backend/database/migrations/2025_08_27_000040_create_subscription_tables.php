<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 80);
            $table->string('slug', 100)->unique();
            $table->unsignedBigInteger('price_irr');
            $table->unsignedInteger('duration_days');
            $table->json('features')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        // درخواست اشتراک با رسید پرداخت آفلاین (کارت‌به‌کارت)
        Schema::create('subscription_requests', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('plans');
            $table->string('status', 24)->default('pending_review')->index(); // pending_review | approved | rejected | cancelled
            $table->string('receipt_path')->nullable();      // رسید بارگذاری‌شده
            $table->string('receipt_original_name')->nullable();
            $table->string('tracking_code', 60)->nullable(); // شماره پیگیری واریز
            $table->foreignId('reviewed_by')->nullable();    // مدیر بررسی‌کننده
            $table->text('review_note')->nullable();
            $table->timestamps();
        });

        // اشتراک فعال — شروع/پایان خودکار
        Schema::create('subscriptions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->index()->constrained('users')->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('plans');
            $table->foreignId('subscription_request_id')->nullable();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->index();
            $table->string('status', 20)->default('active')->index(); // active | expired | cancelled
            $table->json('reminders_sent')->nullable(); // [7,3,1] یادآوری‌های ارسال‌شده
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('subscription_requests');
        Schema::dropIfExists('plans');
    }
};
