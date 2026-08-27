<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $fillable = ['user_id', 'actor_role', 'action', 'subject_type', 'subject_id', 'before', 'after', 'ip'];

    protected $casts = ['before' => 'array', 'after' => 'array'];
}
