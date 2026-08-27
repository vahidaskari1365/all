<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DesignerProfile;

/** لندینگ کد/لینک معرف طراح */
class ReferralController extends Controller
{
    public function show(string $code): \Illuminate\Http\JsonResponse
    {
        $designer = DesignerProfile::query()
            ->where('code', $code)
            ->with('user:id,name')
            ->firstOrFail();

        return response()->json([
            'code' => $designer->code,
            'designer_name' => $designer->user?->name,
            'title' => $designer->title,
            'portfolio_url' => $designer->portfolio_url,
            'ref_link' => url("/r/{$designer->code}"),
        ]);
    }
}
