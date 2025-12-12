# Platform Status Page

A custom status page implementation that monitors the health of all platform services using GitHub Actions.

## Overview

This status page checks the actual health endpoints of the application, not CI build status. It runs periodic health checks via GitHub Actions and displays the results on a simple HTML page.

## How It Works

1. **GitHub Actions Workflow** (`.github/workflows/check-status.yml`)
   - Runs every 5 minutes
   - Executes the health check script
   - Commits and pushes status updates

2. **Health Check Script** (`check-health.js`)
   - Checks all health endpoints defined in the services list
   - Stores individual service history in `history/{service-key}.json`
   - Creates a summary in `public/status.json`

3. **Status Page** (`public/index.html`)
   - Displays current status of all services
   - Auto-refreshes every minute
   - Shows response times and status codes

## Setup

### 1. Configure Base URL (Optional)

If your app URL is different from `https://app.chargingthefuture.com`, set it in the GitHub Actions workflow:

```yaml
env:
  BASE_URL: ${{ secrets.BASE_URL || 'https://your-app-url.com' }}
```

Or set it as a GitHub secret named `BASE_URL`.

### 2. Enable GitHub Pages

**Recommended: Use GitHub Actions (bypasses dropdown limitation)**

The repository includes a GitHub Actions workflow (`.github/workflows/deploy-status-pages.yml`) that automatically deploys the status page to GitHub Pages. This bypasses the dropdown limitation.

1. Go to your repository settings
2. Navigate to **Pages**
3. Under **Source**, select **GitHub Actions** (not "Deploy from a branch")
4. The workflow will automatically deploy when you push changes to `status/public/`

**Alternative: Manual branch deployment (if dropdown limitation exists)**

If you prefer to use branch deployment but the dropdown only shows `/` (root) and `/docs`:

1. Go to your repository settings → **Pages**
2. Set source to `Deploy from a branch`
3. Select branch: `main` (or your default branch)
4. **Important**: The folder dropdown may only show `/` (root) and `/docs` folders. This is a GitHub Pages limitation - it only shows folders with an `index.html` at their root level.
5. If the dropdown allows manual input, type `/status/public` in the folder field
6. If only a dropdown is available, use the GitHub Actions method above instead

**Using GitHub CLI** (alternative):
```bash
gh api repos/{owner}/{repo}/pages -X PUT -f source='{"branch":"main","path":"/status/public"}'
```

The status page will be available at: `https://{username}.github.io/{repo-name}/`

### 3. Initial Run

The workflow will run automatically every 5 minutes. You can also trigger it manually:

1. Go to Actions tab
2. Select "Check Service Status"
3. Click "Run workflow"

## Files Structure

```
status/
├── .github/
│   └── workflows/
│       └── check-status.yml    # GitHub Actions workflow
├── history/                     # Historical data (git-ignored or committed)
│   ├── main.json
│   ├── chatgroups.json
│   └── ...
├── public/                      # Public files (served by GitHub Pages)
│   ├── index.html              # Status page
│   └── status.json             # Current status summary
├── check-health.js             # Health check script
└── README.md                   # This file
```

## Health Endpoints

The script checks the following endpoints (based on your upptime config):

- `/api/health` - Main Platform
- `/api/health/chatgroups` - ChatGroups
- `/api/health/directory` - Directory
- `/api/health/gentlepulse` - GentlePulse
- `/api/health/chyme` - Chyme
- `/api/health/default-alive-or-dead` - Default Alive or Dead
- `/api/health/workforce-recruiter` - Workforce Recruiter
- `/api/health/lighthouse` - LightHouse
- `/api/health/lostmail` - LostMail
- `/api/health/mechanicmatch` - MechanicMatch
- `/api/health/research` - CompareNotes
- `/api/health/socketrelay` - SocketRelay
- `/api/health/supportmatch` - SupportMatch
- `/api/health/trusttransport` - TrustTransport

## Local Testing

You can test the health check script locally:

```bash
cd status
node check-health.js
```

Set a custom base URL:

```bash
BASE_URL=https://your-app-url.com node check-health.js
```

## Customization

### Change Check Interval

Edit `.github/workflows/check-status.yml`:

```yaml
schedule:
  - cron: '*/5 * * * *'  # Change to desired interval
```

### Add/Remove Services

Edit the `SERVICES` array in `check-health.js`:

```javascript
const SERVICES = [
  { name: 'Service Name', endpoint: '/api/health/service', key: 'service-key' },
  // ...
];
```

### Customize Status Page

Edit `public/index.html` to change the appearance, add features, or modify the layout.

## Notes

- The workflow commits status updates automatically
- History files are kept in the repository (last 1000 entries per service)
- The status page auto-refreshes every minute
- Failed health checks don't fail the workflow (exit code 1 is used but doesn't stop the workflow)
