<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\User;

class ProjectPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->exists;
    }

    public function view(User $user, Project $project): bool
    {
        return $this->isProjectMember($user, $project);
    }

    public function create(User $user): bool
    {
        return $user->exists;
    }

    public function update(User $user, Project $project): bool
    {
        return $this->isProjectAdmin($user, $project);
    }

    public function delete(User $user, Project $project): bool
    {
        return $this->isProjectAdmin($user, $project);
    }

    public function transferOwnership(User $user, Project $project): bool
    {
        return $project->user_id === $user->id;
    }

    private function isProjectAdmin(User $user, Project $project): bool
    {
        if ($project->user_id === $user->id) {
            return true;
        }

        if ($project->relationLoaded('members')) {
            return $project->members->contains(function ($member) use ($user) {
                return $member->user_id === $user->id && $member->role === ProjectMember::ROLE_ADMIN;
            });
        }

        return $project->members()
            ->where('user_id', $user->id)
            ->where('role', ProjectMember::ROLE_ADMIN)
            ->exists();
    }

    private function isProjectMember(User $user, Project $project): bool
    {
        if ($project->user_id === $user->id) {
            return true;
        }

        if ($project->relationLoaded('members')) {
            return $project->members->contains('user_id', $user->id);
        }

        return $project->members()->where('user_id', $user->id)->exists();
    }
}
