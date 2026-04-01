import { z } from 'zod';

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
});

export type CommentFormValues = z.infer<typeof commentSchema>;
