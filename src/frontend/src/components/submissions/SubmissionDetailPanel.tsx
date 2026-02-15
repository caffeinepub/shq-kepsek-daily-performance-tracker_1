import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, Image as ImageIcon } from 'lucide-react';
import type { Submission } from '../../backend';
import { formatTime } from '../../utils/time';
import { useState } from 'react';

interface SubmissionDetailPanelProps {
  submission: Submission;
}

export default function SubmissionDetailPanel({ submission }: SubmissionDetailPanelProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const loadImage = async () => {
    if (!submission.attendance?.photo || imageUrl) return;
    
    setImageLoading(true);
    try {
      const url = submission.attendance.photo.getDirectURL();
      setImageUrl(url);
    } catch (error) {
      console.error('Failed to load image:', error);
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Score Breakdown</CardTitle>
            <Badge variant={Number(submission.score) >= 80 ? 'default' : 'secondary'} className="text-lg">
              {submission.score.toString()} / 100
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {submission.attendance ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
              Attendance
            </span>
            <Badge variant="outline">{submission.attendance ? '20' : '0'} pts</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {submission.classControl ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
              Class Control
            </span>
            <Badge variant="outline">{submission.classControl ? '20' : '0'} pts</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {submission.teacherControl ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
              Teacher Control
            </span>
            <Badge variant="outline">{submission.teacherControl ? '20' : '0'} pts</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {submission.parentResponse ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
              Parent Response
            </span>
            <Badge variant="outline">{submission.parentResponse ? '20' : '0'} pts</Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {submission.programExecution ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 text-gray-400" />
              )}
              Program Execution
            </span>
            <Badge variant="outline">{submission.programExecution ? '20' : '0'} pts</Badge>
          </div>
        </CardContent>
      </Card>

      {submission.attendance && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Attendance Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Check-In</p>
                <p className="font-medium">{formatTime(submission.attendance.checkIn)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Check-Out</p>
                <p className="font-medium">{formatTime(submission.attendance.checkOut)}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="w-5 h-5 text-muted-foreground" />
                <p className="text-sm font-medium">Attendance Photo</p>
              </div>
              {!imageUrl && !imageLoading && (
                <button
                  onClick={loadImage}
                  className="w-full h-48 border-2 border-dashed rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm text-muted-foreground">Click to load image</span>
                </button>
              )}
              {imageLoading && (
                <div className="w-full h-48 border rounded-lg flex items-center justify-center bg-muted">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              )}
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Attendance"
                  className="w-full h-auto rounded-lg border"
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {submission.problemSolving && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Problem Solving Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{submission.problemSolving}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
