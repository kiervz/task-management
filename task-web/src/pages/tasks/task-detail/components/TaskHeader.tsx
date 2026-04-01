import { memo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CircleCheck, CircleDot } from 'lucide-react';

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { User } from '@/@types/user';
import { cn } from '@/lib/utils';
import { handleApiError } from '@/lib/apiErrorHandler';
import { getInitials } from '@/lib/getInitials';

interface TaskHeaderProps {
  projectCode: string;
  title: string;
  isDone: boolean;
  assignees: User[];
  onSave: (title: string) => void | Promise<void>;
  isSaving?: boolean;
  status: string;
  canManageTask: boolean;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({
  projectCode,
  title,
  isDone,
  assignees,
  onSave,
  isSaving = false,
  status,
  canManageTask,
}) => {
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isAssigneesOpen, setIsAssigneesOpen] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState<string>(title);
  const visibleAssignees = assignees.slice(0, 8);
  const hiddenAssigneesCount = Math.max(
    assignees.length - visibleAssignees.length,
    0,
  );

  console.log('TaskHeader Rendered');

  const onChangeTitle = (title: string) => {
    setEditedTitle(title);
  };

  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  const handleSave = async () => {
    const nextTitle = editedTitle.trim();

    if (!nextTitle || nextTitle === title) {
      setIsEdit(false);
      return;
    }

    try {
      await onSave(nextTitle);
      setIsEdit(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleCancel = () => {
    setEditedTitle(title);
    setIsEdit(false);
  };

  return (
    <div className="flex flex-col border-b px-6 py-4 gap-2">
      <div className="flex items-start justify-between gap-4">
        {isEdit ? (
          <>
            <div className="flex flex-1 items-center">
              <Input
                value={editedTitle}
                onChange={(e) => {
                  onChangeTitle(e.target.value);
                }}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="default"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button size="default" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/projects/${projectCode}?tab=tasks`)}
                className="rounded-full"
                aria-label="Back to projects"
              >
                <ArrowLeft />
              </Button>
              <h1 className="text-xl font-semibold truncate">{title}</h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {canManageTask && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={() => {
                    setIsEdit(true);
                  }}
                >
                  Edit
                </Button>
              )}
              <Button
                size="default"
                onClick={() =>
                  navigate(`/projects/${projectCode}?tab=tasks&addTask=true`)
                }
              >
                New Task
              </Button>
            </div>
          </>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Badge
          variant={isDone ? 'outline' : 'default'}
          className={cn(
            'flex items-center gap-1.5 shrink-0 px-2.5 py-1',
            isDone && 'text-green-600 border-green-600',
          )}
        >
          {isDone ? (
            <CircleCheck className="size-3.5" />
          ) : (
            <CircleDot className="size-3.5" />
          )}
          {status}
        </Badge>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Assignees: </span>
          {assignees.length > 0 ? (
            <>
              <button
                type="button"
                onClick={() => setIsAssigneesOpen(true)}
                className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Open assignees list"
              >
                <AvatarGroup className="grayscale">
                  {visibleAssignees.map((assignee) => (
                    <Tooltip key={assignee.id}>
                      <TooltipTrigger>
                        <Avatar size="sm">
                          <AvatarFallback>
                            {getInitials(assignee.name)}
                          </AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{assignee.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                  {hiddenAssigneesCount > 0 && (
                    <Tooltip>
                      <TooltipTrigger>
                        <AvatarGroupCount className="size-6 text-xs">
                          +{hiddenAssigneesCount}
                        </AvatarGroupCount>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{hiddenAssigneesCount} more assignees</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </AvatarGroup>
              </button>

              <Dialog open={isAssigneesOpen} onOpenChange={setIsAssigneesOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assignees</DialogTitle>
                    <DialogDescription>
                      {assignees.length} member{assignees.length > 1 ? 's' : ''}{' '}
                      assigned to this task.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {assignees.map((assignee) => (
                      <div
                        key={assignee.id}
                        className="flex items-center gap-3 rounded-md border px-3 py-2"
                      >
                        <Avatar size="sm">
                          <AvatarFallback>
                            {getInitials(assignee.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {assignee.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {assignee.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <DialogFooter showCloseButton />
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <span className="text-xs">Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(TaskHeader);
