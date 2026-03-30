'use client';

import { useLocation, useNavigate } from 'react-router-dom';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from './app-sidebar';

export function NavMain({
  items,
}: Readonly<{
  items: Array<NavItem>;
}>) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = location.pathname === item.url;

          return (
            <SidebarMenuItem
              key={item.title}
              onClick={() => navigate(item.url)}
            >
              <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                {item.icon}
                {item.title}
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
