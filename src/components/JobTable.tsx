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
  const [searchFilter, setSearchFilter] = useState('');
  const [jobNameFilter, setJobNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Get unique job names and statuses for dropdown options
  const uniqueJobNames = useMemo(() => {
    const names = Array.from(new Set(jobs.map(job => job.jobName))).sort();
    return names;
  }, [jobs]);

  const uniqueStatuses = useMemo(() => {
    const statuses = Array.from(new Set(jobs.map(job => job.status))).sort();
    return statuses;
  }, [jobs]);

  const filteredAndSortedJobs = useMemo(() => {
    let filtered = jobs;

    // Apply search filter
    if (searchFilter) {
      filtered = filtered.filter(job =>
        job.jobName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        job.status.toLowerCase().includes(searchFilter.toLowerCase()) ||
        job.errorSummary.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }

    // Apply job name filter
    if (jobNameFilter) {
      filtered = filtered.filter(job => job.jobName === jobNameFilter);
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(job => job.status === statusFilter);
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
  }, [jobs, searchFilter, jobNameFilter, statusFilter, sortField, sortDirection]);

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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Job Executions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Job Name Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Name
            </label>
            <select
              value={jobNameFilter}
              onChange={(e) => setJobNameFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Job Names</option>
              {uniqueJobNames.map((jobName) => (
                <option key={jobName} value={jobName}>
                  {jobName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(searchFilter || jobNameFilter || statusFilter) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchFilter('');
                setJobNameFilter('');
                setStatusFilter('');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Clear All Filters
            </button>
          </div>
        )}
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedJobs.map((job, index) => (
              <tr key={`${job.workflowRunId}-${job.jobName}-${index}`} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <a
                    href={job.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    {job.jobName}
                  </a>
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