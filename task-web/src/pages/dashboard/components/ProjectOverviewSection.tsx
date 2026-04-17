import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { type DashboardProjectOverview } from '@/store/api/dashboardApi';

interface ProjectOverviewSectionProps {
  projects: DashboardProjectOverview[];
  isLoading: boolean;
}

const toStatusLabel = (status: string) =>
  status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const ProjectOverviewSection = ({
  projects,
  isLoading,
}: ProjectOverviewSectionProps) => {
  const skeletonKeys = ['one', 'two', 'three', 'four'];

  let content: ReactNode;

  if (isLoading) {
    content = (
      <div className="grid gap-4 md:grid-cols-2">
        {skeletonKeys.map((key) => (
          <Card key={`project-overview-skeleton-${key}`}>
            <CardHeader>
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-6 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  } else if (projects.length === 0) {
    content = (
      <Card>
        <CardContent className="text-muted-foreground py-8 text-sm">
          No projects found.
        </CardContent>
      </Card>
    );
  } else {
    content = (
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => {
          return (
            <Card key={project.id}>
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="leading-tight">
                    <Link
                      to={`/projects/${project.code}?tab=tasks`}
                      className="underline-offset-4 hover:underline"
                    >
                      {project.name}
                    </Link>
                  </CardTitle>
                  <Badge variant="outline">
                    {toStatusLabel(project.status)}
                  </Badge>
                </div>
                <CardDescription>
                  Completion rate: {project.completion_rate}%
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${Math.max(0, Math.min(100, project.completion_rate))}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-medium">{project.total_tasks}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Completed</p>
                    <p className="font-medium">{project.completed_tasks}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Overdue</p>
                    <p className="font-medium">{project.overdue_tasks}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-muted-foreground text-sm">
                    {project.total_members} member
                    {project.total_members === 1 ? '' : 's'}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <header>
        <h2 className="text-xl font-semibold tracking-tight">
          Project Overview
        </h2>
        <p className="text-muted-foreground text-sm">
          Your 2 most recently active projects
        </p>
      </header>

      {content}

      {!isLoading && projects.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            render={<Link to="/projects" />}
            nativeButton={false}
          >
            View All Projects
          </Button>
        </div>
      )}
    </section>
  );
};

export default ProjectOverviewSection;
