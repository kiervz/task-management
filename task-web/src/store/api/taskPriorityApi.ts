import type { ApiResponse } from '@/@types/apiResponse';
import type { TaskPriority } from '@/@types/task';
import { baseApi } from './baseApi';

type CatalogPayload<T> = { data: T[] } | T[];
type TaskPriorityCatalogResponse = ApiResponse<CatalogPayload<TaskPriority>>;
type TaskPriorityResponse = ApiResponse<TaskPriority>;

const extractCatalogItems = <T>(
  payload: CatalogPayload<T> | null | undefined,
): T[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.data ?? [];
};

export interface TaskPriorityPayload {
  name: string;
  color?: string;
  is_default?: boolean;
  sort_order?: number;
}

type TaskPriorityCreateRequest = TaskPriorityPayload & { projectCode: string };
type TaskPriorityUpdateRequest = Partial<TaskPriorityPayload> & {
  taskPriorityId: string;
  projectCode: string;
};
type TaskPriorityDeleteRequest = {
  taskPriorityId: string;
  projectCode: string;
};

export const taskPriorityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    taskPriorities: builder.query<Array<TaskPriority>, string>({
      query: (projectCode) => ({
        url: `/projects/${projectCode}/task-priorities`,
        method: 'GET',
      }),
      transformResponse: (res: TaskPriorityCatalogResponse) =>
        extractCatalogItems(res.response),
      providesTags: (_result, _error, projectCode) => [
        { type: 'TaskPriorities', id: projectCode },
      ],
    }),

    taskPriorityAdd: builder.mutation<
      TaskPriorityResponse,
      TaskPriorityCreateRequest
    >({
      query: ({ projectCode, ...body }) => ({
        url: `/projects/${projectCode}/task-priorities`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectCode }) => [
        { type: 'TaskPriorities', id: projectCode },
      ],
    }),

    taskPriorityUpdate: builder.mutation<
      TaskPriorityResponse,
      TaskPriorityUpdateRequest
    >({
      query: ({ taskPriorityId, projectCode: _projectCode, ...body }) => ({
        url: `/task-priorities/${taskPriorityId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { projectCode }) => [
        { type: 'TaskPriorities', id: projectCode },
      ],
    }),

    taskPriorityDelete: builder.mutation<void, TaskPriorityDeleteRequest>({
      query: ({ taskPriorityId }) => ({
        url: `/task-priorities/${taskPriorityId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { projectCode }) => [
        { type: 'TaskPriorities', id: projectCode },
      ],
    }),
  }),
});

export const {
  useTaskPrioritiesQuery,
  useTaskPriorityAddMutation,
  useTaskPriorityUpdateMutation,
  useTaskPriorityDeleteMutation,
} = taskPriorityApi;
