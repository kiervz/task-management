import { useEffect } from 'react';
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
import Tasks from './tasks/Tasks';
import TaskFormModal from './tasks/components/TaskFormModal';

const ProjectDetail = () => {
  console.log('ProjectDetail Rendered');

  const { code } = useParams<{ code: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useIsMobile();

  const currentTab = searchParams.get('tab') ?? TAB_LIST[0].value;
  const isAddTaskParam = searchParams.get('addTask') === 'true';

  const navigate = useNavigate();

  const handleAddTask = () => {
    setSearchParams((prev) => {
      prev.set('addTask', 'true');
      return prev;
    });
  };

  const handleCloseModal = () => {
    setSearchParams((prev) => {
      prev.delete('addTask');
      return prev;
    });
  };

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

  if (isLoading || isFetching || !data?.response) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <Spinner className="size-6" />
      </div>
    );
  }

  const project = data.response;

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
              <span className="text-2xl font-bold">{project[value] ?? 0}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs
        value={currentTab}
        onValueChange={(val) => {
          setSearchParams({ tab: val });
        }}
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

        {TAB_LIST.map(({ value }) => (
          <TabsContent value={value} key={value}>
            {value === 'tasks' && <Tasks />}
            {value === 'calendar' && <>Calendar Component</>}
            {value === 'analytics' && <>Analytics Component</>}
            {value === 'reports' && <>Reports Component</>}
            {value === 'settings' && <>Settings Component</>}
          </TabsContent>
        ))}
      </Tabs>

      <TaskFormModal
        open={isAddTaskParam}
        onOpenChange={handleCloseModal}
        projectCode={project.code}
      />
    </div>
  );
};

export default ProjectDetail;
