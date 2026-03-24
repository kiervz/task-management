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
            'due_date' => $this->due_date,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'creator' => new UserResource($this->whenLoaded('creator')),
            'type' => new TaskTypeResource($this->whenLoaded('type')),
            'status' => new TaskStatusResource($this->whenLoaded('status')),
            'priority' => new TaskPriorityResource($this->whenLoaded('priority')),
            'assignees' => TaskAssigneeResource::collection($this->whenLoaded('assignees')),
        ];
    }
}
