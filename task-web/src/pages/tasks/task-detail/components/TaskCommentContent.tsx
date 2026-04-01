import React, { memo, useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import TaskContentHeader from './TaskContentHeader';
import TaskContentEditor from './TaskContentEditor';
import TaskContentView from './TaskContentView';

interface TaskCommentContentProps {
  id: string | number;
  userId: string;
  username: string;
  createdAt: string;
  content: string;
  onSave: (commentId: string | number, comment: string) => void;
  onDelete: (commentId: string | number) => void;
}
const TaskCommentContent: React.FC<TaskCommentContentProps> = ({
  id,
  userId,
  username,
  createdAt,
  content,
  onSave,
  onDelete,
}) => {
  console.log('Rendered TaskCommentContent');

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
    onSave(id, contentValue.trim());
    setIsEdit(false);
  };

  const handleDelete = () => {
    onDelete(id);
  };

  return (
    <div className="flex gap-3">
      <Avatar className="size-8">
        <AvatarFallback className="text-sm">
          {username[0].toUpperCase() ?? 'U'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 border rounded-lg overflow-hidden">
        <TaskContentHeader
          userName={username}
          createdAt={createdAt}
          isComment={true}
          onEdit={() => setIsEdit(true)}
          onDelete={handleDelete}
          userId={userId}
        />

        {isEdit ? (
          <TaskContentEditor
            value={contentValue}
            onChange={setContentValue}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        ) : (
          <TaskContentView content={contentValue} isComment={true} />
        )}
      </div>
    </div>
  );
};

export default memo(TaskCommentContent);
