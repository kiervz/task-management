import { RichContent } from '@/components/ui/rich-content';
import { cn } from '@/lib/utils';

interface TaskContentViewProps {
  content: string;
  isComment: boolean;
}

const TaskContentView: React.FC<TaskContentViewProps> = ({
  content,
  isComment,
}) => {
  return (
    <div className={cn('p-4', isComment ? 'min-h-auto' : 'min-h-24')}>
      <RichContent content={content} />
    </div>
  );
};

export default TaskContentView;
