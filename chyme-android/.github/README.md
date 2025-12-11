# GitHub Distribution Setup

This directory contains the GitHub Actions workflow for automatically building and releasing APKs.

## Quick Start

1. **Add GitHub Secrets** (Settings → Secrets and variables → Actions):
   - `CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
   - `PLATFORM_API_BASE_URL`: Your platform API URL

2. **Create a Release**:
   - Go to Releases → Create a new release
   - Choose a tag (e.g., `v1.0.0`)
   - Publish the release
   - The workflow will automatically build and attach the APK

3. **Users can download** the APK from the Releases page

## Workflow Details

The workflow (`build-and-release.yml`) will:
- Build the release APK when you create a new release
- Use GitHub Secrets for configuration (no need to commit secrets)
- Automatically attach the APK to the release
- Can also be triggered manually via "Run workflow"

For more details, see [docs/DISTRIBUTION.md](../docs/DISTRIBUTION.md).

