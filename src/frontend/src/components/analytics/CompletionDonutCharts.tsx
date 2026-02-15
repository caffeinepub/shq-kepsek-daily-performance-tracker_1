import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Submission } from '../../backend';

interface CompletionDonutChartsProps {
  submissions: Submission[];
  timeRange: 7 | 30;
}

export default function CompletionDonutCharts({ submissions, timeRange }: CompletionDonutChartsProps) {
  const now = Date.now();
  const rangeMs = timeRange * 24 * 60 * 60 * 1000;
  const startTime = now - rangeMs;

  const filteredSubmissions = submissions.filter(
    (s) => Number(s.date) / 1_000_000 >= startTime
  );

  const calculateCompletion = (field: keyof Submission) => {
    const completed = filteredSubmissions.filter((s) => s[field] === true).length;
    const notCompleted = filteredSubmissions.length - completed;
    return [
      { name: 'Completed', value: completed },
      { name: 'Not Completed', value: notCompleted },
    ];
  };

  const classControlData = calculateCompletion('classControl');
  const teacherControlData = calculateCompletion('teacherControl');
  const programExecutionData = calculateCompletion('programExecution');

  const COLORS = ['oklch(var(--chart-1))', 'oklch(var(--chart-3))'];

  const renderChart = (data: any[], title: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>Completion rate</CardDescription>
      </CardHeader>
      <CardContent>
        {filteredSubmissions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No data</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {renderChart(classControlData, 'Class Control')}
      {renderChart(teacherControlData, 'Teacher Control')}
      {renderChart(programExecutionData, 'Program Execution')}
    </div>
  );
}
