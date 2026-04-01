import type { ApiResponse } from '@/@types/apiResponse';
import type { Paginated, PaginationMeta } from '@/@types/paginated';
import type { Comment } from '@/@types/comment';
import type { CommentFormValues } from '@/pages/projects/project-detail/tasks/schemas/commentSchema';
import { baseApi } from './baseApi';

type CommentPaginatedResponse = ApiResponse<Paginated<Comment>>;
type CommentResponse = ApiResponse<Comment>;

type CommentsByTaskIdArgs = {
  taskId: number | string;
  page?: number;
  perPage?: number;
};

type CommentAddRequest = CommentFormValues & {
  taskId: number | string;
};

type CommentUpdateRequest = Partial<CommentFormValues> & {
  commentId: number | string;
};

type CommentDeleteRequest = {
  commentId: number | string;
};

export const commentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    commentsByTaskId: builder.query<
      { comments: Array<Comment>; meta: PaginationMeta },
      CommentsByTaskIdArgs
    >({
      query: ({ taskId, page = 1, perPage = 20 }) => ({
        url: `/tasks/${taskId}/comments`,
        method: 'GET',
        params: {
          page,
          paginate: perPage,
        },
      }),
      transformResponse: (res: CommentPaginatedResponse) => ({
        comments: res.response.data,
        meta: res.response.meta,
      }),
      // Treat all pages of the same task as one cache entry
      serializeQueryArgs: ({ queryArgs }) => ({ taskId: queryArgs.taskId }),
      // Append new pages to the existing cache
      merge: (currentCache, newItems) => {
        currentCache.comments.push(...newItems.comments);
        currentCache.meta = newItems.meta;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
      providesTags: (_result, _error, { taskId }) => [
        { type: 'TaskComments', id: taskId },
      ],
    }),

    commentAdd: builder.mutation<CommentResponse, CommentAddRequest>({
      query: ({ taskId, ...body }) => ({
        url: `/tasks/${taskId}/comments`,
        method: 'POST',
        body,
      }),
    }),

    commentUpdate: builder.mutation<CommentResponse, CommentUpdateRequest>({
      query: ({ commentId, ...body }) => ({
        url: `/comments/${commentId}`,
        method: 'PUT',
        body,
      }),
    }),

    commentDelete: builder.mutation<void, CommentDeleteRequest>({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useCommentsByTaskIdQuery,
  useCommentAddMutation,
  useCommentUpdateMutation,
  useCommentDeleteMutation,
} = commentsApi;
