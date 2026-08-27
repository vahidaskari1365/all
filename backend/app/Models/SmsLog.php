<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmsLog extends Model
{
    protected $fillable = ['phone', 'template', 'message', 'driver', 'status', 'meta'];

    protected $casts = ['meta' => 'array'];
}
