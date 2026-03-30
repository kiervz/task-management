import { z } from 'zod';

export const projectSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Project name is required')
      .max(100, 'Project name must be less than 100 characters'),
    description: z.string().min(6, 'Description is required'),
    status: z.enum(
      ['planning', 'active', 'completed', 'on_hold', 'cancelled'],
      {
        error: 'Status is required',
      },
    ),
    priority: z.enum(['low', 'medium', 'high'], {
      error: 'Priority is required',
    }),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
  })
  .refine(
    (data) => {
      if (data.start_date && data.end_date) {
        return new Date(data.end_date) >= new Date(data.start_date);
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['end_date'],
    },
  );

export type ProjectFormValues = z.infer<typeof projectSchema>;
