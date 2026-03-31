import { Link } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { MessageSquare } from 'lucide-react';

import type { Task } from '@/@types/task';
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

type ColumnsArgs = {
  sortBy: TaskSortBy;
  sortOrder: SortOrder;
  onSortChange: (
    sortBy: TaskSortBy | null,
    sortOrder: SortOrder | null,
  ) => void;
};

export const columns = ({
  sortBy,
  sortOrder,
  onSortChange,
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
          <Badge className="ml-2">{task.type.name}</Badge>
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
    cell: ({ row }) => row.original.status.name,
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => row.original.priority.name,
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
];
