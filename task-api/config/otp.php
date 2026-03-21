<?php

return [
    'expires_minutes' => (int) env('OTP_EXPIRES_MINUTES', 10),
    'resend_seconds' => (int) env('OTP_RESEND_SECONDS', 60),
    'max_attempts' => (int) env('OTP_MAX_ATTEMPTS', 3),
];
