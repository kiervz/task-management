import { useEffect, useState } from 'react';
import { ArrowLeft, CircleCheck, CircleDot } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { User } from '@/@types/user';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { handleApiError } from '@/lib/apiErrorHandler';

interface TaskHeaderProps {
  projectCode: string;
  title: string;
  isDone: boolean;
  onSave: (title: string) => void | Promise<void>;
  isSaving?: boolean;
  userId: string;
  user: User | null;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({
  projectCode,
  title,
  isDone,
  onSave,
  isSaving = false,
  userId,
  user,
}) => {
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editedTitle, setEditedTitle] = useState<string>(title);

  console.log('Rendered TaskHeader');

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
              {user?.id === userId && (
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
        {isDone ? 'Done' : 'Not Done'}
      </Badge>
    </div>
  );
};

export default TaskHeader;
