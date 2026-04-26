import CatalogManagementCard from './CatalogManagementCard';
import {
  useTaskStatusesQuery,
  useTaskStatusAddMutation,
  useTaskStatusUpdateMutation,
  useTaskStatusDeleteMutation,
} from '@/store/api/taskStatusApi';

type TaskStatusesCatalogProps = {
  projectCode: string;
  canManage: boolean;
  isLoadingPermissions: boolean;
};

export default function TaskStatusesCatalog({
  projectCode,
  canManage,
  isLoadingPermissions,
}: Readonly<TaskStatusesCatalogProps>) {
  const {
    data: items = [],
    isLoading: isLoadingItems,
    isFetching: isFetchingItems,
  } = useTaskStatusesQuery(projectCode, {
    skip: !canManage,
  });

  const [create, { isLoading: isCreating }] = useTaskStatusAddMutation();
  const [update, { isLoading: isUpdating }] = useTaskStatusUpdateMutation();
  const [remove, { isLoading: isDeleting }] = useTaskStatusDeleteMutation();

  return (
    <CatalogManagementCard
      title="Task Statuses"
      subtitle="Task Status"
      items={items}
      canManage={canManage}
      isLoadingPermissions={isLoadingPermissions}
      isLoadingItems={isLoadingItems}
      isFetchingItems={isFetchingItems}
      isCreating={isCreating}
      isUpdating={isUpdating}
      isDeleting={isDeleting}
      supportsDoneField
      onCreate={(payload) => create({ projectCode, ...payload }).unwrap()}
      onUpdate={(id, payload) =>
        update({ projectCode, taskStatusId: id, ...payload }).unwrap()
      }
      onDelete={(id) => remove({ projectCode, taskStatusId: id }).unwrap()}
    />
  );
}
