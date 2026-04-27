import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import type { RootState } from '../index';
import { clearUser, setAccessToken } from '../slices/userSlice';
import { handleApiError } from '@/lib/apiErrorHandler';

const AUTH_ROUTES = ['/auth/refresh-token', '/auth/login', '/auth/register'];

const AUTH_PAGES = new Set([
  '/login',
  '/register',
  '/auth/callback',
  '/otp',
  '/forgot-password',
  '/forgot-password/verify',
  '/forgot-password/reset',
]);

type RefreshResponse = {
  response: {
    access_token: string;
  };
};

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    headers.set('accept', 'application/json');
    const token = (getState() as RootState).user.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

let pendingRefresh: Promise<string | null> | null = null;

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  { silent?: boolean }
> = async (args, api, extraOptions) => {
  const url = typeof args === 'string' ? args : args.url;
  let result = await rawBaseQuery(args, api, extraOptions);

  if (
    result.error?.status === 401 &&
    !AUTH_ROUTES.some((route) => url.includes(route))
  ) {
    pendingRefresh ??= (async () => {
      try {
        const res = await rawBaseQuery(
          { url: '/auth/refresh-token', method: 'POST' },
          api,
          { silent: true },
        );
        const data = res.data as RefreshResponse | undefined;
        return data?.response?.access_token ?? null;
      } finally {
        pendingRefresh = null;
      }
    })();

    const newToken = await pendingRefresh;

    if (newToken) {
      api.dispatch(setAccessToken(newToken));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearUser());
      return result;
    }
  }

  if (
    result.error &&
    !extraOptions?.silent &&
    !AUTH_ROUTES.some((route) => url.includes(route)) &&
    !AUTH_PAGES.has(globalThis.location.pathname)
  ) {
    handleApiError(result.error);
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Projects',
    'ProjectTasks',
    'Task',
    'TaskComments',
    'TaskTypes',
    'TaskStatuses',
    'TaskPriorities',
    'ProjectAnalytics',
    'ProjectCalendar',
  ],
  endpoints: () => ({}),
});
