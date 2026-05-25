# Workflow Analyzer Dashboard

A React.js web application for analyzing GitHub workflow executions, specifically designed for the Red Hat Data Services "upstream-auto-merge" workflow.

## Features

- **Workflow Analysis**: Analyze matrix-based GitHub workflow executions
- **Job Filtering**: Filter jobs starting with "build" and extract job names from complex titles
- **Interactive Data Visualization**: 
  - Sortable and filterable job execution table
  - Pie charts for status distribution
  - Bar charts for job execution trends
  - Timeline analysis
- **Date Range Selection**: Custom date range filtering for historical data
- **Real-time Data**: Fetch live data from GitHub API
- **Responsive Design**: Mobile-friendly interface

## Prerequisites

- Node.js (version 18 or higher)
- GitHub Personal Access Token with `repo` and `actions:read` permissions

## Installation

1. Clone the repository:
```bash
git clone https://github.com/dchourasia/Workflow-Analyzer-App.git
cd Workflow-Analyzer-App
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

1. **GitHub Token Setup**: On first launch, enter your GitHub Personal Access Token
2. **Date Range Selection**: Choose the date range for workflow analysis
3. **Fetch Data**: Click "Fetch Workflow Data" to load job execution information
4. **View Results**: 
   - Use the "Job Table" tab to view detailed execution data
   - Use the "Charts & Analytics" tab for visual analysis

## Configuration

The application is configured to analyze the following workflow:
- **Repository**: `red-hat-data-services/rhods-devops-infra`
- **Workflow**: `upstream-auto-merge.yaml`

To analyze different workflows, modify the constants in `src/services/githubApi.ts`:
```typescript
const REPO_OWNER = 'your-org';
const REPO_NAME = 'your-repo';
const WORKFLOW_NAME = 'your-workflow';
```

## Deployment

The application is automatically deployed to GitHub Pages when changes are pushed to the main branch using GitHub Actions.

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to GitHub Pages or your preferred hosting service.

## Available Scripts

### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### `npm test`
Launches the test runner in interactive watch mode

### `npm run build`
Builds the app for production to the `build` folder

## GitHub API Rate Limiting

The application respects GitHub API rate limits. For authenticated requests, you have 5,000 requests per hour. The app includes error handling for rate limit scenarios.

## Technical Stack

- **Frontend**: React.js with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Deployment**: GitHub Pages with GitHub Actions
