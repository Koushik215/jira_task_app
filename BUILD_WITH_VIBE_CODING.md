# Build Guide: Recreate This App With Vibe Coding

This guide explains how a third person can rebuild this application from scratch, even without prior knowledge of the project.

The goal is not just to copy files, but to understand the build order, feature breakdown, and implementation decisions so the app can be rebuilt confidently.

## 1. What this app does

This is an AI meeting intelligence web app.

It:

- accepts Microsoft Teams transcript JSON
- cleans and normalizes transcript text
- extracts explicit tasks using an LLM
- validates task data
- stores tasks in MySQL
- shows tasks in a frontend dashboard
- keeps a Jira integration module available
- allows pushing tasks to Jira, one by one or all at once

In the current version:

- frontend is React
- backend is FastAPI
- database is MySQL
- LLM provider is Groq
- Jira integration can be turned off with `JIRA_ENABLED=false`

## 2. Final app structure

The project is organized like this:

```text
backend/
  main.py
  routes/
  services/
  db/
  models/

frontend/
  src/
    components/
    lib/
```

Core files:

- backend entrypoint: `backend/main.py`
- API routes: `backend/routes/meeting_routes.py`
- transcript cleanup: `backend/services/nlp_engine.py`
- LLM extraction: `backend/services/llm_service.py`
- validation: `backend/services/validation.py`
- Jira integration: `backend/services/jira_service.py`
- DB logic: `backend/db/database.py`
- React app shell: `frontend/src/App.jsx`
- frontend API client: `frontend/src/lib/api.js`
- action board UI: `frontend/src/components/TaskBoard.jsx`

## 3. Product requirements you should start with

Before coding, define the product in plain language:

### Input

Microsoft Teams transcript JSON:

```json
{
  "value": [
    {
      "speaker": "John",
      "text": "We need to finish API by Friday",
      "startTime": "00:01:10"
    }
  ]
}
```

### Output

Extracted tasks such as:

```json
{
  "tasks": [
    {
      "task": "Finish API",
      "owner": "John",
      "priority": "High",
      "deadline": "2026-04-03"
    }
  ]
}
```

### Frontend requirements

- upload transcript
- show current transcript tasks
- show previous tasks separately
- show timeline
- allow one-click Jira push per task
- allow Add All to Jira

### Backend requirements

- clean transcript
- run LLM extraction
- validate fields
- normalize priorities and dates
- deduplicate tasks
- store tasks in DB
- support Jira integration

## 4. Step-by-step build order

Build this app in the following order.

Do not start with deployment.
Do not start with Jira.
Start with the local happy path.

### Step 1: Create backend skeleton

Create:

- `backend/main.py`
- `backend/routes/meeting_routes.py`
- `backend/services/`
- `backend/models/schemas.py`
- `backend/db/database.py`

Install:

- FastAPI
- Uvicorn
- mysql-connector-python
- Groq SDK
- Requests
- Pydantic

At this point, only create:

- `/health`
- empty `/process-meeting`
- empty `/dashboard-data`

### Step 2: Create transcript schemas

In `backend/models/schemas.py`, define:

- transcript payload schema
- extracted task schema
- Jira push request schema
- dashboard response schema

This keeps request/response contracts stable before business logic is added.

### Step 3: Build the NLP cleaning layer

Create `backend/services/nlp_engine.py`.

It should:

- remove filler words like `uh`, `um`
- normalize whitespace
- fix missing speakers by using `Unknown`
- preserve timestamps
- clean sentence formatting

At this stage, do not use the LLM yet.

Input:

```json
{"speaker":"John","text":"um we need to finish API by Friday","startTime":"00:01:10"}
```

Output:

```json
{"speaker":"John","text":"We need to finish API by Friday.","timestamp":"00:01:10"}
```

### Step 4: Build the LLM extraction layer

Create `backend/services/llm_service.py`.

This service should:

- accept cleaned transcript entries
- send them to Groq
- ask for strict JSON output only
- extract only explicit tasks

Important prompt rules:

- do not hallucinate
- use strict JSON only
- unknown fields should be `null`

Also add a fallback extractor when `GROQ_API_KEY` is missing so local dev still works.

### Step 5: Build validation and normalization

Create `backend/services/validation.py`.

This should:

- normalize priorities
- normalize dates
- remove duplicates
- skip invalid or empty tasks

Rules:

- `urgent` -> `High`
- `critical` -> `High`
- same `task + owner` = duplicate

### Step 6: Build user mapping

Create `backend/services/user_mapping.py`.

This module:

- normalizes owner names
- maps names to Jira account IDs
- falls back to `DEFAULT_USER`

Keep this static at first.

### Step 7: Build database layer

Create `backend/db/database.py`.

Use MySQL.

Add:

- DB connection helper
- startup initialization
- create `meetings` table
- create `tasks` table
- insert meeting
- insert tasks
- update Jira status
- fetch historical tasks

Make it compatible with hosted MySQL like Railway by:

- connecting to the configured database directly
- only attempting to create the database if it is actually missing

### Step 8: Build the API routes

In `backend/routes/meeting_routes.py`, implement:

#### `POST /process-meeting`

Pipeline:

1. validate request
2. clean transcript
3. extract tasks with Groq
4. validate tasks
5. store meeting and tasks
6. return tasks + cleaned transcript

#### `POST /push-to-jira`

Pipeline:

1. accept selected tasks
2. map users
3. call Jira service
4. update task statuses in DB
5. return result list

#### `GET /dashboard-data`

Return:

- all stored tasks
- summary counts

### Step 9: Build Jira integration module

Create `backend/services/jira_service.py`.

This module should:

- build Jira issue payloads
- send requests to Jira REST API
- retry on failure
- support rate limits

Important:

Keep the module in the codebase even if Jira is temporarily disabled.

Use:

- `JIRA_ENABLED=false`

When disabled:

- do not call real Jira
- return `not_connected`
- still allow the UI to display the module

### Step 10: Create frontend skeleton

Create the React app with Vite.

Build:

- `frontend/src/App.jsx`
- `frontend/src/lib/api.js`
- `frontend/src/components/UploadPanel.jsx`
- `frontend/src/components/TaskBoard.jsx`
- `frontend/src/components/TimelinePanel.jsx`
- `frontend/src/components/SummaryCharts.jsx`

### Step 11: Build upload flow

`UploadPanel.jsx` should:

- accept a JSON file
- allow manual JSON paste
- validate JSON
- call `/process-meeting`

### Step 12: Build task board UI

The action board should show:

- Task
- Owner
- Priority
- Deadline
- Jira status
- action button

Important UX rule:

Current transcript tasks and historical tasks must not be mixed.

So implement two tabs:

- `Current Transcript`
- `Previous Tasks`

### Step 13: Add Jira buttons in the action board

Current transcript tab:

- each task row gets `Add to Jira`
- top section gets `Add All to Jira`

Historical tab:

- tasks are read-only
- no Jira action button there

### Step 14: Build timeline panel

Show cleaned transcript entries in timestamp order:

- speaker
- timestamp
- cleaned text

### Step 15: Build summary chart

Show backend summary counts:

- created
- pending
- failed
- not connected

### Step 16: Connect frontend to backend

Create `frontend/src/lib/api.js`.

It should call:

- `/process-meeting`
- `/push-to-jira`
- `/dashboard-data`

Use:

- local backend URL in development
- deployed backend URL through `VITE_API_BASE` in production

### Step 17: Separate current tasks from historical tasks

Do not store everything in one frontend state bucket.

Use separate state:

- `currentTasks`
- `historicalTasks`

Why:

- newly uploaded transcript tasks should appear immediately
- previous tasks should remain available as history
- action board should stay clear

### Step 18: Add deployment support

For backend:

- Dockerfile inside `backend/`

For frontend:

- standard React static site build on Render

For database:

- Railway MySQL or another hosted MySQL

### Step 19: Make the backend deployment-safe

When deploying backend-only to Render:

- imports must be local package imports
- do not use `from backend...`
- use `from db...`, `from routes...`, `from services...`

This is critical when `backend` is the service root.

### Step 20: Make hosted MySQL work

For Railway or hosted MySQL:

- do not use internal-only hostnames from another platform
- do not use `localhost`
- use public host and public port when connecting from Render

Example:

- host: `mainline.proxy.rlwy.net`
- port: external TCP proxy port

## 5. Suggested implementation prompts for vibe coding

If using an AI assistant to build this app, use prompts in small phases.

### Prompt 1: backend foundation

```text
Create a FastAPI backend with modular folders for routes, services, models, and db. Add a /health endpoint and Pydantic schemas for transcript input and extracted task output.
```

### Prompt 2: NLP layer

```text
Implement a transcript cleaning service that removes filler words, preserves timestamps, fills missing speakers with Unknown, and returns normalized transcript entries.
```

### Prompt 3: Groq integration

```text
Create a Groq-based task extraction service that accepts cleaned transcript entries and returns strict JSON with tasks, owners, priorities, deadlines, and timestamps. Add fallback extraction when no API key is configured.
```

### Prompt 4: validation

```text
Implement task validation that normalizes priorities and deadlines, removes duplicates by task plus owner, and skips invalid items.
```

### Prompt 5: MySQL layer

```text
Add a MySQL database layer that stores meetings and tasks, initializes tables on startup, and supports hosted MySQL environments like Railway.
```

### Prompt 6: API routes

```text
Wire POST /process-meeting, POST /push-to-jira, and GET /dashboard-data using the service pipeline.
```

### Prompt 7: React UI

```text
Build a React dashboard with transcript upload, action board, timeline, and summary chart. Keep current transcript tasks and previous tasks in separate tabs.
```

### Prompt 8: Jira action UX

```text
Update the action board so each current task has an Add to Jira button and the board header has an Add All to Jira button.
```

### Prompt 9: deployment readiness

```text
Prepare the backend for deployment as a Render web service using the backend folder as the service root, and make frontend API base configurable with VITE_API_BASE.
```

## 6. Local development order

When rebuilding, use this order:

1. backend health endpoint
2. transcript cleaning
3. Groq extraction
4. validation
5. MySQL storage
6. dashboard API
7. frontend upload
8. current tasks tab
9. historical tasks tab
10. Jira buttons
11. deployment

## 7. Common mistakes to avoid

### Mixing current and historical tasks

Do not use one state array for both.

### Making Jira mandatory during early development

Keep the module present, but allow `JIRA_ENABLED=false`.

### Using wrong database host in production

Do not use:

- `localhost`
- `127.0.0.1`
- internal hostnames from another hosting provider

### Using repo-root imports in backend-only deploy

Avoid:

```python
from backend.db.database import init_db
```

Use:

```python
from db.database import init_db
```

## 8. Final outcome

If built correctly, the app should:

- accept transcript JSON
- extract and validate explicit tasks
- store them in MySQL
- display current tasks in one tab
- display historical tasks in another tab
- allow Add to Jira per task
- allow Add All to Jira
- run locally
- deploy with frontend and backend on Render and MySQL on Railway

## 9. Optional future improvements

After rebuilding the current version, next improvements can be:

- authentication
- meeting grouping in history
- better date parsing
- richer owner mapping
- editable task review before pushing to Jira
- Jira project selection in UI
- audit logs for pushes
