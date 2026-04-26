import { useAppSelector } from '@/store/hooks';
import { useProjectMembersQuery } from '@/store/api/projectApi';
import TaskTypesCatalog from './components/TaskTypesCatalog';
import TaskStatusesCatalog from './components/TaskStatusesCatalog';
import TaskPrioritiesCatalog from './components/TaskPrioritiesCatalog';

type CatalogsProps = {
  projectCode: string;
};

export default function Catalogs({ projectCode }: Readonly<CatalogsProps>) {
  const currentUser = useAppSelector((state) => state.user.user);

  const { data: members = [], isLoading: isLoadingMembers } =
    useProjectMembersQuery(projectCode);

  const canManageCatalogs =
    !!currentUser?.id &&
    members.some(
      (member) => member.user.id === currentUser.id && member.role === 'admin',
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Catalogs</h2>
        <p className="text-sm text-muted-foreground">
          Manage Task Types, Task Priorities, and Task Statuses for this
          project.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <TaskTypesCatalog
          projectCode={projectCode}
          canManage={canManageCatalogs}
          isLoadingPermissions={isLoadingMembers}
        />

        <TaskStatusesCatalog
          projectCode={projectCode}
          canManage={canManageCatalogs}
          isLoadingPermissions={isLoadingMembers}
        />

        <TaskPrioritiesCatalog
          projectCode={projectCode}
          canManage={canManageCatalogs}
          isLoadingPermissions={isLoadingMembers}
        />
      </div>
    </div>
  );
}
