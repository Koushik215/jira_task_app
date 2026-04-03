# Deploy Guide: Render + Railway

This document explains how to deploy this application from scratch using:

- Render for the frontend
- Render for the backend
- Railway for the MySQL database

It is written for someone who has never seen this project before.

## 1. What this app contains

This project has two deployable parts:

- `frontend/` = React app
- `backend/` = FastAPI app

The backend requires:

- a Groq API key
- a MySQL database

In this setup:

- frontend is hosted on Render as a `Static Site`
- backend is hosted on Render as a `Web Service`
- database is hosted on Railway as MySQL

## 2. Before you start

You need:

- a GitHub repo containing this project
- a Render account
- a Railway account
- a Groq API key

## 3. Deploy the MySQL database on Railway

### 3.1 Create the Railway project

1. Log in to Railway.
2. Click `New Project`.
3. Choose `Provision MySQL`.
4. Wait for Railway to create the database.

### 3.2 Copy the database connection values

After MySQL is created, open the Railway MySQL service and collect:

- `MYSQLHOST` or public host
- `MYSQLPORT` or public port
- `MYSQLUSER`
- `MYSQLPASSWORD`
- `MYSQLDATABASE`

Important:

- If you are connecting from Render, do not use `*.railway.internal`
- Use Railway `Public Networking`

Example public networking values:

- host: `mainline.proxy.rlwy.net`
- port: `41351`

Use the public host and public port only.

## 4. Deploy the backend on Render

### 4.1 Create the service

1. Log in to Render.
2. Click `New +`.
3. Click `Web Service`.
4. Connect your GitHub account if needed.
5. Select the GitHub repo for this project.

### 4.2 Fill the Render backend service form

Use these values:

- Name: `jira-task-app-backend` or any name you want
- Branch: `main`
- Root Directory: `backend`
- Environment: `Docker`
- Dockerfile Path: `Dockerfile`
- Region: choose the closest region to your users
- Instance Type: `Starter` is enough to begin

### 4.3 Add backend environment variables

In the Render backend service, add these environment variables:

- `GROQ_API_KEY` = your Groq API key
- `GROQ_MODEL` = `llama-3.1-8b-instant`
- `JIRA_ENABLED` = `false`
- `JIRA_EMAIL` = leave blank for now
- `JIRA_API_TOKEN` = leave blank for now
- `JIRA_URL` = leave blank for now
- `JIRA_PROJECT_KEY` = `AIM`
- `DEFAULT_USER` = `accountId_default`

Database values from Railway:

- `MYSQL_HOST` = Railway public host
- `MYSQL_PORT` = Railway public port
- `MYSQL_USER` = Railway username
- `MYSQL_PASSWORD` = Railway password
- `MYSQL_DATABASE` = Railway database name

Example:

```text
MYSQL_HOST=mainline.proxy.rlwy.net
MYSQL_PORT=41351
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=railway
```

### 4.4 Set the health check

Set:

- Health Check Path: `/health`

### 4.5 Deploy the backend

1. Click `Create Web Service`.
2. Wait for the deployment to finish.
3. Open the backend URL and test:

```text
https://your-backend-service.onrender.com/health
```

Expected response:

```json
{"status":"ok"}
```

If backend deployment fails:

- check that Railway public host and port are correct
- check all MySQL credentials
- check Groq API key exists

## 5. Deploy the frontend on Render

### 5.1 Create the frontend service

1. In Render, click `New +`.
2. Click `Static Site`.
3. Select the same GitHub repo.

### 5.2 Fill the Render frontend form

Use these values:

- Name: `jira-task-app-frontend` or any name you want
- Branch: `main`
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

### 5.3 Add the frontend environment variable

Add:

- `VITE_API_BASE` = your backend Render URL

Example:

```text
VITE_API_BASE=https://jira-task-app-6.onrender.com
```

### 5.4 Deploy the frontend

1. Click `Create Static Site`.
2. Wait for deployment to finish.
3. Open the frontend Render URL in your browser.

## 6. How frontend and backend connect

The frontend calls the backend using:

- `VITE_API_BASE`

The backend connects to Railway using:

- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`

## 7. How to update the application later

### 7.1 Update code

1. Make changes locally.
2. Commit them.
3. Push to GitHub.

### 7.2 Redeploy

If auto deploy is enabled in Render:

- frontend and backend will redeploy automatically after push

If auto deploy is not enabled:

1. Open the Render service
2. Click `Manual Deploy`
3. Click `Deploy latest commit`

## 8. Common problems and fixes

### Problem: backend says `No module named backend`

Cause:

- old code or old commit was deployed

Fix:

- push the latest code
- redeploy the backend

### Problem: backend says `Unknown MySQL server host 'mysql.railway.internal'`

Cause:

- using Railway private hostname from Render

Fix:

- use Railway `Public Networking` host and port

### Problem: frontend loads but API calls fail

Cause:

- wrong `VITE_API_BASE`

Fix:

- set `VITE_API_BASE` to the backend Render URL
- redeploy the frontend

### Problem: backend health check fails

Cause:

- bad database credentials
- missing Groq API key
- invalid MySQL host or port

Fix:

- review all backend env vars carefully

## 9. Required deployment values checklist

### Backend on Render

- `GROQ_API_KEY`
- `GROQ_MODEL`
- `JIRA_ENABLED`
- `JIRA_PROJECT_KEY`
- `DEFAULT_USER`
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`

### Frontend on Render

- `VITE_API_BASE`

### Railway MySQL

- public host
- public port
- username
- password
- database name

## 10. Final deployment order

Use this order every time from scratch:

1. Create Railway MySQL
2. Copy Railway public connection values
3. Create Render backend service
4. Add backend env vars
5. Deploy backend
6. Confirm `/health` works
7. Create Render frontend static site
8. Set `VITE_API_BASE` to backend URL
9. Deploy frontend
10. Open frontend URL and test the app
