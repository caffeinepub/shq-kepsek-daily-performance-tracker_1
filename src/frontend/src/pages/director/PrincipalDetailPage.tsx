import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetSchoolDetails } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Award } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import SubmissionDetailPanel from '../../components/submissions/SubmissionDetailPanel';
import { formatDate } from '../../utils/time';

export default function PrincipalDetailPage() {
  const { schoolId } = useParams({ from: '/director/principal/$schoolId' });
  const navigate = useNavigate();
  const { data, isLoading } = useGetSchoolDetails(BigInt(schoolId));

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading school details...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>School Not Found</CardTitle>
            <CardDescription>The requested school could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/director' })}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { school, recentSubmissions } = data;
  const sortedSubmissions = [...recentSubmissions].sort((a, b) => Number(b.date - a.date));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/director' })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{school.name}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{school.region.name}</Badge>
            <Badge variant="secondary">{school.schoolCategory}</Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{school.submissionsCount.toString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {recentSubmissions.length > 0
                  ? Math.round(
                      recentSubmissions.reduce((sum, s) => sum + Number(s.score), 0) /
                        recentSubmissions.length
                    )
                  : 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Submission</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {school.lastSubmissionDate ? formatDate(school.lastSubmissionDate) : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
          <CardDescription>All daily submissions from this principal</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedSubmissions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No submissions yet</p>
          ) : (
            <div className="space-y-4">
              {sortedSubmissions.map((submission) => (
                <SubmissionDetailPanel key={submission.id.toString()} submission={submission} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
