# Setup Guide: Connecting Kiro with ServiceNow & GitHub

## Prerequisites
- [ ] ServiceNow PDI instance (Personal Developer Instance)
- [ ] GitHub account
- [ ] Kiro IDE installed and running

## Step 1: Get Your ServiceNow PDI Instance

If you don't have a PDI yet:
1. Go to https://developer.servicenow.com/
2. Sign up or log in
3. Request a Personal Developer Instance (PDI)
4. Note down your instance URL (e.g., `https://dev12345.service-now.com`)

## Step 2: Set Up GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named: `servicenow-sprint-pointing`
3. Keep it private (for now)
4. Don't initialize with README (we already have one)
5. Copy the repository URL

## Step 3: Initialize Git in Your Project

Run these commands in your terminal:

```bash
git init
git add .
git commit -m "Initial commit: Sprint Pointing App setup"
git branch -M main
git remote add origin [YOUR_GITHUB_REPO_URL]
git push -u origin main
```

## Step 4: Configure ServiceNow Connection in Kiro

We'll use ServiceNow's REST API to interact with your instance.

### Create a ServiceNow Integration User (Recommended)
1. Log into your PDI instance
2. Navigate to: User Administration > Users
3. Create a new user for API access
4. Assign roles: `admin` (for development)
5. Set a password you'll remember

### Store Credentials Securely
Create a `.env` file (already in .gitignore):

```
SERVICENOW_INSTANCE=dev12345.service-now.com
SERVICENOW_USERNAME=your_username
SERVICENOW_PASSWORD=your_password
```

## Step 5: Test ServiceNow Connection

We'll create a simple test script to verify connectivity.

## Next Steps
Once setup is complete, we'll move to Phase 1: Data Model Design
