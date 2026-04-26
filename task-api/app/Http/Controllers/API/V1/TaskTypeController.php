<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskTypeRequest;
use App\Http\Requests\Task\UpdateTaskTypeRequest;
use App\Http\Resources\Task\TaskTypeResource;
use App\Services\TaskCatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TaskTypeController extends Controller
{
    public function __construct(private TaskCatalogService $taskService) {}

    public function index(Request $request, string $projectCode): JsonResponse
    {
        $project = $this->taskService->findProject($projectCode);
        $this->authorize('manageTaskTypes', $project);

        $items = $this->taskService->getTaskTypes($project);

        return $this->apiResponse(
            'Task types retrieved successfully.',
            TaskTypeResource::collection($items)
        );
    }

    public function store(StoreTaskTypeRequest $request, string $projectCode): JsonResponse
    {
        $project = $this->taskService->findProject($projectCode);
        $this->authorize('manageTaskTypes', $project);

        $item = $this->taskService->createTaskType($project, $request->validated());

        return $this->apiResponse(
            'Task type created successfully.',
            new TaskTypeResource($item),
            Response::HTTP_CREATED
        );
    }

    public function update(UpdateTaskTypeRequest $request, string $taskTypeId): JsonResponse
    {
        $taskType = $this->taskService->findTaskTypeById($taskTypeId);
        $project = $taskType->project;
        $this->authorize('manageTaskTypes', $project);

        $item = $this->taskService->updateTaskType($project, $taskTypeId, $request->validated());

        return $this->apiResponse('Task type updated successfully.', new TaskTypeResource($item));
    }

    public function destroy(Request $request, string $taskTypeId): Response
    {
        $taskType = $this->taskService->findTaskTypeById($taskTypeId);
        $project = $taskType->project;
        $this->authorize('manageTaskTypes', $project);

        $this->taskService->deleteTaskType($project, $taskTypeId);

        return response()->noContent();
    }
}
