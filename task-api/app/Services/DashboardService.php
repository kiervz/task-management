<?php

namespace App\Services;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

class DashboardService
{
    public function getTeamKpis(User $user): array
    {
        $totalProjects = $this->userProjectsQuery($user)->count();

        $totalTasks = Task::query()
            ->whereIn('project_id', $this->userProjectsQuery($user)->select('id'))
            ->count();

        $myTasks = Task::query()
            ->whereIn('project_id', $this->userProjectsQuery($user)->select('id'))
            ->whereHas('assignees', fn ($query) => $query->where('user_id', $user->id))
            ->count();

        $overdueTasks = Task::query()
            ->whereIn('project_id', $this->userProjectsQuery($user)->select('id'))
            ->whereDate('due_date', '<', now()->startOfDay())
            ->whereHas('status', fn ($query) => $query->where('is_done', false))
            ->count();

        return [
            'total_projects' => $totalProjects,
            'total_tasks' => $totalTasks,
            'my_tasks' => $myTasks,
            'overdue_tasks' => $overdueTasks,
        ];
    }

    public function getMyWork(User $user): array
    {
        $tasks = $this->assignedOpenTasksQuery($user)
            ->latest('updated_at')
            ->limit(10)
            ->get();

        return [
            'tasks' => $this->serializeTasks($tasks),
        ];
    }

    public function getProjectsOverview(User $user): array
    {
        $projects = Project::query()
            ->whereHas('members', fn ($query) => $query->where('user_id', $user->id))
            ->withCount('tasks')
            ->withCount([
                'tasks as completed_tasks' => fn ($query) =>
                    $query->whereHas('status', fn ($statusQuery) => $statusQuery->where('is_done', true)),
            ])
            ->withCount([
                'tasks as overdue_tasks' => fn ($query) =>
                    $query
                        ->whereDate('due_date', '<', now()->startOfDay())
                        ->whereHas('status', fn ($statusQuery) => $statusQuery->where('is_done', false)),
            ])
            ->withCount('members as total_members')
            ->orderByDesc('updated_at')
            ->limit(2)
            ->get(['id', 'code', 'name', 'status', 'updated_at']);

        $overview = $projects->map(function (Project $project) {
            $totalTasks = (int) ($project->tasks_count ?? 0);
            $completedTasks = (int) ($project->completed_tasks ?? 0);

            $completionRate = $totalTasks > 0
                ? round(($completedTasks / $totalTasks) * 100, 1)
                : 0;

            return [
                'id' => $project->id,
                'code' => $project->code,
                'name' => $project->name,
                'status' => $project->status,
                'completion_rate' => $completionRate,
                'total_tasks' => $totalTasks,
                'completed_tasks' => $completedTasks,
                'overdue_tasks' => (int) ($project->overdue_tasks ?? 0),
                'total_members' => (int) ($project->total_members ?? 0),
            ];
        })->values()->all();

        return [
            'projects' => $overview,
        ];
    }

    private function assignedOpenTasksQuery(User $user): Builder
    {
        return Task::query()
            ->with([
                'project:id,code,name',
                'type:id,code,name,color',
                'priority:id,code,name,color',
                'status:id,code,name,color,is_done',
            ])
            ->whereIn('project_id', $this->userProjectsQuery($user)->select('id'))
            ->whereHas('assignees', fn ($query) => $query->where('user_id', $user->id))
            ->whereHas('status', fn ($query) => $query->where('is_done', false));
    }

    private function serializeTasks(iterable $tasks): array
    {
        return collect($tasks)
            ->map(fn (Task $task) => [
                'id' => $task->id,
                'title' => $task->title,
                'due_date' => $this->asCarbonDate($task->due_date)?->toDateString(),
                'project' => [
                    'code' => $task->project?->code,
                    'name' => $task->project?->name,
                ],
                'type' => [
                    'code' => $task->type?->code,
                    'name' => $task->type?->name,
                    'color' => $task->type?->color,
                ],
                'priority' => [
                    'code' => $task->priority?->code,
                    'name' => $task->priority?->name,
                    'color' => $task->priority?->color,
                ],
                'status' => [
                    'code' => $task->status?->code,
                    'name' => $task->status?->name,
                    'color' => $task->status?->color,
                    'is_done' => (bool) ($task->status?->is_done ?? false),
                ],
            ])
            ->values()
            ->all();
    }

    private function asCarbonDate(mixed $value): ?Carbon
    {
        if ($value === null) {
            return null;
        }

        return $value instanceof Carbon
            ? $value
            : Carbon::parse((string) $value);
    }

    private function userProjectsQuery(User $user): Builder
    {
        return Project::query()
            ->whereHas('members', fn ($query) => $query->where('user_id', $user->id));
    }
}
