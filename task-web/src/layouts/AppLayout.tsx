import { Outlet, useLocation, Link } from 'react-router-dom';

import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ModeToggle } from '@/components/ui/mode-toggle';
import NavUser from '@/components/nav-user';

const ROUTE_LABELS: Record<string, string> = {
  projects: 'Projects',
  tasks: 'Tasks',
};

const DYNAMIC_LABELS: Record<string, string> = {
  projects: 'Project Details',
  tasks: 'Task Details',
};

const isDynamic = (segment: string) => !ROUTE_LABELS[segment];

const AppLayout = () => {
  const location = useLocation();

  const rawSegments = location.pathname.split('/').filter(Boolean);
  const SKIP_SEGMENTS = new Set(['tasks']);

  const segments = rawSegments
    .filter((seg) => !SKIP_SEGMENTS.has(seg))
    .map((seg) => {
      if (isDynamic(seg)) {
        const originalIndex = rawSegments.indexOf(seg);
        const parent = rawSegments[originalIndex - 1];
        return { slug: seg, label: DYNAMIC_LABELS[parent] ?? 'Details' };
      }
      return { slug: seg, label: ROUTE_LABELS[seg] };
    });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <header className="flex justify-between h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2" />
            <Breadcrumb className="hidden xs:flex">
              <BreadcrumbList>
                {segments.length === 0 ? (
                  <BreadcrumbItem>
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  </BreadcrumbItem>
                ) : (
                  <>
                    <BreadcrumbItem>
                      <BreadcrumbLink render={<Link to="/" />}>
                        Dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>

                    {segments.map((segment, index) => {
                      const isLast = index === segments.length - 1;
                      const href =
                        '/' + rawSegments.slice(0, index + 1).join('/');

                      return (
                        <span key={href} className="flex items-center gap-1.5">
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            {isLast ? (
                              <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink render={<Link to={href} />}>
                                {segment.label}
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                        </span>
                      );
                    })}
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-4 px-4">
            <ModeToggle />
            <NavUser />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 w-full max-w-7xl mx-auto">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AppLayout;
