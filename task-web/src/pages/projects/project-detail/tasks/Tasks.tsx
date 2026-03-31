import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ColumnFiltersState } from '@tanstack/react-table';

import DataTable from '@/components/data-table/data-table';
import FetchErrorAlert from '@/components/errors/FetchErrorAlert';
import {
  useTasksByProjectIdQuery,
  type TaskFilters,
  type TaskSortBy,
  type TaskSortOrder,
} from '@/store/api/taskApi';
import { columns } from './components/columns';
import { FACETED_FILTERS } from '../constants';

const Tasks = () => {
  const { code } = useParams<{ code: string }>();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<TaskSortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<TaskSortOrder>('desc');
  const [typeValues, setTypeValues] = useState<string[]>([]);
  const [statusValues, setStatusValues] = useState<string[]>([]);
  const [priorityValues, setPriorityValues] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');

  const columnFilters: ColumnFiltersState = useMemo(
    () => [
      ...(typeValues.length ? [{ id: 'type', value: typeValues }] : []),
      ...(statusValues.length ? [{ id: 'status', value: statusValues }] : []),
      ...(priorityValues.length
        ? [{ id: 'priority', value: priorityValues }]
        : []),
    ],
    [priorityValues, statusValues, typeValues],
  );

  const filters: TaskFilters = useMemo(
    () => ({
      type: typeValues.length ? typeValues : undefined,
      status: statusValues.length ? statusValues : undefined,
      priority: priorityValues.length ? priorityValues : undefined,
    }),
    [priorityValues, statusValues, typeValues],
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

    setTypeValues(types);
    setStatusValues(status);
    setPriorityValues(priority);
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
    <DataTable
      columns={columns({ sortBy, sortOrder, onSortChange })}
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
      facetedFilters={FACETED_FILTERS}
      isLoading={isFetching}
    />
  );
};

export default Tasks;
