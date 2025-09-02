import axios from 'axios';
import { WorkflowRun, Job, GitHubApiResponse, ProcessedJob, DateRange } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'opendatahub-io';
const REPO_NAME = 'odh-data-service-rhods';
const WORKFLOW_NAME = 'upstream-auto-merge';

class GitHubApiService {
  private token: string;
  private baseHeaders: Record<string, string>;

  constructor(token?: string) {
    // Check for environment variable first, then use provided token
    this.token = token || process.env.REACT_APP_GITHUB_TOKEN || '';
    
    this.baseHeaders = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    // Only add Authorization header if we have a token
    if (this.token) {
      this.baseHeaders['Authorization'] = `token ${this.token}`;
    }
  }

  private async makeRequest<T>(url: string): Promise<T> {
    try {
      const response = await axios.get(url, { headers: this.baseHeaders });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`GitHub API error: ${error.response?.status} - ${error.response?.statusText}`);
      }
      throw error;
    }
  }

  async getWorkflowRuns(dateRange?: DateRange, page = 1, perPage = 100): Promise<GitHubApiResponse<WorkflowRun>> {
    let url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_NAME}.yml/runs?page=${page}&per_page=${perPage}`;
    
    if (dateRange) {
      const createdQuery = `created:${dateRange.start.toISOString().split('T')[0]}..${dateRange.end.toISOString().split('T')[0]}`;
      url += `&created=${encodeURIComponent(createdQuery)}`;
    }

    return this.makeRequest<GitHubApiResponse<WorkflowRun>>(url);
  }

  async getJobsForRun(runId: number): Promise<GitHubApiResponse<Job>> {
    const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/${runId}/jobs`;
    return this.makeRequest<GitHubApiResponse<Job>>(url);
  }

  private extractJobName(fullJobName: string): string {
    const buildMatch = fullJobName.match(/build[^(]*\(([^)]+)\)/i);
    if (buildMatch) {
      return buildMatch[1].trim();
    }
    
    const simpleMatch = fullJobName.match(/build[\s-]*(.*)/i);
    if (simpleMatch) {
      return simpleMatch[1].trim() || fullJobName;
    }
    
    return fullJobName;
  }

  private getErrorSummary(job: Job): string {
    if (job.conclusion === 'success') return '';
    
    const failedSteps = job.steps?.filter(step => 
      step.conclusion === 'failure' || step.status === 'failure'
    ) || [];
    
    if (failedSteps.length > 0) {
      return failedSteps.map(step => step.name).join(', ');
    }
    
    return job.conclusion || 'Unknown error';
  }

  async getProcessedJobs(dateRange?: DateRange): Promise<ProcessedJob[]> {
    const workflowRuns = await this.getWorkflowRuns(dateRange);
    const processedJobs: ProcessedJob[] = [];

    for (const run of workflowRuns.workflow_runs || []) {
      try {
        const jobsResponse = await this.getJobsForRun(run.id);
        const buildJobs = (jobsResponse.jobs || []).filter(job => 
          job.name.toLowerCase().includes('build')
        );

        for (const job of buildJobs) {
          const processedJob: ProcessedJob = {
            jobName: this.extractJobName(job.name),
            executionDate: new Date(job.started_at).toLocaleDateString(),
            jobUrl: job.html_url,
            status: job.conclusion || job.status,
            errorSummary: this.getErrorSummary(job),
            workflowRunId: run.id,
          };
          processedJobs.push(processedJob);
        }
      } catch (error) {
        console.error(`Error fetching jobs for run ${run.id}:`, error);
      }
    }

    return processedJobs;
  }

  async getAllWorkflowData(dateRange?: DateRange): Promise<{
    workflowRuns: WorkflowRun[];
    processedJobs: ProcessedJob[];
  }> {
    const [workflowRunsResponse, processedJobs] = await Promise.all([
      this.getWorkflowRuns(dateRange),
      this.getProcessedJobs(dateRange)
    ]);

    return {
      workflowRuns: workflowRunsResponse.workflow_runs || [],
      processedJobs
    };
  }
}

export default GitHubApiService;