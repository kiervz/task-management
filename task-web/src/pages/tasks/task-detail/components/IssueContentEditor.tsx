import { Button } from '@/components/ui/button';
import { MinimalTiptap } from '@/components/ui/minimal-tiptap';

interface IssueContentEditorProps {
  value: string;
  onChange: (val: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

const IssueContentEditor: React.FC<IssueContentEditorProps> = ({
  value,
  onChange,
  onCancel,
  onSave,
}) => {
  return (
    <div className="flex flex-col">
      <MinimalTiptap
        content={value}
        onChange={onChange}
        placeholder="Leave a comment..."
        className="border-t-0 border-l-0 border-r-0 rounded-b-none"
      />

      <div className="flex justify-end gap-2 p-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave}>Save</Button>
      </div>
    </div>
  );
};

export default IssueContentEditor;
