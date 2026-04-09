import { lazy, Suspense, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useProjectGetByCodeQuery } from '@/store/api/projectApi';
import { STAT_CARDS, TAB_LIST } from './constants';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setProject, setProjectStats } from '@/store/slices/projectSlice';
import TaskFormModal from './tasks/components/TaskFormModal';

const Tasks = lazy(() => import('./tasks/Tasks'));
const Settings = lazy(() => import('./settings/Settings'));
const Calendar = lazy(() => import('./calendar/Calendar'));

const ProjectDetail = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const dispatch = useAppDispatch();
  const projectStats = useAppSelector((state) => state.project.stats);

  const currentTab = useMemo(
    () => searchParams.get('tab') ?? TAB_LIST[0].value,
    [searchParams],
  );
  const isAddTaskParam = useMemo(
    () => searchParams.get('addTask') === 'true',
    [searchParams],
  );

  const navigate = useNavigate();

  const handleAddTask = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', 'tasks');
      next.set('addTask', 'true');
      return next;
    });
  }, [setSearchParams]);

  const handleCloseModal = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('addTask');
      return next;
    });
  }, [setSearchParams]);

  const handleTabChange = useCallback(
    (val: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', val);
        next.delete('addTask');
        return next;
      });
    },
    [setSearchParams],
  );

  const { data, isError, error, isLoading, isFetching } =
    useProjectGetByCodeQuery(code!);

  useEffect(() => {
    if (isError) {
      const status = (error as { status?: number })?.status;
      if (status === 404 || status === 403) {
        navigate('/projects', { replace: true });
      }
    }
  }, [isError, error, navigate]);

  const project = data?.response;

  const projectStatsPayload = useMemo(
    () => ({
      total_tasks: project?.total_tasks ?? 0,
      completed_tasks: project?.completed_tasks ?? 0,
      overdue_tasks: project?.overdue_tasks ?? 0,
      total_members: project?.total_members ?? 0,
    }),
    [
      project?.total_tasks,
      project?.completed_tasks,
      project?.overdue_tasks,
      project?.total_members,
    ],
  );

  useEffect(() => {
    if (!project) {
      return;
    }

    dispatch(
      setProject({
        code: project.code,
        name: project.name,
      }),
    );

    dispatch(
      setProjectStats({
        projectCode: project.code,
        stats: projectStatsPayload,
      }),
    );
  }, [dispatch, project, projectStatsPayload]);

  if (isLoading || isFetching || !project) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between flex-col items-start md:flex-row md:items-center gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/projects')}
            className="rounded-full"
            aria-label="Back to projects"
          >
            <ArrowLeft />
          </Button>

          <h1 className="text-2xl font-bold tracking-tight text-wrap">
            {project.name} <Badge>{project.status}</Badge>
          </h1>
        </div>

        <Button onClick={handleAddTask}>Add Task</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 2xs:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map(({ value, label, icon: Icon }) => (
          <Card key={value}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                {label}
                <Icon className="size-4" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                {projectStats[value] ?? project[value] ?? 0}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs
        value={currentTab}
        onValueChange={handleTabChange}
        orientation={isMobile ? 'vertical' : 'horizontal'}
        className={isMobile ? 'flex-col' : ''}
      >
        <TabsList className={isMobile ? 'w-full' : ''}>
          {TAB_LIST.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value}>
              <Icon className="size-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TAB_LIST.map(({ value }) => {
          if (value !== currentTab) {
            return null;
          }

          return (
            <TabsContent value={value} key={value}>
              {value === 'tasks' && (
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-10">
                      <Spinner className="size-5" />
                    </div>
                  }
                >
                  <Tasks />
                </Suspense>
              )}
              {value === 'calendar' && (
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-10">
                      <Spinner className="size-5" />
                    </div>
                  }
                >
                  <Calendar />
                </Suspense>
              )}
              {value === 'analytics' && <>Analytics Component</>}
              {value === 'reports' && <>Reports Component</>}
              {value === 'settings' && (
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-10">
                      <Spinner className="size-5" />
                    </div>
                  }
                >
                  <Settings projectCode={project.code} />
                </Suspense>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {currentTab === 'tasks' && (
        <TaskFormModal
          open={isAddTaskParam}
          onOpenChange={handleCloseModal}
          projectCode={project.code}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
