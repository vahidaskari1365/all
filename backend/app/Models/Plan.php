<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = ['name', 'slug', 'price_irr', 'duration_days', 'features', 'is_active', 'sort'];

    protected $casts = ['features' => 'array', 'is_active' => 'boolean', 'price_irr' => 'integer', 'duration_days' => 'integer'];
}
