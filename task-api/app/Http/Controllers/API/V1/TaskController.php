<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\AssignTaskAssigneeRequest;
use App\Http\Requests\Task\GetTasksRequest;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Http\Resources\Task\TaskAssigneeResource;
use App\Http\Resources\Task\TaskResource;
use App\Services\TaskService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TaskController extends Controller
{
    public function __construct(private TaskService $taskService) {}

    public function index(GetTasksRequest $request, string $projectCode): JsonResponse
    {
        $project = $this->taskService->findProject($projectCode);
        $this->authorize('view', $project);

        $filters = $request->validated();
        $perPage = (int) ($filters['per_page'] ?? 10);

        $tasks = $this->taskService->getTasks($project, max($perPage, 1), $filters);

        return $this->apiResponse(
            'Tasks retrieved successfully.',
            TaskResource::collection($tasks)->response()->getData(true)
        );
    }

    public function store(StoreTaskRequest $request, string $projectCode): JsonResponse
    {
        $project = $this->taskService->findProject($projectCode);
        $this->authorize('update', $project);

        $task = $this->taskService->createTask($project, $request->user(), $request->validated());

        return $this->apiResponse(
            'Task created successfully.',
            new TaskResource($task),
            Response::HTTP_CREATED
        );
    }

    public function show(Request $request, string $taskId): JsonResponse
    {
        $task = $this->taskService->findTaskById($taskId);
        $project = $task->project;
        $this->authorize('view', $project);

        $task = $this->taskService->findTask($project, $taskId);

        return $this->apiResponse('Task retrieved successfully.', new TaskResource($task));
    }

    public function update(UpdateTaskRequest $request, string $taskId): JsonResponse
    {
        $task = $this->taskService->findTaskById($taskId);
        $project = $task->project;
        $this->authorize('update', $project);

        $task = $this->taskService->updateTask($project, $taskId, $request->validated());

        return $this->apiResponse('Task updated successfully.', new TaskResource($task));
    }

    public function destroy(Request $request, string $taskId): Response
    {
        $task = $this->taskService->findTaskById($taskId);
        $project = $task->project;
        $this->authorize('update', $project);

        $this->taskService->deleteTask($project, $taskId);

        return response()->noContent();
    }

    public function assignees(Request $request, string $taskId): JsonResponse
    {
        $task = $this->taskService->findTaskById($taskId);
        $project = $task->project;
        $this->authorize('view', $project);

        $assignees = $this->taskService->getTaskAssignees($project, $taskId);

        return $this->apiResponse(
            'Task assignees retrieved successfully.',
            TaskAssigneeResource::collection($assignees)
        );
    }

    public function assignAssignee(AssignTaskAssigneeRequest $request, string $taskId): JsonResponse
    {
        $task = $this->taskService->findTaskById($taskId);
        $project = $task->project;
        $this->authorize('update', $project);

        $assignees = $this->taskService->assignTaskAssignees(
            $project,
            $taskId,
            $request->validated('user_ids')
        );

        return $this->apiResponse(
            'Task assignees saved successfully.',
            TaskAssigneeResource::collection($assignees),
            Response::HTTP_OK
        );
    }

    public function unassignAssignee(Request $request, string $taskId, string $userId): Response
    {
        $task = $this->taskService->findTaskById($taskId);
        $project = $task->project;
        $this->authorize('update', $project);

        $this->taskService->unassignTaskAssignee($project, $taskId, $userId);

        return response()->noContent();
    }
}
