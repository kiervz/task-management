import { useState } from 'react';
import { Ellipsis, Pencil, Trash } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppSelector } from '@/store/hooks';
import { formatRelativeDate } from '@/lib/formatDate';
import { handleApiError } from '../../../../lib/apiErrorHandler';

interface IssueContentHeaderProps {
  userId: string;
  userName: string;
  createdAt: string;
  isComment: boolean;
  onEdit: () => void;
  onDelete?: () => void | Promise<void>;
  isDeleting?: boolean;
}

const IssueContentHeader: React.FC<IssueContentHeaderProps> = ({
  userId,
  userName,
  createdAt,
  isComment,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  const user = useAppSelector((state) => state.user.user);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);

  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      await onDelete();
      setIsDeleteOpen(false);
    } catch (err) {
      handleApiError(err);
    }
  };

  return (
    <div className="flex items-center justify-between bg-muted/40 px-4 py-2.5 border-b">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">{userName}</span>
        <span className="text-muted-foreground">
          {isComment ? 'on' : 'created'} {formatRelativeDate(createdAt)}
        </span>
      </div>

      {user?.id === userId && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="h-8 w-8 p-0" />}
          >
            <Ellipsis className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={onEdit} className="flex gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>

              {onDelete && (
                <>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => setIsDeleteOpen(true)}
                    className="flex gap-2"
                    disabled={isDeleting}
                  >
                    <Trash className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? 'Deleting...' : 'Delete Task'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IssueContentHeader;
