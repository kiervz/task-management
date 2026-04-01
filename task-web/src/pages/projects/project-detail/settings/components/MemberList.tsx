import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

import { MemberRow } from './MemberRow';
import type { Member } from '../types';

type MemberListProps = {
  members: Member[];
  currentUserId?: string;
  isLoading: boolean;
};

export default function MemberList({
  members,
  currentUserId,
  isLoading,
}: Readonly<MemberListProps>) {
  const memberCountLabel = members.length === 1 ? 'member' : 'members';
  const descriptionText = isLoading
    ? 'Loading...'
    : `${members.length} ${memberCountLabel} in this project`;

  const loadingState = (
    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
      <Spinner className="size-4" />
      Loading members...
    </div>
  );

  const emptyState = (
    <p className="text-sm text-muted-foreground py-4 text-center">
      No members found.
    </p>
  );

  const memberList = (
    <div className="divide-y">
      {members.map((member) => (
        <MemberRow
          key={member.id}
          member={member}
          isCurrentUser={member.user.id === currentUserId}
        />
      ))}
    </div>
  );

  let content;
  if (isLoading) {
    content = loadingState;
  } else if (members.length === 0) {
    content = emptyState;
  } else {
    content = memberList;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>{descriptionText}</CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
