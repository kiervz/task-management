import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, SquarePen, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TaskMeta } from '@/@types/task';

export type CatalogItem = TaskMeta & {
  is_done?: boolean;
};

type ColumnsArgs = {
  supportsDoneField: boolean;
  onEdit: (item: CatalogItem) => void;
  onDelete: (item: CatalogItem) => void;
};

export const columns = ({
  supportsDoneField,
  onEdit,
  onDelete,
}: ColumnsArgs): ColumnDef<CatalogItem>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.code}</span>
    ),
  },
  {
    id: 'color',
    header: 'Color',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span
          className="inline-block size-3 rounded-full border"
          style={{ backgroundColor: row.original.color }}
        />
        <span className="text-sm text-muted-foreground">
          {row.original.color}
        </span>
      </div>
    ),
  },
  {
    id: 'is_default',
    header: 'Default',
    cell: ({ row }) =>
      row.original.is_default ? (
        <Badge>Default</Badge>
      ) : (
        <Badge variant="secondary">No</Badge>
      ),
  },
  ...(supportsDoneField
    ? [
        {
          id: 'is_done',
          header: 'Done',
          cell: ({ row }: { row: { original: CatalogItem } }) =>
            row.original.is_done ? (
              <Badge>Done</Badge>
            ) : (
              <Badge variant="secondary">No</Badge>
            ),
        } satisfies ColumnDef<CatalogItem>,
      ]
    : []),
  {
    accessorKey: 'sort_order',
    header: 'Order',
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" className="h-8 w-8 p-0" />}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => onEdit(row.original)}
              className="flex items-center gap-2"
            >
              <SquarePen className="h-4 w-4" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => onDelete(row.original)}
              className="flex items-center gap-2 text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
