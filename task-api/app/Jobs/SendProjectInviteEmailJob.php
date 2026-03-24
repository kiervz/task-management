<?php

namespace App\Jobs;

use App\Mail\ProjectInviteMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendProjectInviteEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 10;

    public function __construct(
        private readonly string $email,
        private readonly string $projectName,
        private readonly string $projectCode,
        private readonly string $inviterName,
        private readonly string $role,
        private readonly ?string $expiresAt = null,
    ) {}

    public function handle(): void
    {
        Mail::to($this->email)->send(new ProjectInviteMail(
            inviteeEmail: $this->email,
            projectName: $this->projectName,
            projectCode: $this->projectCode,
            inviterName: $this->inviterName,
            role: $this->role,
            expiresAt: $this->expiresAt,
        ));
    }
}