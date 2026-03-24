<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreCommentRequest;
use App\Http\Requests\Task\UpdateCommentRequest;
use App\Http\Resources\Task\CommentResource;
use App\Services\CommentService;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class CommentController extends Controller
{
    public function __construct(
        private CommentService $commentService,
        private TaskService $taskService,
    ) {}

    public function index(Request $request, string $taskId): JsonResponse
    {
        $task = $this->taskService->findTaskById($taskId);
        $project = $task->project;
        $this->authorize('view', $project);

        $perPage = min((int) $request->integer('per_page', 10), 50);
        $comments = $this->commentService->getTaskComments($task, max($perPage, 1));

        return $this->apiResponse(
            'Comments retrieved successfully.',
            CommentResource::collection($comments)->response()->getData(true)
        );
    }

    public function store(StoreCommentRequest $request, string $taskId): JsonResponse
    {
        $task = $this->taskService->findTaskById($taskId);
        $project = $task->project;
        $this->authorize('view', $project);

        $comment = $this->commentService->createComment(
            $task,
            $request->user(),
            $request->validated()
        );

        return $this->apiResponse(
            'Comment created successfully.',
            new CommentResource($comment),
            Response::HTTP_CREATED
        );
    }

    public function update(UpdateCommentRequest $request, string $commentId): JsonResponse
    {
        $comment = $this->commentService->findCommentById($commentId);
        $project = $comment->task->project;
        $this->authorize('view', $project);

        if ((string) $comment->user_id !== (string) $request->user()->id) {
            $this->authorize('update', $project);
        }

        $comment = $this->commentService->updateComment($comment, $request->validated());

        return $this->apiResponse(
            'Comment updated successfully.',
            new CommentResource($comment)
        );
    }

    public function destroy(Request $request, string $commentId): Response
    {
        $comment = $this->commentService->findCommentById($commentId);
        $project = $comment->task->project;
        $this->authorize('view', $project);

        if ((string) $comment->user_id !== (string) $request->user()->id) {
            $this->authorize('update', $project);
        }

        $this->commentService->deleteComment($comment);

        return response()->noContent();
    }
}
