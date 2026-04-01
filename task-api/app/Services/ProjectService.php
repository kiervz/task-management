<?php

namespace App\Services;

use App\Jobs\SendProjectInviteEmailJob;
use App\Models\Project;
use App\Models\ProjectInvite;
use App\Models\ProjectMember;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ProjectService
{
    public function getUserProjects(User $user, int $perPage, array $filters)
    {
        $statuses = $filters['status'] ?? [];
        $priorities = $filters['priority'] ?? [];
        $startDateFrom = $filters['start_date_from'] ?? null;
        $startDateTo = $filters['start_date_to'] ?? null;

        $allowedSortColumns = [
            'created_at',
            'name',
            'description',
            'start_date',
            'end_date',
            'status',
            'priority',
        ];

        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDir = strtolower((string) ($filters['sort_dir'] ?? 'desc'));

        if (!in_array($sortBy, $allowedSortColumns, true)) {
            $sortBy = 'created_at';
        }

        if (!in_array($sortDir, ['asc', 'desc'], true)) {
            $sortDir = 'desc';
        }

        return Project::query()
            ->with(['user', 'members'])
            ->whereHas('members', fn ($q) => $q->where('user_id', $user->id))
            ->when($statuses !== [], fn ($q) => $q->whereIn('status', $statuses))
            ->when($priorities !== [], fn ($q) => $q->whereIn('priority', $priorities))
            ->when($filters['search'] ?? null, fn ($q, $search) =>
                $q->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                }))
            ->when($startDateFrom && $startDateTo, fn ($q) => $q->whereBetween('start_date', [$startDateFrom, $startDateTo]))
            ->when($startDateFrom && !$startDateTo, fn ($q) => $q->whereDate('start_date', '>=', $startDateFrom))
            ->when(!$startDateFrom && $startDateTo, fn ($q) => $q->whereDate('start_date', '<=', $startDateTo))
            ->orderBy($sortBy, $sortDir)
            ->paginate($perPage);
    }

    public function findProject(string $projectCode): Project
    {
        $project = Project::with(['user', 'members', 'tasks', 'tasks.status', 'members'])
            ->where('code', $projectCode)
            ->first();

        if (!$project) {
            throw new NotFoundHttpException('Project not found.');
        }

        return $project;
    }

    public function createProject(User $user, array $data): Project
    {
        return DB::transaction(function () use ($user, $data) {
            $project = Project::create([
                ...$data,
                'user_id' => $user->id,
                'code'    => $this->generateUniqueCode(),
            ]);

            $project->members()->create([
                'user_id' => $user->id,
                'role'    => ProjectMember::ROLE_ADMIN,
            ]);

            return $project->load(['user', 'members']);
        });
    }

    public function updateProject(string $projectCode, array $data): Project
    {
        $project = $this->findProject($projectCode);
        $project->update($data);
        return $project->fresh(['user', 'members']);
    }

    public function deleteProject(string $projectCode): void
    {
        $project = $this->findProject($projectCode);
        $project->delete();
    }

    public function getProjectMembers(string $projectCode, int $perPage, array $filters = [])
    {
        $project = $this->findProject($projectCode);

        $role = $filters['role'] ?? null;
        $allowedRoles = [ProjectMember::ROLE_ADMIN, ProjectMember::ROLE_MEMBER];
        $role = in_array($role, $allowedRoles, true) ? $role : null;

        return $project->members()
            ->with('user')
            ->when($role !== null, fn ($q) => $q->where('role', $role))
            ->orderByRaw("CASE WHEN role = 'admin' THEN 0 ELSE 1 END")
            ->orderBy('created_at')
            ->paginate($perPage);
    }

    public function getAllProjectMembers(string $projectCode)
    {
        $project = $this->findProject($projectCode);

        return $project->members()
            ->with('user')
            ->orderByRaw("CASE WHEN role = 'admin' THEN 0 ELSE 1 END")
            ->orderBy('created_at')
            ->get();
    }

    public function removeMember(Project $project, string $userId): void
    {
        if ($project->user_id === $userId) {
            throw ValidationException::withMessages([
                'user_id' => ['Project owner cannot be removed.'],
            ]);
        }

        $member = $project->members()->where('user_id', $userId)->first();

        if (!$member) {
            throw new NotFoundHttpException('Project member not found.');
        }

        if ($member->role === ProjectMember::ROLE_ADMIN) {
            $adminCount = (int) $project->members()
                ->where('role', ProjectMember::ROLE_ADMIN)
                ->count();

            if ($adminCount <= 1) {
                throw ValidationException::withMessages([
                    'user_id' => ['Cannot remove the last project admin.'],
                ]);
            }
        }

        $member->delete();
    }

    public function transferOwnership(Project $project, string $newOwnerId): Project
    {
        if ($project->user_id === $newOwnerId) {
            throw ValidationException::withMessages([
                'user_id' => ['Selected user is already the project owner.'],
            ]);
        }

        $member = $project->members()
            ->where('user_id', $newOwnerId)
            ->first();

        if (!$member) {
            throw ValidationException::withMessages([
                'user_id' => ['Selected user must be a member of this project.'],
            ]);
        }

        if ($member->role !== ProjectMember::ROLE_ADMIN) {
            throw ValidationException::withMessages([
                'user_id' => ['Ownership can only be transferred to a project admin.'],
            ]);
        }

        $project->update(['user_id' => $newOwnerId]);

        return $project->fresh(['user', 'members']);
    }

    public function inviteMember(string $projectCode, User $inviter, array $data): ProjectInvite
    {
        $project = $this->findProject($projectCode);

        if (strtolower($inviter->email) === strtolower($data['member_email'])) {
            throw ValidationException::withMessages([
                'member_email' => ['You cannot invite yourself to this project.'],
            ]);
        }

        $alreadyMember = $project->members()
            ->whereHas('user', fn ($query) => $query->where('email', $data['member_email']))
            ->exists();

        if ($alreadyMember) {
            throw ValidationException::withMessages([
                'member_email' => ['This user is already a member of the project.'],
            ]);
        }

        return DB::transaction(function () use ($project, $inviter, $data) {
            $invite = ProjectInvite::updateOrCreate(
                [
                    'project_id' => $project->id,
                    'member_email' => strtolower($data['member_email']),
                ],
                [
                    'invited_by' => $inviter->id,
                    'role' => $data['role'],
                    'status' => ProjectInvite::STATUS_PENDING,
                    'responded_by' => null,
                    'responded_at' => null,
                    'expires_at' => now()->addDays(7),
                ]
            );

            SendProjectInviteEmailJob::dispatch(
                email: $invite->member_email,
                projectName: $project->name,
                projectCode: $project->code,
                inviterName: $inviter->name,
                role: $invite->role,
                expiresAt: $invite->expires_at?->toDateTimeString(),
            );

            return $invite->load('project');
        });
    }

    public function confirmInvite(string $projectCode, User $user, string $action): ProjectInvite
    {
        $project = Project::where('code', $projectCode)->first();

        if (!$project) {
            throw new NotFoundHttpException('Project invite not found.');
        }

        $invite = ProjectInvite::query()
            ->where('project_id', $project->id)
            ->where('member_email', strtolower($user->email))
            ->where('status', ProjectInvite::STATUS_PENDING)
            ->latest()
            ->first();

        if (!$invite) {
            throw new NotFoundHttpException('Project invite not found.');
        }

        if ($invite->expires_at && $invite->expires_at->isPast()) {
            $invite->update([
                'status' => ProjectInvite::STATUS_REJECTED,
                'responded_by' => $user->id,
                'responded_at' => now(),
            ]);

            throw ValidationException::withMessages([
                'id' => ['This invite has expired. Please ask for a new invite.'],
            ]);
        }

        if ($action === 'accept') {
            DB::transaction(function () use ($project, $invite, $user) {
                $project->members()->firstOrCreate(
                    ['user_id' => $user->id],
                    ['role' => $invite->role]
                );

                $invite->update([
                    'status' => ProjectInvite::STATUS_ACCEPTED,
                    'responded_by' => $user->id,
                    'responded_at' => now(),
                ]);
            });

            return $invite->fresh('project');
        }

        $invite->update([
            'status' => ProjectInvite::STATUS_REJECTED,
            'responded_by' => $user->id,
            'responded_at' => now(),
        ]);

        return $invite->fresh('project');
    }

    private function generateUniqueCode(): string
    {
        for ($attempt = 0; $attempt < 10; $attempt++) {
            $code = strtoupper(Str::random(11));
            if (!Project::where('code', $code)->exists()) {
                return $code;
            }
        }
        throw new \RuntimeException('Unable to generate unique project code.');
    }
}
