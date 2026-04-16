import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Pie, PieChart } from 'recharts';

import FetchErrorAlert from '@/components/errors/FetchErrorAlert';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useProjectTaskAnalyticsQuery } from '@/store/api/projectApi';

type TaskAnalyticsBucket = {
  id: string;
  code: string;
  name: string;
  color: string;
  count: number;
};

type AnalyticsPieCardProps = {
  title: string;
  description: string;
  data: TaskAnalyticsBucket[];
};

const getSliceColor = (
  color: string | null | undefined,
  index: number,
): string => {
  if (color?.trim()) return color;
  return `var(--color-chart-${(index % 5) + 1})`;
};

const AnalyticsPieCard = ({
  title,
  description,
  data,
}: AnalyticsPieCardProps) => {
  const chartData = useMemo(
    () =>
      data
        .filter((item) => item.count > 0)
        .map((item, index) => ({
          name: item.name,
          count: item.count,
          fill: getSliceColor(item.color, index),
        })),
    [data],
  );

  const chartConfig = useMemo<ChartConfig>(() => {
    const config: ChartConfig = { count: { label: 'Count' } };

    data.forEach((item, index) => {
      config[item.code] = {
        label: item.name,
        color: getSliceColor(item.color, index),
      };
    });

    return config;
  }, [data]);

  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.count, 0),
    [data],
  );

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-none pb-0">
        {total > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="name"
                innerRadius={48}
                outerRadius={92}
                strokeWidth={2}
              />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="mx-auto flex aspect-square max-h-[250px] items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
            No tasks yet
          </div>
        )}
      </CardContent>

      {total > 0 && (
        <CardFooter className="flex-col gap-3 border-t px-6 py-4 text-sm">
          <div className="w-full space-y-2">
            {data.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor: getSliceColor(item.color, index),
                    }}
                    aria-hidden="true"
                  />
                  <span
                    className={item.count === 0 ? 'text-muted-foreground' : ''}
                  >
                    {item.name}
                  </span>
                </div>
                <span
                  className={`font-medium tabular-nums ${item.count === 0 ? 'text-muted-foreground' : ''}`}
                >
                  {item.count}
                </span>
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            Total: {total} task{total !== 1 ? 's' : ''}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

// ─── Analytics ────────────────────────────────────────────────────────────────

const Analytics = () => {
  const { code } = useParams<{ code: string }>();

  const { data, isLoading, isFetching, isError, error, refetch } =
    useProjectTaskAnalyticsQuery(code ?? '', { skip: !code });

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (isError) {
    return (
      <FetchErrorAlert
        title="Task analytics"
        description="Track tasks by status, type, and priority"
        error={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 items-start">
      <AnalyticsPieCard
        title="Tasks by Status"
        description="A breakdown of tasks by current status"
        data={data?.by_status ?? []}
      />
      <AnalyticsPieCard
        title="Tasks by Type"
        description="A breakdown of tasks by type"
        data={data?.by_type ?? []}
      />
      <AnalyticsPieCard
        title="Tasks by Priority"
        description="A breakdown of tasks by priority level"
        data={data?.by_priority ?? []}
      />
    </div>
  );
};

export default Analytics;
