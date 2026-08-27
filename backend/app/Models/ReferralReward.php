<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReferralReward extends Model
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_PAID = 'paid';
    public const STATUS_CANCELLED = 'cancelled';

    protected $fillable = ['designer_id', 'user_id', 'subscription_id', 'amount_irr', 'percent', 'status', 'paid_at'];

    protected $casts = ['paid_at' => 'datetime', 'amount_irr' => 'integer', 'percent' => 'integer'];

    public function designer(): BelongsTo
    {
        return $this->belongsTo(DesignerProfile::class, 'designer_id');
    }

    /** خریدار معرفی‌شده */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }
}
