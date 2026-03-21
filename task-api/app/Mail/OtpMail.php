<?php

namespace App\Mail;

use App\Enums\OtpType;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public readonly string $name,
        public readonly string $otpCode,
        public readonly OtpType $type,
        public readonly int $expiresInMinutes = 10,
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = match ($this->type) {
            OtpType::REGISTER => 'Verify your email address',
            OtpType::LOGIN => 'Your login verification code',
            OtpType::FORGOT_PASSWORD => 'Reset your password',
        };

        return new Envelope(subject: $subject);
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $view = match ($this->type) {
            OtpType::REGISTER, OtpType::LOGIN => 'emails.otp',
            OtpType::FORGOT_PASSWORD => 'emails.forgot-password',
        };

        return new Content(
            view: $view,
            with: [
                'name' => $this->name,
                'otpCode' => $this->otpCode,
                'expiresInMinutes' => $this->expiresInMinutes,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
