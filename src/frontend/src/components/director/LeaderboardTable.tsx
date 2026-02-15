import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';
import type { School } from '../../backend';

interface LeaderboardTableProps {
  schools: School[];
  isLoading: boolean;
}

export default function LeaderboardTable({ schools, isLoading }: LeaderboardTableProps) {
  const navigate = useNavigate();

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Award className="w-5 h-5 text-amber-600" />;
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Principal Leaderboard</CardTitle>
        <CardDescription>Ranked by total number of submissions</CardDescription>
      </CardHeader>
      <CardContent>
        {schools.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No schools registered yet</p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rank</TableHead>
                  <TableHead>School Name</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead className="text-right">Total Submissions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((school, index) => (
                  <TableRow
                    key={school.id.toString()}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate({ to: `/director/principal/${school.id.toString()}` })}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRankIcon(index)}
                        <span className="font-bold">{index + 1}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{school.region.name}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {school.submissionsCount.toString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
