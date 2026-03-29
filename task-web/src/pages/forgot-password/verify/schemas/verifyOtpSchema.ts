import { z } from 'zod';

export const verifyOtpSchema = z.object({
  otp_code: z.string().length(6, 'Please enter the 6-digit code'),
});

export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;
