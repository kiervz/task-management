import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(8, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
