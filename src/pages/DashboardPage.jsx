import { useEffect, useState } from "react";
import { api } from "../lib/api";

function StatCard({ label, value }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-[#050A13]">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard — HalaPark Admin";
    api
      .stats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-slate-500">Loading dashboard…</p>;
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#050A13]">Dashboard</h2>
      <p className="mt-1 text-sm text-slate-500">Overview of website submissions</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total quotes" value={stats?.quotesTotal ?? 0} />
        <StatCard label="New quotes" value={stats?.quotesNew ?? 0} />
        <StatCard label="Total applications" value={stats?.jobApplicationsTotal ?? 0} />
        <StatCard label="New applications" value={stats?.jobApplicationsNew ?? 0} />
      </div>
    </div>
  );
}
