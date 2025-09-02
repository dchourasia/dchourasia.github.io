import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ProcessedJob, ChartData } from '../types';

interface ChartsProps {
  jobs: ProcessedJob[];
}

const COLORS = {
  success: '#10B981',
  failure: '#EF4444',
  cancelled: '#6B7280',
  in_progress: '#3B82F6',
  default: '#F59E0B'
};

const Charts: React.FC<ChartsProps> = ({ jobs }) => {
  const statusData: ChartData[] = React.useMemo(() => {
    const statusCounts = jobs.reduce((acc, job) => {
      const status = job.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      color: COLORS[status as keyof typeof COLORS] || COLORS.default
    }));
  }, [jobs]);

  const jobNameData: ChartData[] = React.useMemo(() => {
    const jobCounts = jobs.reduce((acc, job) => {
      const jobName = job.jobName;
      acc[jobName] = (acc[jobName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(jobCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([jobName, count]) => ({
        name: jobName,
        value: count
      }));
  }, [jobs]);

  const timelineData = React.useMemo(() => {
    const dateCounts = jobs.reduce((acc, job) => {
      const date = job.executionDate;
      if (!acc[date]) {
        acc[date] = { date, success: 0, failure: 0, other: 0 };
      }
      
      if (job.status === 'success') {
        acc[date].success += 1;
      } else if (job.status === 'failure') {
        acc[date].failure += 1;
      } else {
        acc[date].other += 1;
      }
      
      return acc;
    }, {} as Record<string, { date: string; success: number; failure: number; other: number }>);

    return Object.values(dateCounts)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14);
  }, [jobs]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (jobs.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
        No data available for charts
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Job Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top 10 Job Names</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={jobNameData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Execution Timeline (Last 14 Days)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="success" stackId="a" fill={COLORS.success} name="Success" />
            <Bar dataKey="failure" stackId="a" fill={COLORS.failure} name="Failure" />
            <Bar dataKey="other" stackId="a" fill={COLORS.default} name="Other" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;