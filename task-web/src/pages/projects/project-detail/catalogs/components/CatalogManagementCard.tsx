import { useMemo, useState } from 'react';
import { Plus, Shield } from 'lucide-react';
import { toast } from 'sonner';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import DataTable from '@/components/data-table/data-table';
import { getApiError } from '@/lib/getApiError';
import { columns, type CatalogItem } from './columns';
import CatalogDeleteDialog from './CatalogDeleteDialog';
import CatalogFormDialog, { type CatalogFormState } from './CatalogFormDialog';

type CatalogPayload = {
  name: string;
  color?: string;
  is_default?: boolean;
  sort_order?: number;
  is_done?: boolean;
};

type CatalogManagementCardProps = {
  title: string;
  subtitle: string;
  items: CatalogItem[];
  canManage: boolean;
  isLoadingPermissions: boolean;
  isLoadingItems: boolean;
  isFetchingItems: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  supportsDoneField?: boolean;
  onCreate: (payload: CatalogPayload) => Promise<unknown>;
  onUpdate: (id: string, payload: CatalogPayload) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
};

const EMPTY_FORM: CatalogFormState = {
  name: '',
  color: '#3B82F6',
  sort_order: '',
  is_default: false,
  is_done: false,
};

export default function CatalogManagementCard({
  title,
  subtitle,
  items,
  canManage,
  isLoadingPermissions,
  isLoadingItems,
  isFetchingItems,
  isCreating,
  isUpdating,
  isDeleting,
  supportsDoneField = false,
  onCreate,
  onUpdate,
  onDelete,
}: Readonly<CatalogManagementCardProps>) {
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<CatalogItem | null>(null);
  const [deleting, setDeleting] = useState<CatalogItem | null>(null);
  const [form, setForm] = useState<CatalogFormState>(EMPTY_FORM);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const isSaving = isCreating || isUpdating;

  let submitLabel = 'Create';
  if (editing) {
    submitLabel = 'Update';
  }
  if (isSaving) {
    submitLabel = 'Saving...';
  }

  const cardDescription = useMemo(() => {
    if (!canManage) {
      return `Only project admins can manage ${title.toLowerCase()}.`;
    }

    if (isLoadingItems || isFetchingItems) {
      return `Loading ${title.toLowerCase()}...`;
    }

    const count = items.length;
    return `${count} ${count === 1 ? 'item' : 'items'} configured.`;
  }, [canManage, isFetchingItems, isLoadingItems, items.length, title]);

  const catalogColumns = useMemo(
    () =>
      columns({
        supportsDoneField,
        onEdit: (item) => {
          setEditing(item);
          setForm({
            name: item.name,
            color: item.color || '#3B82F6',
            sort_order: String(item.sort_order ?? ''),
            is_default: Boolean(item.is_default),
            is_done: Boolean(item.is_done),
          });
          setOpenForm(true);
        },
        onDelete: (item) => setDeleting(item),
      }),
    [supportsDoneField],
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter((item) => {
      const haystacks = [item.name, item.code, item.color];
      return haystacks.some((value) => value?.toLowerCase().includes(query));
    });
  }, [items, searchQuery]);

  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);

  const pagedItems = useMemo(() => {
    const start = safePageIndex * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, pageSize, safePageIndex]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpenForm(true);
  };

  const closeForm = () => {
    setOpenForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const onSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();

    if (!form.name.trim()) {
      toast.error('Name is required.');
      return;
    }

    const payload: CatalogPayload = {
      name: form.name.trim(),
      color: form.color.trim() || undefined,
      is_default: form.is_default,
      sort_order:
        form.sort_order.trim() === '' ? undefined : Number(form.sort_order),
      ...(supportsDoneField ? { is_done: form.is_done } : {}),
    };

    void (async () => {
      try {
        if (editing) {
          await onUpdate(editing.id, payload);
          toast.success(`${subtitle} updated successfully.`);
        } else {
          await onCreate(payload);
          toast.success(`${subtitle} created successfully.`);
        }

        closeForm();
      } catch (error) {
        const apiError = getApiError(error);
        toast.error(apiError?.text ?? 'Something went wrong');
      }
    })();
  };

  const onConfirmDelete = async () => {
    if (!deleting) {
      return;
    }

    try {
      await onDelete(deleting.id);
      toast.success(`${subtitle} deleted successfully.`);
      setDeleting(null);
    } catch (error) {
      const apiError = getApiError(error);
      toast.error(apiError?.text ?? 'Something went wrong');
    }
  };

  const renderContent = () => {
    if (isLoadingPermissions) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner className="size-4" />
          Checking permissions...
        </div>
      );
    }

    if (!canManage) {
      return (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <Shield className="size-4 mt-0.5 shrink-0" />
          Only project admins can handle this catalog CRUD.
        </div>
      );
    }

    if (isLoadingItems || isFetchingItems) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
          <Spinner className="size-4" />
          Loading {title.toLowerCase()}...
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <DataTable
          columns={catalogColumns}
          data={pagedItems}
          pageIndex={safePageIndex}
          pageSize={pageSize}
          pageCount={pageCount}
          onPageIndexChange={setPageIndex}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPageIndex(0);
          }}
          search={searchQuery}
          onSearchChange={(value) => {
            setSearchQuery(value);
            setPageIndex(0);
          }}
          searchPlaceholder={`Search ${title.toLowerCase()}...`}
          isLoading={isLoadingItems || isFetchingItems}
          showViewOptions={false}
        />
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="flex justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{cardDescription}</CardDescription>
          </div>

          <Button type="button" onClick={openCreate}>
            <Plus className="size-4" />
            Add {subtitle}
          </Button>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>

      <CatalogFormDialog
        open={openForm}
        title={title}
        subtitle={subtitle}
        editing={editing}
        form={form}
        supportsDoneField={supportsDoneField}
        isSaving={isSaving}
        submitLabel={submitLabel}
        setForm={setForm}
        onOpenChange={setOpenForm}
        onCancel={closeForm}
        onSubmit={onSubmit}
      />

      <CatalogDeleteDialog
        open={!!deleting}
        subtitle={subtitle}
        deletingName={deleting?.name}
        isDeleting={isDeleting}
        onOpenChange={() => setDeleting(null)}
        onConfirmDelete={onConfirmDelete}
      />
    </>
  );
}
