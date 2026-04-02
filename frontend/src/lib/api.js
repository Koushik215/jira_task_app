const API_BASE = import.meta.env.VITE_API_BASE || "https://jira-task-app-6.onrender.com";

function apiUrl(path) {
  if (API_BASE.startsWith("http://") || API_BASE.startsWith("https://")) {
    return `${API_BASE}${path}`;
  }
  return `${API_BASE}${path}`;
}

async function handleResponse(response) {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }
  return response.json();
}

export async function processMeeting(transcript) {
  return handleResponse(
    await fetch(apiUrl("/process-meeting"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    })
  );
}

export async function pushToJira(tasks) {
  return handleResponse(
    await fetch(apiUrl("/push-to-jira"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks }),
    })
  );
}

export async function fetchDashboardData() {
  return handleResponse(await fetch(apiUrl("/dashboard-data")));
}
