<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DesignerProfile extends Model
{
    protected $fillable = ['user_id', 'code', 'title', 'portfolio_url', 'commission_percent', 'is_verified'];

    protected $casts = ['is_verified' => 'boolean', 'commission_percent' => 'integer'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function rewards(): HasMany
    {
        return $this->hasMany(ReferralReward::class, 'designer_id');
    }

    public static function generateUniqueCode(): string
    {
        do {
            $code = 'D'.strtoupper(substr(bin2hex(random_bytes(4)), 0, 7));
        } while (self::where('code', $code)->exists());

        return $code;
    }
}
