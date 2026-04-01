import { Crown, User2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

export function RoleBadge({ role }: Readonly<{ role: string }>) {
  if (role === 'admin') {
    return (
      <Badge variant="secondary" className="gap-1 text-xs">
        <Crown className="size-3" />
        Admin
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 text-xs">
      <User2 className="size-3" />
      Member
    </Badge>
  );
}
