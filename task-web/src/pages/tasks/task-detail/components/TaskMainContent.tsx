import { memo, useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import TaskContentHeader from './TaskContentHeader';
import TaskContentEditor from './TaskContentEditor';
import TaskContentView from './TaskContentView';

interface TaskMainContentProps {
  userName: string;
  createdAt: string;
  content: string;
  onSave: (content: string) => void;
  onDelete?: () => void | Promise<void>;
  isDeleting?: boolean;
  canManageTask: boolean;
}

const TaskMainContent: React.FC<TaskMainContentProps> = ({
  userName,
  createdAt,
  content,
  onSave,
  onDelete,
  isDeleting = false,
  canManageTask,
}) => {
  console.log('TaskMainContent Rendered');

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [contentValue, setContentValue] = useState<string>(content);

  const handleCancel = () => {
    setContentValue(content);
    setIsEdit(false);
  };

  const handleSave = () => {
    if (contentValue.trim() === content) {
      setIsEdit(false);
      return;
    }
    onSave(contentValue.trim());
    setIsEdit(false);
  };

  return (
    <div className="flex gap-3">
      <Avatar className="size-8">
        <AvatarFallback className="text-sm">
          {userName[0].toUpperCase() ?? 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 border-4 rounded-lg overflow-hidden">
        <TaskContentHeader
          userName={userName}
          createdAt={createdAt}
          isComment={false}
          onEdit={() => setIsEdit(true)}
          onDelete={onDelete}
          isDeleting={isDeleting}
          canManage={canManageTask}
        />

        {isEdit ? (
          <TaskContentEditor
            value={contentValue}
            onChange={setContentValue}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        ) : (
          <TaskContentView content={contentValue} isComment={false} />
        )}
      </div>
    </div>
  );
};

export default memo(TaskMainContent);
