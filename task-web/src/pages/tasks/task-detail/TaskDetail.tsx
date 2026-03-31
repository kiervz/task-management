import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, FileSearch } from 'lucide-react';

import { Spinner } from '@/components/ui/spinner';
import { useAppSelector } from '@/store/hooks';
import {
  useTaskGetByTaskIdQuery,
  useTaskUpdateMutation,
  useTaskDeleteMutation,
} from '@/store/api/taskApi';
import { handleApiError } from '@/lib/apiErrorHandler';
import TaskHeader from './components/TaskHeader';
import TaskMainContent from './components/TaskMainContent';
import FetchErrorAlert from '@/components/errors/FetchErrorAlert';
import { Button } from '@/components/ui/button';

const TaskDetail = () => {
  console.log('TaskDetail Rendered');
  const navigate = useNavigate();
  const { taskCode } = useParams<{ taskCode: string }>();
  const user = useAppSelector((state) => state.user.user);
  const [taskUpdate, { isLoading: isUpdatingTitle }] = useTaskUpdateMutation();
  const [taskDelete, { isLoading: isDeletingTask }] = useTaskDeleteMutation();

  const { data, isLoading, isError, error, refetch } = useTaskGetByTaskIdQuery(
    taskCode ?? '',
  );

  const taskData = data?.response;

  const handleUpdateTitle = async (title: string) => {
    if (!taskData) return;

    try {
      await taskUpdate({ taskId: taskData.id, title }).unwrap();
      toast.success('Task title updated successfully');
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleUpdateDescription = async (description: string) => {
    if (!taskData) return;

    try {
      await taskUpdate({ taskId: taskData.id, description }).unwrap();
      toast.success('Task description updated successfully');
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskData) return;

    try {
      await taskDelete({ taskId: taskData.id }).unwrap();
      toast.success('Task deleted successfully');
      navigate(`/projects/${taskData.project.code}?tab=tasks`, {
        replace: true,
      });
    } catch (err) {
      handleApiError(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!taskData) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center px-4 sm:px-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <FileSearch className="size-5" />
          </div>
          <h2 className="text-lg font-semibold">Task not found</h2>
          <p className="text-sm text-muted-foreground">
            The task may have been removed, or the link may be invalid.
          </p>
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="size-4" />
              Go back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <FetchErrorAlert
        title="Task"
        description="Task Details"
        error={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TaskHeader
        projectCode={taskData.project.code}
        title={taskData.title}
        isDone={taskData.status.is_done === true}
        onSave={handleUpdateTitle}
        isSaving={isUpdatingTitle}
        userId={taskData.creator.id}
        user={user}
      />
      <div className="flex flex-col lg:flex-row gap-4 px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        <div className="flex-1 min-w-0 flex flex-col">
          <TaskMainContent
            userId={taskData.creator.id}
            userName={taskData.creator.name}
            createdAt={taskData.created_at}
            content={taskData.description}
            onSave={handleUpdateDescription}
            onDelete={handleDeleteTask}
            isDeleting={isDeletingTask}
          />
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
