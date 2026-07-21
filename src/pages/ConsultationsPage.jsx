import { useEffect, useState } from "react";
import { ArrowLeft, Trash2, Mail, Phone, Building2, Layers, Clock3, MessageSquare } from "lucide-react";
import { api } from "../lib/api";

const STATUS_OPTIONS = ["new", "read", "scheduled", "closed"];

const STATUS_STYLES = {
  new:       "bg-blue-50 text-blue-700 border border-blue-200",
  read:      "bg-amber-50 text-amber-700 border border-amber-200",
  scheduled: "bg-emerald-50 text-emerald-700 border border-emerald-200",
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
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="mt-0.5 block truncate text-sm text-[#0088FF] hover:underline">
            {value}
          </a>
        ) : (
          <p className="mt-0.5 text-sm text-[#050A13]">{value}</p>
        )}
      </div>
    </div>
  );
}

/* ── Detail view ─────────────────────────────────────────────────────── */
function ConsultationDetail({ consultation, onBack, onStatusChange, onDelete }) {
  const [status, setStatus]   = useState(consultation.status);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDelete] = useState(false);
  const [error, setError]     = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const id = consultation._id ?? consultation.id;
  const topics = Array.isArray(consultation.topics) ? consultation.topics : [];

  async function handleStatusChange(newStatus) {
    if (newStatus === status) return;
    setSaving(true);
    setError("");
    try {
      const data = await api.updateConsultationStatus(id, newStatus);
      const next = data.consultation?.status ?? newStatus;
      setStatus(next);
      onStatusChange(id, next);
    } catch (err) {
      setError(err.message ?? "Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDelete(true);
    setError("");
    try {
      await api.deleteConsultation(id);
      onDelete(id);
    } catch (err) {
      setError(err.message ?? "Failed to delete");
      setDelete(false);
    }
  }

  return (
    <div>
      {/* Header */}
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
              <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
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

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {/* Card */}
      <div className="rounded-[20px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[#050A13]">{consultation.fullName}</h2>
            {consultation.company ? (
              <p className="mt-0.5 text-sm text-slate-500">{consultation.company}</p>
            ) : null}
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={status} />
            <p className="text-[11px] text-slate-400">
              {new Date(consultation.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
          <DetailField icon={Mail}      label="Email"          value={consultation.email} href={`mailto:${consultation.email}`} />
          <DetailField icon={Phone}     label="Phone"          value={consultation.phone} href={`tel:${consultation.phone}`} />
          <DetailField icon={Building2} label="Company"        value={consultation.company} />
          <DetailField icon={Clock3}    label="Preferred Time" value={consultation.preferredTime} />
          {topics.length > 0 && (
            <div className="sm:col-span-2">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF6FF]">
                  <Layers className="h-4 w-4 text-[#0088FF]" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Topics</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {topics.map((s, i) => (
                      <span key={i} className="rounded-full bg-[#EEF6FF] px-2.5 py-1 text-xs font-medium text-[#0088FF]">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {consultation.message && (
            <div className="sm:col-span-2">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF6FF]">
                  <MessageSquare className="h-4 w-4 text-[#0088FF]" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Message</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#050A13]">{consultation.message}</p>
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
export default function ConsultationsPage() {
  const [items, setItems]       = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    document.title = "Consultations — HalaPark Admin";
    api
      .consultations()
      .then((data) => setItems(data.consultations ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleStatusChange(id, newStatus) {
    setItems((prev) =>
      prev.map((p) => ((p._id ?? p.id) === id ? { ...p, status: newStatus } : p)),
    );
    if ((selected?._id ?? selected?.id) === id) setSelected((s) => ({ ...s, status: newStatus }));
  }

  function handleDelete(id) {
    setItems((prev) => prev.filter((p) => (p._id ?? p.id) !== id));
    setSelected(null);
  }

  if (loading) return <p className="text-slate-500">Loading consultations…</p>;
  if (error) return <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>;

  /* Detail view */
  if (selected) {
    return (
      <ConsultationDetail
        consultation={selected}
        onBack={() => setSelected(null)}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    );
  }

  /* List view */
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[#050A13]">Consultations</h2>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} request{items.length !== 1 ? "s" : ""} · click a row to view details
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-[20px] border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          No consultation requests yet. Submissions from the popup will appear here.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[20px] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-[#f8fbff] text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Topics</th>
                <th className="px-4 py-3">Preferred Time</th>
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
                          {p.company ? <span className="block text-xs text-slate-400">{p.company}</span> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.email}</td>
                    <td className="px-4 py-3 text-slate-600">{p.phone}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="flex max-w-[220px] flex-wrap gap-1">
                        {(p.topics ?? []).map((s, i) => (
                          <span key={i} className="rounded-full bg-[#EEF6FF] px-2 py-0.5 text-[11px] font-medium text-[#0088FF]">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.preferredTime || "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(p.createdAt).toLocaleDateString()}
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
