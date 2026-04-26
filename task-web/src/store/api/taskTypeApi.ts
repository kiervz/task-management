import type { ApiResponse } from '@/@types/apiResponse';
import type { TaskType } from '@/@types/task';
import { baseApi } from './baseApi';

type CatalogPayload<T> = { data: T[] } | T[];
type TaskTypeCatalogResponse = ApiResponse<CatalogPayload<TaskType>>;
type TaskTypeResponse = ApiResponse<TaskType>;

const extractCatalogItems = <T>(
  payload: CatalogPayload<T> | null | undefined,
): T[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.data ?? [];
};

export interface TaskTypePayload {
  name: string;
  color?: string;
  is_default?: boolean;
  sort_order?: number;
}

type TaskTypeCreateRequest = TaskTypePayload & { projectCode: string };
type TaskTypeUpdateRequest = Partial<TaskTypePayload> & {
  taskTypeId: string;
  projectCode: string;
};
type TaskTypeDeleteRequest = { taskTypeId: string; projectCode: string };

export const taskTypeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    taskTypes: builder.query<Array<TaskType>, string>({
      query: (projectCode) => ({
        url: `/projects/${projectCode}/task-types`,
        method: 'GET',
      }),
      transformResponse: (res: TaskTypeCatalogResponse) =>
        extractCatalogItems(res.response),
      providesTags: (_result, _error, projectCode) => [
        { type: 'TaskTypes', id: projectCode },
      ],
    }),

    taskTypeAdd: builder.mutation<TaskTypeResponse, TaskTypeCreateRequest>({
      query: ({ projectCode, ...body }) => ({
        url: `/projects/${projectCode}/task-types`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { projectCode }) => [
        { type: 'TaskTypes', id: projectCode },
      ],
    }),

    taskTypeUpdate: builder.mutation<TaskTypeResponse, TaskTypeUpdateRequest>({
      query: ({ taskTypeId, projectCode: _projectCode, ...body }) => ({
        url: `/task-types/${taskTypeId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { projectCode }) => [
        { type: 'TaskTypes', id: projectCode },
      ],
    }),

    taskTypeDelete: builder.mutation<void, TaskTypeDeleteRequest>({
      query: ({ taskTypeId }) => ({
        url: `/task-types/${taskTypeId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { projectCode }) => [
        { type: 'TaskTypes', id: projectCode },
      ],
    }),
  }),
});

export const {
  useTaskTypesQuery,
  useTaskTypeAddMutation,
  useTaskTypeUpdateMutation,
  useTaskTypeDeleteMutation,
} = taskTypeApi;
