import React from 'react';

interface FilterControlsProps {
  searchFilter: string;
  setSearchFilter: (value: string) => void;
  jobNameFilter: string;
  setJobNameFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  uniqueJobNames: string[];
  uniqueStatuses: string[];
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  searchFilter,
  setSearchFilter,
  jobNameFilter,
  setJobNameFilter,
  statusFilter,
  setStatusFilter,
  uniqueJobNames,
  uniqueStatuses,
  clearFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
      
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
      {hasActiveFilters && (
        <div className="mt-4">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterControls;