import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function JobApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Job Applications — HalaPark Admin";
    api
      .jobApplications()
      .then((data) => setApplications(data.applications ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-slate-500">Loading applications…</p>;
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#050A13]">Job Applications</h2>
      <p className="mt-1 text-sm text-slate-500">
        Career applications submitted from the careers page
      </p>

      {applications.length === 0 ? (
        <div className="mt-8 rounded-[20px] border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          No applications yet. Submissions appear here when candidates apply from the careers page.
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-[20px] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-[#f8fbff] text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id ?? app.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-[#050A13]">{app.fullName}</td>
                  <td className="px-4 py-3 text-slate-600">{app.email}</td>
                  <td className="px-4 py-3 text-slate-600">{app.phone}</td>
                  <td className="px-4 py-3 text-slate-600">{app.jobTitle}</td>
                  <td className="px-4 py-3 text-slate-600">{app.department || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[#EEF6FF] px-2.5 py-1 text-xs font-semibold text-[#0088FF]">
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(app.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {applications.some((app) => app.message || app.linkedIn || app.location) ? (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-semibold text-[#050A13]">Application details</h3>
          {applications.map((app) =>
            app.message || app.linkedIn || app.location ? (
              <div
                key={`detail-${app._id ?? app.id}`}
                className="rounded-xl border border-slate-200 bg-white p-4 text-sm"
              >
                <p className="font-semibold text-[#050A13]">
                  {app.fullName} — {app.jobTitle}
                </p>
                {app.location ? (
                  <p className="mt-1 text-slate-600">Location: {app.location}</p>
                ) : null}
                {app.linkedIn ? (
                  <p className="mt-1 text-slate-600">
                    LinkedIn:{" "}
                    <a
                      href={app.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0088FF] hover:underline"
                    >
                      {app.linkedIn}
                    </a>
                  </p>
                ) : null}
                {app.message ? (
                  <p className="mt-2 whitespace-pre-wrap text-slate-600">{app.message}</p>
                ) : null}
              </div>
            ) : null,
          )}
        </div>
      ) : null}
    </div>
  );
}
