import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TimeRangeSelector from './TimeRangeSelector';
import PerformanceLineChart from './PerformanceLineChart';
import CompletionDonutCharts from './CompletionDonutCharts';
import type { Submission, School } from '../../backend';

interface PerformanceAnalyticsProps {
  submissions: Submission[];
  schools: School[];
}

export default function PerformanceAnalytics({ submissions, schools }: PerformanceAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<7 | 30>(7);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Track trends and completion rates over time</CardDescription>
            </div>
            <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
          </div>
        </CardHeader>
      </Card>

      <PerformanceLineChart submissions={submissions} timeRange={timeRange} />
      <CompletionDonutCharts submissions={submissions} timeRange={timeRange} />
    </div>
  );
}
