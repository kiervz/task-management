import type { ApiResponse } from '@/@types/apiResponse';
import type { Paginated, PaginationMeta } from '@/@types/paginated';
import type { Task, TaskType, TaskStatus, TaskPriority } from '@/@types/task';
import { baseApi } from './baseApi';
import {
  applyTaskCreatedStats,
  applyTaskDeletedStats,
  applyTaskTransitionStats,
} from '../slices/projectSlice';

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
type CatalogPayload<T> = { data: T[] } | T[];
type TaskCatalogResponse = ApiResponse<CatalogPayload<TaskType>>;
type StatusCatalogResponse = ApiResponse<CatalogPayload<TaskStatus>>;
type PriorityCatalogResponse = ApiResponse<CatalogPayload<TaskPriority>>;

const extractCatalogItems = <T>(
  payload: CatalogPayload<T> | null | undefined,
): T[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.data ?? [];
};

type TaskStatsSnapshot = {
  due_date?: string | null;
  status?: {
    is_done: boolean;
  } | null;
};

const toTaskStatsSnapshot = (
  task: Task | null | undefined,
): TaskStatsSnapshot | null => {
  if (!task) {
    return null;
  }

  return {
    due_date: task.due_date,
    status: {
      is_done: task.status?.is_done ?? false,
    },
  };
};

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
type TaskUpdateRequest = Partial<TaskPayload> & { taskId: string };
type TaskDeleteRequest = { taskId: string };

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
      async onQueryStarted({ projectCode }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;

          dispatch(
            applyTaskCreatedStats({
              projectCode,
              task: toTaskStatsSnapshot(data.response) ?? {},
            }),
          );
        } catch {
          // stats stay unchanged when creation fails.
        }
      },
    }),

    taskUpdate: builder.mutation<TaskResponse, TaskUpdateRequest>({
      query: ({ taskId, ...body }) => ({
        url: `/tasks/${taskId}`,
        method: 'PUT',
        body,
      }),
      async onQueryStarted(
        { taskId, ...patch },
        { dispatch, getState, queryFulfilled },
      ) {
        const cachedTaskListArgs = taskApi.util.selectCachedArgsForQuery(
          getState(),
          'tasksByProjectId',
        );

        const taskFromList = cachedTaskListArgs
          .map(
            (args) =>
              taskApi.endpoints.tasksByProjectId.select(args)(getState()).data
                ?.tasks,
          )
          .flat()
          .find(
            (task): task is Task => task !== undefined && task.id === taskId,
          );

        const taskFromDetail =
          taskApi.endpoints.taskGetByTaskId.select(taskId)(getState()).data
            ?.response;

        const previousTaskSnapshot = toTaskStatsSnapshot(
          taskFromDetail ?? taskFromList,
        );

        const taskDetailPatchResult = dispatch(
          taskApi.util.updateQueryData('taskGetByTaskId', taskId, (draft) => {
            if (patch.title !== undefined) {
              draft.response.title = patch.title;
            }

            if (patch.description !== undefined) {
              draft.response.description = patch.description;
            }

            if (patch.task_status_id !== undefined) {
              draft.response.status.id = patch.task_status_id;
            }

            if (patch.task_priority_id !== undefined) {
              draft.response.priority.id = patch.task_priority_id;
            }
          }),
        );

        const taskListPatchResults = cachedTaskListArgs.map((args) => {
          const statuses =
            taskApi.endpoints.taskStatuses.select(args.projectCode)(getState())
              .data ?? [];
          const priorities =
            taskApi.endpoints.taskPriorities.select(args.projectCode)(
              getState(),
            ).data ?? [];

          return dispatch(
            taskApi.util.updateQueryData('tasksByProjectId', args, (draft) => {
              const task = draft.tasks.find((item) => item.id === taskId);

              if (!task) {
                return;
              }

              if (patch.title !== undefined) {
                task.title = patch.title;
              }

              if (patch.description !== undefined) {
                task.description = patch.description;
              }

              if (patch.due_date !== undefined) {
                task.due_date = patch.due_date;
              }

              if (patch.task_status_id !== undefined) {
                const nextStatus = statuses.find(
                  (status) => status.id === patch.task_status_id,
                );

                if (nextStatus) {
                  task.status = nextStatus;
                } else {
                  task.status.id = patch.task_status_id;
                }
              }

              if (patch.task_priority_id !== undefined) {
                const nextPriority = priorities.find(
                  (priority) => priority.id === patch.task_priority_id,
                );

                if (nextPriority) {
                  task.priority = nextPriority;
                } else {
                  task.priority.id = patch.task_priority_id;
                }
              }
            }),
          );
        });

        try {
          const { data } = await queryFulfilled;

          const nextTaskSnapshot = toTaskStatsSnapshot(data.response);

          if (nextTaskSnapshot) {
            dispatch(
              applyTaskTransitionStats({
                projectCode: data.response.project.code,
                previousTask: previousTaskSnapshot,
                nextTask: nextTaskSnapshot,
              }),
            );
          }

          dispatch(
            taskApi.util.updateQueryData('taskGetByTaskId', taskId, (draft) => {
              draft.response = data.response;
            }),
          );

          cachedTaskListArgs.forEach((args) => {
            dispatch(
              taskApi.util.updateQueryData(
                'tasksByProjectId',
                args,
                (draft) => {
                  const index = draft.tasks.findIndex(
                    (item) => item.id === taskId,
                  );

                  if (index >= 0) {
                    draft.tasks[index] = data.response;
                  }
                },
              ),
            );
          });
        } catch {
          taskDetailPatchResult.undo();
          taskListPatchResults.forEach((result) => result.undo());
        }
      },
    }),

    taskDelete: builder.mutation<void, TaskDeleteRequest>({
      query: ({ taskId }) => ({
        url: `/tasks/${taskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ProjectTasks'],
      async onQueryStarted({ taskId }, { dispatch, getState, queryFulfilled }) {
        const taskFromDetail =
          taskApi.endpoints.taskGetByTaskId.select(taskId)(getState()).data
            ?.response;

        const previousTaskSnapshot = toTaskStatsSnapshot(taskFromDetail);
        const projectCode = taskFromDetail?.project.code;

        try {
          await queryFulfilled;

          if (projectCode && previousTaskSnapshot) {
            dispatch(
              applyTaskDeletedStats({
                projectCode,
                task: previousTaskSnapshot,
              }),
            );
          }
        } catch {
          // stats stay unchanged when deletion fails.
        }
      },
    }),

    taskTypes: builder.query<Array<TaskType>, string>({
      query: (projectCode) => ({
        url: `/projects/${projectCode}/task-types`,
        method: 'GET',
      }),
      transformResponse: (res: TaskCatalogResponse) =>
        extractCatalogItems(res.response),
    }),

    taskStatuses: builder.query<Array<TaskStatus>, string>({
      query: (projectCode) => ({
        url: `/projects/${projectCode}/task-statuses`,
        method: 'GET',
      }),
      transformResponse: (res: StatusCatalogResponse) =>
        extractCatalogItems(res.response),
    }),

    taskPriorities: builder.query<Array<TaskPriority>, string>({
      query: (projectCode) => ({
        url: `/projects/${projectCode}/task-priorities`,
        method: 'GET',
      }),
      transformResponse: (res: PriorityCatalogResponse) =>
        extractCatalogItems(res.response),
    }),
  }),
});

export const {
  useTasksByProjectIdQuery,
  useTaskGetByTaskIdQuery,
  useTaskAddMutation,
  useTaskUpdateMutation,
  useTaskDeleteMutation,
  useTaskTypesQuery,
  useTaskStatusesQuery,
  useTaskPrioritiesQuery,
} = taskApi;
