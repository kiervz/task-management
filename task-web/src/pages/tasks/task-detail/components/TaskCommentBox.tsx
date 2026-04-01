import { memo, useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MinimalTiptap } from '@/components/ui/minimal-tiptap';
import type { User } from '@/@types/user';

interface TaskCommentBoxProps {
  user: User | null;
  onSubmit: (value: string) => void;
}

const TaskCommentBox: React.FC<TaskCommentBoxProps> = ({
  user,
  onSubmit,
}) => {
  const [comment, setComment] = useState<string>('');

  const handleSubmit = (value: string) => {
    onSubmit(value);
    setComment('');
  };

  return (
    <div className="flex gap-3 mt-4">
      <Avatar className="size-8">
        <AvatarFallback className="text-sm">
          {user?.name[0]?.toUpperCase() ?? 'U'}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 flex flex-col gap-2">
        <h2 className="text-base p-1">Add a comment</h2>

        <MinimalTiptap
          content={comment}
          onChange={setComment}
          placeholder="Leave a comment..."
        />

        <div className="flex justify-end items-center">
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleSubmit(comment)}
              disabled={!comment.trim()}
            >
              Comment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(TaskCommentBox);
