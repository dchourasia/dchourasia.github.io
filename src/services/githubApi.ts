import axios from 'axios';
import { WorkflowRun, Job, GitHubApiResponse, ProcessedJob, DateRange } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'red-hat-data-services';
const REPO_NAME = 'rhods-devops-infra';
const WORKFLOW_NAME = 'upstream-auto-merge';

class GitHubApiService {
  private token: string;
  private baseHeaders: Record<string, string>;

  constructor(token?: string) {
    // Check for environment variable first, then use provided token
    this.token = token || process.env.REACT_APP_GITHUB_TOKEN || '';
    
    console.log('GitHubApiService initialized with:', {
      providedToken: !!token,
      envToken: !!process.env.REACT_APP_GITHUB_TOKEN,
      finalToken: !!this.token,
      tokenLength: this.token.length
    });
    
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
      console.log('Making request to:', url);
      console.log('Headers:', this.baseHeaders);
      console.log('Token available:', !!this.token);
      
      const response = await axios.get(url, { headers: this.baseHeaders });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('GitHub API Error Details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: url,
          headers: this.baseHeaders
        });
        throw new Error(`GitHub API error: ${error.response?.status} - ${error.response?.statusText || 'Unknown error'}`);
      }
      throw error;
    }
  }

  async getWorkflowRuns(dateRange?: DateRange, page = 1, perPage = 100): Promise<GitHubApiResponse<WorkflowRun>> {
    let url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_NAME}.yaml/runs?page=${page}&per_page=${perPage}`;
    
    if (dateRange) {
      // GitHub API expects ISO format: YYYY-MM-DDTHH:MM:SSZ
      const startDate = dateRange.start.toISOString();
      const endDate = dateRange.end.toISOString();
      
      // Use created parameter with proper format: >=start_date <=end_date
      url += `&created=${encodeURIComponent(`>=${startDate} <=${endDate}`)}`;
      
      console.log('Date range query:', {
        start: startDate,
        end: endDate,
        query: `>=${startDate} <=${endDate}`
      });
    }
    
    console.log('Fetching workflow runs from:', url);

    const result = await this.makeRequest<GitHubApiResponse<WorkflowRun>>(url);
    console.log('Workflow runs response:', {
      total_count: result.total_count,
      runs_count: result.workflow_runs?.length,
      first_run: result.workflow_runs?.[0],
      date_range: dateRange ? {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      } : 'no filter'
    });
    
    return result;
  }

  async getJobsForRun(runId: number): Promise<GitHubApiResponse<Job>> {
    const url = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs/${runId}/jobs`;
    return this.makeRequest<GitHubApiResponse<Job>>(url);
  }

  private extractJobName(fullJobName: string): string {
    console.log('Extracting job name from:', fullJobName);
    
    // Pattern 1: Matrix jobs with parentheses - e.g., "build (python-3.9, ubuntu-latest)"
    const matrixMatch = fullJobName.match(/^[^(]*\(([^)]+)\)/);
    if (matrixMatch) {
      const extracted = matrixMatch[1].trim();
      console.log('Matrix pattern match:', extracted);
      return extracted;
    }
    
    // Pattern 2: Build jobs with specific format - e.g., "build-component-name"
    const buildMatch = fullJobName.match(/^build[-_](.+)/i);
    if (buildMatch) {
      const extracted = buildMatch[1].trim();
      console.log('Build pattern match:', extracted);
      return extracted;
    }
    
    // Pattern 3: Jobs with "build" keyword - e.g., "Build Container Image"
    const buildKeywordMatch = fullJobName.match(/build\s+(.+)/i);
    if (buildKeywordMatch) {
      const extracted = buildKeywordMatch[1].trim();
      console.log('Build keyword match:', extracted);
      return extracted;
    }
    
    // Pattern 4: Jobs that contain "build" anywhere
    if (fullJobName.toLowerCase().includes('build')) {
      // Remove common prefixes and suffixes
      let extracted = fullJobName
        .replace(/^(job_|task_|step_)/i, '')
        .replace(/(_job|_task|_step)$/i, '')
        .trim();
      console.log('Contains build match:', extracted);
      return extracted;
    }
    
    // Pattern 5: Matrix strategy jobs - e.g., "test (3.9, ubuntu-latest)" 
    const generalMatrixMatch = fullJobName.match(/^([^(]+)\s*\(([^)]+)\)/);
    if (generalMatrixMatch) {
      const jobType = generalMatrixMatch[1].trim();
      const matrixVars = generalMatrixMatch[2].trim();
      const extracted = `${jobType} (${matrixVars})`;
      console.log('General matrix match:', extracted);
      return extracted;
    }
    
    console.log('No pattern match, using original:', fullJobName);
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

    console.log(`Processing ${workflowRuns.workflow_runs?.length || 0} workflow runs`);

    // Process runs in smaller batches to avoid overwhelming the API
    const runs = workflowRuns.workflow_runs || [];
    const batchSize = 5; // Process 5 runs at a time
    
    for (let i = 0; i < runs.length; i += batchSize) {
      const batch = runs.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(runs.length/batchSize)}`);
      
      const batchPromises = batch.map(async (run) => {
        try {
          const jobsResponse = await this.getJobsForRun(run.id);
          console.log(`Run ${run.id}: Found ${jobsResponse.jobs?.length || 0} total jobs`);
          
          const allJobs = jobsResponse.jobs || [];
          
          // Log job names only for first few runs to avoid console spam
          if (i < 10) {
            console.log('All job names:', allJobs.map(j => j.name));
          }
          
          // Filter jobs based on various patterns (not just "build")
          const relevantJobs = allJobs.filter(job => {
            const jobName = job.name.toLowerCase();
            return (
              jobName.includes('build') ||
              jobName.includes('test') ||
              jobName.includes('deploy') ||
              jobName.includes('lint') ||
              jobName.includes('check') ||
              jobName.includes('validate') ||
              jobName.match(/\([^)]+\)/) || // Matrix jobs with parentheses
              jobName.includes('matrix') ||
              jobName.includes('strategy')
            );
          });
          
          if (i < 10) {
            console.log(`Filtered to ${relevantJobs.length} relevant jobs:`, relevantJobs.map(j => j.name));
          }

          return relevantJobs.map(job => ({
            jobName: this.extractJobName(job.name),
            executionDate: new Date(job.started_at).toLocaleDateString(),
            jobUrl: job.html_url,
            status: job.conclusion || job.status,
            errorSummary: this.getErrorSummary(job),
            workflowRunId: run.id,
          }));
        } catch (error) {
          console.error(`Error fetching jobs for run ${run.id}:`, error);
          return [];
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(jobs => processedJobs.push(...jobs));
      
      // Small delay between batches to be respectful to the API
      if (i + batchSize < runs.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Final processed jobs count: ${processedJobs.length}`);
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