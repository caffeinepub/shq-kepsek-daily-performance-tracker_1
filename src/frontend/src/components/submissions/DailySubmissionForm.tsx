import { useState } from 'react';
import { useCreateSubmission } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import AttendancePhotoUploader from '../uploads/AttendancePhotoUploader';
import { ExternalBlob } from '../../backend';
import { timeToNanoseconds } from '../../utils/time';

interface DailySubmissionFormProps {
  schoolId: bigint;
}

export default function DailySubmissionForm({ schoolId }: DailySubmissionFormProps) {
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [attendancePhoto, setAttendancePhoto] = useState<ExternalBlob | null>(null);
  const [classControl, setClassControl] = useState(false);
  const [teacherControl, setTeacherControl] = useState(false);
  const [parentResponse, setParentResponse] = useState(false);
  const [programExecution, setProgramExecution] = useState(false);
  const [problemSolving, setProblemSolving] = useState('');

  const createSubmission = useCreateSubmission();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkInTime || !checkOutTime) {
      toast.error('Please provide both check-in and check-out times');
      return;
    }

    if (!attendancePhoto) {
      toast.error('Please upload an attendance photo');
      return;
    }

    try {
      const attendance = {
        checkIn: timeToNanoseconds(checkInTime),
        checkOut: timeToNanoseconds(checkOutTime),
        photo: attendancePhoto,
      };

      await createSubmission.mutateAsync({
        schoolId,
        attendance,
        classControl,
        teacherControl,
        parentResponse,
        programExecution,
        problemSolving,
      });

      toast.success('Daily submission recorded successfully!');

      // Reset form
      setCheckInTime('');
      setCheckOutTime('');
      setAttendancePhoto(null);
      setClassControl(false);
      setTeacherControl(false);
      setParentResponse(false);
      setProgramExecution(false);
      setProblemSolving('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit daily form');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Submission Form</CardTitle>
        <CardDescription>Complete your daily performance report (Max 100 points)</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Attendance (20 points)</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="checkIn">Check-In Time</Label>
                <Input
                  id="checkIn"
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="checkOut">Check-Out Time</Label>
                <Input
                  id="checkOut"
                  type="time"
                  value={checkOutTime}
                  onChange={(e) => setCheckOutTime(e.target.value)}
                />
              </div>
            </div>
            <AttendancePhotoUploader onPhotoChange={setAttendancePhoto} />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Daily Activities (80 points)</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="classControl"
                  checked={classControl}
                  onCheckedChange={(checked) => setClassControl(checked as boolean)}
                />
                <Label htmlFor="classControl" className="cursor-pointer">
                  Class Control (Kontrol Kelas) - 20 points
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="teacherControl"
                  checked={teacherControl}
                  onCheckedChange={(checked) => setTeacherControl(checked as boolean)}
                />
                <Label htmlFor="teacherControl" className="cursor-pointer">
                  Teacher Control (Kontrol Guru) - 20 points
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="parentResponse"
                  checked={parentResponse}
                  onCheckedChange={(checked) => setParentResponse(checked as boolean)}
                />
                <Label htmlFor="parentResponse" className="cursor-pointer">
                  Parent Response (Respon Wali Santri) - 20 points
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="programExecution"
                  checked={programExecution}
                  onCheckedChange={(checked) => setProgramExecution(checked as boolean)}
                />
                <Label htmlFor="programExecution" className="cursor-pointer">
                  Program Execution (Pelaksanaan Program) - 20 points
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problemSolving">Problem Solving Notes</Label>
            <Textarea
              id="problemSolving"
              placeholder="Describe any problems encountered and how you solved them today..."
              value={problemSolving}
              onChange={(e) => setProblemSolving(e.target.value)}
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" disabled={createSubmission.isPending}>
            {createSubmission.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Submitting...
              </>
            ) : (
              'Submit Daily Report'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
