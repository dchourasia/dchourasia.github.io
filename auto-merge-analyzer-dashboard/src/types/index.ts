export interface WorkflowRun {
  id: number;
  name: string;
  status: 'completed' | 'failure' | 'in_progress' | 'cancelled';
  conclusion: 'success' | 'failure' | 'cancelled' | 'neutral' | 'skipped' | 'timed_out' | null;
  created_at: string;
  updated_at: string;
  html_url: string;
  jobs_url: string;
}

export interface Job {
  id: number;
  name: string;
  status: 'completed' | 'in_progress' | 'queued';
  conclusion: 'success' | 'failure' | 'cancelled' | 'neutral' | 'skipped' | 'timed_out' | null;
  started_at: string;
  completed_at: string;
  html_url: string;
  steps: JobStep[];
}

export interface JobStep {
  name: string;
  status: string;
  conclusion: string | null;
  number: number;
  started_at: string;
  completed_at: string;
}

export interface ProcessedJob {
  jobName: string;
  executionDate: string;
  jobUrl: string;
  status: string;
  errorSummary: string;
  workflowRunId: number;
}

export interface GitHubApiResponse<T> {
  total_count: number;
  workflow_runs?: T[];
  jobs?: T[];
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface FilterOptions {
  status?: string;
  jobName?: string;
  dateRange?: DateRange;
}

export interface FetchOptions {
  dateRange?: DateRange;
  jobStatus?: string;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}