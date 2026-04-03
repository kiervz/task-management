import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ColumnFiltersState } from '@tanstack/react-table';

import DataTable from '@/components/data-table/data-table';
import FetchErrorAlert from '@/components/errors/FetchErrorAlert';
import ProjectFormModal from './components/ProjectFormModal';
import ProjectDeleteModal from './components/ProjectDeleteModal';
import { Button } from '@/components/ui/button';
import {
  useProjectsQuery,
  type ProjectSortBy,
  type ProjectSortOrder,
  type ProjectFilters,
  type ProjectStatus,
  type ProjectPriority,
} from '@/store/api/projectApi';
import { useAppDispatch } from '@/store/hooks';
import { setProject } from '@/store/slices/projectSlice';
import { columns } from './components/columns';
import { FACETED_FILTERS } from './constants';

const Projects = () => {
  console.log('Projects Rendered');

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [sortBy, setSortBy] = useState<ProjectSortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<ProjectSortOrder>('desc');
  const [statusValues, setStatusValues] = useState<string[]>([]);
  const [priorityValues, setPriorityValues] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<
    number | string | undefined
  >();
  const [deletingProject, setDeletingProject] = useState<
    { id: number | string; name: string } | undefined
  >();
  const [isOpenProjectModal, setIsOpenProjectModal] = useState<boolean>(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);
  const [inlineSavingKeys, setInlineSavingKeys] = useState<Set<string>>(
    new Set(),
  );

  const handleInlineSavingChange = useCallback(
    (key: string, isSaving: boolean) => {
      setInlineSavingKeys((prev) => {
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

  const columnFilters: ColumnFiltersState = useMemo(
    () => [
      ...(statusValues.length ? [{ id: 'status', value: statusValues }] : []),
      ...(priorityValues.length
        ? [{ id: 'priority', value: priorityValues }]
        : []),
    ],
    [statusValues, priorityValues],
  );

  const filters: ProjectFilters = useMemo(
    () => ({
      status: statusValues.length
        ? (statusValues as ProjectStatus[])
        : undefined,
      priority: priorityValues.length
        ? (priorityValues as ProjectPriority[])
        : undefined,
    }),
    [statusValues, priorityValues],
  );

  const { data, isFetching, isError, error, refetch } = useProjectsQuery({
    page: pageIndex + 1,
    per_page: pageSize,
    search: searchInput,
    sort_by: sortBy,
    sort_dir: sortOrder,
    filters,
  });

  const projects = data?.projects ?? [];
  const meta = data?.meta;

  const onSortChange = useCallback(
    (
      nextSortBy: ProjectSortBy | null,
      nextSortOrder: ProjectSortOrder | null,
    ) => {
      setSortBy(nextSortBy ?? 'created_at');
      setSortOrder(nextSortOrder ?? 'desc');
      setPageIndex(0);
    },
    [],
  );

  const handleColumnFiltersChange = useCallback((next: ColumnFiltersState) => {
    const status =
      (next.find((f) => f.id === 'status')?.value as string[]) ?? [];
    const priority =
      (next.find((f) => f.id === 'priority')?.value as string[]) ?? [];
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

  const handleViewProject = useCallback(
    (code: string, name: string) => {
      dispatch(setProject({ code, name }));
      navigate(`/projects/${code}?tab=tasks`);
    },
    [dispatch, navigate],
  );

  const handleUpdateProject = useCallback((id: string) => {
    setSelectedProjectId(id);
    setIsOpenProjectModal(true);
  }, []);

  const handleDeleteProject = useCallback((id: string, name: string) => {
    setDeletingProject({ id, name });
    setIsOpenDeleteModal(true);
  }, []);

  const projectColumns = useMemo(
    () =>
      columns({
        sortBy,
        sortOrder,
        inlineSavingKeys,
        onInlineSavingChange: handleInlineSavingChange,
        onSortChange,
        onView: handleViewProject,
        onEdit: handleUpdateProject,
        onDelete: handleDeleteProject,
      }),
    [
      sortBy,
      sortOrder,
      inlineSavingKeys,
      handleInlineSavingChange,
      onSortChange,
      handleViewProject,
      handleUpdateProject,
      handleDeleteProject,
    ],
  );

  if (isError) {
    return (
      <FetchErrorAlert
        title="Projects"
        description="Manage your projects"
        error={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your projects</p>
        </div>
        <Button
          onClick={() => {
            setIsOpenProjectModal(true);
            setSelectedProjectId(undefined);
          }}
        >
          Add Project
        </Button>
      </header>

      <DataTable
        columns={projectColumns}
        data={projects}
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

      <ProjectFormModal
        open={isOpenProjectModal}
        onOpenChange={setIsOpenProjectModal}
        projectId={selectedProjectId}
      />
      <ProjectDeleteModal
        open={isOpenDeleteModal}
        onOpenChange={setIsOpenDeleteModal}
        projectId={deletingProject?.id}
        projectName={deletingProject?.name}
      />
    </div>
  );
};

export default Projects;
