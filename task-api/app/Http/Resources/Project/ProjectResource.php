<?php

namespace App\Http\Resources\Project;

use App\Http\Resources\User\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => new UserResource($this->whenLoaded('user')),
            'code' => $this->code,
            'name' => $this->name,
            'description' => $this->description,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'status' => $this->status,
            'priority' => $this->priority,
            'permissions' => [
                'can_manage' => $request->user()?->can('update', $this->resource) ?? false,
            ],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'total_tasks'      => $this->when(
                $this->relationLoaded('tasks'),
                fn() => $this->tasks->count()
            ),
            'completed_tasks'  => $this->when(
                $this->relationLoaded('tasks'),
                fn() => $this->tasks->filter(
                    fn($task) => $task->relationLoaded('status') && $task->status?->is_done
                )->count()
            ),
            'overdue_tasks' => $this->when(
                $this->relationLoaded('tasks'),
                fn() => $this->tasks->filter(
                    fn($task) => $task->due_date &&
                                $task->due_date->isPast() &&
                                $task->status?->is_done === false
                )->count()
            ),
            'total_members'      => $this->when(
                $this->relationLoaded('members'),
                fn() => $this->members->count()
            ),
        ];
    }
}
