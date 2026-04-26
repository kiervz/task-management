<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskStatusRequest;
use App\Http\Requests\Task\UpdateTaskStatusRequest;
use App\Http\Resources\Task\TaskStatusResource;
use App\Services\TaskCatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TaskStatusController extends Controller
{
    public function __construct(private TaskCatalogService $taskService) {}

    public function index(Request $request, string $projectCode): JsonResponse
    {
        $project = $this->taskService->findProject($projectCode);
        $this->authorize('view', $project);

        $items = $this->taskService->getTaskStatuses($project);

        return $this->apiResponse(
            'Task statuses retrieved successfully.',
            TaskStatusResource::collection($items)
        );
    }

    public function store(StoreTaskStatusRequest $request, string $projectCode): JsonResponse
    {
        $project = $this->taskService->findProject($projectCode);
        $this->authorize('update', $project);

        $item = $this->taskService->createTaskStatus($project, $request->validated());

        return $this->apiResponse(
            'Task status created successfully.',
            new TaskStatusResource($item),
            Response::HTTP_CREATED
        );
    }

    public function update(UpdateTaskStatusRequest $request, string $taskStatusId): JsonResponse
    {
        $taskStatus = $this->taskService->findTaskStatusById($taskStatusId);
        $project = $taskStatus->project;
        $this->authorize('update', $project);

        $item = $this->taskService->updateTaskStatus($project, $taskStatusId, $request->validated());

        return $this->apiResponse('Task status updated successfully.', new TaskStatusResource($item));
    }

    public function destroy(Request $request, string $taskStatusId): Response
    {
        $taskStatus = $this->taskService->findTaskStatusById($taskStatusId);
        $project = $taskStatus->project;
        $this->authorize('update', $project);

        $this->taskService->deleteTaskStatus($project, $taskStatusId);

        return response()->noContent();
    }
}
