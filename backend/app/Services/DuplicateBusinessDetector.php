<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Business;

/**
 * تشخیص کسب‌وکار تکراری:
 * ۱) شماره تماس نرمال‌شده یکسان در همان شهر
 * ۲) نام نرمال‌شده یکسان یا بسیار نزدیک (شباهت > ۸۵٪) در همان شهر
 */
class DuplicateBusinessDetector
{
    /** @return array<int, array{id:int,name:string,reason:string,similarity:float|null}> */
    public function find(string $name, ?string $phone, int $cityId, ?int $excludeId = null): array
    {
        $hits = collect();
        $nameNorm = Business::normalizeName($name);
        $phoneNorm = Business::normalizePhone($phone);

        $q = Business::query()->where('city_id', $cityId);
        if ($excludeId !== null) {
            $q->whereKeyNot($excludeId);
        }

        if ($phoneNorm !== null) {
            $phoneMatch = (clone $q)
                ->where(function ($qq) use ($phoneNorm) {
                    $qq->where('phone', $phoneNorm)->orWhere('mobile', $phoneNorm);
                })
                ->get(['id', 'name']);
            foreach ($phoneMatch as $b) {
                $hits->push(['id' => $b->id, 'name' => $b->name, 'reason' => 'phone', 'similarity' => null]);
            }
        }

        if ($nameNorm !== '') {
            $sameCity = (clone $q)->get(['id', 'name', 'name_normalized']);
            foreach ($sameCity as $b) {
                if ($b->name_normalized === $nameNorm) {
                    $hits->push(['id' => $b->id, 'name' => $b->name, 'reason' => 'exact_name', 'similarity' => 1.0]);

                    continue;
                }
                $sim = $this->similarity($nameNorm, (string) $b->name_normalized);
                if ($sim >= 0.85) {
                    $hits->push(['id' => $b->id, 'name' => $b->name, 'reason' => 'similar_name', 'similarity' => round($sim, 3)]);
                }
            }
        }

        return $hits->unique('id')->values()->all();
    }

    private function similarity(string $a, string $b): float
    {
        // پسوندهای لاتین/زباله‌مانند (مثل «/tree») در مقایسه نام فارسی لحاظ نمی‌شوند
        $fa = static fn (string $s): string => trim(preg_replace('/\s+/u', ' ', preg_replace('/[a-zA-Z0-9]/u', '', $s)) ?? $s);

        $a2 = $fa($a);
        $b2 = $fa($b);

        if ($a2 !== '' && $b2 !== '') {
            $a = $a2;
            $b = $b2;
        }

        similar_text($a, $b, $percent);

        return $percent / 100;
    }
}
