import { toast } from 'sonner';

import type { Project } from '@/@types/project';
import { useProjectUpdateMutation } from '@/store/api/projectApi';
import { handleApiError } from '@/lib/apiErrorHandler';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type InlineSelectOption = {
  value: string;
  label: string;
};

type ProjectInlineSelectProps = {
  project: Project;
  field: 'status' | 'priority';
  value: string;
  options: InlineSelectOption[];
  placeholder: string;
  savingLabel: string;
};

export default function ProjectInlineSelect({
  project,
  field,
  value,
  options,
  placeholder,
  savingLabel,
}: Readonly<ProjectInlineSelectProps>) {
  const [projectUpdate, { isLoading }] = useProjectUpdateMutation();

  const handleValueChange = async (nextValue: string | null) => {
    if (!nextValue || nextValue === value || isLoading) return;

    try {
      await projectUpdate({
        id: project.code,
        [field]: nextValue,
      } as Parameters<typeof projectUpdate>[0]).unwrap();
      toast.success(`${savingLabel} updated`);
    } catch (error) {
      handleApiError(error);
    }
  };

  const isBusy = isLoading;
  const currentLabel = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div className="min-w-36">
      <Select value={value} onValueChange={handleValueChange} disabled={isBusy}>
        <SelectTrigger className="w-full border-none bg-transparent shadow-none focus-visible:ring-0 disabled:opacity-60 dark:bg-transparent dark:hover:bg-transparent">
          <SelectValue placeholder={placeholder}>{currentLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
