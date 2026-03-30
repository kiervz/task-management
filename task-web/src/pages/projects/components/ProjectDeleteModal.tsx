import { useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProjectDeleteMutation } from '@/store/api/projectApi';

interface ProjectDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: number | string;
  projectName?: string;
}

export default function ProjectDeleteModal({
  open,
  onOpenChange,
  projectId,
  projectName,
}: Readonly<ProjectDeleteModalProps>) {
  const [confirmText, setConfirmText] = useState('');
  const [projectDelete, { isLoading }] = useProjectDeleteMutation();

  const isConfirmed = confirmText === projectName;

  const handleDelete = async () => {
    if (!projectId || !isConfirmed) return;

    try {
      await projectDelete(projectId).unwrap();
      toast.success('Project deleted successfully!');
      setConfirmText('');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmText('');
    }
    onOpenChange(open);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription render={<div className="space-y-3" />}>
            <p>
              This action cannot be undone. This will permanently delete this
              project and remove all associated data from our servers.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-foreground">
                Type <span className="font-bold">"{projectName}"</span> to
                confirm deletion:
              </p>
              <Input
                id="name"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                disabled={isLoading}
                className="text-foreground"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button
            onClick={handleDelete}
            disabled={!isConfirmed || isLoading}
            variant="destructive"
          >
            {isLoading ? 'Deleting...' : 'Delete Project'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
