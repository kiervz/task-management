import MemberList from './components/MemberList';
import InviteMemberForm from './components/InviteMemberForm';
import { Separator } from '@/components/ui/separator';
import { useAppSelector } from '@/store/hooks';
import { useProjectMembersQuery } from '@/store/api/projectApi';
import type { Member } from './types';

type SettingsProps = {
  projectCode: string;
};

export default function Settings({ projectCode }: Readonly<SettingsProps>) {
  const currentUser = useAppSelector((state) => state.user.user);

  const { data: members = [], isLoading: isLoadingMembers } =
    useProjectMembersQuery(projectCode);

  const canInvite =
    !!currentUser?.id &&
    members.some(
      (member) => member.user.id === currentUser.id && member.role === 'admin',
    );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Project Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage members and permissions for this project.
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <MemberList
          members={members as Member[]}
          currentUserId={currentUser?.id}
          isLoading={isLoadingMembers}
        />

        <InviteMemberForm
          projectCode={projectCode}
          canInvite={canInvite}
          isLoadingMembers={isLoadingMembers}
        />
      </div>
    </div>
  );
}
