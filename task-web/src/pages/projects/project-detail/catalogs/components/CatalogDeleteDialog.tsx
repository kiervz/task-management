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

type CatalogDeleteDialogProps = {
  open: boolean;
  subtitle: string;
  deletingName?: string;
  isDeleting: boolean;
  onOpenChange: () => void;
  onConfirmDelete: () => void;
};

export default function CatalogDeleteDialog({
  open,
  subtitle,
  deletingName,
  isDeleting,
  onOpenChange,
  onConfirmDelete,
}: Readonly<CatalogDeleteDialogProps>) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {subtitle}</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {deletingName}. You cannot undo this
            action.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
            onClick={onConfirmDelete}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
