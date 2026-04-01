import { toast } from 'sonner';

import type { Task, TaskMeta } from '@/@types/task';
import { useTaskUpdateMutation } from '@/store/api/taskApi';
import { handleApiError } from '@/lib/apiErrorHandler';
import CatalogCombobox from '@/components/ui/catalog-combobox';

type TaskInlineSelectProps = {
  task: Task;
  projectCode: string;
  items: TaskMeta[];
  valueId: string;
  field: 'task_status_id' | 'task_priority_id';
  placeholder: string;
  savingLabel: string;
  savingKey: string;
  isSaving: boolean;
  onSavingChange: (key: string, isSaving: boolean) => void;
};

export default function TaskInlineSelect({
  task,
  projectCode,
  items,
  valueId,
  field,
  placeholder,
  savingLabel,
  savingKey,
  isSaving,
  onSavingChange,
}: Readonly<TaskInlineSelectProps>) {
  const [taskUpdate, { isLoading }] = useTaskUpdateMutation();

  const handleValueChange = async (nextId: string) => {
    if (!nextId || nextId === valueId || isSaving || isLoading) {
      return;
    }

    onSavingChange(savingKey, true);

    try {
      await taskUpdate({ taskId: task.id, [field]: nextId }).unwrap();
      toast.success(`${savingLabel} updated`);
    } catch (error) {
      handleApiError(error);
    } finally {
      onSavingChange(savingKey, false);
    }
  };

  const isBusy = isLoading || isSaving;

  return (
    <div className="min-w-36">
      <CatalogCombobox
        id={`${field}-${projectCode}-${task.id}`}
        value={valueId}
        items={items}
        placeholder={placeholder}
        emptyText={`No ${savingLabel.toLowerCase()} options.`}
        hasError={false}
        disabled={isBusy}
        onValueChange={handleValueChange}
        className="border-none"
      />
    </div>
  );
}
