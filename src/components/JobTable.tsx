import React, { useState, useMemo } from 'react';
import { ProcessedJob } from '../types';

interface JobTableProps {
  jobs: ProcessedJob[];
  loading?: boolean;
}

type SortField = 'jobName' | 'executionDate' | 'status';
type SortDirection = 'asc' | 'desc';

const JobTable: React.FC<JobTableProps> = ({ jobs, loading = false }) => {
  const [sortField, setSortField] = useState<SortField>('executionDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filter, setFilter] = useState('');

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs;

    if (filter) {
      filtered = jobs.filter(job =>
        job.jobName.toLowerCase().includes(filter.toLowerCase()) ||
        job.status.toLowerCase().includes(filter.toLowerCase())
      );
    }

    return filtered.sort((a, b) => {
      let aValue: string | Date = a[sortField];
      let bValue: string | Date = b[sortField];

      if (sortField === 'executionDate') {
        aValue = new Date(a.executionDate);
        bValue = new Date(b.executionDate);
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [jobs, filter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failure':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Job Executions</h3>
        <div className="mt-2">
          <input
            type="text"
            placeholder="Filter by job name or status..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort('jobName')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Job Name
                {sortField === 'jobName' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort('executionDate')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Execution Date
                {sortField === 'executionDate' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th
                onClick={() => handleSort('status')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                Status
                {sortField === 'status' && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Error Summary
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job URL
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedJobs.map((job, index) => (
              <tr key={`${job.workflowRunId}-${job.jobName}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {job.jobName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {job.executionDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(job.status)}`}>
                    {job.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {job.errorSummary || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                  <a
                    href={job.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-800 hover:underline"
                  >
                    View Job
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredAndSortedJobs.length === 0 && (
        <div className="px-6 py-4 text-center text-gray-500">
          No jobs found matching the current filters.
        </div>
      )}
    </div>
  );
};

export default JobTable;