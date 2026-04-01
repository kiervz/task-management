import type { ApiResponse } from '@/@types/apiResponse';
import type { Paginated, PaginationMeta } from '@/@types/paginated';
import type { Project } from '@/@types/project';
import type { ProjectFormValues } from '@/pages/projects/schemas/projectSchema';
import type { User } from '@/@types/user';
import { baseApi } from './baseApi';

export type ProjectSortBy =
  | 'created_at'
  | 'description'
  | 'name'
  | 'priority'
  | 'start_date'
  | 'end_date'
  | 'status';
export type ProjectSortOrder = 'asc' | 'desc';
export type ProjectStatus =
  | 'planning'
  | 'active'
  | 'completed'
  | 'on_hold'
  | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high';

export interface ProjectFilters {
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  start_date_from?: string;
  start_date_to?: string;
}

type ProjectPaginatedResponse = ApiResponse<Paginated<Project>>;
type ProjectResponse = ApiResponse<Project>;
type ProjectRequest = ProjectFormValues;
type ProjectUpdateRequest = ProjectFormValues & { id: number | string };
type ProjectMemberResponse = ApiResponse<
  Paginated<{ id: string; project_id: string; role: string; user: User }>
>;
type ConfirmProjectInviteAction = 'accept' | 'reject';
type ProjectInviteResponse = ApiResponse<{
  id: string;
  project_code: string;
  member_email: string;
  role: string;
  status: string;
}>;
type InviteProjectMemberRequest = {
  projectCode: string;
  member_email: string;
  role: 'member' | 'admin';
};

export interface ProjectsQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: ProjectSortBy;
  sort_dir?: ProjectSortOrder;
  filters?: ProjectFilters;
}

export const projectApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    projects: builder.query<
      {
        projects: Array<Project>;
        meta: PaginationMeta;
      },
      ProjectsQueryParams
    >({
      query: ({
        page = 1,
        per_page = 10,
        search = '',
        sort_by = 'created_at',
        sort_dir = 'desc',
        filters = {},
      } = {}) => {
        const params: Record<string, string> = {
          page: String(page),
          per_page: String(per_page),
          sort_by,
          sort_dir,
        };

        if (search) {
          params.search = search;
        }

        if (filters.status?.length) {
          params.status = filters.status.join(',');
        }

        if (filters.priority?.length) {
          params.priority = filters.priority.join(',');
        }

        if (filters.start_date_from) {
          params.start_date_from = filters.start_date_from;
        }

        if (filters.start_date_to) {
          params.start_date_to = filters.start_date_to;
        }

        return { url: '/projects', method: 'GET', params };
      },
      transformResponse: (res: ProjectPaginatedResponse) => ({
        projects: res.response.data,
        meta: res.response.meta,
      }),
      providesTags: ['Projects'],
    }),

    projectGetByCode: builder.query<ProjectResponse, number | string>({
      query: (id) => ({ url: `/projects/${id}`, method: 'GET' }),
    }),
    projectAdd: builder.mutation<ProjectResponse, ProjectRequest>({
      query: (body) => ({ url: '/projects', method: 'POST', body }),
      invalidatesTags: ['Projects'],
    }),
    projectUpdate: builder.mutation<ProjectResponse, ProjectUpdateRequest>({
      query: ({ id, ...body }) => ({
        url: `/projects/${id}`,
        method: 'PATCH',
        body,
      }),
      async onQueryStarted(
        { id, ...patch },
        { dispatch, getState, queryFulfilled },
      ) {
        const cachedArgs = projectApi.util.selectCachedArgsForQuery(
          getState(),
          'projects',
        );

        const listPatchResults = cachedArgs.map((args) =>
          dispatch(
            projectApi.util.updateQueryData('projects', args, (draft) => {
              const project = draft.projects.find((p) => p.code === id);
              if (!project) return;
              if (patch.status !== undefined) project.status = patch.status;
              if (patch.priority !== undefined)
                project.priority = patch.priority;
            }),
          ),
        );

        const detailPatchResult = dispatch(
          projectApi.util.updateQueryData('projectGetByCode', id, (draft) => {
            if (patch.status !== undefined)
              draft.response.status = patch.status;
            if (patch.priority !== undefined)
              draft.response.priority = patch.priority;
          }),
        );

        try {
          const { data } = await queryFulfilled;

          cachedArgs.forEach((args) => {
            dispatch(
              projectApi.util.updateQueryData('projects', args, (draft) => {
                const index = draft.projects.findIndex((p) => p.code === id);
                if (index >= 0) draft.projects[index] = data.response;
              }),
            );
          });

          dispatch(
            projectApi.util.updateQueryData('projectGetByCode', id, (draft) => {
              draft.response = data.response;
            }),
          );
        } catch {
          listPatchResults.forEach((result) => result.undo());
          detailPatchResult.undo();
        }
      },
    }),
    projectDelete: builder.mutation<void, number | string>({
      query: (id) => ({ url: `/projects/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Projects'],
    }),
    projectMembers: builder.query<
      Array<{ id: string; project_id: string; role: string; user: User }>,
      string
    >({
      query: (projectId) => ({
        url: `/projects/${projectId}/members`,
        method: 'GET',
        params: {
          per_page: 100,
        },
      }),
      transformResponse: (res: ProjectMemberResponse) => res.response.data,
    }),
    inviteProjectMember: builder.mutation<
      ProjectInviteResponse,
      InviteProjectMemberRequest
    >({
      query: ({ projectCode, ...body }) => ({
        url: `/projects/${projectCode}/invites`,
        method: 'POST',
        body,
      }),
    }),
    confirmProjectInvite: builder.mutation<
      ProjectInviteResponse,
      { code: string; action: ConfirmProjectInviteAction }
    >({
      query: ({ code, action }) => ({
        url: '/projects/invites/confirm',
        method: 'POST',
        params: { code, action },
      }),
      invalidatesTags: ['Projects'],
    }),
  }),
});

export const {
  useProjectsQuery,
  useProjectAddMutation,
  useProjectUpdateMutation,
  useProjectGetByCodeQuery,
  useProjectDeleteMutation,
  useProjectMembersQuery,
  useInviteProjectMemberMutation,
  useConfirmProjectInviteMutation,
} = projectApi;
