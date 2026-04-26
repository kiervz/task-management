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
import ProjectInlineSelect, {
  type InlineSelectOption,
} from './ProjectInlineSelect';
import { formatDate } from '@/lib/formatDate';

const STATUS_OPTIONS: InlineSelectOption[] = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PRIORITY_OPTIONS: InlineSelectOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

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
    cell: ({ row }) => {
      const project = row.original;
      const canManage = project.permissions?.can_manage ?? false;

      if (!canManage) {
        return (
          <div className="px-3">
            {STATUS_OPTIONS.find((s) => s.value === project.status)?.label ??
              project.status}
          </div>
        );
      }

      return (
        <ProjectInlineSelect
          project={project}
          field="status"
          value={project.status}
          options={STATUS_OPTIONS}
          placeholder="Select status"
          savingLabel="Status"
        />
      );
    },
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const project = row.original;
      const canManage = project.permissions?.can_manage ?? false;

      if (!canManage) {
        return (
          <div className="px-3">
            {PRIORITY_OPTIONS.find((p) => p.value === project.priority)
              ?.label ?? project.priority}
          </div>
        );
      }

      return (
        <ProjectInlineSelect
          project={project}
          field="priority"
          value={project.priority}
          options={PRIORITY_OPTIONS}
          placeholder="Select priority"
          savingLabel="Priority"
        />
      );
    },
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
    cell: ({ row }) => formatDate(row.original.start_date),
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
    cell: ({ row }) => formatDate(row.original.end_date),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const project = row.original;
      const canManage = project.permissions?.can_manage ?? false;

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

              {canManage && (
                <>
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
                </>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
