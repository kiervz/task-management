import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { AlertMessageType } from '@/components/ui/alert-message';

type ApiErrorData = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]> | null;
};

export function getApiError(
  err: unknown,
  fallback = 'Something went wrong',
): AlertMessageType {
  const DEFAULT: AlertMessageType = {
    type: 'error',
    text: fallback,
  };

  if (!err || typeof err !== 'object' || !('status' in err)) return DEFAULT;

  const error = err as FetchBaseQueryError & { data?: ApiErrorData | string };

  const data: ApiErrorData | undefined =
    typeof error.data === 'string' ? undefined : error.data;

  const text =
    data?.message ?? (typeof error.data === 'string' ? error.data : fallback);

  return { type: 'error', text };
}
