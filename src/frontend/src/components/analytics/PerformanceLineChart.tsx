import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Submission } from '../../backend';
import { formatDate } from '../../utils/time';

interface PerformanceLineChartProps {
  submissions: Submission[];
  timeRange: 7 | 30;
}

export default function PerformanceLineChart({ submissions, timeRange }: PerformanceLineChartProps) {
  const now = Date.now();
  const rangeMs = timeRange * 24 * 60 * 60 * 1000;
  const startTime = now - rangeMs;

  const filteredSubmissions = submissions.filter(
    (s) => Number(s.date) / 1_000_000 >= startTime
  );

  // Group by date and calculate average score
  const dataByDate = new Map<string, { total: number; count: number }>();

  filteredSubmissions.forEach((submission) => {
    const date = formatDate(submission.date);
    const existing = dataByDate.get(date) || { total: 0, count: 0 };
    dataByDate.set(date, {
      total: existing.total + Number(submission.score),
      count: existing.count + 1,
    });
  });

  const chartData = Array.from(dataByDate.entries())
    .map(([date, { total, count }]) => ({
      date,
      averageScore: Math.round(total / count),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Performance Trend</CardTitle>
        <CardDescription>Average daily score over the selected period</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No data available for this period</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="averageScore"
                stroke="oklch(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: "oklch(var(--chart-1))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
