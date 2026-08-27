<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * کاربر سامانه — ورود صرفاً با شماره موبایل + OTP
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    public const ROLE_ADMIN = 'admin';
    public const ROLE_OWNER = 'owner';
    public const ROLE_DESIGNER = 'designer';
    public const ROLE_USER = 'user';

    public const ROLES = [self::ROLE_ADMIN, self::ROLE_OWNER, self::ROLE_DESIGNER, self::ROLE_USER];

    protected $fillable = ['name', 'phone', 'role', 'lat', 'lng', 'location_updated_at', 'referred_by_designer_id', 'phone_verified_at', 'is_active'];

    protected $casts = [
        'phone_verified_at' => 'datetime',
        'location_updated_at' => 'datetime',
        'lat' => 'float',
        'lng' => 'float',
        'is_active' => 'boolean',
    ];

    public function designerProfile(): HasOne
    {
        return $this->hasOne(DesignerProfile::class);
    }

    public function referredBy(): BelongsTo
    {
        return $this->belongsTo(DesignerProfile::class, 'referred_by_designer_id');
    }

    public function businesses(): HasMany
    {
        return $this->hasMany(Business::class, 'owner_id');
    }

    public function subscriptionRequests(): HasMany
    {
        return $this->hasMany(SubscriptionRequest::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isDesigner(): bool
    {
        return $this->role === self::ROLE_DESIGNER;
    }

    public function isOwner(): bool
    {
        return $this->role === self::ROLE_OWNER;
    }

    /** ذخیره موقعیت انتخابی کاربر — تا تغییر دستی بعدی باقی می‌ماند */
    public function saveLocation(float $lat, float $lng): void
    {
        $this->forceFill(['lat' => $lat, 'lng' => $lng, 'location_updated_at' => now()])->save();
    }
}
