import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function SummaryCharts({ summary }) {
  const data = [
    { name: "Created", value: summary.created || 0 },
    { name: "Pending", value: summary.pending || 0 },
    { name: "Failed", value: summary.failed || 0 },
    { name: "Offline", value: summary.not_connected || 0 },
  ];

  return (
    <section className="glass-card rounded-3xl p-6 shadow-soft">
      <p className="text-sm uppercase tracking-[0.3em] text-ink/60">Health</p>
      <h2 className="mt-2 text-2xl font-semibold text-ink">Jira Delivery Status</h2>
      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="4 4" stroke="#d9e4e8" />
            <XAxis dataKey="name" stroke="#12263a" />
            <YAxis stroke="#12263a" allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#ef6f6c" radius={[12, 12, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
