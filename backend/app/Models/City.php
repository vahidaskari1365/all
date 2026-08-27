<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    protected $fillable = ['name', 'slug', 'province', 'lat', 'lng'];

    protected $casts = ['lat' => 'float', 'lng' => 'float'];
}
