import { BriefcaseBusiness, Clock3, ListTodo, UserCheck } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { type DashboardKpis } from '@/store/api/dashboardApi';

const numberFormatter = new Intl.NumberFormat();

interface KpiCardsProps {
  data: DashboardKpis | undefined;
  isLoading: boolean;
}

const KpiCards = ({ data, isLoading }: KpiCardsProps) => {
  const kpis = [
    {
      title: 'Total Projects',
      description: "Projects I'm a member of",
      value: data?.total_projects ?? 0,
      icon: BriefcaseBusiness,
      loading: isLoading,
    },
    {
      title: 'Total Tasks',
      description: 'Tasks across all projects',
      value: data?.total_tasks ?? 0,
      icon: ListTodo,
      loading: isLoading,
    },
    {
      title: 'My Tasks',
      description: 'Tasks assigned to me',
      value: data?.my_tasks ?? 0,
      icon: UserCheck,
      loading: isLoading,
    },
    {
      title: 'Overdue Tasks',
      description: 'Overdue tasks across all projects',
      value: data?.overdue_tasks ?? 0,
      icon: Clock3,
      loading: isLoading,
    },
  ] as const;

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;

        return (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>{kpi.title}</CardTitle>
                <CardDescription>{kpi.description}</CardDescription>
              </div>
              <Icon className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              {kpi.loading ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                <p className="text-3xl font-semibold tracking-tight">
                  {numberFormatter.format(kpi.value)}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
};

export default KpiCards;
