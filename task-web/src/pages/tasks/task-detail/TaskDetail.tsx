import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileSearch } from 'lucide-react';
import { toast } from 'sonner';
import { useInView } from 'react-intersection-observer';

import { Spinner } from '@/components/ui/spinner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  useTaskGetByTaskIdQuery,
  useTaskUpdateMutation,
  useTaskDeleteMutation,
} from '@/store/api/taskApi';
import {
  useCommentDeleteMutation,
  useCommentAddMutation,
  useCommentsByTaskIdQuery,
  useCommentUpdateMutation,
  commentsApi,
} from '@/store/api/commentApi';
import { handleApiError } from '@/lib/apiErrorHandler';
import { Button } from '@/components/ui/button';
import TaskHeader from './components/TaskHeader';
import TaskMainContent from './components/TaskMainContent';
import FetchErrorAlert from '@/components/errors/FetchErrorAlert';
import TaskCommentBox from './components/TaskCommentBox';
import { Separator } from '@/components/ui/separator';
import type { Comment } from '@/@types/comment';
import TaskCommentContent from './components/TaskCommentContent';

const TaskDetail = () => {
  console.log('TaskDetail Rendered');
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const [commentPage, setCommentPage] = useState<number>(1);

  const [taskUpdate, { isLoading: isUpdatingTitle }] = useTaskUpdateMutation();
  const [taskDelete, { isLoading: isDeletingTask }] = useTaskDeleteMutation();
  const {
    data: commentsData,
    isLoading: isLoadingComments,
    isFetching: isFetchingComments,
  } = useCommentsByTaskIdQuery({ taskId: taskId!, page: commentPage });
  const [commentAdd] = useCommentAddMutation();
  const [commentUpdate] = useCommentUpdateMutation();
  const [commentDelete] = useCommentDeleteMutation();
  const { data, isLoading, isError, error, refetch } = useTaskGetByTaskIdQuery(
    taskId ?? '',
  );

  const taskData = data?.response;
  const hasMore = commentPage < (commentsData?.meta?.last_page ?? 1);
  const canManageTask =
    taskData?.permissions?.can_manage ??
    (!!user && user.id === taskData?.creator.id);

  const { ref: sentinelRef } = useInView({
    threshold: 0.1,
    onChange: (inView) => {
      if (inView && hasMore && !isFetchingComments) {
        setCommentPage((prev) => prev + 1);
      }
    },
  });

  const handleUpdateTitle = useCallback(
    async (title: string) => {
      if (!taskData) return;

      try {
        await taskUpdate({ taskId: taskData.id, title }).unwrap();
        toast.success('Task title updated successfully');
      } catch (err) {
        handleApiError(err);
      }
    },
    [taskData, taskUpdate],
  );

  const handleUpdateDescription = useCallback(
    async (description: string) => {
      if (!taskData) return;

      try {
        await taskUpdate({ taskId: taskData.id, description }).unwrap();
        toast.success('Task description updated successfully');
      } catch (err) {
        handleApiError(err);
      }
    },
    [taskData, taskUpdate],
  );

  const handleDeleteTask = useCallback(async () => {
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
  }, [taskData, taskDelete, navigate]);

  const handleSubmitComment = useCallback(
    async (value: string) => {
      if (!taskId || !user) return;

      const tempId = Date.now();

      const patch = dispatch(
        commentsApi.util.updateQueryData(
          'commentsByTaskId',
          { taskId },
          (draft) => {
            draft.comments.push({
              id: tempId,
              issue_id: taskId,
              content: value,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user,
            } as unknown as Comment);
          },
        ),
      );

      try {
        const result = await commentAdd({ taskId, content: value }).unwrap();

        dispatch(
          commentsApi.util.updateQueryData(
            'commentsByTaskId',
            { taskId },
            (draft) => {
              const target = draft.comments.find((c) => c.id === tempId);
              if (target) {
                target.id = result.response.id;
              }
            },
          ),
        );
      } catch {
        patch.undo();
      }
    },
    [commentAdd, dispatch, taskId, user],
  );

  const handleUpdateComment = useCallback(
    async (commentId: string | number, comment: string) => {
      const patch = dispatch(
        commentsApi.util.updateQueryData(
          'commentsByTaskId',
          { taskId: taskId! },
          (draft) => {
            const target = draft.comments.find((c) => c.id === commentId);
            if (target) {
              target.content = comment;
            }
          },
        ),
      );

      try {
        await commentUpdate({ commentId, content: comment }).unwrap();
      } catch {
        patch.undo();
      }
    },
    [commentUpdate, dispatch, taskId],
  );

  const handleDeleteComment = useCallback(
    async (commentId: string | number) => {
      const patch = dispatch(
        commentsApi.util.updateQueryData(
          'commentsByTaskId',
          { taskId: taskId! },
          (draft) => {
            const index = draft.comments.findIndex((c) => c.id === commentId);
            if (index !== -1) {
              draft.comments.splice(index, 1);
            }
          },
        ),
      );

      try {
        await commentDelete({ commentId }).unwrap();
      } catch {
        patch.undo();
      }
    },
    [commentDelete, dispatch, taskId],
  );

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
        assignees={taskData.assignees.map((assignee) => assignee.user)}
        onSave={handleUpdateTitle}
        isSaving={isUpdatingTitle}
        status={taskData.status.name}
        canManageTask={canManageTask}
      />
      <div className="flex flex-col lg:flex-row gap-4 px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        <div className="flex-1 min-w-0 flex flex-col">
          <TaskMainContent
            userName={taskData.creator.name}
            createdAt={taskData.created_at}
            content={taskData.description}
            onSave={handleUpdateDescription}
            onDelete={handleDeleteTask}
            isDeleting={isDeletingTask}
            canManageTask={canManageTask}
          />

          {/* Comments */}
          {isLoadingComments && commentPage === 1 ? (
            <div className="pl-20 py-4">
              <Spinner className="size-4" />
            </div>
          ) : (
            <>
              {commentsData?.comments.map((comment) => (
                <div key={comment.id}>
                  <div className="pl-20 h-5">
                    <Separator
                      orientation="vertical"
                      className="w-0.5! bg-border/90"
                    />
                  </div>

                  <TaskCommentContent
                    id={comment.id}
                    userId={comment.user.id}
                    username={comment.user.name}
                    createdAt={comment.created_at}
                    content={comment.content}
                    onSave={handleUpdateComment}
                    onDelete={handleDeleteComment}
                  />
                </div>
              ))}

              <div className="pl-20 h-5">
                <Separator
                  orientation="vertical"
                  className="w-0.5! bg-border/90"
                />
              </div>

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="mx-auto">
                {isFetchingComments && (
                  <div className="py-8">
                    <Spinner className="size-4" />
                  </div>
                )}
              </div>
            </>
          )}

          {user && (
            <TaskCommentBox user={user} onSubmit={handleSubmitComment} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
