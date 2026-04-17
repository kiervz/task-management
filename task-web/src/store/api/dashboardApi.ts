import type { ApiResponse } from '@/@types/apiResponse';
import { baseApi } from './baseApi';

type DashboardKpisResponse = ApiResponse<{
  total_projects: number;
  total_tasks: number;
  my_tasks: number;
  overdue_tasks: number;
}>;

export interface DashboardKpis {
  total_projects: number;
  total_tasks: number;
  my_tasks: number;
  overdue_tasks: number;
}

export interface DashboardMyWorkTask {
  id: string;
  title: string;
  due_date: string | null;
  project: {
    code: string | null;
    name: string | null;
  };
  type: {
    code: string | null;
    name: string | null;
    color: string | null;
  };
  priority: {
    code: string | null;
    name: string | null;
    color: string | null;
  };
  status: {
    code: string | null;
    name: string | null;
    color: string | null;
    is_done: boolean;
  };
}

export interface DashboardMyWork {
  tasks: DashboardMyWorkTask[];
}

export interface DashboardProjectOverview {
  id: string;
  code: string;
  name: string;
  status: string;
  completion_rate: number;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  total_members: number;
}

export interface DashboardProjectsOverview {
  projects: DashboardProjectOverview[];
}

type DashboardMyWorkResponse = ApiResponse<DashboardMyWork>;
type DashboardProjectsOverviewResponse = ApiResponse<DashboardProjectsOverview>;

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    dashboardKpis: builder.query<DashboardKpis, void>({
      query: () => ({ url: '/dashboard/kpis', method: 'GET' }),
      transformResponse: (res: DashboardKpisResponse) => res.response,
      providesTags: ['Projects', 'ProjectTasks'],
    }),
    dashboardMyWork: builder.query<DashboardMyWork, void>({
      query: () => ({ url: '/dashboard/my-work', method: 'GET' }),
      transformResponse: (res: DashboardMyWorkResponse) => res.response,
      providesTags: ['Projects', 'ProjectTasks'],
    }),
    dashboardProjectsOverview: builder.query<DashboardProjectsOverview, void>({
      query: () => ({ url: '/dashboard/projects-overview', method: 'GET' }),
      transformResponse: (res: DashboardProjectsOverviewResponse) =>
        res.response,
      providesTags: ['Projects', 'ProjectTasks'],
    }),
  }),
});

export const {
  useDashboardKpisQuery,
  useDashboardMyWorkQuery,
  useDashboardProjectsOverviewQuery,
} = dashboardApi;
