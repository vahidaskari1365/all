<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 80);
            $table->string('slug', 100)->unique();
            $table->string('icon', 60)->default('store');
            $table->string('color', 30)->default('primary');
            $table->timestamps();
        });

        Schema::create('cities', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 80);
            $table->string('slug', 100)->unique();
            $table->string('province', 80)->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cities');
        Schema::dropIfExists('categories');
    }
};
