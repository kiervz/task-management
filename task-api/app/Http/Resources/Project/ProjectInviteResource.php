<?php

namespace App\Http\Resources\Project;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectInviteResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_code' => $this->project?->code,
            'member_email' => $this->member_email,
            'role' => $this->role,
            'status' => $this->status,
            'invited_by' => $this->invited_by,
            'responded_by' => $this->responded_by,
            'responded_at' => $this->responded_at,
            'expires_at' => $this->expires_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
