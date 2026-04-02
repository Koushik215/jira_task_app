import { useEffect, useState } from "react";
import SummaryCharts from "./components/SummaryCharts";
import TaskBoard from "./components/TaskBoard";
import TimelinePanel from "./components/TimelinePanel";
import UploadPanel from "./components/UploadPanel";
import { fetchDashboardData, processMeeting, pushToJira } from "./lib/api";

export default function App() {
  const [currentTasks, setCurrentTasks] = useState([]);
  const [historicalTasks, setHistoricalTasks] = useState([]);
  const [cleanedTranscript, setCleanedTranscript] = useState([]);
  const [summary, setSummary] = useState({ total_tasks: 0, created: 0, failed: 0, pending: 0, not_connected: 0 });
  const [loading, setLoading] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [message, setMessage] = useState("");

  async function loadDashboard() {
    try {
      const data = await fetchDashboardData();
      setHistoricalTasks(data.tasks || []);
      setSummary(data.summary);
    } catch {
      setMessage("Dashboard metrics will appear once the backend is running.");
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleProcess(transcript) {
    setLoading(true);
    setMessage("");
    try {
      const response = await processMeeting(transcript);
      setCurrentTasks(response.tasks);
      setCleanedTranscript(response.cleaned_transcript);
      setMessage(`Processed meeting ${response.meeting_id} and extracted ${response.tasks.length} task(s).`);
      await loadDashboard();
    } catch (error) {
      setMessage(`Processing failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handlePush() {
    setPushing(true);
    setMessage("");
    try {
      const results = await pushToJira(currentTasks);
      setCurrentTasks((current) =>
        current.map((task) => {
          const match = results.find((result) => result.task === task.task && result.owner === task.owner);
          return match ? { ...task, jira_issue_id: match.jira_issue_id, jira_status: match.jira_status } : task;
        })
      );
      setMessage("Jira push completed. The board has been refreshed with issue status.");
      await loadDashboard();
    } catch (error) {
      setMessage(`Jira push failed: ${error.message}`);
    } finally {
      setPushing(false);
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 text-ink md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 rounded-[2rem] bg-ink px-8 py-10 text-white shadow-soft">
          <p className="text-sm uppercase tracking-[0.35em] text-white/70">AI Meeting Intelligence</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight">
            Convert Microsoft Teams transcripts into validated Jira work with a single review flow.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/75">
            Upload raw transcript JSON, extract explicit tasks with NLP plus LLM processing, and push the final task set into Jira.
          </p>
          {message ? <p className="mt-5 rounded-full bg-white/10 px-4 py-3 text-sm text-white/90">{message}</p> : null}
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <UploadPanel onSubmit={handleProcess} isLoading={loading} />
          <SummaryCharts summary={summary} />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <TaskBoard currentTasks={currentTasks} historicalTasks={historicalTasks} onPush={handlePush} isPushing={pushing} />
          <TimelinePanel cleanedTranscript={cleanedTranscript} />
        </section>
      </div>
    </main>
  );
}
