import { Link } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { MessageSquare, MoreHorizontal, Pencil } from 'lucide-react';

import type { Task, TaskMeta } from '@/@types/task';
import type { TaskSortBy } from '@/store/api/taskApi';
import {
  ColumnHeader,
  type SortOrder,
} from '@/components/data-table/column-header';
import { formatDate } from '@/lib/formatDate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCount } from '@/lib/formatCount';
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/components/ui/avatar';
import { getInitials } from '@/lib/getInitials';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../../../../components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TaskInlineSelect from './TaskInlineSelect';

type ColumnsArgs = {
  projectCode: string;
  currentUserId?: string;
  statuses: TaskMeta[];
  priorities: TaskMeta[];
  sortBy: TaskSortBy;
  sortOrder: SortOrder;
  inlineSavingKeys: Set<string>;
  onInlineSavingChange: (key: string, isSaving: boolean) => void;
  onSortChange: (
    sortBy: TaskSortBy | null,
    sortOrder: SortOrder | null,
  ) => void;
  onEdit: (taskId: string) => void;
};

export const columns = ({
  projectCode,
  currentUserId,
  statuses,
  priorities,
  sortBy,
  sortOrder,
  inlineSavingKeys,
  onInlineSavingChange,
  onSortChange,
  onEdit,
}: ColumnsArgs): ColumnDef<Task>[] => [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <ColumnHeader<Task, unknown, TaskSortBy>
        column={column}
        title="Title"
        sortKey="title"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
      />
    ),
    cell: ({ row }) => {
      const task = row.original;
      return (
        <Button
          variant="link"
          className="min-h-11 text-sm font-medium text-primary"
          render={<Link to={`tasks/${task.id}`} />}
          nativeButton={false}
        >
          {task.title}
          <Badge
            variant="outline"
            style={
              task.type.color ? { borderColor: task.type.color } : undefined
            }
          >
            {task.type.name ?? 'Unknown type'}
          </Badge>
        </Button>
      );
    },
  },
  {
    accessorKey: 'type',
    cell: () => null,
    enableHiding: false,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const task = row.original;
      const canEditTask =
        task.permissions?.can_manage ?? currentUserId === task.creator.id;
      const savingKey = `task-status-${task.id}`;

      if (!canEditTask) {
        return <div className="px-3">{task.status.name}</div>;
      }

      return (
        <TaskInlineSelect
          task={task}
          projectCode={projectCode}
          items={statuses}
          valueId={task.status.id}
          field="task_status_id"
          placeholder="Select status"
          savingLabel="Status"
          savingKey={savingKey}
          isSaving={inlineSavingKeys.has(savingKey)}
          onSavingChange={onInlineSavingChange}
        />
      );
    },
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => {
      const task = row.original;
      const canEditTask =
        task.permissions?.can_manage ?? currentUserId === task.creator.id;
      const savingKey = `task-priority-${task.id}`;

      if (!canEditTask) {
        return <div className="px-3">{task.priority.name}</div>;
      }

      return (
        <TaskInlineSelect
          task={task}
          projectCode={projectCode}
          items={priorities}
          valueId={task.priority.id}
          field="task_priority_id"
          placeholder="Select priority"
          savingLabel="Priority"
          savingKey={savingKey}
          isSaving={inlineSavingKeys.has(savingKey)}
          onSavingChange={onInlineSavingChange}
        />
      );
    },
  },
  {
    accessorKey: 'due_date',
    header: ({ column }) => (
      <ColumnHeader<Task, unknown, TaskSortBy>
        column={column}
        title="Due Date"
        sortKey="due_date"
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
      />
    ),
    cell: ({ row }) => formatDate(row.original.due_date),
  },
  {
    accessorKey: 'assignees_id',
    header: 'Assignees',
    cell: ({ row }) => {
      const assignees = row.original.assignees;
      const max_visible = 3;
      const visible = assignees.slice(0, max_visible);
      const overflow = assignees.length - max_visible;

      return (
        <div className="flex items-center justify-start text-wrap">
          <AvatarGroup className="grayscale">
            {visible.map((assignee) => (
              <Tooltip key={assignee.user.id}>
                <TooltipTrigger>
                  <Avatar>
                    <AvatarImage src={''} alt={assignee.user.name} />
                    <AvatarFallback>
                      {getInitials(assignee.user.name)}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{assignee.user.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            {overflow > 0 && <AvatarGroupCount>+{overflow}</AvatarGroupCount>}
          </AvatarGroup>
        </div>
      );
    },
  },
  {
    id: 'comments',
    cell: ({ row }) => {
      const task = row.original;

      return (
        <div className="flex justify-center items-center gap-1 text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span className="text-xs">
            {formatCount(task?.comments_count ?? 0)}
          </span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const task = row.original;
      const canEditTask =
        task.permissions?.can_manage ?? currentUserId === task.creator.id;

      if (!canEditTask) {
        return null;
      }

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
                onClick={() => onEdit(task.id)}
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
