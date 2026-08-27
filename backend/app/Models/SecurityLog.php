<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SecurityLog extends Model
{
    public const EVT_OTP_REQUESTED = 'otp_requested';
    public const EVT_OTP_VERIFIED = 'otp_verified';
    public const EVT_OTP_FAILED = 'otp_failed';
    public const EVT_OTP_RATE_LIMITED = 'otp_rate_limited';
    public const EVT_LOGIN = 'login';
    public const EVT_FORBIDDEN = 'forbidden';
    public const EVT_RECEIPT_UPLOADED = 'receipt_uploaded';
    public const EVT_SUBSCRIPTION_APPROVED = 'subscription_approved';
    public const EVT_DUPLICATE_ATTEMPT = 'duplicate_business_attempt';

    protected $fillable = ['event', 'user_id', 'phone', 'ip', 'user_agent', 'meta'];

    protected $casts = ['meta' => 'array'];
}
