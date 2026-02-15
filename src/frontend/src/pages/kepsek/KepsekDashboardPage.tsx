import { useState } from 'react';
import { useGetCallerUserProfile, useGetMySubmissions, useGetActiveSchools } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import ProfileHeader from '../../components/profile/ProfileHeader';
import DailySubmissionForm from '../../components/submissions/DailySubmissionForm';
import SubmissionHistory from '../../components/submissions/SubmissionHistory';
import ProfileSetupDialog from '../../components/profile/ProfileSetupDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function KepsekDashboardPage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: submissions = [], isLoading: submissionsLoading } = useGetMySubmissions();
  const { data: schools = [] } = useGetActiveSchools();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  const mySchool = schools.find(
    (school) => school.principalId.toString() === identity?.getPrincipal().toString()
  );

  if (profileLoading || !isFetched) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (showProfileSetup) {
    return <ProfileSetupDialog />;
  }

  if (!userProfile) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>Please contact your administrator to set up your profile.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Principal Dashboard</h1>
          <p className="text-muted-foreground">Track your daily performance and submissions</p>
        </div>
      </div>

      <ProfileHeader profile={userProfile} />

      <Tabs defaultValue="submit" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="submit">Daily Submission</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-6">
          {mySchool ? (
            <DailySubmissionForm schoolId={mySchool.id} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>School Not Found</CardTitle>
                <CardDescription>
                  Your school record is not available. Please contact your administrator.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <SubmissionHistory submissions={submissions} isLoading={submissionsLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
