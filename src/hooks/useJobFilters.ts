import { useState, useMemo } from 'react';
import { ProcessedJob } from '../types';

export const useJobFilters = (jobs: ProcessedJob[]) => {
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

  // Apply all filters
  const filteredJobs = useMemo(() => {
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

    return filtered;
  }, [jobs, searchFilter, jobNameFilter, statusFilter]);

  const clearFilters = () => {
    setSearchFilter('');
    setJobNameFilter('');
    setStatusFilter('');
  };

  const hasActiveFilters = searchFilter || jobNameFilter || statusFilter;

  return {
    // Filter states
    searchFilter,
    setSearchFilter,
    jobNameFilter,
    setJobNameFilter,
    statusFilter,
    setStatusFilter,
    
    // Filter options
    uniqueJobNames,
    uniqueStatuses,
    
    // Filtered data
    filteredJobs,
    
    // Filter controls
    clearFilters,
    hasActiveFilters,
  };
};