import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import type { Submission } from '../../backend';
import { formatDate } from '../../utils/time';
import SubmissionDetailPanel from './SubmissionDetailPanel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface SubmissionHistoryProps {
  submissions: Submission[];
  isLoading: boolean;
}

export default function SubmissionHistory({ submissions, isLoading }: SubmissionHistoryProps) {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const sortedSubmissions = [...submissions].sort((a, b) => Number(b.date - a.date));

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading submissions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
          <CardDescription>View your past daily submissions and scores</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedSubmissions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No submissions yet</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSubmissions.map((submission) => (
                    <TableRow key={submission.id.toString()}>
                      <TableCell className="font-medium">{formatDate(submission.date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={Number(submission.score) >= 80 ? 'default' : 'secondary'}
                        >
                          {submission.score.toString()} / 100
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>
              {selectedSubmission && formatDate(selectedSubmission.date)}
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && <SubmissionDetailPanel submission={selectedSubmission} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
