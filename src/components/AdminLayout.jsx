import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  LogOut,
  Globe,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { FRONTEND_PAGES } from "../constants/pages.js";
import { getUser, logout } from "../lib/api";

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
    isActive
      ? "bg-[#0088FF] text-white"
      : "text-slate-600 hover:bg-white hover:text-[#050A13]"
  }`;

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = getUser();
  const [pagesOpen, setPagesOpen] = useState(true);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-slate-200 bg-white px-4 py-5 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r lg:overflow-y-auto">
        <div className="mb-6 px-2">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0088FF]">
            HalaPark
          </p>
          <h1 className="mt-1 text-xl font-semibold text-[#050A13]">Admin</h1>
          {user ? (
            <p className="mt-1 truncate text-xs text-slate-500">{user.email}</p>
          ) : null}
        </div>

        <nav className="space-y-1">
          <NavLink to="/" end className={navLinkClass}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink to="/quotes" className={navLinkClass}>
            <FileText className="h-4 w-4" />
            Quotes
          </NavLink>
          <NavLink to="/job-applications" className={navLinkClass}>
            <Briefcase className="h-4 w-4" />
            Job Applications
          </NavLink>

          <button
            type="button"
            onClick={() => setPagesOpen((v) => !v)}
            className="mt-4 flex w-full items-center justify-between rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5" />
              Website Pages
            </span>
            <ChevronDown className={`h-4 w-4 transition ${pagesOpen ? "rotate-180" : ""}`} />
          </button>

          {pagesOpen ? (
            <div className="ml-2 space-y-0.5 border-l border-slate-100 pl-2">
              {FRONTEND_PAGES.map((page) => (
                <NavLink
                  key={page.slug}
                  to={`/pages/${page.slug}`}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-sm transition ${
                      isActive
                        ? "bg-[#EEF6FF] font-semibold text-[#0088FF]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-[#050A13]"
                    }`
                  }
                >
                  {page.name}
                </NavLink>
              ))}
            </div>
          ) : null}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </aside>

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
}
