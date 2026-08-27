<?php

declare(strict_types=1);

namespace App\Services;

use App\Services\Sms\SmsManager;
use App\Models\SecurityLog;
use App\Models\Plan;
use App\Models\ReferralReward;
use App\Models\Subscription;
use App\Models\SubscriptionRequest;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/** چرخه عمر اشتراک: ثبت درخواست → رسید آفلاین → تأیید مدیر → شروع/پایان خودکار → یادآوری تمدید */
class SubscriptionService
{
    public function approve(SubscriptionRequest $request, User $admin, ?string $note = null): Subscription
    {
        return DB::transaction(function () use ($request, $admin, $note) {
            $plan = $request->plan;

            $request->forceFill([
                'status' => SubscriptionRequest::STATUS_APPROVED,
                'reviewed_by' => $admin->id,
                'review_note' => $note,
            ])->save();

            $subscription = Subscription::create([
                'user_id' => $request->user_id,
                'plan_id' => $plan->id,
                'subscription_request_id' => $request->id,
                'starts_at' => now(),
                'ends_at' => now()->addDays($plan->duration_days),
                'status' => Subscription::STATUS_ACTIVE,
                'reminders_sent' => [],
            ]);

            // پورسانت معرف طراح (در صورت معرفی)
            $buyer = User::find($request->user_id);
            if ($buyer?->referred_by_designer_id) {
                $designer = $buyer->referredBy;
                ReferralReward::create([
                    'designer_id' => $designer->id,
                    'user_id' => $buyer->id,
                    'subscription_id' => $subscription->id,
                    'amount_irr' => (int) floor($plan->price_irr * $designer->commission_percent / 100),
                    'percent' => $designer->commission_percent,
                    'status' => ReferralReward::STATUS_PENDING,
                ]);
            }

            AuditLogger::log('approved', $request, ['status' => SubscriptionRequest::STATUS_PENDING_REVIEW], ['status' => 'approved', 'subscription_id' => $subscription->id]);
            SecurityLogger::log(SecurityLog::EVT_SUBSCRIPTION_APPROVED, ['request_id' => $request->id, 'subscription_id' => $subscription->id], $admin);

            return $subscription;
        });
    }

    public function reject(SubscriptionRequest $request, User $admin, ?string $note = null): void
    {
        $request->forceFill([
            'status' => SubscriptionRequest::STATUS_REJECTED,
            'reviewed_by' => $admin->id,
            'review_note' => $note,
        ])->save();

        AuditLogger::log('rejected', $request, ['status' => $request->getOriginal('status')], ['status' => 'rejected']);
    }

    /** پایان خودکار اشتراک‌های منقضی (دستور زمان‌بندی‌شده) */
    public function expireOverdue(): int
    {
        $expired = Subscription::query()
            ->where('status', Subscription::STATUS_ACTIVE)
            ->where('ends_at', '<', now())
            ->get();

        foreach ($expired as $s) {
            $s->forceFill(['status' => Subscription::STATUS_EXPIRED])->save();
            AuditLogger::log('expired', $s, ['status' => 'active'], ['status' => 'expired']);
        }

        return $expired->count();
    }

    /** یادآوری تمدید — روزهای ۷، ۳ و ۱ مانده به پایان */
    public function sendRenewalReminders(?array $milestones = null): int
    {
        $milestones ??= config('kasbyab.renewal_reminders', [7, 3, 1]);
        $sent = 0;

        foreach ($milestones as $days) {
            $subs = Subscription::query()
                ->where('status', Subscription::STATUS_ACTIVE)
                ->whereDate('ends_at', now()->copy()->addDays((int) $days)->toDateString())
                ->get();

            foreach ($subs as $sub) {
                $sentList = $sub->reminders_sent ?? [];
                if (in_array($days, $sentList, true)) {
                    continue;
                }
                $user = $sub->user;
                if ($user) {
                    app(SmsManager::class)->send(
                        $user->phone,
                        "کسب‌یاب: اشتراک «{$sub->plan->name}» شما تا {$days} روز دیگر پایان می‌یابد. برای تمدید اقدام کنید.",
                        'renewal_reminder'
                    );
                }
                $sentList[] = $days;
                $sub->forceFill(['reminders_sent' => $sentList])->save();
                $sent++;
            }
        }

        return $sent;
    }
}
