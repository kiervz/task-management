<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>Password Reset</title>
</head>
<body style="margin:0;padding:0;background-color:#f0ede8;font-family:Georgia,serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0ede8;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;">
          <tr>
            <td style="background-color:#0f0f0f;padding:30px 38px;border-radius:16px 16px 0 0;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;letter-spacing:3px;text-transform:uppercase;color:#888888;">Password Reset</p>
              <h1 style="margin:12px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:normal;color:#ffffff;line-height:1.2;">Reset your password</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 38px 14px;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:15px;color:#666666;line-height:1.7;">
                Hi <strong style="color:#0f0f0f;">{{ $name }}</strong>, use the code below to reset your password.
                This code is valid for <strong style="color:#0f0f0f;">{{ $expiresInMinutes }} minutes</strong> and can only be used once.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 38px 6px;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#aaaaaa;">Your reset code</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 38px 30px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#f7f5f2;border-radius:8px;padding:18px 32px;border:1px solid #e0ddd8;">
                    <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:bold;color:#0f0f0f;letter-spacing:10px;">{{ $otpCode }}</p>
                  </td>
                </tr>
              </table>
              <p style="margin:14px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#999999;">Do not share this code with anyone.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f7f5f2;padding:10px 38px;border-radius:0 0 16px 16px;border-top:1px solid #ede9e4;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#aaaaaa;line-height:1.6;">If you didn't request a password reset, you can safely ignore this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
