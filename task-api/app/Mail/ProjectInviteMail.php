<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProjectInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $inviteeEmail,
        public readonly string $projectName,
        public readonly string $projectCode,
        public readonly string $inviterName,
        public readonly string $role,
        public readonly ?string $expiresAt = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: "You're invited to join {$this->projectName}");
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.project-invite',
            with: [
                'inviteeEmail' => $this->inviteeEmail,
                'projectName' => $this->projectName,
                'projectCode' => $this->projectCode,
                'inviterName' => $this->inviterName,
                'role' => $this->role,
                'expiresAt' => $this->expiresAt,
                'acceptUrl' => $this->buildConfirmUrl('accept'),
                'rejectUrl' => $this->buildConfirmUrl('reject'),
            ],
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }

    private function buildConfirmUrl(string $action): string
    {
        $baseUrl = rtrim((string) config('app.frontend_url'), '/')."/invites/{$action}";

        return $baseUrl.'?'.http_build_query([
            'code' => $this->projectCode,
        ]);
    }
}
