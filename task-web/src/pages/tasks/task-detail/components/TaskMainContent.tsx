import { memo, useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import IssueContentHeader from './IssueContentHeader';
import IssueContentEditor from './IssueContentEditor';
import IssueContentView from './IssueContentView';

interface TaskMainContentProps {
  userId: string;
  userName: string;
  createdAt: string;
  content: string;
  onSave: (content: string) => void;
  onDelete?: () => void | Promise<void>;
  isDeleting?: boolean;
}

const TaskMainContent: React.FC<TaskMainContentProps> = ({
  userId,
  userName,
  createdAt,
  content,
  onSave,
  onDelete,
  isDeleting = false,
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
      <div className="flex-1 border rounded-lg overflow-hidden">
        <IssueContentHeader
          userId={userId}
          userName={userName}
          createdAt={createdAt}
          isComment={false}
          onEdit={() => setIsEdit(true)}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />

        {isEdit ? (
          <IssueContentEditor
            value={contentValue}
            onChange={setContentValue}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        ) : (
          <IssueContentView content={contentValue} isComment={false} />
        )}
      </div>
    </div>
  );
};

export default memo(TaskMainContent);
