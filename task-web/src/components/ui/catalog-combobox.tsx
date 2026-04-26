import { useEffect } from 'react';

import {
  Combobox,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from '@/components/ui/combobox';
import type { TaskMeta } from '@/@types/task';
import { cn } from '../../lib/utils';

interface CatalogComboboxProps {
  id: string;
  value: string;
  items: TaskMeta[];
  placeholder: string;
  emptyText: string;
  hasError: boolean;
  disabled?: boolean;
  onValueChange: (val: string) => void;
  className?: string;
}

export default function CatalogCombobox({
  id,
  value,
  items,
  placeholder,
  emptyText,
  hasError,
  disabled = false,
  onValueChange,
  className,
}: Readonly<CatalogComboboxProps>) {
  const defaultItem = items.find((item) => item.is_default);

  useEffect(() => {
    if (!value && defaultItem) {
      onValueChange(defaultItem.id);
    }
  }, [defaultItem, onValueChange, value]);

  return (
    <Combobox
      id={id}
      value={value}
      inputValue=""
      onInputValueChange={() => {}}
      disabled={disabled}
      onValueChange={(val) => onValueChange(val ?? '')}
      items={items.map((i) => i.id)}
    >
      <ComboboxTrigger
        className={cn(
          'h-8 w-full flex justify-between items-center rounded-md border border-input bg-transparent px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
        aria-invalid={hasError}
        disabled={disabled}
      >
        <ComboboxValue>
          {(val: string | null) => {
            const found = items.find((i) => i.id === val);
            return found ? (
              <span className="flex justify-start items-center gap-1.5 text-sm">
                {found.name}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            );
          }}
        </ComboboxValue>
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(itemId: string) => {
            const found = items.find((i) => i.id === itemId);
            return (
              <ComboboxItem key={itemId} value={itemId}>
                <span className="flex items-center gap-1.5">
                  {found?.name ?? itemId}
                </span>
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
