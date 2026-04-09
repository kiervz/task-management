import { format, formatDistanceToNow, parseISO } from 'date-fns';

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
