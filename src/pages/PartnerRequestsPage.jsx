import { useEffect, useState } from "react";
import { ArrowLeft, Trash2, Mail, Phone, Building2, MessageSquare, Paperclip, MousePointerClick } from "lucide-react";
import { api } from "../lib/api";

const STATUS_OPTIONS = ["new", "read", "contacted", "closed"];

const STATUS_STYLES = {
  new:       "bg-blue-50 text-blue-700 border border-blue-200",
  read:      "bg-amber-50 text-amber-700 border border-amber-200",
  contacted: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  closed:    "bg-slate-100 text-slate-500 border border-slate-200",
};

function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[status] ?? STATUS_STYLES.new}`}>
      {status}
    </span>
  );
}

function DetailField({ icon: Icon, label, value, href }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF6FF]">
        <Icon className="h-4 w-4 text-[#0088FF]" strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
        {href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="mt-0.5 block truncate text-sm text-[#0088FF] hover:underline">
            {value}
          </a>
        ) : (
          <p className="mt-0.5 text-sm text-[#050A13] [overflow-wrap:anywhere]">{value}</p>
        )}
      </div>
    </div>
  );
}

/* ── Detail view ─────────────────────────────────────────────────────── */
function PartnerRequestDetail({ item, onBack, onStatusChange, onDelete }) {
  const [status, setStatus] = useState(item.status);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const id = item._id ?? item.id;

  async function handleStatusChange(newStatus) {
    if (newStatus === status) return;
    setSaving(true);
    setError("");
    try {
      const data = await api.updatePartnerRequestStatus(id, newStatus);
      const next = data.partnerRequest?.status ?? newStatus;
      setStatus(next);
      onStatusChange(id, next);
    } catch (err) {
      setError(err.message ?? "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      await api.deletePartnerRequest(id);
      onDelete(id);
    } catch (err) {
      setError(err.message ?? "Failed to delete");
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-[#0088FF] hover:text-[#0088FF]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </button>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={saving}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-[#0088FF] focus:ring-2 focus:ring-[#0088FF]/15 disabled:opacity-60"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>

          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Sure?</span>
              <button type="button" onClick={handleDelete} disabled={deleting}
                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>
      </div>

      {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="rounded-[20px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[#050A13]">{item.fullName}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{item.companyName}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={status} />
            <p className="text-[11px] text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
          <DetailField icon={Mail}              label="Email"        value={item.email} href={`mailto:${item.email}`} />
          <DetailField icon={Phone}             label="Phone"        value={item.phone} href={`tel:${(item.phone || "").replace(/\s+/g, "")}`} />
          <DetailField icon={Building2}         label="Company"      value={item.companyName} />
          <DetailField icon={MousePointerClick} label="Opened From"  value={item.source} />
          {item.document?.url && (
            <div className="sm:col-span-2">
              <DetailField icon={Paperclip} label="Supporting Document" value={item.document.name || "View document"} href={item.document.url} />
            </div>
          )}
          {item.message && (
            <div className="sm:col-span-2">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF6FF]">
                  <MessageSquare className="h-4 w-4 text-[#0088FF]" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">How Can We Help?</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#050A13]">{item.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── List view ───────────────────────────────────────────────────────── */
export default function PartnerRequestsPage() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Partner Requests — HalaPark Admin";
    api
      .partnerRequests()
      .then((data) => setItems(data.partnerRequests ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleStatusChange(id, newStatus) {
    setItems((prev) => prev.map((p) => ((p._id ?? p.id) === id ? { ...p, status: newStatus } : p)));
    if ((selected?._id ?? selected?.id) === id) setSelected((s) => ({ ...s, status: newStatus }));
  }

  function handleDelete(id) {
    setItems((prev) => prev.filter((p) => (p._id ?? p.id) !== id));
    setSelected(null);
  }

  if (loading) return <p className="text-slate-500">Loading partner requests…</p>;
  if (error) return <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>;

  if (selected) {
    return (
      <PartnerRequestDetail
        item={selected}
        onBack={() => setSelected(null)}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div>
      <div>
        <h2 className="text-2xl font-semibold text-[#050A13]">Partner Requests</h2>
        <p className="mt-1 text-sm text-slate-500">
          {items.length} request{items.length !== 1 ? "s" : ""} · click a row to view details
        </p>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-[20px] border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          No partner requests yet. Submissions from the &quot;Become a Partner&quot; popup will appear here.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[20px] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-[#f8fbff] text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Opened From</th>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => {
                const id = p._id ?? p.id;
                return (
                  <tr
                    key={id}
                    onClick={() => setSelected(p)}
                    className="cursor-pointer border-b border-slate-100 transition-colors last:border-0 hover:bg-[#F4F8FF]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF6FF] text-[0.7rem] font-bold text-[#0088FF]">
                          {p.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-[#050A13]">{p.fullName}</span>
                          <span className="block text-xs text-slate-400">{p.companyName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.email}</td>
                    <td className="px-4 py-3 text-slate-600">{p.phone}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-xs text-slate-500">{p.source || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.document?.url ? <Paperclip className="h-4 w-4 text-[#0088FF]" aria-label="Has document" /> : "—"}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</td>
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
