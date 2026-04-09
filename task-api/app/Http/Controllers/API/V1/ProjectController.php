<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Project\ConfirmProjectInviteRequest;
use App\Http\Requests\Project\GetCalendarOverdueTasksRequest;
use App\Http\Requests\Project\GetProjectsRequest;
use App\Http\Resources\Project\ProjectMemberResource;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\StoreProjectInviteRequest;
use App\Http\Requests\Project\TransferProjectOwnershipRequest;
use App\Http\Resources\Project\ProjectInviteResource;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\Project\ProjectResource;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ProjectController extends Controller
{
    public function __construct(private ProjectService $projectService) {}

    public function index(GetProjectsRequest $request): JsonResponse
    {
        $this->authorize('viewAny', Project::class);

        $filters = $request->validated();
        $perPage = (int) ($filters['per_page'] ?? 10);

        $projects = $this->projectService->getUserProjects(
            $request->user(),
            max($perPage, 1),
            $filters
        );

        return $this->apiResponse(
            'Projects retrieved successfully.',
            ProjectResource::collection($projects)->response()->getData(true)
        );
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $this->authorize('create', Project::class);

        $project = $this->projectService->createProject(
            $request->user(),
            $request->validated()
        );

        return $this->apiResponse(
            'Project created successfully.',
            new ProjectResource($project),
            Response::HTTP_CREATED
        );
    }

    public function show(Request $request, string $projectCode): JsonResponse
    {
        $project = $this->projectService->findProject($projectCode);

        $this->authorize('view', $project);

        return $this->apiResponse(
            'Project retrieved successfully.',
            new ProjectResource($project)
        );
    }

    public function update(UpdateProjectRequest $request, string $projectCode): JsonResponse
    {
        $project = $this->projectService->findProject($projectCode);

        $this->authorize('update', $project);

        $project = $this->projectService->updateProject(
            $projectCode,
            $request->validated()
        );

        return $this->apiResponse(
            'Project updated successfully.',
            new ProjectResource($project)
        );
    }

    public function destroy(Request $request, string $projectCode): Response
    {
        $project = $this->projectService->findProject($projectCode);

        $this->authorize('delete', $project);

        $this->projectService->deleteProject($projectCode);

        return response()->noContent();
    }

    public function members(Request $request, string $projectCode): JsonResponse
    {
        $perPage = min((int) $request->integer('per_page', 10), 50);
        $filters = $request->only(['role']);
        $project = $this->projectService->findProject($projectCode);

        $this->authorize('view', $project);

        $members = $this->projectService->getProjectMembers($projectCode, $perPage, $filters);

        return $this->apiResponse(
            'Project members retrieved successfully.',
            ProjectMemberResource::collection($members)->response()->getData(true)
        );
    }

    public function calendarOverdueTasks(GetCalendarOverdueTasksRequest $request, string $projectCode): JsonResponse
    {
        $project = $this->projectService->findProject($projectCode);

        $this->authorize('view', $project);

        $month = (int) $request->validated('month');
        $year = (int) $request->validated('year');

        $summary = $this->projectService->getOverdueTasksSummaryByMonth($project, $month, $year);

        return $this->apiResponse(
            'Project calendar overdue tasks total retrieved successfully.',
            $summary
        );
    }

    public function removeMember(Request $request, string $projectCode, string $userId): Response
    {
        $project = $this->projectService->findProject($projectCode);

        $this->authorize('update', $project);

        $this->projectService->removeMember($project, $userId);

        return response()->noContent();
    }

    public function transferOwnership(TransferProjectOwnershipRequest $request, string $projectCode): JsonResponse
    {
        $project = $this->projectService->findProject($projectCode);

        $this->authorize('transferOwnership', $project);

        $project = $this->projectService->transferOwnership(
            $project,
            $request->validated('user_id')
        );

        return $this->apiResponse(
            'Project ownership transferred successfully.',
            new ProjectResource($project)
        );
    }

    public function inviteMember(StoreProjectInviteRequest $request, string $projectCode): JsonResponse
    {
        $project = $this->projectService->findProject($projectCode);

        $this->authorize('update', $project);

        $invite = $this->projectService->inviteMember(
            $projectCode,
            $request->user(),
            $request->validated()
        );

        return $this->apiResponse(
            'Project invite created successfully.',
            new ProjectInviteResource($invite),
            Response::HTTP_CREATED
        );
    }

    public function confirmInvite(ConfirmProjectInviteRequest $request): JsonResponse
    {
        $action = (string) $request->validated('action');

        $invite = $this->projectService->confirmInvite(
            $request->validated('code'),
            $request->user(),
            $action
        );

        $message = $action === 'accept'
            ? 'Project invite accepted successfully.'
            : 'Project invite rejected successfully.';

        return $this->apiResponse(
            $message,
            new ProjectInviteResource($invite)
        );
    }
}
