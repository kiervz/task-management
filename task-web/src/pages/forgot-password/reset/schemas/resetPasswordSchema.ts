import { z } from 'zod';

export const resetPasswordSchema = z
  .object({
    otp_code: z.string().length(6, 'Please enter the 6-digit code'),
    new_password: z.string().min(8, 'Password must be at least 8 characters'),
    new_password_confirmation: z.string(),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: 'Passwords do not match',
    path: ['new_password_confirmation'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
