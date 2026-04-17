import {
  endOfWeek,
  format,
  formatDistanceToNow,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfDay,
} from 'date-fns';

export function formatRelativeDate(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(
  date: string | Date,
  dateFormat: string = 'MMMM d, yyyy',
): string {
  if (typeof date === 'string') {
    // Strip time/timezone and parse as local date only
    const dateOnly = date.split('T')[0];
    return format(parseISO(dateOnly), dateFormat);
  }
  return format(date, dateFormat);
}

export function formatDueDate(date: string | null): string {
  if (!date) {
    return 'No due date';
  }

  return formatDate(date, 'MMM d, yyyy');
}

export function isDueToday(date: string | null): boolean {
  return date ? isSameDay(parseISO(date), new Date()) : false;
}

export function isDueThisWeek(date: string | null): boolean {
  return date
    ? isWithinInterval(parseISO(date), {
        start: startOfDay(new Date()),
        end: endOfWeek(new Date()),
      })
    : false;
}

export function isOverdue(date: string | null): boolean {
  return date ? parseISO(date) < startOfDay(new Date()) : false;
}
