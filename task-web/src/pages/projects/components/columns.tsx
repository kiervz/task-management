import type { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';

import type { Project } from '@/@types/project';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import type { ProjectSortBy } from '@/store/api/projectApi';
import {
  ColumnHeader,
  type SortOrder,
} from '@/components/data-table/column-header';

type ColumnsArgs = {
  sortBy: ProjectSortBy;
  sortOrder: SortOrder;
  onSortChange: (
    sortBy: ProjectSortBy | null,
    sortOrder: SortOrder | null,
  ) => void;
  onView: (projectCode: string, projectName: string) => void;
  onEdit: (projectId: string) => void;
  onDelete: (projectId: string, projectName: string) => void;
};

export const columns = ({
  sortBy,
  sortOrder,
  onSortChange,
  onView,
  onEdit,
  onDelete,
}: ColumnsArgs): ColumnDef<Project>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <ColumnHeader<Project, unknown, ProjectSortBy>
        column={column}
        title="Name"
        sortKey="name"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
      />
    ),
    cell: ({ row }) => {
      return (
        <Button
          variant="link"
          className="min-h-11 text-sm font-medium text-primary"
          render={<Link to={`/projects/${row.original.code}?tab=tasks`} />}
          nativeButton={false}
        >
          {row.original.name}
        </Button>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => row.original.status,
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => row.original.priority,
  },
  {
    accessorKey: 'start_date',
    header: ({ column }) => (
      <ColumnHeader<Project, unknown, ProjectSortBy>
        column={column}
        title="Start Date"
        sortKey="start_date"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
      />
    ),
    cell: ({ row }) => row.original.start_date?.slice(0, 10) ?? '—',
  },
  {
    accessorKey: 'end_date',
    header: ({ column }) => (
      <ColumnHeader<Project, unknown, ProjectSortBy>
        column={column}
        title="End Date"
        sortKey="end_date"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
      />
    ),
    cell: ({ row }) => row.original.end_date?.slice(0, 10) ?? '—',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const project = row.original;

      return (
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
                onClick={() => onView(project.code, project.name)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onEdit(project.code)}
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => onDelete(project.code, project.name)}
                className="flex items-center gap-2 text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
