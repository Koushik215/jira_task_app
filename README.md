# AI Meeting Intelligence Dashboard

Full-stack app that ingests Microsoft Teams transcript JSON, extracts explicit action items with Groq, validates them, creates Jira issues, stores results in MySQL, and renders a React dashboard.

## Stack

- Backend: FastAPI, MySQL, Groq API, Requests
- Frontend: React, Vite, Tailwind CSS, Recharts

## Run backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn backend.main:app --reload --app-dir ..
```

## Run frontend

```powershell
cd frontend
npm install
npm run dev
```

Set `VITE_API_BASE=http://localhost:8000` if the API runs on another origin.

## Run with Docker Compose

```powershell
docker compose up --build
```

## Environment

- `GROQ_API_KEY`
- `JIRA_EMAIL`
- `JIRA_API_TOKEN`
- `JIRA_URL`
- `JIRA_ENABLED`
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`
- `JIRA_PROJECT_KEY`
- `DEFAULT_USER`
- `GROQ_MODEL`

## Core endpoints

1. `POST /process-meeting`
2. `POST /push-to-jira`
3. `GET /dashboard-data`

## Notes

- If `GROQ_API_KEY` is not configured, the backend falls back to deterministic extraction so the flow still works locally.
- Unknown owners are mapped to `DEFAULT_USER`.
- Jira creation retries three times and respects `429 Retry-After` responses.
- `docker compose up --build` starts three services: `mysql`, `backend`, and the React `frontend`.
- When `JIRA_ENABLED=false`, the Jira module stays present but offline, and extracted tasks are still shown in the frontend.
