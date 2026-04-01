import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { RoleBadge } from './RoleBadge';
import type { Member } from '../types';

type MemberRowProps = {
  member: Member;
  isCurrentUser: boolean;
};

export function MemberRow({ member, isCurrentUser }: Readonly<MemberRowProps>) {
  const initials = member.user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="size-8 shrink-0">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {member.user.name}
            {isCurrentUser && (
              <span className="ml-1.5 text-xs text-muted-foreground font-normal">
                (you)
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {member.user.email}
          </p>
        </div>
      </div>
      <RoleBadge role={member.role} />
    </div>
  );
}
