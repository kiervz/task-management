<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $dashboardService) {}

    public function kpis(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Project::class);

        $kpis = $this->dashboardService->getTeamKpis($request->user());

        return $this->apiResponse('Dashboard KPIs retrieved successfully.', $kpis);
    }

    public function myWork(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Project::class);

        $myWork = $this->dashboardService->getMyWork($request->user());

        return $this->apiResponse('Dashboard my work retrieved successfully.', $myWork);
    }

    public function projectsOverview(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Project::class);

        $projectsOverview = $this->dashboardService->getProjectsOverview($request->user());

        return $this->apiResponse(
            'Dashboard projects overview retrieved successfully.',
            $projectsOverview,
        );
    }
}
