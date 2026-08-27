<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;

class Business extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_PENDING = 'pending';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_SUSPENDED = 'suspended';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'owner_id', 'name', 'name_normalized', 'slug', 'category_id', 'city_id', 'district',
        'tagline', 'description', 'address', 'phone', 'mobile', 'email', 'website',
        'logo_url', 'cover_url', 'lat', 'lng', 'instagram', 'telegram', 'whatsapp',
        'work_hours', 'has_license', 'union_member', 'has_guarantee', 'has_showcase',
        'status', 'reject_reason', 'approved_by', 'approved_at',
    ];

    protected static function booted(): void
    {
        // همگام‌سازی ستون مکانی PostGIS با lat/lng
        static::saved(function (Business $b) {
            if ($b->lat !== null && $b->lng !== null) {
                \Illuminate\Support\Facades\DB::statement(
                    'UPDATE businesses SET location = ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography WHERE id = ?',
                    [$b->lng, $b->lat, $b->id]
                );
            }
        });
    }

    protected $casts = [
        'has_license' => 'boolean',
        'union_member' => 'boolean',
        'has_guarantee' => 'boolean',
        'has_showcase' => 'boolean',
        'approved_at' => 'datetime',
        'lat' => 'float',
        'lng' => 'float',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function cards(): HasMany
    {
        return $this->hasMany(BusinessCard::class);
    }

    /** انتخاب فاصله (متر) تا یک نقطه جغرافیایی — مبتنی بر PostGIS */
    public function scopeSelectWithDistance(Builder $query, float $lat, float $lng): Builder
    {
        $point = sprintf('ST_SetSRID(ST_MakePoint(%.7F, %.7F), 4326)', $lng, $lat);

        return $query->select('*')->addSelect(DB::raw("ST_Distance(location, {$point}::geography) AS distance_m"));
    }

    /** فیلتر شعاع: فقط کسب‌وکارهای داخل شعاع مشخص (متر) */
    public function scopeWithinRadius(Builder $query, float $lat, float $lng, float $radiusMeters): Builder
    {
        $point = sprintf('ST_SetSRID(ST_MakePoint(%.7F, %.7F), 4326)', $lng, $lat);

        return $query->whereRaw("ST_DWithin(location, {$point}::geography, ?)", [$radiusMeters]);
    }

    /** مرتب‌سازی از نزدیک‌ترین به دورترین */
    public function scopeOrderByDistance(Builder $query, float $lat, float $lng): Builder
    {
        $point = sprintf('ST_SetSRID(ST_MakePoint(%.7F, %.7F), 4326)', $lng, $lat);

        return $query->orderByRaw("ST_Distance(location, {$point}::geography) ASC");
    }

    /** تشخیص کسب‌وکار تکراری: نرمال‌سازی نام + شهر / یا شماره تماس مشترک */
    public static function normalizeName(string $name): string
    {
        $s = str_replace(["\u{200C}", '‌'], '', $name); // حذف نیم‌فاصله
        $s = mb_strtolower(trim($s));
        $s = preg_replace('/[\s\x00-\x1F]+/u', ' ', $s);
        $s = preg_replace('/[^\p{L}\p{N} ]/u', '', $s);
        $s = preg_replace('/\s+/u', ' ', $s);

        return trim($s);
    }

    public static function normalizePhone(?string $phone): ?string
    {
        if ($phone === null || $phone === '') {
            return null;
        }
        $digits = preg_replace('/\D+/', '', $phone);

        return match (true) {
            str_starts_with($digits, '0098') => '0'.substr($digits, 4),
            str_starts_with($digits, '98') && strlen($digits) > 10 => '0'.substr($digits, 2),
            str_starts_with($digits, '9') && strlen($digits) === 10 => '0'.$digits,
            default => $digits === '' ? null : $digits,
        };
    }
}
