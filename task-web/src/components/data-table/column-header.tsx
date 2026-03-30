import { type Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type SortOrder = 'asc' | 'desc';

interface ColumnHeaderProps<
  TData,
  TValue,
  TSortKey,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;

  sortKey: TSortKey;
  sortBy: TSortKey;
  sortOrder: SortOrder;
  onSortChange: (sortBy: TSortKey | null, sortOrder: SortOrder | null) => void;
}

export function ColumnHeader<TData, TValue, TSortKey>({
  column,
  title,
  className,
  sortKey,
  sortBy,
  sortOrder,
  onSortChange,
}: Readonly<ColumnHeaderProps<TData, TValue, TSortKey>>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  const active = sortBy === sortKey;

  const getSortIcon = () => {
    if (!active) {
      return <ChevronsUpDown className="h-4 w-4" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const icon = getSortIcon();

  return (
    <div className={cn('flex items-center ml-2 gap-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              className="data-[state=open]:bg-accent -ml-3 h-8"
            />
          }
        >
          <span>{title}</span>
          {icon}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => onSortChange(sortKey, 'asc')}>
            <ArrowUp className="mr-2 h-4 w-4" />
            Asc
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => onSortChange(sortKey, 'desc')}>
            <ArrowDown className="mr-2 h-4 w-4" />
            Desc
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => onSortChange(null, null)}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
