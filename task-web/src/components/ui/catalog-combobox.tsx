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

interface CatalogComboboxProps {
  id: string;
  value: string;
  items: TaskMeta[];
  placeholder: string;
  emptyText: string;
  hasError: boolean;
  onValueChange: (val: string) => void;
}

export default function CatalogCombobox({
  id,
  value,
  items,
  placeholder,
  emptyText,
  hasError,
  onValueChange,
}: Readonly<CatalogComboboxProps>) {
  return (
    <Combobox
      id={id}
      value={value}
      onValueChange={(val) => onValueChange(val ?? '')}
      items={items.map((i) => i.id)}
    >
      <ComboboxTrigger
        className="h-8 w-full flex justify-between items-center rounded-md border border-input bg-transparent px-3 text-sm"
        aria-invalid={hasError}
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
                {found?.name ?? itemId}
              </ComboboxItem>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
