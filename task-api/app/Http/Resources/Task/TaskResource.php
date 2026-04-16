<?php

namespace App\Http\Resources\Task;

use App\Http\Resources\User\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
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
            'project_id' => $this->project_id,
            'title' => $this->title,
            'description' => $this->description,
            'due_date' => $this->due_date?->toDateString(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'comments_count' => $this->comments->count(),
            'creator' => new UserResource($this->whenLoaded('creator')),
            'project' => new TaskProjectResource($this->whenLoaded('project')),
            'type' => new TaskTypeResource($this->whenLoaded('type')),
            'status' => new TaskStatusResource($this->whenLoaded('status')),
            'priority' => new TaskPriorityResource($this->whenLoaded('priority')),
            'assignees' => TaskAssigneeResource::collection($this->whenLoaded('assignees')),
            'permissions' => [
                'can_manage' => $request->user()?->can('manageTask', [$this->project, $this->resource]) ?? false,
            ],
        ];
    }
}
