import { Settings2 } from 'lucide-react';
import { type Table, type VisibilityState } from '@tanstack/react-table';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function ViewOptions<TData>({
  table,
  columnVisibility,
}: Readonly<{
  table: Table<TData>;
  columnVisibility: VisibilityState;
}>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="ml-auto hidden h-8 lg:flex"
          />
        }
      >
        <Settings2 />
        View
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-37.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {table
            .getAllColumns()
            .filter((c) => c.accessorFn && c.getCanHide())
            .map((column) => {
              const isVisible = columnVisibility[column.id] ?? true;

              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  closeOnClick={false}
                  checked={isVisible}
                  onClick={() => {
                    table.setColumnVisibility((prev) => ({
                      ...prev,
                      [column.id]: !isVisible,
                    }));
                  }}
                >
                  {column.id.replaceAll('_', ' ')}
                </DropdownMenuCheckboxItem>
              );
            })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
