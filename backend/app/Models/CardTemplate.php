<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CardTemplate extends Model
{
    protected $fillable = ['key', 'name', 'description', 'config', 'sort', 'is_active'];

    protected $casts = ['config' => 'array', 'is_active' => 'boolean'];
}
