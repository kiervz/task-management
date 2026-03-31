import { z } from 'zod';

export const createTaskSchema = (
  typeOptions: string[],
  statusOptions: string[],
  priorityOptions: string[],
) => {
  // Ensure we have at least one option for each catalog
  const validTypeOptions = typeOptions.length > 0 ? typeOptions : ['task'];
  const validStatusOptions =
    statusOptions.length > 0 ? statusOptions : ['backlog'];
  const validPriorityOptions =
    priorityOptions.length > 0 ? priorityOptions : ['low'];

  return z.object({
    title: z
      .string()
      .min(1, 'Task name is required')
      .max(100, 'Task name must be less than 100 characters'),
    description: z
      .string()
      .min(1, 'Description is required')
      .min(6, 'Description must be at least 6 characters long'),
    type: z.enum(
      [validTypeOptions[0], ...validTypeOptions.slice(1)] as [
        string,
        ...string[],
      ],
      {
        error: 'Type is required',
      },
    ),
    status: z.enum(
      [validStatusOptions[0], ...validStatusOptions.slice(1)] as [
        string,
        ...string[],
      ],
      {
        error: 'Status is required',
      },
    ),
    priority: z.enum(
      [validPriorityOptions[0], ...validPriorityOptions.slice(1)] as [
        string,
        ...string[],
      ],
      {
        error: 'Priority is required',
      },
    ),
    due_date: z.string().min(1, 'Due date is required'),
    assignee_ids: z.array(z.string()).optional(),
  });
};

export type TaskFormValues = z.infer<ReturnType<typeof createTaskSchema>>;
