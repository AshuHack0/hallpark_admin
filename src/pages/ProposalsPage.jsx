import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { api } from "../lib/api";

export default function ProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Proposals — HalaPark Admin";
    api
      .proposals()
      .then((data) => setProposals(data.proposals ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    try {
      await api.deleteProposal(id);
      setProposals((prev) => prev.filter((p) => (p._id ?? p.id) !== id));
    } catch (err) {
      setError(err.message ?? "Failed to delete");
    }
  }

  if (loading) return <p className="text-slate-500">Loading proposals…</p>;
  if (error) return <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#050A13]">Proposals</h2>
      <p className="mt-1 text-sm text-slate-500">&ldquo;Get Proposal&rdquo; requests from the Business page popup</p>

      {proposals.length === 0 ? (
        <div className="mt-8 rounded-[20px] border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          No proposals yet. Submissions from the &ldquo;Get Proposal&rdquo; popup will appear here.
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-[20px] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-[#f8fbff] text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Solutions</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Attachments</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => {
                const id = p._id ?? p.id;
                return (
                  <tr key={id} className="border-b border-slate-100 last:border-0 align-top">
                    <td className="px-4 py-3 font-medium text-[#050A13]">
                      {p.fullName}
                      {p.company ? <span className="block text-xs text-slate-400">{p.company}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.email}</td>
                    <td className="px-4 py-3 text-slate-600">{p.phone}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex max-w-[220px] flex-wrap gap-1">
                        {(p.solutions ?? []).map((s, i) => (
                          <span key={i} className="rounded-full bg-[#EEF6FF] px-2 py-0.5 text-[11px] font-medium text-[#0088FF]">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600"><span className="block max-w-[240px] whitespace-pre-wrap">{p.message || "—"}</span></td>
                    <td className="px-4 py-3 text-slate-600">
                      {Array.isArray(p.attachments) && p.attachments.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {p.attachments.map((f, i) => (
                            <a key={i} href={f?.url} target="_blank" rel="noopener noreferrer" className="max-w-[160px] truncate text-xs font-medium text-[#0088FF] hover:underline">{f?.name || `File ${i + 1}`}</a>
                          ))}
                        </div>
                      ) : <span className="text-xs text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{new Date(p.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(id)} className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
