<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskPriorityRequest;
use App\Http\Requests\Task\UpdateTaskPriorityRequest;
use App\Http\Resources\Task\TaskPriorityResource;
use App\Services\TaskCatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TaskPriorityController extends Controller
{
    public function __construct(private TaskCatalogService $taskService) {}

    public function index(Request $request, string $projectCode): JsonResponse
    {
        $project = $this->taskService->findProject($projectCode);
        $this->authorize('view', $project);

        $items = $this->taskService->getTaskPriorities($project);

        return $this->apiResponse(
            'Task priorities retrieved successfully.',
            TaskPriorityResource::collection($items)
        );
    }

    public function store(StoreTaskPriorityRequest $request, string $projectCode): JsonResponse
    {
        $project = $this->taskService->findProject($projectCode);
        $this->authorize('update', $project);

        $item = $this->taskService->createTaskPriority($project, $request->validated());

        return $this->apiResponse(
            'Task priority created successfully.',
            new TaskPriorityResource($item),
            Response::HTTP_CREATED
        );
    }

    public function update(UpdateTaskPriorityRequest $request, string $taskPriorityId): JsonResponse
    {
        $taskPriority = $this->taskService->findTaskPriorityById($taskPriorityId);
        $project = $taskPriority->project;
        $this->authorize('update', $project);

        $item = $this->taskService->updateTaskPriority($project, $taskPriorityId, $request->validated());

        return $this->apiResponse('Task priority updated successfully.', new TaskPriorityResource($item));
    }

    public function destroy(Request $request, string $taskPriorityId): Response
    {
        $taskPriority = $this->taskService->findTaskPriorityById($taskPriorityId);
        $project = $taskPriority->project;
        $this->authorize('update', $project);

        $this->taskService->deleteTaskPriority($project, $taskPriorityId);

        return response()->noContent();
    }
}
