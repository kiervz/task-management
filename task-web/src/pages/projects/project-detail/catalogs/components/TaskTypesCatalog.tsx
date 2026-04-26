import CatalogManagementCard from './CatalogManagementCard';
import {
  useTaskTypeAddMutation,
  useTaskTypeDeleteMutation,
  useTaskTypeUpdateMutation,
  useTaskTypesQuery,
} from '@/store/api/taskTypeApi';

type TaskTypesCatalogProps = {
  projectCode: string;
  canManage: boolean;
  isLoadingPermissions: boolean;
};

export default function TaskTypesCatalog({
  projectCode,
  canManage,
  isLoadingPermissions,
}: Readonly<TaskTypesCatalogProps>) {
  const {
    data: items = [],
    isLoading: isLoadingItems,
    isFetching: isFetchingItems,
  } = useTaskTypesQuery(projectCode, {
    skip: !canManage,
  });

  const [create, { isLoading: isCreating }] = useTaskTypeAddMutation();
  const [update, { isLoading: isUpdating }] = useTaskTypeUpdateMutation();
  const [remove, { isLoading: isDeleting }] = useTaskTypeDeleteMutation();

  return (
    <CatalogManagementCard
      title="Task Types"
      subtitle="Task Type"
      items={items}
      canManage={canManage}
      isLoadingPermissions={isLoadingPermissions}
      isLoadingItems={isLoadingItems}
      isFetchingItems={isFetchingItems}
      isCreating={isCreating}
      isUpdating={isUpdating}
      isDeleting={isDeleting}
      onCreate={(payload) => create({ projectCode, ...payload }).unwrap()}
      onUpdate={(id, payload) =>
        update({ projectCode, taskTypeId: id, ...payload }).unwrap()
      }
      onDelete={(id) => remove({ projectCode, taskTypeId: id }).unwrap()}
    />
  );
}
