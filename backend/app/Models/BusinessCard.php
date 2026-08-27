<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusinessCard extends Model
{
    protected $fillable = ['business_id', 'template_id', 'slug', 'data', 'print_file_path', 'print_original_name', 'designer_id', 'is_active'];

    protected $casts = ['data' => 'array', 'is_active' => 'boolean'];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(CardTemplate::class, 'template_id');
    }

    public function designer(): BelongsTo
    {
        return $this->belongsTo(DesignerProfile::class, 'designer_id');
    }

    public static function generateUniqueSlug(string $name): string
    {
        $base = \Illuminate\Support\Str::slug($name, '-', null) ?: 'card';
        do {
            $slug = $base.'-'.substr(bin2hex(random_bytes(3)), 0, 5);
        } while (self::where('slug', $slug)->exists());

        return $slug;
    }
}
