<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DesignerProfile;
use App\Models\ReferralReward;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** پنل طراح — کد معرف، پورسانت‌ها */
class DesignerController extends Controller
{
    /** GET /designer/profile */
    public function profile(Request $request): JsonResponse
    {
        $profile = $request->user()->designerProfile()->firstOrCreate([
            'user_id' => $request->user()->id,
        ], [
            'code' => DesignerProfile::generateUniqueCode(),
            'commission_percent' => 10,
        ]);

        return response()->json(['data' => $profile]);
    }

    /** PUT /designer/profile */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:120'],
            'portfolio_url' => ['nullable', 'url', 'max:250'],
        ]);

        $profile = $request->user()->designerProfile()->firstOrCreate(['user_id' => $request->user()->id], ['code' => DesignerProfile::generateUniqueCode()]);
        $profile->update($data);

        return response()->json(['data' => $profile->fresh()]);
    }

    /** GET /designer/referrals — کاربران معرفی‌شده و پورسانت‌ها */
    public function referrals(Request $request): JsonResponse
    {
        $profile = $request->user()->designerProfile()->firstOrCreate(['user_id' => $request->user()->id], ['code' => DesignerProfile::generateUniqueCode()]);

        $rewards = ReferralReward::query()->where('designer_id', $profile->id)->with(['user:id,name,phone', 'subscription.plan:id,name'])->latest()->get();

        return response()->json([
            'ref_link' => url("/r/{$profile->code}"),
            'code' => $profile->code,
            'totals' => [
                'pending_irr' => (int) $rewards->where('status', 'pending')->sum('amount_irr'),
                'paid_irr' => (int) $rewards->where('status', 'paid')->sum('amount_irr'),
                'count' => $rewards->count(),
            ],
            'data' => $rewards,
        ]);
    }
}
