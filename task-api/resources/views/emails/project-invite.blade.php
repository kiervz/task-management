<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Project Invite</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f7fb;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f7fb;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background-color:#ffffff;border:1px solid #e7ebf3;border-radius:14px;overflow:hidden;">
          <tr>
            <td style="padding:24px 28px;background-color:#0f172a;">
              <p style="margin:0;font-size:12px;letter-spacing:1.8px;text-transform:uppercase;color:#94a3b8;">Project Invitation</p>
              <h1 style="margin:10px 0 0;font-size:26px;line-height:1.3;color:#ffffff;">You're invited to join {{ $projectName }}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px 10px;color:#334155;font-size:15px;line-height:1.7;">
              <p style="margin:0 0 12px;">Hello {{ $inviteeEmail }},</p>
              <p style="margin:0 0 12px;"><strong style="color:#0f172a;">{{ $inviterName }}</strong> invited you to collaborate on <strong style="color:#0f172a;">{{ $projectName }}</strong> as <strong style="color:#0f172a;">{{ ucfirst($role) }}</strong>.</p>
              <p style="margin:0 0 12px;">Project code: <strong style="color:#0f172a;">{{ $projectCode }}</strong></p>
              @if(!empty($expiresAt))
                <p style="margin:0 0 12px;">This invite expires at <strong style="color:#0f172a;">{{ $expiresAt }}</strong>.</p>
              @endif
              <p style="margin:0;">Use one of the following links while authenticated:</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 20px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-right:12px;">
                    <a href="{{ $acceptUrl }}" style="display:inline-block;padding:12px 18px;background:#16a34a;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">Accept Invite</a>
                  </td>
                  <td>
                    <a href="{{ $rejectUrl }}" style="display:inline-block;padding:12px 18px;background:#e2e8f0;color:#0f172a;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600;">Reject Invite</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:14px 28px 24px;color:#64748b;font-size:12px;line-height:1.6;border-top:1px solid #e7ebf3;">
              If the buttons do not work, copy the URLs below into your browser:<br />
              <a href="{{ $acceptUrl }}" style="color:#2563eb;word-break:break-all;">{{ $acceptUrl }}</a><br />
              <a href="{{ $rejectUrl }}" style="color:#2563eb;word-break:break-all;">{{ $rejectUrl }}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
