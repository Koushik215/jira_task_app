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
Copy-Item ..\.env.example ..\.env
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
Copy-Item .env.example .env
docker compose up --build
```

## Deploy On A Single GCP Compute Engine VM

Use the production compose stack instead of the local dev stack.

1. Create an Ubuntu VM in GCP and SSH into it.
2. Install Docker Engine and the Docker Compose plugin.
3. Copy this repo to the VM.
4. Create the production env file:

```bash
cp .env.gcp.example .env.gcp
```

5. Edit `.env.gcp` and set your real values, especially:

```env
GROQ_API_KEY=your_groq_key
MYSQL_PASSWORD=strong_password
MYSQL_ROOT_PASSWORD=strong_root_password
JIRA_ENABLED=false
```

6. Start the production stack:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.gcp up --build -d
```

7. Open the VM external IP over HTTP. The frontend is served on port `80`, and Nginx proxies `/api/*` to the backend container.

Useful commands:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.gcp ps
docker compose -f docker-compose.prod.yml --env-file .env.gcp logs -f
docker compose -f docker-compose.prod.yml --env-file .env.gcp down
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
