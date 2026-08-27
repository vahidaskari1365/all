<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Owner;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\BusinessCard;
use App\Models\CardTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** پنل مالک — کارت‌های ویزیت پویا، QR و طرح چاپی */
class CardController extends Controller
{
    /** GET /owner/cards */
    public function index(Request $request): JsonResponse
    {
        $cards = BusinessCard::query()
            ->whereHas('business', fn ($q) => $q->where('owner_id', $request->user()->id))
            ->with(['business:id,name,slug', 'template:id,key,name'])
            ->latest()
            ->get();

        return response()->json(['data' => $cards]);
    }

    /** POST /owner/cards */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'business_id' => ['required', 'integer'],
            'template_id' => ['required', 'integer', 'exists:card_templates,id'],
            'data' => ['nullable', 'array'],
            'designer_id' => ['nullable', 'integer', 'exists:designer_profiles,id'],
        ]);

        $business = Business::where('owner_id', $request->user()->id)->findOrFail($data['business_id']);

        $card = BusinessCard::create([
            'business_id' => $business->id,
            'template_id' => $data['template_id'],
            'slug' => BusinessCard::generateUniqueSlug($business->name),
            'data' => $data['data'] ?? [],
            'designer_id' => $data['designer_id'] ?? null,
        ]);

        return response()->json([
            'data' => $card->load(['template:id,key,name,config', 'business:id,name,slug']),
            'qr_url' => url("/api/v1/cards/{$card->slug}/qr.png"),
            'public_url' => url("/c/{$card->slug}"),
        ], 201);
    }

    /** PUT /owner/cards/{id} */
    public function update(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'template_id' => ['nullable', 'integer', 'exists:card_templates,id'],
            'data' => ['nullable', 'array'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $card = $this->myCard($request, $id);
        $card->update(array_filter($data, fn ($v) => $v !== null));

        return response()->json(['data' => $card->fresh()]);
    }

    /** POST /owner/cards/{id}/print — بارگذاری طرح چاپی موجود */
    public function uploadPrint(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'print' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
        ]);

        $card = $this->myCard($request, $id);
        $path = $request->file('print')->store("cards/prints/{$request->user()->id}", 'local');
        $card->forceFill([
            'print_file_path' => $path,
            'print_original_name' => $request->file('print')->getClientOriginalName(),
        ])->save();

        return response()->json(['data' => $card->fresh(), 'message' => 'طرح چاپی ذخیره شد.']);
    }

    private function myCard(Request $request, int $id): BusinessCard
    {
        return BusinessCard::query()
            ->whereHas('business', fn ($q) => $q->where('owner_id', $request->user()->id))
            ->findOrFail($id);
    }
}
