<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ثبت سوابق مدیریتی (Audit Trail)
        Schema::create('audit_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->index(); // کاربر انجام‌دهنده
            $table->string('actor_role', 20)->nullable();
            $table->string('action', 60)->index(); // created | updated | deleted | approved | rejected | restored | force_deleted
            $table->string('subject_type', 80)->index();
            $table->unsignedBigInteger('subject_id')->index();
            $table->json('before')->nullable();
            $table->json('after')->nullable();
            $table->string('ip', 45)->nullable();
            $table->timestamps();
        });

        // لاگ امنیتی
        Schema::create('security_logs', function (Blueprint $table): void {
            $table->id();
            $table->string('event', 60)->index(); // otp_requested | otp_verified | otp_failed | otp_rate_limited | login | forbidden | receipt_uploaded ...
            $table->foreignId('user_id')->nullable()->index();
            $table->string('phone', 20)->nullable();
            $table->string('ip', 45)->nullable();
            $table->string('user_agent', 250)->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        // پیامک‌های ارسالی (درایور log در توسعه + آرشیو همه)
        Schema::create('sms_logs', function (Blueprint $table): void {
            $table->id();
            $table->string('phone', 20)->index();
            $table->string('template', 40)->nullable();
            $table->text('message');
            $table->string('driver', 20);
            $table->string('status', 16)->default('sent'); // sent | failed
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sms_logs');
        Schema::dropIfExists('security_logs');
        Schema::dropIfExists('audit_logs');
    }
};
