import { createContext, useContext, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarX } from 'lucide-react';

import FetchErrorAlert from '@/components/errors/FetchErrorAlert';
import {
  Calendar as ShadcnCalendar,
  CalendarDayButton,
} from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useProjectCalendarOverdueTasksQuery } from '@/store/api/projectApi';

type OverdueDayButtonProps = React.ComponentProps<typeof CalendarDayButton> & {
  overdueCountByDate: Record<string, number>;
};

const OverdueCountByDateContext = createContext<Record<string, number>>({});

function OverdueDayButton({
  overdueCountByDate,
  ...props
}: OverdueDayButtonProps) {
  const dateKey = format(props.day.date, 'yyyy-MM-dd');
  const overdueCount = overdueCountByDate[dateKey] ?? 0;

  return (
    <CalendarDayButton
      {...props}
      className={cn(
        props.className,
        overdueCount > 0 &&
          'ring-1 ring-inset ring-destructive/30 bg-destructive/5',
      )}
    >
      <div className="text-xs leading-none">{props.day.date.getDate()}</div>
      {overdueCount > 0 ? (
        <div
          className="mt-auto max-w-full truncate rounded-sm bg-destructive/15 px-1 py-0.5 text-[10px] font-semibold leading-none text-destructive"
          title={`${overdueCount} overdue task${overdueCount === 1 ? '' : 's'}`}
        >
          {overdueCount} {overdueCount === 1 ? 'task' : 'tasks'}
        </div>
      ) : null}
    </CalendarDayButton>
  );
}

function OverdueDayButtonWithContext(
  props: React.ComponentProps<typeof CalendarDayButton>,
) {
  const overdueCountByDate = useContext(OverdueCountByDateContext);
  return (
    <OverdueDayButton {...props} overdueCountByDate={overdueCountByDate} />
  );
}

const CALENDAR_COMPONENTS = {
  DayButton: OverdueDayButtonWithContext,
};

const Calendar = () => {
  const { code } = useParams<{ code: string }>();
  const [month, setMonth] = useState<Date>(new Date());
  const projectCode = code ?? '';
  const monthNumber = Number(format(month, 'M'));
  const yearNumber = Number(format(month, 'yyyy'));

  const { data, isLoading, isFetching, isError, error, refetch } =
    useProjectCalendarOverdueTasksQuery(
      {
        projectCode,
        month: monthNumber,
        year: yearNumber,
      },
      { skip: !projectCode },
    );

  const totalOverdueTasks = data?.total_overdue_tasks ?? 0;
  const days = useMemo(() => data?.days ?? [], [data?.days]);

  const { overdueCountByDate, dayBreakdown } = useMemo(() => {
    const overdueCountByDate: Record<string, number> = {};
    const dayBreakdown: { day: number; value: number; date: Date }[] = [];

    for (const item of days) {
      const day = Number(item.day);
      const value = Number(item.value);

      if (
        !Number.isInteger(day) ||
        day < 1 ||
        day > 31 ||
        !Number.isFinite(value) ||
        value <= 0
      )
        continue;

      const date = new Date(yearNumber, monthNumber - 1, day);
      const key = format(date, 'yyyy-MM-dd');

      overdueCountByDate[key] = value;
      dayBreakdown.push({ day, value, date });
    }

    dayBreakdown.sort((a, b) => a.day - b.day);
    return { overdueCountByDate, dayBreakdown };
  }, [days, monthNumber, yearNumber]);

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (isError) {
    return (
      <FetchErrorAlert
        title="Calendar"
        description="See overdue tasks by due date"
        error={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <Card className="lg:col-span-7">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <CalendarX className="size-4" />
            Overdue Task Calendar
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {format(month, 'MMMM yyyy')}: {totalOverdueTasks} overdue task
            {totalOverdueTasks === 1 ? '' : 's'}
          </p>
        </CardHeader>

        <CardContent>
          <OverdueCountByDateContext.Provider value={overdueCountByDate}>
            <ShadcnCalendar
              mode="single"
              month={month}
              onMonthChange={setMonth}
              showOutsideDays
              components={CALENDAR_COMPONENTS}
              className="w-full [--cell-size:clamp(2.25rem,8vw,4.25rem)] [--cell-radius:0.8rem]"
              classNames={{
                root: 'w-full',
                month: 'w-full gap-3',
                table: 'w-full! ',
                weekdays: 'grid grid-cols-7',
                week: 'grid grid-cols-7 mt-2',
                weekday:
                  'h-9 flex items-center justify-center text-xs uppercase',
                day: 'h-[var(--cell-size)] w-full min-w-0 p-0 text-center!',
                day_button:
                  'h-[var(--cell-size)] w-full min-w-0 items-start justify-start overflow-hidden p-1.5 text-left sm:p-2 data-[selected-single=true]:bg-primary/20 data-[selected-single=true]:text-foreground hover:data-[selected-single=true]:bg-primary/25',
              }}
            />
          </OverdueCountByDateContext.Provider>
        </CardContent>
      </Card>

      <Card className="lg:col-span-5 overflow-y-auto h-max max-h-175">
        <CardHeader className="border-b px-6 py-6 gap-4">
          <CardTitle className="text-xl font-medium tracking-tight">
            Monthly Overdue Summary
          </CardTitle>

          <Alert
            variant="destructive"
            className="bg-destructive/5 border-destructive/20 text-destructive"
          >
            <AlertDescription className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="h-7 w-7 shrink-0 rounded-full border-destructive/30 bg-background text-destructive justify-center p-0 text-sm font-medium shadow-sm"
              >
                {totalOverdueTasks}
              </Badge>
              <span className="text-sm text-destructive">
                <span className="font-medium">Total overdue tasks</span> for{' '}
                {format(month, 'MMMM yyyy')}
              </span>
            </AlertDescription>
          </Alert>
        </CardHeader>

        <CardContent className="p-6">
          <p className="mb-4 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Breakdown by Date
          </p>

          {dayBreakdown.length > 0 ? (
            <div className="flex flex-col gap-3">
              {dayBreakdown.map((item) => (
                <div
                  key={item.day}
                  className="flex items-center justify-between rounded-xl border bg-card p-2"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg border bg-muted/40">
                      <span className="mt-0.5 text-xs font-medium leading-none text-muted-foreground uppercase">
                        {format(item.date, 'MMM')}
                      </span>
                      <span className="mt-1 text-lg font-medium leading-none text-foreground">
                        {format(item.date, 'dd')}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        Day {item.day}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(item.date, 'EEEE')}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className="gap-1.5 border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                    {item.value} {item.value === 1 ? 'task' : 'tasks'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No overdue days for {format(month, 'MMMM yyyy')}.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Calendar;
