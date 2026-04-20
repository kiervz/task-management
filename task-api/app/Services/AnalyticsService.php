<?php

namespace App\Services;

use App\Models\Project;

class AnalyticsService
{
    public function getTaskAnalytics(Project $project): array
    {
        $taskCountsByStatusId = $project->tasks()
            ->selectRaw('task_status_id, COUNT(*) as total')
            ->groupBy('task_status_id')
            ->pluck('total', 'task_status_id');

        $completedTaskStatusIds = $project->taskStatuses()
            ->where('is_done', true)
            ->pluck('id');

        $completedTasks = (int) $taskCountsByStatusId
            ->only($completedTaskStatusIds)
            ->sum();

        $taskCountsByTypeId = $project->tasks()
            ->selectRaw('task_type_id, COUNT(*) as total')
            ->groupBy('task_type_id')
            ->pluck('total', 'task_type_id');

        $taskCountsByPriorityId = $project->tasks()
            ->selectRaw('task_priority_id, COUNT(*) as total')
            ->groupBy('task_priority_id')
            ->pluck('total', 'task_priority_id');

        $statusBuckets = $project->taskStatuses()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'color'])
            ->map(fn ($status) => [
                'id' => $status->id,
                'code' => $status->code,
                'name' => $status->name,
                'color' => $status->color,
                'count' => (int) ($taskCountsByStatusId[$status->id] ?? 0),
            ])
            ->values()
            ->all();

        $typeBuckets = $project->taskTypes()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'color'])
            ->map(fn ($type) => [
                'id' => $type->id,
                'code' => $type->code,
                'name' => $type->name,
                'color' => $type->color,
                'count' => (int) ($taskCountsByTypeId[$type->id] ?? 0),
            ])
            ->values()
            ->all();

        $priorityBuckets = $project->taskPriorities()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'color'])
            ->map(fn ($priority) => [
                'id' => $priority->id,
                'code' => $priority->code,
                'name' => $priority->name,
                'color' => $priority->color,
                'count' => (int) ($taskCountsByPriorityId[$priority->id] ?? 0),
            ])
            ->values()
            ->all();

        $totalTasks = (int) $project->tasks()->count();
        $completionRate = $totalTasks > 0
            ? round(($completedTasks / $totalTasks) * 100, 1)
            : 0;

        return [
            'project_code' => $project->code,
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'completion_rate' => $completionRate,
            'by_status' => $statusBuckets,
            'by_type' => $typeBuckets,
            'by_priority' => $priorityBuckets,
        ];
    }
}
