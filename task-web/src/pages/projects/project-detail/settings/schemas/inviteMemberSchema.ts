import { z } from 'zod';

export const inviteMemberSchema = z.object({
  member_email: z
    .string()
    .min(1, 'Email is required.')
    .email({ message: 'Enter a valid email address.' }),
  role: z.enum(['member', 'admin']),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;
