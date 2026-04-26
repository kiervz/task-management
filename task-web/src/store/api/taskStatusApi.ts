import type { ApiResponse } from '@/@types/apiResponse';
import type { TaskStatus } from '@/@types/task';
import { baseApi } from './baseApi';

type CatalogPayload<T> = { data: T[] } | T[];
type TaskStatusCatalogResponse = ApiResponse<CatalogPayload<TaskStatus>>;
type TaskStatusResponse = ApiResponse<TaskStatus>;

const extractCatalogItems = <T>(
  payload: CatalogPayload<T> | null | undefined,
): T[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.data ?? [];
};

export interface TaskStatusPayload {
  name: string;
  color?: string;
  is_done?: boolean;
  is_default?: boolean;
  sort_order?: number;
}

type TaskStatusCreateRequest = TaskStatusPayload & { projectCode: string };
type TaskStatusUpdateRequest = Partial<TaskStatusPayload> & {
  taskStatusId: string;
  projectCode: string;
};
type TaskStatusDeleteRequest = { taskStatusId: string; projectCode: string };

export const taskStatusApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    taskStatuses: builder.query<Array<TaskStatus>, string>({
      query: (projectCode) => ({
        url: `/projects/${projectCode}/task-statuses`,
        method: 'GET',
      }),
      transformResponse: (res: TaskStatusCatalogResponse) =>
        extractCatalogItems(res.response),
      providesTags: (_result, _error, projectCode) => [
        { type: 'TaskStatuses', id: projectCode },
      ],
    }),

    taskStatusAdd: builder.mutation<
      TaskStatusResponse,
      TaskStatusCreateRequest
    >({
      query: ({ projectCode, ...body }) => ({
        url: `/projects/${projectCode}/task-statuses`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectCode }) => [
        { type: 'TaskStatuses', id: projectCode },
      ],
    }),

    taskStatusUpdate: builder.mutation<
      TaskStatusResponse,
      TaskStatusUpdateRequest
    >({
      query: ({ taskStatusId, projectCode: _projectCode, ...body }) => ({
        url: `/task-statuses/${taskStatusId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { projectCode }) => [
        { type: 'TaskStatuses', id: projectCode },
      ],
    }),

    taskStatusDelete: builder.mutation<void, TaskStatusDeleteRequest>({
      query: ({ taskStatusId }) => ({
        url: `/task-statuses/${taskStatusId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { projectCode }) => [
        { type: 'TaskStatuses', id: projectCode },
      ],
    }),
  }),
});

export const {
  useTaskStatusesQuery,
  useTaskStatusAddMutation,
  useTaskStatusUpdateMutation,
  useTaskStatusDeleteMutation,
} = taskStatusApi;
