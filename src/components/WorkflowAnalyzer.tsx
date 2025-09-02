import React, { useState, useEffect } from 'react';
import GitHubApiService from '../services/githubApi';
import { ProcessedJob, DateRange } from '../types';
import { getDefaultDateRange } from '../utils/dateUtils';
import { useJobFilters } from '../hooks/useJobFilters';
import JobTable from './JobTable';
import Charts from './Charts';
import DateRangePicker from './DateRangePicker';
import FilterControls from './FilterControls';

const WorkflowAnalyzer: React.FC = () => {
  const [jobs, setJobs] = useState<ProcessedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange(30));
  const [githubToken, setGithubToken] = useState<string>('');
  const [apiService, setApiService] = useState<GitHubApiService | null>(null);
  const [activeTab, setActiveTab] = useState<'table' | 'charts'>('table');

  // Use shared filtering logic
  const filterControls = useJobFilters(jobs);

  useEffect(() => {
    // Try to initialize with environment token first
    const envToken = process.env.REACT_APP_GITHUB_TOKEN;
    if (envToken) {
      setApiService(new GitHubApiService(envToken));
      setGithubToken('Environment Token');
      return;
    }
    
    // Fall back to saved token
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
      setGithubToken(savedToken);
      setApiService(new GitHubApiService(savedToken));
    } else {
      // Initialize with no token for public repos
      setApiService(new GitHubApiService());
    }
  }, []);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (githubToken.trim()) {
      localStorage.setItem('github_token', githubToken);
      setApiService(new GitHubApiService(githubToken));
      setError(null);
    }
  };

  const fetchData = async () => {
    if (!apiService) {
      setError('API service not initialized');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiService.getProcessedJobs(dateRange);
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  const clearToken = () => {
    localStorage.removeItem('github_token');
    setGithubToken('');
    setApiService(null);
    setJobs([]);
  };

  // Show token input only if no environment token and no API service
  if (!apiService && !process.env.REACT_APP_GITHUB_TOKEN) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white shadow rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            GitHub Workflow Analyzer
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Enter your GitHub token to access workflow data, or try without a token for public repositories.
          </p>
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                GitHub Personal Access Token (Optional)
              </label>
              <input
                type="password"
                id="token"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-2 text-sm text-gray-500">
                Token needs 'repo' and 'actions:read' permissions. Leave empty to try without authentication.
              </p>
            </div>
            <div className="space-y-2">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Connect with Token
              </button>
              <button
                type="button"
                onClick={() => setApiService(new GitHubApiService())}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Without Token
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Workflow Analyzer Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {process.env.REACT_APP_GITHUB_TOKEN 
                  ? 'Using environment token' 
                  : githubToken 
                    ? `Connected: ${githubToken.slice(0, 10)}...` 
                    : 'No authentication'
                }
              </span>
              {!process.env.REACT_APP_GITHUB_TOKEN && (
                <button
                  onClick={clearToken}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  {githubToken ? 'Disconnect' : 'Add Token'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <DateRangePicker dateRange={dateRange} onChange={handleDateRangeChange} />
            
            <div className="mt-6">
              <button
                onClick={fetchData}
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Fetch Workflow Data'}
              </button>
            </div>

            {jobs.length > 0 && (
              <div className="mt-6 bg-white shadow rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Summary</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Total Jobs: {jobs.length}</div>
                  <div>Success: {jobs.filter(j => j.status === 'success').length}</div>
                  <div>Failures: {jobs.filter(j => j.status === 'failure').length}</div>
                  <div>Other: {jobs.filter(j => !['success', 'failure'].includes(j.status)).length}</div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-3">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {jobs.length > 0 && (
              <>
                {/* Filter Controls */}
                <FilterControls {...filterControls} />

                {/* Tab Navigation */}
                <div className="mb-6">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      <button
                        onClick={() => setActiveTab('table')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'table'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Job Table ({filterControls.filteredJobs.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('charts')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                          activeTab === 'charts'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        Charts & Analytics ({filterControls.filteredJobs.length})
                      </button>
                    </nav>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'table' && <JobTable jobs={filterControls.filteredJobs} loading={loading} />}
            {activeTab === 'charts' && <Charts jobs={filterControls.filteredJobs} />}

            {!loading && jobs.length === 0 && (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Data</h3>
                <p className="text-gray-500">
                  Click "Fetch Workflow Data" to load job execution information.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowAnalyzer;