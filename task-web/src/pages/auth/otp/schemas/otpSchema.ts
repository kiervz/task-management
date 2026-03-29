import { z } from 'zod';

export const otpSchema = z.object({
  otp_code: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers'),
});

export type OTPFormValues = z.infer<typeof otpSchema>;
