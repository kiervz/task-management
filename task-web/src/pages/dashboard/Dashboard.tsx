import FetchErrorAlert from '@/components/errors/FetchErrorAlert';
import {
  useDashboardKpisQuery,
  useDashboardMyWorkQuery,
  useDashboardProjectsOverviewQuery,
} from '@/store/api/dashboardApi';
import KpiCards from './components/KpiCards';
import MyWorkSection from './components/MyWorkSection';
import ProjectOverviewSection from './components/ProjectOverviewSection';

const Dashboard = () => {
  const { data, isFetching, isError, error, refetch } = useDashboardKpisQuery();
  const {
    data: myWork,
    isFetching: isMyWorkFetching,
    isError: isMyWorkError,
    error: myWorkError,
    refetch: refetchMyWork,
  } = useDashboardMyWorkQuery();
  const {
    data: projectsOverview,
    isFetching: isProjectsOverviewFetching,
    isError: isProjectsOverviewError,
    error: projectsOverviewError,
    refetch: refetchProjectsOverview,
  } = useDashboardProjectsOverviewQuery();

  if (isError || isMyWorkError || isProjectsOverviewError) {
    return (
      <FetchErrorAlert
        title="Dashboard"
        description="Team overview"
        error={error ?? myWorkError ?? projectsOverviewError}
        onRetry={() => {
          refetch();
          refetchMyWork();
          refetchProjectsOverview();
        }}
      />
    );
  }

  const isKpiLoading = isFetching && !data;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </header>

      <KpiCards data={data} isLoading={isKpiLoading} />

      <ProjectOverviewSection
        projects={projectsOverview?.projects ?? []}
        isLoading={isProjectsOverviewFetching}
      />

      <MyWorkSection tasks={myWork?.tasks ?? []} isLoading={isMyWorkFetching} />
    </div>
  );
};

export default Dashboard;
