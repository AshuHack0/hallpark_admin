import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, Briefcase, MessageSquare, Globe,
  ArrowRight, TrendingUp, Users, Mail,
  LayoutDashboard, ChevronRight,
} from "lucide-react";
import { api } from "../lib/api";
import { FRONTEND_PAGES } from "../constants/pages.js";

// ── Clickable stat card ─────────────────────────────────────────────────────
function StatCard({ label, total, newCount, icon: Icon, color, bg, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm text-left transition hover:-translate-y-0.5 hover:border-[#0088FF]/30 hover:shadow-[0_8px_24px_rgba(0,136,255,0.10)]"
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} strokeWidth={1.8} />
        </div>
        {newCount > 0 && (
          <span className="rounded-full bg-[#0088FF] px-2.5 py-0.5 text-[11px] font-bold text-white">
            {newCount} new
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-[#050A13]">{total}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
      <div className="mt-3 flex items-center gap-1 text-[0.78rem] font-medium text-[#0088FF] opacity-0 transition group-hover:opacity-100">
        View all <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </button>
  );
}

// ── Quick link card ─────────────────────────────────────────────────────────
function QuickLink({ label, description, icon: Icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-[16px] border border-slate-200 bg-white px-4 py-4 text-left transition hover:border-[#0088FF]/30 hover:bg-[#F4F8FF]"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#EEF6FF]">
        <Icon className="h-5 w-5 text-[#0088FF]" strokeWidth={1.8} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#050A13]">{label}</p>
        {description && <p className="mt-0.5 truncate text-[0.75rem] text-slate-400">{description}</p>}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-[#0088FF]" />
    </button>
  );
}

// ── Main dashboard ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats]   = useState(null);
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Dashboard — HalaPark Admin";
    api
      .stats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Loading dashboard…</p>;
  if (error)   return <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>;

  const statCards = [
    {
      label: "Total Quotes",
      total: stats?.quotesTotal ?? 0,
      newCount: stats?.quotesNew ?? 0,
      icon: FileText,
      color: "text-[#0088FF]",
      bg: "bg-[#EEF6FF]",
      route: "/quotes",
    },
    {
      label: "Contact Submissions",
      total: stats?.contactsTotal ?? 0,
      newCount: stats?.contactsNew ?? 0,
      icon: Mail,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      route: "/contacts",
    },
    {
      label: "Job Applications",
      total: stats?.jobApplicationsTotal ?? 0,
      newCount: stats?.jobApplicationsNew ?? 0,
      icon: Briefcase,
      color: "text-purple-600",
      bg: "bg-purple-50",
      route: "/job-applications",
    },
    {
      label: "Website Pages",
      total: FRONTEND_PAGES.length,
      newCount: 0,
      icon: Globe,
      color: "text-amber-600",
      bg: "bg-amber-50",
      route: `/pages/${FRONTEND_PAGES[0]?.slug}`,
    },
  ];

  const totalNew =
    (stats?.quotesNew ?? 0) +
    (stats?.jobApplicationsNew ?? 0) +
    (stats?.contactsNew ?? 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-[#0088FF]" strokeWidth={1.8} />
            <h2 className="text-2xl font-semibold text-[#050A13]">Dashboard</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Overview of website activity
            {totalNew > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[#0088FF] px-2.5 py-0.5 text-[11px] font-bold text-white">
                <TrendingUp className="h-3 w-3" />
                {totalNew} new
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
          Overview
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <StatCard
              key={card.label}
              {...card}
              onClick={() => navigate(card.route)}
            />
          ))}
        </div>
      </div>

      {/* Bottom row: Submissions + Website Pages */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Submissions quick links */}
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Submissions
          </h3>
          <div className="space-y-2">
            <QuickLink
              icon={FileText}
              label="Quotes"
              description={`${stats?.quotesNew ?? 0} new · ${stats?.quotesTotal ?? 0} total`}
              onClick={() => navigate("/quotes")}
            />
            <QuickLink
              icon={Mail}
              label="Contact Submissions"
              description={`${stats?.contactsNew ?? 0} new · ${stats?.contactsTotal ?? 0} total`}
              onClick={() => navigate("/contacts")}
            />
            <QuickLink
              icon={Briefcase}
              label="Job Applications"
              description={`${stats?.jobApplicationsNew ?? 0} new · ${stats?.jobApplicationsTotal ?? 0} total`}
              onClick={() => navigate("/job-applications")}
            />
          </div>
        </div>

        {/* Website pages quick links */}
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Website Pages
          </h3>
          <div className="space-y-2">
            {FRONTEND_PAGES.map((page) => (
              <QuickLink
                key={page.slug}
                icon={Globe}
                label={page.name}
                description={`Edit ${page.path} content`}
                onClick={() => navigate(`/pages/${page.slug}`)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
