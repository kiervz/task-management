import React, { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { createTaskSchema, type TaskFormValues } from '../schemas/taskSchema';
import {
  useTaskAddMutation,
  useTaskGetByTaskIdQuery,
  useTaskUpdateMutation,
} from '@/store/api/taskApi';
import { useTaskTypesQuery } from '@/store/api/taskTypeApi';
import { useTaskStatusesQuery } from '@/store/api/taskStatusApi';
import { useTaskPrioritiesQuery } from '@/store/api/taskPriorityApi';
import { useProjectMembersQuery } from '@/store/api/projectApi';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import CatalogCombobox from '@/components/ui/catalog-combobox';

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId?: string;
  projectCode: string;
}

const DEFAULT_VALUES: Partial<TaskFormValues> = {
  title: '',
  description: '',
  due_date: '',
  assignee_ids: [],
};

export default function TaskFormModal({
  open,
  onOpenChange,
  taskId,
  projectCode,
}: Readonly<TaskFormModalProps>) {
  const assigneeAnchor = useComboboxAnchor();
  const isEditMode = !!taskId;

  const title = isEditMode ? 'Edit Task' : 'Add New Task';
  const description = isEditMode
    ? 'Update your task information'
    : 'Create a new task';
  const submitButtonText = isEditMode ? 'Update Task' : 'Create Task';
  const loadingText = isEditMode ? 'Updating...' : 'Creating...';
  const successMessage = isEditMode
    ? 'Task updated successfully!'
    : 'Task created successfully!';

  const { data: taskData, isLoading: isFetchingTask } = useTaskGetByTaskIdQuery(
    taskId!,
    {
      skip: !isEditMode || !open,
      refetchOnMountOrArgChange: true,
    },
  );

  const { data: members, isLoading: isFetchingMembers } =
    useProjectMembersQuery(projectCode);

  const { data: types } = useTaskTypesQuery(projectCode);
  const { data: statuses } = useTaskStatusesQuery(projectCode);
  const { data: priorities } = useTaskPrioritiesQuery(projectCode);

  const [taskAdd, { isLoading: isAdding }] = useTaskAddMutation();
  const [taskUpdate, { isLoading: isUpdating }] = useTaskUpdateMutation();

  const { schema, defaultValues } = useMemo(() => {
    const typeIds = types?.map((t) => t.id) ?? [];
    const statusIds = statuses?.map((s) => s.id) ?? [];
    const priorityIds = priorities?.map((p) => p.id) ?? [];
    const defaultTypeId = types?.find((type) => type.is_default)?.id;
    const defaultStatusId = statuses?.find((status) => status.is_default)?.id;
    const defaultPriorityId = priorities?.find(
      (priority) => priority.is_default,
    )?.id;

    return {
      schema: createTaskSchema(typeIds, statusIds, priorityIds),
      defaultValues: {
        ...DEFAULT_VALUES,
        type: defaultTypeId ?? typeIds[0] ?? '',
        status: defaultStatusId ?? statusIds[0] ?? '',
        priority: defaultPriorityId ?? priorityIds[0] ?? '',
      } as TaskFormValues,
    };
  }, [types, statuses, priorities]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields, isSubmitted },
    reset,
    setValue,
    control,
  } = useForm<TaskFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onSubmit',
  });

  const typeValue = useWatch({ control, name: 'type' });
  const statusValue = useWatch({ control, name: 'status' });
  const priorityValue = useWatch({ control, name: 'priority' });

  const showTitleError = Boolean(
    errors.title && (isSubmitted || touchedFields.title),
  );
  const showDescriptionError = Boolean(
    errors.description && (isSubmitted || touchedFields.description),
  );

  useEffect(() => {
    if (open && isEditMode && taskData?.response) {
      const t = taskData.response;
      reset({
        title: t.title,
        description: t.description || '',
        type: t.type?.id || (defaultValues.type ?? ''),
        status: t.status?.id || (defaultValues.status ?? ''),
        priority: t.priority?.id || (defaultValues.priority ?? ''),
        due_date: t.due_date?.slice(0, 10) ?? '',
        assignee_ids: t.assignees?.map((a) => a.user.id) || [],
      } as TaskFormValues);
    } else if (open && !isEditMode) {
      reset(defaultValues);
    }
  }, [isEditMode, open, taskData, reset, defaultValues]);

  const onSubmit = async (values: TaskFormValues) => {
    try {
      const payload = {
        title: values.title,
        description: values.description,
        task_type_id: values.type,
        task_status_id: values.status,
        task_priority_id: values.priority,
        due_date: values.due_date || undefined,
        assignee_ids: values.assignee_ids,
      };

      if (isEditMode) {
        await taskUpdate({ taskId, ...payload }).unwrap();
      } else {
        await taskAdd({ ...payload, projectCode: projectCode }).unwrap();
      }
      toast.success(successMessage);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save task:', error);
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

        {isFetchingTask ? (
          <div className="flex justify-center items-center py-8">
            <Spinner className="size-6" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="title">
                  Title <span className="text-red-400">*</span>
                </FieldLabel>
                <Input
                  id="title"
                  type="text"
                  placeholder="Title of your task"
                  aria-invalid={showTitleError}
                  {...register('title')}
                />
                {showTitleError && errors.title?.message && (
                  <span className="text-sm text-destructive">
                    {errors.title.message}
                  </span>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Description of your task"
                  rows={3}
                  aria-invalid={showDescriptionError}
                  {...register('description')}
                />
                {showDescriptionError && errors.description?.message && (
                  <span className="text-sm text-destructive">
                    {errors.description.message}
                  </span>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="type">
                    Type <span className="text-red-400">*</span>
                  </FieldLabel>
                  <CatalogCombobox
                    id="type"
                    value={typeValue ?? ''}
                    items={types ?? []}
                    placeholder="Select type"
                    emptyText="No types found."
                    hasError={!!errors.type}
                    onValueChange={(val) =>
                      setValue('type', val, { shouldValidate: true })
                    }
                  />
                  {errors.type?.message && (
                    <span className="text-sm text-destructive">
                      {errors.type.message}
                    </span>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="status">
                    Status <span className="text-red-400">*</span>
                  </FieldLabel>
                  <CatalogCombobox
                    id="status"
                    value={statusValue ?? ''}
                    items={statuses ?? []}
                    placeholder="Select status"
                    emptyText="No statuses found."
                    hasError={!!errors.status}
                    onValueChange={(val) =>
                      setValue('status', val, { shouldValidate: true })
                    }
                  />
                  {errors.status?.message && (
                    <span className="text-sm text-destructive">
                      {errors.status.message}
                    </span>
                  )}
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="priority">
                    Priority <span className="text-red-400">*</span>
                  </FieldLabel>
                  <CatalogCombobox
                    id="priority"
                    value={priorityValue ?? ''}
                    items={priorities ?? []}
                    placeholder="Select priority"
                    emptyText="No priorities found."
                    hasError={!!errors.priority}
                    onValueChange={(val) =>
                      setValue('priority', val, { shouldValidate: true })
                    }
                  />
                  {errors.priority?.message && (
                    <span className="text-sm text-destructive">
                      {errors.priority.message}
                    </span>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="due_date">
                    Due Date <span className="text-red-400">*</span>
                  </FieldLabel>
                  <Input id="due_date" type="date" {...register('due_date')} />
                  {errors.due_date?.message && (
                    <span className="text-sm text-destructive">
                      {errors.due_date.message}
                    </span>
                  )}
                </Field>
              </div>

              <div className="flex">
                <Field>
                  <FieldLabel htmlFor="assignee_ids">Assignees</FieldLabel>
                  <Controller
                    control={control}
                    name="assignee_ids"
                    render={({ field }) => (
                      <Combobox
                        id="assignee_ids"
                        multiple
                        autoHighlight
                        value={field.value ?? []}
                        onValueChange={field.onChange}
                        disabled={isFetchingMembers}
                        items={members?.map((m) => m.user.id) ?? []}
                      >
                        <ComboboxChips ref={assigneeAnchor} className="w-full">
                          <ComboboxValue>
                            {(values: string[]) => (
                              <React.Fragment>
                                {values.map((id) => {
                                  const member = members?.find(
                                    (m) => m.user.id === id,
                                  );
                                  return (
                                    <ComboboxChip key={id}>
                                      {member?.user?.name ?? id}
                                    </ComboboxChip>
                                  );
                                })}
                                <ComboboxChipsInput />
                              </React.Fragment>
                            )}
                          </ComboboxValue>
                        </ComboboxChips>
                        <ComboboxContent anchor={assigneeAnchor}>
                          <ComboboxEmpty>No members found.</ComboboxEmpty>
                          <ComboboxList>
                            {(item: string) => {
                              const member = members?.find(
                                (m) => m.user.id === item,
                              );
                              return (
                                <ComboboxItem key={item} value={item}>
                                  {member?.user?.name ?? item}
                                </ComboboxItem>
                              );
                            }}
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    )}
                  />
                  {errors.assignee_ids?.message && (
                    <span className="text-sm text-destructive">
                      {errors.assignee_ids.message}
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
