import { GalleryVerticalEndIcon, LayoutDashboard, Layers } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar';

export type NavItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  isActive?: boolean;
};

const navMain: Array<NavItem> = [
  {
    title: 'Dashboard',
    url: '/',
    icon: <LayoutDashboard />,
    isActive: true,
  },
  {
    title: 'Projects',
    url: '/projects',
    icon: <Layers />,
    isActive: false,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex flex-row items-center justify-start gap-2">
        <SidebarMenuButton size="lg" className="py-0">
          <div className="flex aspect-square size-7 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GalleryVerticalEndIcon />
          </div>
          <div className="truncate font-medium">TaskZenFlow</div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
