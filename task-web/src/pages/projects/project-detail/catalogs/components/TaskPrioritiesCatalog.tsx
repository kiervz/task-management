import CatalogManagementCard from './CatalogManagementCard';
import {
  useTaskPrioritiesQuery,
  useTaskPriorityAddMutation,
  useTaskPriorityUpdateMutation,
  useTaskPriorityDeleteMutation,
} from '@/store/api/taskPriorityApi';

type TaskPrioritiesCatalogProps = {
  projectCode: string;
  canManage: boolean;
  isLoadingPermissions: boolean;
};

export default function TaskPrioritiesCatalog({
  projectCode,
  canManage,
  isLoadingPermissions,
}: Readonly<TaskPrioritiesCatalogProps>) {
  const {
    data: items = [],
    isLoading: isLoadingItems,
    isFetching: isFetchingItems,
  } = useTaskPrioritiesQuery(projectCode, {
    skip: !canManage,
  });

  const [create, { isLoading: isCreating }] = useTaskPriorityAddMutation();
  const [update, { isLoading: isUpdating }] = useTaskPriorityUpdateMutation();
  const [remove, { isLoading: isDeleting }] = useTaskPriorityDeleteMutation();

  return (
    <CatalogManagementCard
      title="Task Priorities"
      subtitle="Task Priority"
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
        update({ projectCode, taskPriorityId: id, ...payload }).unwrap()
      }
      onDelete={(id) => remove({ projectCode, taskPriorityId: id }).unwrap()}
    />
  );
}
