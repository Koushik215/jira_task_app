import { useEffect, useMemo, useState } from "react";

function priorityClass(priority) {
  if (priority === "High") return "bg-coral/15 text-coral";
  if (priority === "Low") return "bg-pine/15 text-pine";
  return "bg-gold/20 text-ink";
}

function statusClass(status) {
  if (status === "created") return "text-pine";
  if (status === "failed") return "text-coral";
  if (status === "not_connected") return "text-gold";
  return "text-ink/60";
}

function taskKey(task) {
  return `${task.task}::${task.owner}`;
}

export default function TaskBoard({ currentTasks, historicalTasks, onPushAll, onPushOne, isPushingAll, pushingTaskKey }) {
  const [activeTab, setActiveTab] = useState("current");
  const tasks = useMemo(
    () => (activeTab === "current" ? currentTasks : historicalTasks),
    [activeTab, currentTasks, historicalTasks]
  );

  useEffect(() => {
    if (currentTasks.length > 0) {
      setActiveTab("current");
    }
  }, [currentTasks]);

  return (
    <section className="glass-card rounded-3xl p-6 shadow-soft">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-ink/60">Tasks</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Action Board</h2>
        </div>
        <button
          type="button"
          onClick={onPushAll}
          disabled={!currentTasks.length || isPushingAll}
          className="rounded-full bg-ink px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPushingAll ? "Adding All..." : "Add All to Jira"}
        </button>
      </div>

      <div className="mb-5 inline-flex rounded-full border border-ink/10 bg-white/70 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("current")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            activeTab === "current" ? "bg-ink text-white" : "text-ink/70"
          }`}
        >
          Current Transcript ({currentTasks.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            activeTab === "history" ? "bg-ink text-white" : "text-ink/70"
          }`}
        >
          Previous Tasks ({historicalTasks.length})
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink/10">
        <table className="min-w-full divide-y divide-ink/10 bg-white/80">
          <thead className="bg-ink text-left text-sm text-white">
            <tr>
              <th className="px-4 py-3">Task</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Deadline</th>
              <th className="px-4 py-3">Jira Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10 text-sm text-ink">
            {tasks.length ? (
              tasks.map((task, index) => (
                <tr key={`${task.task}-${task.owner}-${index}`}>
                  <td className="px-4 py-3 font-medium">{task.task}</td>
                  <td className="px-4 py-3">{task.owner}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityClass(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">{task.deadline || "Unspecified"}</td>
                  <td className={`px-4 py-3 font-medium ${statusClass(task.jira_status)}`}>
                    {task.jira_issue_id || (task.jira_status === "not_connected" ? "Not connected" : task.jira_status)}
                  </td>
                  <td className="px-4 py-3">
                    {activeTab === "current" ? (
                      <button
                        type="button"
                        onClick={() => onPushOne(task)}
                        disabled={isPushingAll || pushingTaskKey === taskKey(task)}
                        className="rounded-full border border-ink/15 px-3 py-2 text-xs font-semibold text-ink transition hover:border-ink/30 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {pushingTaskKey === taskKey(task) ? "Adding..." : "Add to Jira"}
                      </button>
                    ) : (
                      <span className="text-ink/45">History</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-center text-ink/60" colSpan="6">
                  {activeTab === "current" ? "No tasks extracted from the current transcript yet." : "No previous tasks found yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
