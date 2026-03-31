import type { ApiResponse } from '@/@types/apiResponse';
import type { Paginated, PaginationMeta } from '@/@types/paginated';
import type { Task, TaskType, TaskStatus, TaskPriority } from '@/@types/task';
import { baseApi } from './baseApi';

export type TaskSortBy =
  | 'title'
  | 'type'
  | 'status'
  | 'priority'
  | 'due_date'
  | 'created_at';
export type TaskSortOrder = 'asc' | 'desc';

export interface TaskFilters {
  type?: string[];
  status?: string[];
  priority?: string[];
  start_date_from?: string;
  start_date_to?: string;
}

type TaskPaginatedResponse = ApiResponse<Paginated<Task>>;
type TaskResponse = ApiResponse<Task>;
type TaskCatalogResponse = ApiResponse<{ data: TaskType[] }>;
type StatusCatalogResponse = ApiResponse<{ data: TaskStatus[] }>;
type PriorityCatalogResponse = ApiResponse<{ data: TaskPriority[] }>;

export interface TaskPayload {
  title: string;
  description?: string;
  task_type_id: string;
  task_status_id: string;
  task_priority_id: string;
  due_date?: string;
  assignee_ids?: string[];
}

type TaskRequest = TaskPayload & { projectCode: string };
type TaskUpdateRequest = TaskPayload & { taskId: string };

export interface TasksQueryParams {
  projectCode: string;
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: TaskSortBy;
  sort_dir?: TaskSortOrder;
  filters?: TaskFilters;
}

export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    tasksByProjectId: builder.query<
      { tasks: Array<Task>; meta: PaginationMeta },
      TasksQueryParams
    >({
      query: ({
        projectCode,
        page = 1,
        per_page = 10,
        search = '',
        sort_by = 'created_at',
        sort_dir = 'desc',
        filters = {},
      }) => {
        const params = new URLSearchParams({
          page: String(page),
          per_page: String(per_page),
          sort_by,
          sort_dir,
        });

        if (search) {
          params.set('search', search);
        }

        if (filters.type?.length) {
          filters.type.forEach((value) => params.append('task_type[]', value));
        }

        if (filters.status?.length) {
          filters.status.forEach((value) =>
            params.append('task_status[]', value),
          );
        }

        if (filters.priority?.length) {
          filters.priority.forEach((value) =>
            params.append('task_priority[]', value),
          );
        }

        return { url: `/projects/${projectCode}/tasks`, method: 'GET', params };
      },
      transformResponse: (res: TaskPaginatedResponse) => ({
        tasks: res.response.data,
        meta: res.response.meta,
      }),
      providesTags: (_result, _error, { projectCode }) => [
        { type: 'ProjectTasks', id: projectCode },
      ],
    }),

    taskGetByTaskId: builder.query<TaskResponse, string>({
      query: (taskId) => ({
        url: `/tasks/${taskId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, taskId) => [{ type: 'Task', id: taskId }],
    }),

    taskAdd: builder.mutation<TaskResponse, TaskRequest>({
      query: ({ projectCode, ...body }) => ({
        url: `/projects/${projectCode}/tasks`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ProjectTasks'],
    }),

    taskUpdate: builder.mutation<TaskResponse, TaskUpdateRequest>({
      query: ({ taskId, ...body }) => ({
        url: `/tasks/${taskId}`,
        method: 'PUT',
        body,
      }),
    }),

    taskTypes: builder.query<Array<TaskType>, string>({
      query: (projectCode) => ({
        url: `/projects/${projectCode}/task-types`,
        method: 'GET',
      }),
      transformResponse: (res: TaskCatalogResponse) => res.response.data,
    }),

    taskStatuses: builder.query<Array<TaskStatus>, string>({
      query: (projectCode) => ({
        url: `/projects/${projectCode}/task-statuses`,
        method: 'GET',
      }),
      transformResponse: (res: StatusCatalogResponse) => res.response.data,
    }),

    taskPriorities: builder.query<Array<TaskPriority>, string>({
      query: (projectCode) => ({
        url: `/projects/${projectCode}/task-priorities`,
        method: 'GET',
      }),
      transformResponse: (res: PriorityCatalogResponse) => res.response.data,
    }),
  }),
});

export const {
  useTasksByProjectIdQuery,
  useTaskGetByTaskIdQuery,
  useTaskAddMutation,
  useTaskUpdateMutation,
  useTaskTypesQuery,
  useTaskStatusesQuery,
  useTaskPrioritiesQuery,
} = taskApi;
