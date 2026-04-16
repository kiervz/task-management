<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct(
        private ProjectService $projectService,
        private AnalyticsService $analyticsService,
    ) {}

    public function taskAnalytics(Request $request, string $projectCode): JsonResponse
    {
        $project = $this->projectService->findProject($projectCode);

        $this->authorize('view', $project);

        $analytics = $this->analyticsService->getTaskAnalytics($project);

        return $this->apiResponse(
            'Project task analytics retrieved successfully.',
            $analytics
        );
    }
}
