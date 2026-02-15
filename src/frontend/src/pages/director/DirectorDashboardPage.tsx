import { useGetDashboardStats, useGetTopSchools, useGetAllSubmissions } from '../../hooks/useQueries';
import StatsCards from '../../components/director/StatsCards';
import LeaderboardTable from '../../components/director/LeaderboardTable';
import PerformanceAnalytics from '../../components/analytics/PerformanceAnalytics';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DirectorDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: topSchools = [], isLoading: schoolsLoading } = useGetTopSchools(20);
  const { data: allSubmissions = [] } = useGetAllSubmissions();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Director Dashboard</h1>
          <p className="text-muted-foreground">Monitor school performance and principal activities</p>
        </div>
      </div>

      <StatsCards stats={stats} isLoading={statsLoading} />

      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          <LeaderboardTable schools={topSchools} isLoading={schoolsLoading} />
        </TabsContent>

        <TabsContent value="analytics">
          <PerformanceAnalytics submissions={allSubmissions} schools={topSchools} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
