<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Task\StoreTaskPriorityRequest;
use App\Http\Requests\Task\StoreTaskStatusRequest;
use App\Http\Requests\Task\StoreTaskTypeRequest;
use App\Http\Requests\Task\UpdateTaskPriorityRequest;
use App\Http\Requests\Task\UpdateTaskStatusRequest;
use App\Http\Requests\Task\UpdateTaskTypeRequest;
use App\Http\Resources\Task\TaskPriorityResource;
use App\Http\Resources\Task\TaskStatusResource;
use App\Http\Resources\Task\TaskTypeResource;
use App\Services\TaskCatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TaskCatalogController extends Controller
{
    public function __construct(private TaskCatalogService $taskService) {}

    public function taskTypes(Request $request, string $projectCode): JsonResponse
    {
        $project = $this->taskService->findProject($projectCode);
        $this->authorize('view', $project);

        $perPage = min((int) $request->integer('per_page', 10), 50);
        $items = $this->taskService->getTaskTypes($project, max($perPage, 1));

        return $this->apiResponse(
            'Task types retrieved successfully.',
            TaskTypeResource::collection($items)->response()->getData(true)
        );
    }

    public function storeTaskType(StoreTaskTypeRequest $request, string $projectCode): JsonResponse
    {
        $project = $this->taskService->findProject($projectCode);
        $this->authorize('update', $project);

        $item = $this->taskService->createTaskType($project, $request->validated());

        return $this->apiResponse(
            'Task type created successfully.',
            new TaskTypeResource($item),
            Response::HTTP_CREATED
        );
    }

    public function updateTaskType(UpdateTaskTypeRequest $request, string $taskTypeId): JsonResponse
    {
        $taskType = $this->taskService->findTaskTypeById($taskTypeId);
        $project = $taskType->project;
        $this->authorize('update', $project);

        $item = $this->taskService->updateTaskType($project, $taskTypeId, $request->validated());

        return $this->apiResponse('Task type updated successfully.', new TaskTypeResource($item));
    }

    public function destroyTaskType(Request $request, string $taskTypeId): Response
    {
        $taskType = $this->taskService->findTaskTypeById($taskTypeId);
        $project = $taskType->project;
        $this->authorize('update', $project);

        $this->taskService->deleteTaskType($project, $taskTypeId);

        return response()->noContent();
    }

    public function taskStatuses(Request $request, string $projectCode): JsonResponse
    {
        $project = $this->taskService->findProject($projectCode);
        $this->authorize('view', $project);

        $perPage = min((int) $request->integer('per_page', 10), 50);
        $items = $this->taskService->getTaskStatuses($project, max($perPage, 1));

        return $this->apiResponse(
            'Task statuses retrieved successfully.',
            TaskStatusResource::collection($items)->response()->getData(true)
        );
    }

    public function storeTaskStatus(StoreTaskStatusRequest $request, string $projectCode): JsonResponse
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

    public function updateTaskStatus(UpdateTaskStatusRequest $request, string $taskStatusId): JsonResponse
    {
        $taskStatus = $this->taskService->findTaskStatusById($taskStatusId);
        $project = $taskStatus->project;
        $this->authorize('update', $project);

        $item = $this->taskService->updateTaskStatus($project, $taskStatusId, $request->validated());

        return $this->apiResponse('Task status updated successfully.', new TaskStatusResource($item));
    }

    public function destroyTaskStatus(Request $request, string $taskStatusId): Response
    {
        $taskStatus = $this->taskService->findTaskStatusById($taskStatusId);
        $project = $taskStatus->project;
        $this->authorize('update', $project);

        $this->taskService->deleteTaskStatus($project, $taskStatusId);

        return response()->noContent();
    }

    public function taskPriorities(Request $request, string $projectCode): JsonResponse
    {
        $project = $this->taskService->findProject($projectCode);
        $this->authorize('view', $project);

        $perPage = min((int) $request->integer('per_page', 10), 50);
        $items = $this->taskService->getTaskPriorities($project, max($perPage, 1));

        return $this->apiResponse(
            'Task priorities retrieved successfully.',
            TaskPriorityResource::collection($items)->response()->getData(true)
        );
    }

    public function storeTaskPriority(StoreTaskPriorityRequest $request, string $projectCode): JsonResponse
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

    public function updateTaskPriority(UpdateTaskPriorityRequest $request, string $taskPriorityId): JsonResponse
    {
        $taskPriority = $this->taskService->findTaskPriorityById($taskPriorityId);
        $project = $taskPriority->project;
        $this->authorize('update', $project);

        $item = $this->taskService->updateTaskPriority($project, $taskPriorityId, $request->validated());

        return $this->apiResponse('Task priority updated successfully.', new TaskPriorityResource($item));
    }

    public function destroyTaskPriority(Request $request, string $taskPriorityId): Response
    {
        $taskPriority = $this->taskService->findTaskPriorityById($taskPriorityId);
        $project = $taskPriority->project;
        $this->authorize('update', $project);

        $this->taskService->deleteTaskPriority($project, $taskPriorityId);

        return response()->noContent();
    }
}
