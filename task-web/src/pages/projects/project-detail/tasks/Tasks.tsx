import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ColumnFiltersState } from '@tanstack/react-table';

import DataTable from '@/components/data-table/data-table';
import FetchErrorAlert from '@/components/errors/FetchErrorAlert';
import {
  useTaskTypesQuery,
  useTaskPrioritiesQuery,
  useTaskStatusesQuery,
  type TaskDueFilter,
  useTasksByProjectIdQuery,
  type TaskFilters,
  type TaskSortBy,
  type TaskSortOrder,
} from '@/store/api/taskApi';
import { useAppSelector } from '@/store/hooks';
import { columns } from './components/columns';
import TaskFormModal from './components/TaskFormModal';

const Tasks = () => {
  const { code } = useParams<{ code: string }>();
  const currentUserId = useAppSelector((state) => state.user.user?.id);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<TaskSortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>('desc');
  const [typeValues, setTypeValues] = useState<string[]>([]);
  const [statusValues, setStatusValues] = useState<string[]>([]);
  const [priorityValues, setPriorityValues] = useState<string[]>([]);
  const [dueValue, setDueValue] = useState<TaskDueFilter | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [inlineSavingKeys, setInlineSavingKeys] = useState<Set<string>>(
    () => new Set(),
  );

  const columnFilters: ColumnFiltersState = useMemo(
    () => [
      ...(typeValues.length ? [{ id: 'type', value: typeValues }] : []),
      ...(statusValues.length ? [{ id: 'status', value: statusValues }] : []),
      ...(priorityValues.length
        ? [{ id: 'priority', value: priorityValues }]
        : []),
      ...(dueValue ? [{ id: 'due_date', value: [dueValue] }] : []),
    ],
    [dueValue, priorityValues, statusValues, typeValues],
  );

  const filters: TaskFilters = useMemo(
    () => ({
      type: typeValues.length ? typeValues : undefined,
      status: statusValues.length ? statusValues : undefined,
      priority: priorityValues.length ? priorityValues : undefined,
      due: dueValue ?? undefined,
    }),
    [dueValue, priorityValues, statusValues, typeValues],
  );

  const { data, isFetching, isError, error, refetch } =
    useTasksByProjectIdQuery({
      projectCode: code!,
      page: pageIndex + 1,
      per_page: pageSize,
      search: searchInput,
      sort_by: sortBy,
      sort_dir: sortOrder,
      filters,
    });

  const { data: types = [] } = useTaskTypesQuery(code!);
  const { data: statuses = [] } = useTaskStatusesQuery(code!);
  const { data: priorities = [] } = useTaskPrioritiesQuery(code!);

  const facetedFilters = useMemo(
    () => [
      {
        columnId: 'type',
        title: 'Type',
        options: types.map((type) => ({
          label: type.name,
          value: type.code,
        })),
      },
      {
        columnId: 'status',
        title: 'Status',
        options: statuses.map((status) => ({
          label: status.name,
          value: status.code,
        })),
      },
      {
        columnId: 'priority',
        title: 'Priority',
        options: priorities.map((priority) => ({
          label: priority.name,
          value: priority.code,
        })),
      },
      {
        columnId: 'due_date',
        title: 'Due Date',
        options: [
          { label: 'Overdue', value: 'overdue' },
          { label: 'Due Today', value: 'today' },
          { label: 'Due This Week', value: 'this_week' },
          { label: 'Due This Month', value: 'this_month' },
          { label: 'Not Yet Due', value: 'not_due' },
        ],
      },
    ],
    [types, statuses, priorities],
  );

  const tasks = data?.tasks ?? [];
  const meta = data?.meta;

  const onSortChange = useCallback(
    (nextSortBy: TaskSortBy | null, nextSortOrder: TaskSortOrder | null) => {
      setSortBy(nextSortBy ?? 'created_at');
      setSortOrder(nextSortOrder ?? 'desc');
      setPageIndex(0);
    },
    [],
  );

  const handleColumnFiltersChange = useCallback((next: ColumnFiltersState) => {
    const types = (next.find((f) => f.id === 'type')?.value as string[]) ?? [];
    const status =
      (next.find((f) => f.id === 'status')?.value as string[]) ?? [];
    const priority =
      (next.find((f) => f.id === 'priority')?.value as string[]) ?? [];
    const dueValues =
      (next.find((f) => f.id === 'due_date')?.value as string[]) ?? [];

    setTypeValues(types);
    setStatusValues(status);
    setPriorityValues(priority);
    setDueValue((dueValues[0] as TaskDueFilter | undefined) ?? null);
    setPageIndex(0);
  }, []);

  const handlePageIndexChange = useCallback(
    (idx: number) => setPageIndex(idx),
    [],
  );

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPageIndex(0);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput((prev) => (prev === value ? prev : value));
    setPageIndex((prev) => (prev === 0 ? prev : 0));
  }, []);

  const handleOpenEdit = useCallback((taskId: string) => {
    setEditTaskId(taskId);
  }, []);

  const handleInlineSavingChange = useCallback(
    (key: string, isSaving: boolean) => {
      setInlineSavingKeys((prev) => {
        const hasKey = prev.has(key);

        if (isSaving === hasKey) {
          return prev;
        }

        const next = new Set(prev);

        if (isSaving) {
          next.add(key);
        } else {
          next.delete(key);
        }

        return next;
      });
    },
    [],
  );

  const handleCloseEdit = useCallback(() => {
    setEditTaskId(null);
  }, []);

  if (isError) {
    return (
      <FetchErrorAlert
        title="Tasks"
        description="Manage your tasks"
        error={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <>
      <DataTable
        columns={columns({
          projectCode: code!,
          currentUserId,
          statuses,
          priorities,
          sortBy,
          sortOrder,
          onSortChange,
          onEdit: handleOpenEdit,
          inlineSavingKeys,
          onInlineSavingChange: handleInlineSavingChange,
        })}
        data={tasks}
        pageIndex={pageIndex}
        pageSize={pageSize}
        pageCount={meta?.last_page ?? 1}
        onPageIndexChange={handlePageIndexChange}
        onPageSizeChange={handlePageSizeChange}
        search={searchInput}
        onSearchChange={handleSearchChange}
        columnFilters={columnFilters}
        onColumnFiltersChange={handleColumnFiltersChange}
        facetedFilters={facetedFilters}
        isLoading={isFetching}
      />

      <TaskFormModal
        open={!!editTaskId}
        onOpenChange={handleCloseEdit}
        taskId={editTaskId ?? undefined}
        projectCode={code!}
      />
    </>
  );
};

export default Tasks;
