import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { projectSchema } from '../schemas/projectSchema';
import {
  useProjectAddMutation,
  useProjectUpdateMutation,
  useProjectGetByCodeQuery,
} from '@/store/api/projectApi';

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: number | string;
}

const STATUS_OPTIONS = [
  'planning',
  'active',
  'completed',
  'on_hold',
  'cancelled',
] as const;

const STATUS_LABELS: Record<(typeof STATUS_OPTIONS)[number], string> = {
  planning: 'Planning',
  active: 'Active',
  completed: 'Completed',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
};

const PRIORITY_OPTIONS = ['low', 'medium', 'high'] as const;

const PRIORITY_LABELS: Record<(typeof PRIORITY_OPTIONS)[number], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const DEFAULT_VALUES: ProjectFormValues = {
  name: '',
  description: '',
  status: 'planning',
  priority: 'medium',
  start_date: '',
  end_date: '',
};

export default function ProjectFormModal({
  open,
  onOpenChange,
  projectId,
}: Readonly<ProjectFormModalProps>) {
  const isEditMode = !!projectId;

  const title = isEditMode ? 'Edit Project' : 'Add New Project';
  const description = isEditMode
    ? 'Update your project information'
    : 'Create a new project to manage your repositories';
  const submitButtonText = isEditMode ? 'Update Project' : 'Create Project';
  const loadingText = isEditMode ? 'Updating...' : 'Creating...';
  const successMessage = isEditMode
    ? 'Project updated successfully!'
    : 'Project created successfully!';
  const errorMessage = isEditMode
    ? 'Failed to update project'
    : 'Failed to create project';

  const { data: projectData, isLoading: isFetchingProject } =
    useProjectGetByCodeQuery(projectId!, {
      skip: !isEditMode || !open,
      refetchOnMountOrArgChange: true,
    });

  const [projectAdd, { isLoading: isAdding }] = useProjectAddMutation();
  const [projectUpdate, { isLoading: isUpdating }] = useProjectUpdateMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    control,
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onSubmit',
  });

  const statusValue = useWatch({ control, name: 'status' });
  const priorityValue = useWatch({ control, name: 'priority' });

  useEffect(() => {
    if (open && isEditMode && projectData?.response) {
      const p = projectData.response;
      reset({
        name: p.name,
        description: p.description || '',
        status: p.status,
        priority: p.priority,
        start_date: p.start_date?.slice(0, 10) ?? '',
        end_date: p.end_date?.slice(0, 10) ?? '',
      });
    } else if (open && !isEditMode) {
      reset(DEFAULT_VALUES);
    }
  }, [isEditMode, open, projectData, reset]);

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      if (isEditMode) {
        await projectUpdate({ id: projectId, ...values }).unwrap();
      } else {
        await projectAdd(values).unwrap();
      }
      toast.success(successMessage);
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(errorMessage);
      console.error('Failed to save project:', error);
    }
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  const isLoading = isAdding || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} disablePointerDismissal>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {isFetchingProject ? (
          <div className="flex justify-center items-center py-8">
            <Spinner className="size-6" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Project Name</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Awesome Project"
                  aria-invalid={!!errors.name}
                  {...register('name')}
                />
                {errors.name?.message && (
                  <span className="text-sm text-destructive">
                    {errors.name.message}
                  </span>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Project Description"
                  rows={3}
                  aria-invalid={!!errors.description}
                  {...register('description')}
                />
                {errors.description?.message && (
                  <span className="text-sm text-destructive">
                    {errors.description.message}
                  </span>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="status">Status</FieldLabel>
                  <Select
                    value={statusValue}
                    onValueChange={(val) =>
                      setValue('status', val as ProjectFormValues['status'], {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger id="status" aria-invalid={!!errors.status}>
                      <SelectValue placeholder="Select status">
                        {statusValue ? STATUS_LABELS[statusValue] : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.status?.message && (
                    <span className="text-sm text-destructive">
                      {errors.status.message}
                    </span>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="priority">Priority</FieldLabel>
                  <Select
                    value={priorityValue}
                    onValueChange={(val) =>
                      setValue(
                        'priority',
                        val as ProjectFormValues['priority'],
                        {
                          shouldValidate: true,
                        },
                      )
                    }
                  >
                    <SelectTrigger
                      id="priority"
                      aria-invalid={!!errors.priority}
                    >
                      <SelectValue placeholder="Select priority">
                        {priorityValue
                          ? PRIORITY_LABELS[priorityValue]
                          : undefined}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {PRIORITY_OPTIONS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {PRIORITY_LABELS[p]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.priority?.message && (
                    <span className="text-sm text-destructive">
                      {errors.priority.message}
                    </span>
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="start_date">Start Date</FieldLabel>
                  <Input
                    id="start_date"
                    type="date"
                    aria-invalid={!!errors.start_date}
                    {...register('start_date')}
                  />
                  {errors.start_date?.message && (
                    <span className="text-sm text-destructive">
                      {errors.start_date.message}
                    </span>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="end_date">End Date</FieldLabel>
                  <Input
                    id="end_date"
                    type="date"
                    aria-invalid={!!errors.end_date}
                    {...register('end_date')}
                  />
                  {errors.end_date?.message && (
                    <span className="text-sm text-destructive">
                      {errors.end_date.message}
                    </span>
                  )}
                </Field>
              </div>

              <Field>
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting || isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || isLoading}>
                    {isSubmitting || isLoading ? loadingText : submitButtonText}
                  </Button>
                </div>
              </Field>
            </FieldGroup>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
