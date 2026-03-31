import { format, formatDistanceToNow } from 'date-fns';

export function formatRelativeDate(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(
  date: string | Date,
  dateFormat: string = 'MMMM d, yyyy',
): string {
  return format(new Date(date), dateFormat);
}
