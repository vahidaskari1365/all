<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<\App\Models\User> */
class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'phone' => '0912'.str_pad((string) random_int(0, 9999999), 7, '0', STR_PAD_LEFT),
            'role' => 'owner',
            'phone_verified_at' => now(),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn () => ['role' => 'admin']);
    }

    public function designer(): static
    {
        return $this->state(fn () => ['role' => 'designer']);
    }
}
