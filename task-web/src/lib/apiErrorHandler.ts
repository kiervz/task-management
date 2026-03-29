import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { toast } from 'sonner';

type ApiError = FetchBaseQueryError & {
  data?: { message?: string; errorCode?: string } | string;
};

export function handleApiError(error: unknown) {
  if (!error || typeof error !== 'object' || !('status' in error)) {
    toast.error('Request failed', { description: 'Unexpected error' });
    return;
  }

  const err = error as ApiError;
  const message = typeof err.data === 'string' ? err.data : err.data?.message;

  switch (err.status) {
    case 401:
      toast.error('Unauthorized', {
        description: message ?? 'Please log in again',
      });
      break;
    case 403:
      toast.error('Forbidden', {
        description: message ?? "You don't have permission to do this",
      });
      break;
    case 404:
      toast.error('Not found', {
        description: message ?? 'The requested resource does not exist',
      });
      break;
    case 422:
      toast.error('Invalid input', {
        description: message ?? 'Please check your input',
      });
      break;
    case 500:
      toast.error('Server error', {
        description: 'Something went wrong on the server',
      });
      break;
    default:
      toast.error('Request failed', {
        description: message ?? `Error ${err.status}`,
      });
  }
}
