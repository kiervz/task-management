<?php

namespace App\Services;

use App\Models\Project;
use App\Models\TaskPriority;
use App\Models\TaskStatus;
use App\Models\TaskType;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class TaskCatalogService
{
    private const DEFAULT_TASK_TYPE_COLOR = '#3B82F6';
    private const DEFAULT_TASK_STATUS_COLOR = '#64748B';
    private const DEFAULT_TASK_PRIORITY_COLOR = '#F59E0B';

    public function __construct(private ProjectService $projectService) {}

    public function findProject(string $projectCode): Project
    {
        return $this->projectService->findProject($projectCode);
    }

    public function getTaskTypes(Project $project, int $perPage)
    {
        return $project->taskTypes()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function createTaskType(Project $project, array $data): TaskType
    {
        $code = $this->generateUniqueProjectSlug(TaskType::class, $project, $data['name']);

        return DB::transaction(function () use ($project, $data, $code) {
            if (($data['is_default'] ?? false) === true) {
                $project->taskTypes()->update(['is_default' => false]);
            }

            return $project->taskTypes()->create([
                ...$data,
                'code' => $code,
                'color' => $this->resolveColor($data['color'] ?? null, self::DEFAULT_TASK_TYPE_COLOR),
                'is_default' => (bool) ($data['is_default'] ?? false),
                'sort_order' => $this->resolveSortOrder(TaskType::class, $project->id, $data['sort_order'] ?? null),
            ]);
        });
    }

    public function findTaskType(Project $project, string $taskTypeId): TaskType
    {
        $taskType = $project->taskTypes()->whereKey($taskTypeId)->first();

        if (!$taskType) {
            throw new NotFoundHttpException('Task type not found.');
        }

        return $taskType;
    }

    public function findTaskTypeById(string $taskTypeId): TaskType
    {
        $taskType = TaskType::query()->whereKey($taskTypeId)->first();

        if (!$taskType) {
            throw new NotFoundHttpException('Task type not found.');
        }

        return $taskType;
    }

    public function updateTaskType(Project $project, string $taskTypeId, array $data): TaskType
    {
        $taskType = $this->findTaskType($project, $taskTypeId);

        if (isset($data['name']) && $data['name'] !== $taskType->name) {
            $data['code'] = $this->generateUniqueProjectSlug(TaskType::class, $project, $data['name'], $taskType->id);
        }

        if (array_key_exists('color', $data) && $this->isEmptyColor($data['color'])) {
            $data['color'] = self::DEFAULT_TASK_TYPE_COLOR;
        }

        DB::transaction(function () use ($project, $taskType, $data) {
            if (($data['is_default'] ?? false) === true) {
                $project->taskTypes()->where('id', '!=', $taskType->id)->update(['is_default' => false]);
            }

            $taskType->update($data);
        });

        return $taskType->fresh();
    }

    public function deleteTaskType(Project $project, string $taskTypeId): void
    {
        $taskType = $this->findTaskType($project, $taskTypeId);

        if ($taskType->tasks()->exists()) {
            throw ValidationException::withMessages([
                'id' => ['Task type cannot be deleted because it is used by one or more tasks.'],
            ]);
        }

        $taskType->delete();
    }

    public function getTaskStatuses(Project $project, int $perPage)
    {
        return $project->taskStatuses()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function createTaskStatus(Project $project, array $data): TaskStatus
    {
        $code = $this->generateUniqueProjectSlug(TaskStatus::class, $project, $data['name']);

        return DB::transaction(function () use ($project, $data, $code) {
            if (($data['is_default'] ?? false) === true) {
                $project->taskStatuses()->update(['is_default' => false]);
            }

            return $project->taskStatuses()->create([
                ...$data,
                'code' => $code,
                'color' => $this->resolveColor($data['color'] ?? null, self::DEFAULT_TASK_STATUS_COLOR),
                'is_done' => (bool) ($data['is_done'] ?? false),
                'is_default' => (bool) ($data['is_default'] ?? false),
                'sort_order' => $this->resolveSortOrder(TaskStatus::class, $project->id, $data['sort_order'] ?? null),
            ]);
        });
    }

    public function findTaskStatus(Project $project, string $taskStatusId): TaskStatus
    {
        $taskStatus = $project->taskStatuses()->whereKey($taskStatusId)->first();

        if (!$taskStatus) {
            throw new NotFoundHttpException('Task status not found.');
        }

        return $taskStatus;
    }

    public function findTaskStatusById(string $taskStatusId): TaskStatus
    {
        $taskStatus = TaskStatus::query()->whereKey($taskStatusId)->first();

        if (!$taskStatus) {
            throw new NotFoundHttpException('Task status not found.');
        }

        return $taskStatus;
    }

    public function updateTaskStatus(Project $project, string $taskStatusId, array $data): TaskStatus
    {
        $taskStatus = $this->findTaskStatus($project, $taskStatusId);

        if (isset($data['name']) && $data['name'] !== $taskStatus->name) {
            $data['code'] = $this->generateUniqueProjectSlug(TaskStatus::class, $project, $data['name'], $taskStatus->id);
        }

        if (array_key_exists('color', $data) && $this->isEmptyColor($data['color'])) {
            $data['color'] = self::DEFAULT_TASK_STATUS_COLOR;
        }

        DB::transaction(function () use ($project, $taskStatus, $data) {
            if (($data['is_default'] ?? false) === true) {
                $project->taskStatuses()->where('id', '!=', $taskStatus->id)->update(['is_default' => false]);
            }

            $taskStatus->update($data);
        });

        return $taskStatus->fresh();
    }

    public function deleteTaskStatus(Project $project, string $taskStatusId): void
    {
        $taskStatus = $this->findTaskStatus($project, $taskStatusId);

        if ($taskStatus->tasks()->exists()) {
            throw ValidationException::withMessages([
                'id' => ['Task status cannot be deleted because it is used by one or more tasks.'],
            ]);
        }

        $taskStatus->delete();
    }

    public function getTaskPriorities(Project $project, int $perPage)
    {
        return $project->taskPriorities()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function createTaskPriority(Project $project, array $data): TaskPriority
    {
        $code = $this->generateUniqueProjectSlug(TaskPriority::class, $project, $data['name']);

        return DB::transaction(function () use ($project, $data, $code) {
            if (($data['is_default'] ?? false) === true) {
                $project->taskPriorities()->update(['is_default' => false]);
            }

            return $project->taskPriorities()->create([
                ...$data,
                'code' => $code,
                'color' => $this->resolveColor($data['color'] ?? null, self::DEFAULT_TASK_PRIORITY_COLOR),
                'is_default' => (bool) ($data['is_default'] ?? false),
                'sort_order' => $this->resolveSortOrder(TaskPriority::class, $project->id, $data['sort_order'] ?? null),
            ]);
        });
    }

    public function findTaskPriority(Project $project, string $taskPriorityId): TaskPriority
    {
        $taskPriority = $project->taskPriorities()->whereKey($taskPriorityId)->first();

        if (!$taskPriority) {
            throw new NotFoundHttpException('Task priority not found.');
        }

        return $taskPriority;
    }

    public function findTaskPriorityById(string $taskPriorityId): TaskPriority
    {
        $taskPriority = TaskPriority::query()->whereKey($taskPriorityId)->first();

        if (!$taskPriority) {
            throw new NotFoundHttpException('Task priority not found.');
        }

        return $taskPriority;
    }

    public function updateTaskPriority(Project $project, string $taskPriorityId, array $data): TaskPriority
    {
        $taskPriority = $this->findTaskPriority($project, $taskPriorityId);

        if (isset($data['name']) && $data['name'] !== $taskPriority->name) {
            $data['code'] = $this->generateUniqueProjectSlug(TaskPriority::class, $project, $data['name'], $taskPriority->id);
        }

        if (array_key_exists('color', $data) && $this->isEmptyColor($data['color'])) {
            $data['color'] = self::DEFAULT_TASK_PRIORITY_COLOR;
        }

        DB::transaction(function () use ($project, $taskPriority, $data) {
            if (($data['is_default'] ?? false) === true) {
                $project->taskPriorities()->where('id', '!=', $taskPriority->id)->update(['is_default' => false]);
            }

            $taskPriority->update($data);
        });

        return $taskPriority->fresh();
    }

    public function deleteTaskPriority(Project $project, string $taskPriorityId): void
    {
        $taskPriority = $this->findTaskPriority($project, $taskPriorityId);

        if ($taskPriority->tasks()->exists()) {
            throw ValidationException::withMessages([
                'id' => ['Task priority cannot be deleted because it is used by one or more tasks.'],
            ]);
        }

        $taskPriority->delete();
    }

    private function generateUniqueProjectSlug(
        string $modelClass,
        Project $project,
        string $name,
        ?string $ignoreId = null
    ): string {
        $base = Str::slug($name);

        if ($base === '') {
            $base = 'item';
        }

        $maxLength = 32;
        $base = Str::limit($base, $maxLength, '');

        for ($attempt = 0; $attempt < 100; $attempt++) {
            $suffix = $attempt === 0 ? '' : '-' . ($attempt + 1);
            $candidate = Str::limit($base, $maxLength - strlen($suffix), '') . $suffix;

            $query = $modelClass::query()
                ->where('project_id', $project->id)
                ->whereRaw('LOWER(code) = ?', [strtolower($candidate)]);

            if ($ignoreId) {
                $query->where('id', '!=', $ignoreId);
            }

            if (!$query->exists()) {
                return $candidate;
            }
        }

        throw ValidationException::withMessages([
            'name' => ['Unable to generate a unique code from the name.'],
        ]);
    }

    private function resolveColor(mixed $color, string $default): string
    {
        $trimmed = trim((string) $color);
        return ($color === null || $trimmed === '') ? $default : $trimmed;
    }

    private function resolveSortOrder(string $modelClass, string $projectId, mixed $sortOrder): int
    {
        if ($sortOrder !== null && $sortOrder !== '') {
            return (int) $sortOrder;
        }

        $max = (int) $modelClass::query()
            ->where('project_id', $projectId)
            ->max('sort_order');

        return $max + 1;
    }
}
