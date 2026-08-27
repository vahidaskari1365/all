<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\CardTemplate;
use App\Models\Category;
use App\Models\City;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** نقاط پایانی عمومی سایت */
class PublicController extends Controller
{
    /** GET /bootstrap — داده‌های عمومی اولیه (دسته‌ها، شهرها، پلن‌ها، قالب‌ها) */
    public function bootstrap(): JsonResponse
    {
        return response()->json([
            'categories' => Category::query()->orderBy('id')->get(['id', 'name', 'slug', 'icon', 'color']),
            'cities' => City::query()->orderBy('name')->get(['id', 'name', 'slug', 'province', 'lat', 'lng']),
            'plans' => Plan::query()->where('is_active', true)->orderBy('sort')->get(),
            'card_templates' => CardTemplate::query()->where('is_active', true)->orderBy('sort')->get(['id', 'key', 'name', 'description', 'config']),
        ]);
    }

    /**
     * GET /businesses/search — جست‌وجوی شعاعی مبتنی بر PostGIS
     *
     * پارامترها: lat, lng, radius (متر), category_id, q, per_page
     * اگر مختصات داده نشود، از موقعیت ذخیره‌شده کاربر استفاده می‌شود.
     * مرتب‌سازی پیش‌فرض: نزدیک‌ترین.
     */
    public function searchBusinesses(Request $request): JsonResponse
    {
        $data = $request->validate([
            'lat' => ['nullable', 'numeric', 'between:20,42'],
            'lng' => ['nullable', 'numeric', 'between:40,64'],
            'radius' => ['nullable', 'integer', 'min:100'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'city_id' => ['nullable', 'integer', 'exists:cities,id'],
            'q' => ['nullable', 'string', 'max:120'],
            'sort' => ['nullable', 'in:distance,name'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        [$lat, $lng] = $this->resolveLocation($request, $data);

        $maxRadius = (int) config('kasbyab.search.max_radius_m');
        $radius = min((int) ($data['radius'] ?? config('kasbyab.search.default_radius_m')), $maxRadius);

        $q = Business::query()
            ->where('status', Business::STATUS_ACTIVE)
            ->with(['category:id,name,slug,icon', 'city:id,name,slug'])
            ->selectWithDistance($lat, $lng)
            ->withinRadius($lat, $lng, $radius);

        if (! empty($data['category_id'])) {
            $q->where('category_id', $data['category_id']);
        }
        if (! empty($data['city_id'])) {
            $q->where('city_id', $data['city_id']);
        }
        if (! empty($data['q'])) {
            $term = '%'.$data['q'].'%';
            $q->where(function ($qq) use ($term) {
                $qq->where('name', 'ilike', $term)
                    ->orWhere('tagline', 'ilike', $term)
                    ->orWhere('description', 'ilike', $term);
            });
        }

        if (($data['sort'] ?? 'distance') === 'distance') {
            $q->orderByDistance($lat, $lng);
        } else {
            $q->orderBy('name');
        }

        $page = $q->paginate(min((int) ($data['per_page'] ?? 12), (int) config('kasbyab.search.limit')));

        return response()->json([
            'center' => ['lat' => $lat, 'lng' => $lng, 'radius' => $radius, 'source' => $request->filled('lat') ? 'request' : 'saved'],
            ...$page->toArray(),
        ]);
    }

    /** GET /businesses/{slug} */
    public function showBusiness(string $slug): JsonResponse
    {
        $business = Business::query()
            ->where('slug', $slug)
            ->where('status', Business::STATUS_ACTIVE)
            ->with(['category:id,name,slug,icon', 'city:id,name,slug', 'cards' => fn ($q) => $q->where('is_active', true)])
            ->firstOrFail();

        return response()->json(['data' => $business]);
    }

    /** GET /cards/{slug} — کارت عمومی (برای QR) */
    public function showCard(string $slug): JsonResponse
    {
        $card = \App\Models\BusinessCard::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->with(['business:id,name,slug,phone,mobile,tagline,logo_url,instagram,telegram,whatsapp,website,work_hours,address', 'template:id,key,name,config'])
            ->firstOrFail();

        return response()->json(['data' => $card]);
    }

    /**
     * @return array{0: float, 1: float}
     */
    private function resolveLocation(Request $request, array $data): array
    {
        if (isset($data['lat'], $data['lng'])) {
            return [(float) $data['lat'], (float) $data['lng']];
        }

        // موقعیت ذخیره‌شده کاربر (تا تغییر دستی باقی می‌ماند) — مسیر عمومی است؛ گارد sanctum صریح
        if ($user = $request->user('sanctum')) {
            if ($user->lat !== null && $user->lng !== null) {
                return [(float) $user->lat, (float) $user->lng];
            }
        }

        throw new \Illuminate\Http\Exceptions\HttpResponseException(
            response()->json(['message' => 'موقعیت مکانی لازم است (lat/lng یا موقعیت ذخیره‌شده کاربر).'], 422)
        );
    }
}
