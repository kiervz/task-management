import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toArray(value: string | string[] | null): string[] {
  if (value === null) return [];
  return Array.isArray(value) ? value : value.split(',').filter(Boolean);
}
