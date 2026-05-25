import React from 'react';
import { DateRange } from '../types';
import { formatDate } from '../utils/dateUtils';

interface DateRangePickerProps {
  dateRange: DateRange;
  onChange: (dateRange: DateRange) => void;
  jobStatusFilter: string;
  onJobStatusChange: (status: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ dateRange, onChange, jobStatusFilter, onJobStatusChange }) => {
  const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = new Date(event.target.value);
    onChange({ ...dateRange, start: newStart });
  };

  const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = new Date(event.target.value);
    onChange({ ...dateRange, end: newEnd });
  };

  const handlePresetChange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onChange({ start, end });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Fetch Options</h3>
      
      <div className="space-y-4">
        <div className="space-y-4">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={formatDate(dateRange.start)}
              onChange={handleStartDateChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              value={formatDate(dateRange.end)}
              onChange={handleEndDateChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="job-status" className="block text-sm font-medium text-gray-700 mb-1">
            Job Status (Server Filter)
          </label>
          <select
            id="job-status"
            value={jobStatusFilter}
            onChange={(e) => onJobStatusChange(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Job Statuses</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="cancelled">Cancelled</option>
            <option value="in_progress">In Progress</option>
            <option value="queued">Queued</option>
            <option value="neutral">Neutral</option>
            <option value="skipped">Skipped</option>
            <option value="timed_out">Timed Out</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Filter individual jobs by status during data fetch
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Select
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePresetChange(7)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Last 7 days
            </button>
            <button
              onClick={() => handlePresetChange(30)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Last 30 days
            </button>
            <button
              onClick={() => handlePresetChange(90)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Last 90 days
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;