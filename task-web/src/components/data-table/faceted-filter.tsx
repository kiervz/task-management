import { useState, useRef, useEffect, type ComponentType } from 'react';
import type { Column } from '@tanstack/react-table';
import { Check, ChevronDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type FacetedFilterConfig = {
  columnId: string;
  title: string;
  options: Array<{
    label: string;
    value: string;
    icon?: ComponentType<{ className?: string }>;
  }>;
};

interface FacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>;
  title?: string;
  options: FacetedFilterConfig['options'];
}

function TriggerContent({
  selectedValues,
  options,
  title,
}: Readonly<{
  selectedValues: string[];
  options: FacetedFilterConfig['options'];
  title?: string;
}>) {
  if (selectedValues.length === 0) {
    return <span className="text-muted-foreground">{title}</span>;
  }

  if (selectedValues.length <= 2) {
    return (
      <div className="flex gap-1">
        {selectedValues.map((v) => (
          <Badge
            key={v}
            variant="secondary"
            className="rounded-sm px-1 font-normal"
          >
            {options.find((o) => o.value === v)?.label ?? v}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <Badge variant="secondary" className="rounded-sm px-1 font-normal">
      {selectedValues.length} selected
    </Badge>
  );
}

export function FacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: Readonly<FacetedFilterProps<TData, TValue>>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selectedValues = (column?.getFilterValue() as string[]) ?? [];

  const toggleValue = (value: string) => {
    const next = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    column?.setFilterValue(next.length ? next : undefined);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="outline"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 min-w-36 items-center justify-between gap-1.5 border-dashed"
      >
        <TriggerContent
          selectedValues={selectedValues}
          options={options}
          title={title}
        />
        <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
      </Button>

      {open && (
        <div className="absolute z-999! mt-1 w-48 rounded-md border bg-popover p-1 shadow-md overflow-auto!">
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => toggleValue(option.value)}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
              >
                <div
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded-sm border border-primary shrink-0',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'opacity-50',
                  )}
                >
                  {isSelected && (
                    <Check
                      className="h-3 w-3"
                      style={{ stroke: 'var(--primary-foreground)' }}
                    />
                  )}
                </div>
                {option.icon && <option.icon className="h-4 w-4 shrink-0" />}
                <span>{option.label}</span>
              </button>
            );
          })}

          {selectedValues.length > 0 && (
            <>
              <div className="my-1 h-px bg-border" />
              <Button
                variant="ghost"
                className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent text-muted-foreground cursor-pointer"
                onClick={() => column?.setFilterValue(undefined)}
              >
                Clear filters
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
