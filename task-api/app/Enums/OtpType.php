<?php

namespace App\Enums;

enum OtpType: string
{
    case REGISTER = 'register';
    case LOGIN = 'login';
    case FORGOT_PASSWORD = 'forgot_password';
}
