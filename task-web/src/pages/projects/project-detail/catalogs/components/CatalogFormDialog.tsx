import type { Dispatch, SetStateAction } from 'react';

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CatalogItem } from './columns';

export type CatalogFormState = {
  name: string;
  color: string;
  sort_order: string;
  is_default: boolean;
  is_done: boolean;
};

type CatalogFormDialogProps = {
  open: boolean;
  title: string;
  subtitle: string;
  editing: CatalogItem | null;
  form: CatalogFormState;
  supportsDoneField: boolean;
  isSaving: boolean;
  submitLabel: string;
  setForm: Dispatch<SetStateAction<CatalogFormState>>;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onSubmit: (event: { preventDefault: () => void }) => void;
};

const PRESET_COLORS = [
  '#3B82F6',
  '#22C55E',
  '#EAB308',
  '#F97316',
  '#EF4444',
  '#EC4899',
  '#A855F7',
  '#14B8A6',
  '#64748B',
  '#111827',
];

const BOOLEAN_OPTIONS = [
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
] as const;

export default function CatalogFormDialog({
  open,
  title,
  subtitle,
  editing,
  form,
  supportsDoneField,
  isSaving,
  submitLabel,
  setForm,
  onOpenChange,
  onCancel,
  onSubmit,
}: Readonly<CatalogFormDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} disablePointerDismissal>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? `Edit ${subtitle}` : `Create ${subtitle}`}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? `Update ${subtitle.toLowerCase()} details for this project.`
              : `Add a new ${subtitle.toLowerCase()} for this project.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor={`${title}_name`}>
                Name <span className="text-red-400">*</span>
              </FieldLabel>
              <Input
                id={`${title}_name`}
                value={form.name}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Name"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={`${title}_color_picker`}>Color</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  id={`${title}_color_picker`}
                  type="color"
                  value={form.color}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      color: event.target.value,
                    }))
                  }
                  className="w-14 p-1"
                />
                <Input
                  id={`${title}_color_hex`}
                  value={form.color}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      color: event.target.value,
                    }))
                  }
                  placeholder="#3B82F6"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="size-6 rounded-full border"
                    style={{ backgroundColor: color }}
                    onClick={() => setForm((prev) => ({ ...prev, color }))}
                    aria-label={`Pick ${color}`}
                  />
                ))}
              </div>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor={`${title}_sort_order`}>
                  Sort Order
                </FieldLabel>
                <Input
                  id={`${title}_sort_order`}
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      sort_order: event.target.value,
                    }))
                  }
                  placeholder="1"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor={`${title}_default`}>Default</FieldLabel>
                <Select
                  value={form.is_default ? 'yes' : 'no'}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      is_default: value === 'yes',
                    }))
                  }
                >
                  <SelectTrigger id={`${title}_default`}>
                    <SelectValue placeholder="Select default option">
                      {form.is_default ? 'Yes' : 'No'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {BOOLEAN_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            {supportsDoneField && (
              <Field>
                <FieldLabel htmlFor={`${title}_done`}>Done Status</FieldLabel>
                <Select
                  value={form.is_done ? 'yes' : 'no'}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      is_done: value === 'yes',
                    }))
                  }
                >
                  <SelectTrigger id={`${title}_done`}>
                    <SelectValue placeholder="Select done status">
                      {form.is_done ? 'Yes' : 'No'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {BOOLEAN_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            )}

            <Field>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Spinner className="size-4" />}
                  {submitLabel}
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
