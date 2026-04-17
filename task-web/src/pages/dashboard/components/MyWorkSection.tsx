import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  formatDueDate,
  isDueThisWeek,
  isDueToday,
  isOverdue,
} from '@/lib/formatDate';
import { type DashboardMyWorkTask } from '@/store/api/dashboardApi';

type MyWorkFilter =
  | 'all'
  | 'overdue'
  | 'due_today'
  | 'due_this_week'
  | 'high_priority'
  | 'in_progress'
  | 'todo';

const FILTER_OPTIONS: Array<{ value: MyWorkFilter; label: string }> = [
  { value: 'all', label: 'All Open Tasks' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'due_today', label: 'Due Today' },
  { value: 'due_this_week', label: 'Due This Week' },
  { value: 'high_priority', label: 'High Priority' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'todo', label: 'Todo' },
];

interface MyWorkSectionProps {
  tasks: DashboardMyWorkTask[];
  isLoading: boolean;
}

const MyWorkSection = ({ tasks, isLoading }: MyWorkSectionProps) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<MyWorkFilter>('all');

  const filteredTasks = useMemo(() => {
    switch (filter) {
      case 'overdue':
        return tasks.filter((task) => isOverdue(task.due_date));
      case 'due_today':
        return tasks.filter((task) => isDueToday(task.due_date));
      case 'due_this_week':
        return tasks.filter((task) => isDueThisWeek(task.due_date));
      case 'high_priority':
        return tasks.filter((task) => task.priority.code === 'high');
      case 'in_progress':
        return tasks.filter((task) => task.status.code === 'in-progress');
      case 'todo':
        return tasks.filter((task) => task.status.code === 'todo');
      default:
        return tasks;
    }
  }, [filter, tasks]);

  let tableContent: ReactNode;

  if (isLoading) {
    tableContent = (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  } else if (filteredTasks.length === 0) {
    tableContent = (
      <p className="text-sm text-muted-foreground">
        No tasks match this filter.
      </p>
    );
  } else {
    tableContent = (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.map((task) => {
            const detailPath = `/projects/${task.project.code}/tasks/${task.id}`;

            return (
              <TableRow
                key={task.id}
                className="cursor-pointer"
                onClick={() => navigate(detailPath)}
              >
                <TableCell className="max-w-[320px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={detailPath}
                      className="font-medium underline-offset-4 hover:underline"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {task.title}
                    </Link>
                    <Badge
                      variant="outline"
                      style={
                        task.type.color
                          ? { borderColor: task.type.color }
                          : undefined
                      }
                    >
                      {task.type.name ?? 'No type'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{task.project.name ?? 'Unknown project'}</TableCell>
                <TableCell>{formatDueDate(task.due_date)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    style={
                      task.priority.color
                        ? { borderColor: task.priority.color }
                        : undefined
                    }
                  >
                    {task.priority.name ?? 'No priority'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    style={
                      task.status.color
                        ? { borderColor: task.status.color }
                        : undefined
                    }
                  >
                    {task.status.name ?? 'Unknown status'}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }

  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-xl font-semibold tracking-tight">My Work</h2>
        <p className="text-muted-foreground text-sm">
          Assigned tasks filtered by due date, priority, and status
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium">
            My 10 most recent assigned tasks
          </p>

          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={
                  option.value === filter
                    ? 'rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground'
                    : 'rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground'
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent>{tableContent}</CardContent>
      </Card>
    </section>
  );
};

export default MyWorkSection;
