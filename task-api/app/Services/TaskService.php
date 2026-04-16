<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use App\Models\TaskAssignee;
use App\Models\TaskPriority;
use App\Models\TaskStatus;
use App\Models\TaskType;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class TaskService
{
    public function __construct(private ProjectService $projectService) {}

    public function findProject(string $projectCode): Project
    {
        return $this->projectService->findProject($projectCode);
    }

    public function getTasks(Project $project, int $perPage, array $filters)
    {
        $taskTypes = $filters['task_type'] ?? [];
        $taskStatuses = $filters['task_status'] ?? [];
        $taskPriorities = $filters['task_priority'] ?? [];
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDir = $filters['sort_dir'] ?? 'desc';

        return $project->tasks()
            ->with(['creator', 'project', 'type', 'status', 'priority', 'assignees.user'])
            ->when($taskTypes !== [], function ($query) use ($taskTypes) {
                $query->whereHas('type', fn ($q) => $q->whereIn('code', $taskTypes));
            })
            ->when($taskStatuses !== [], function ($query) use ($taskStatuses) {
                $query->whereHas('status', fn ($q) => $q->whereIn('code', $taskStatuses));
            })
            ->when($taskPriorities !== [], function ($query) use ($taskPriorities) {
                $query->whereHas('priority', fn ($q) => $q->whereIn('code', $taskPriorities));
            })
            ->when($filters['assignee_id'] ?? null, function ($query, $assigneeId) {
                $query->whereHas('assignees', fn ($q) => $q->where('user_id', $assigneeId));
            })
            ->when($filters['search'] ?? null, fn ($q, $search) =>
                $q->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
                })
            )
            ->when($filters['due'] ?? null, function ($query, $due) {
                match ($due) {
                    'overdue' => $query
                        ->whereDate('due_date', '<', today())
                        ->whereHas('status', fn ($q) => $q->where('is_done', false)),
                    'today' => $query->whereDate('due_date', today()),
                    'this_week' => $query->whereBetween('due_date', [today()->startOfWeek(), today()->endOfWeek()]),
                    'this_month' => $query->whereBetween('due_date', [today()->startOfMonth(), today()->endOfMonth()]),
                    'not_due', 'none' => $query->whereDate('due_date', '>=', today()),
                    default => $query,
                };
            })
            ->when($filters['due_from'] ?? null, fn ($q, $value) => $q->whereDate('due_date', '>=', $value))
            ->when($filters['due_to'] ?? null, fn ($q, $value) => $q->whereDate('due_date', '<=', $value))
            ->orderBy($sortBy, $sortDir)
            ->when($sortBy !== 'created_at', fn ($q) => $q->orderBy('created_at', 'desc'))
            ->paginate($perPage);
    }

    public function findTask(Project $project, string $taskId): Task
    {
        $task = $project->tasks()
            ->with(['creator', 'type', 'status', 'priority', 'assignees.user', 'project'])
            ->whereKey($taskId)
            ->first();

        if (!$task) {
            throw new NotFoundHttpException('Task not found.');
        }

        return $task;
    }

    public function findTaskById(string $taskId): Task
    {
        $task = Task::query()
            ->with(['project'])
            ->whereKey($taskId)
            ->first();

        if (!$task) {
            throw new NotFoundHttpException('Task not found.');
        }

        return $task;
    }

    public function createTask(Project $project, User $user, array $data): Task
    {
        $this->assertProjectEntity(TaskType::class, $project->id, $data['task_type_id'], 'task_type_id');
        $this->assertProjectEntity(TaskStatus::class, $project->id, $data['task_status_id'], 'task_status_id');
        $this->assertProjectEntity(TaskPriority::class, $project->id, $data['task_priority_id'], 'task_priority_id');

        $task = DB::transaction(function () use ($project, $user, $data) {
            $task = $project->tasks()->create([
                'created_by' => $user->id,
                'task_type_id' => $data['task_type_id'],
                'task_status_id' => $data['task_status_id'],
                'task_priority_id' => $data['task_priority_id'],
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'due_date' => $data['due_date'] ?? null,
            ]);

            if (!empty($data['assignee_ids'])) {
                $this->syncTaskAssigneesInternal($project, $task, $data['assignee_ids']);
            }

            return $task;
        });

        return $this->findTask($project, $task->id);
    }

    public function updateTask(Project $project, string $taskId, array $data): Task
    {
        $task = $this->findTask($project, $taskId);

        if (isset($data['task_type_id'])) {
            $this->assertProjectEntity(TaskType::class, $project->id, $data['task_type_id'], 'task_type_id');
        }

        if (isset($data['task_status_id'])) {
            $this->assertProjectEntity(TaskStatus::class, $project->id, $data['task_status_id'], 'task_status_id');
        }

        if (isset($data['task_priority_id'])) {
            $this->assertProjectEntity(TaskPriority::class, $project->id, $data['task_priority_id'], 'task_priority_id');
        }

        DB::transaction(function () use ($project, $task, $data) {
            $task->update($data);

            if (array_key_exists('assignee_ids', $data)) {
                $this->syncTaskAssigneesInternal($project, $task, $data['assignee_ids'] ?? []);
            }
        });

        return $this->findTask($project, $task->id);
    }

    public function deleteTask(Project $project, string $taskId): void
    {
        $task = $this->findTask($project, $taskId);
        $task->delete();
    }

    public function getTaskAssignees(Project $project, string $taskId)
    {
        $task = $this->findTask($project, $taskId);

        return $task->assignees()
            ->with('user')
            ->latest('assigned_at')
            ->get();
    }

    public function assignTaskAssignees(Project $project, string $taskId, array $userIds)
    {
        $task = $this->findTask($project, $taskId);

        $userIds = collect($userIds)
            ->filter()
            ->unique()
            ->values();

        $this->assertProjectMembers($project, $userIds->all());

        foreach ($userIds as $userId) {
            TaskAssignee::firstOrCreate(
                ['task_id' => $task->id, 'user_id' => $userId],
                ['assigned_at' => now()]
            );
        }

        return TaskAssignee::query()
            ->where('task_id', $task->id)
            ->whereIn('user_id', $userIds)
            ->with('user')
            ->latest('assigned_at')
            ->get();
    }

    public function unassignTaskAssignee(Project $project, string $taskId, string $userId): void
    {
        $task = $this->findTask($project, $taskId);

        TaskAssignee::query()
            ->where('task_id', $task->id)
            ->where('user_id', $userId)
            ->delete();
    }

    private function syncTaskAssigneesInternal(Project $project, Task $task, array $assigneeIds): void
    {
        $assigneeIds = collect($assigneeIds)
            ->filter()
            ->unique()
            ->values();

        $this->assertProjectMembers($project, $assigneeIds->all());

        TaskAssignee::where('task_id', $task->id)
            ->whereNotIn('user_id', $assigneeIds)
            ->delete();

        foreach ($assigneeIds as $userId) {
            TaskAssignee::firstOrCreate(
                ['task_id' => $task->id, 'user_id' => $userId],
                ['assigned_at' => now()]
            );
        }
    }

    private function assertProjectMembers(Project $project, array $assigneeIds): void
    {
        if (empty($assigneeIds)) {
            return;
        }

        $memberIds = $project->members()->pluck('user_id')->push($project->user_id)->unique();
        $invalidAssignees = collect($assigneeIds)->diff($memberIds)->values();

        if ($invalidAssignees->isNotEmpty()) {
            throw ValidationException::withMessages([
                'assignee_ids' => ['Each assignee must be a member of the project.'],
            ]);
        }
    }

    private function assertProjectEntity(string $modelClass, string $projectId, string $id, string $field): void
    {
        $exists = $modelClass::query()
            ->where('project_id', $projectId)
            ->whereKey($id)
            ->exists();

        if (!$exists) {
            throw ValidationException::withMessages([
                $field => ['Selected value does not belong to this project.'],
            ]);
        }
    }

}
