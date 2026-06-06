import { useEffect, useState } from "react";
import { ArrowLeft, Trash2, Mail, Phone, Building2, MessageSquare, Tag } from "lucide-react";
import { api } from "../lib/api";

const STATUS_OPTIONS = ["new", "read", "replied", "closed"];

const STATUS_STYLES = {
  new:     "bg-blue-50 text-blue-700 border border-blue-200",
  read:    "bg-amber-50 text-amber-700 border border-amber-200",
  replied: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  closed:  "bg-slate-100 text-slate-500 border border-slate-200",
};

function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[status] ?? STATUS_STYLES.new}`}>
      {status}
    </span>
  );
}

/* ── Detail view ─────────────────────────────────────────────────────── */
function ContactDetail({ contact, onBack, onStatusChange, onDelete }) {
  const [status, setStatus]   = useState(contact.status);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDelete] = useState(false);
  const [error, setError]     = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleStatusChange(newStatus) {
    if (newStatus === status) return;
    setSaving(true);
    setError("");
    try {
      const data = await api.updateContactStatus(contact._id, newStatus);
      setStatus(data.contact.status);
      onStatusChange(contact._id, data.contact.status);
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
      await api.deleteContact(contact._id);
      onDelete(contact._id);
    } catch (err) {
      setError(err.message ?? "Failed to delete");
      setDelete(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-[#0088FF] hover:text-[#0088FF]">
          <ArrowLeft className="h-4 w-4" /> Back to list
        </button>

        <div className="flex items-center gap-2">
          <select value={status} onChange={(e) => handleStatusChange(e.target.value)} disabled={saving}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-[#0088FF] focus:ring-2 focus:ring-[#0088FF]/15 disabled:opacity-60">
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

      {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="rounded-[20px] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[#050A13]">{contact.fullName}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{contact.subject ?? "General Enquiry"}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={status} />
            <p className="text-[11px] text-slate-400">{new Date(contact.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
          {/* Email */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF6FF]">
              <Mail className="h-4 w-4 text-[#0088FF]" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Email</p>
              <a href={`mailto:${contact.email}`} className="mt-0.5 block text-sm text-[#0088FF] hover:underline">{contact.email}</a>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF6FF]">
              <Phone className="h-4 w-4 text-[#0088FF]" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Phone</p>
              <a href={`tel:${contact.phone}`} className="mt-0.5 block text-sm text-[#0088FF] hover:underline">{contact.phone}</a>
            </div>
          </div>

          {/* Company */}
          {contact.company && (
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF6FF]">
                <Building2 className="h-4 w-4 text-[#0088FF]" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Company</p>
                <p className="mt-0.5 text-sm text-[#050A13]">{contact.company}</p>
              </div>
            </div>
          )}

          {/* Subject */}
          {contact.subject && (
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF6FF]">
                <Tag className="h-4 w-4 text-[#0088FF]" strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Subject</p>
                <p className="mt-0.5 text-sm text-[#050A13]">{contact.subject}</p>
              </div>
            </div>
          )}

          {/* Message — full width */}
          <div className="flex items-start gap-3 sm:col-span-2">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#EEF6FF]">
              <MessageSquare className="h-4 w-4 text-[#0088FF]" strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Message</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#050A13]">{contact.message}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── List view ───────────────────────────────────────────────────────── */
export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    document.title = "Contact Submissions — HalaPark Admin";
    api
      .contacts()
      .then((data) => setContacts(data.contacts ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleStatusChange(id, newStatus) {
    setContacts((prev) => prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c)));
    if (selected?._id === id) setSelected((s) => ({ ...s, status: newStatus }));
  }

  function handleDelete(id) {
    setContacts((prev) => prev.filter((c) => c._id !== id));
    setSelected(null);
  }

  if (loading) return <p className="text-slate-500">Loading messages…</p>;
  if (error)   return <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>;

  if (selected) {
    return (
      <ContactDetail
        contact={selected}
        onBack={() => setSelected(null)}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div>
      <div>
        <h2 className="text-2xl font-semibold text-[#050A13]">Contact Submissions</h2>
        <p className="mt-1 text-sm text-slate-500">
          {contacts.length} submission{contacts.length !== 1 ? "s" : ""} · click a row to view & reply
        </p>
      </div>

      {contacts.length === 0 ? (
        <div className="mt-8 rounded-[20px] border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          No contact submissions yet. They appear here when visitors submit the contact form.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-[20px] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-[#f8fbff] text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c._id} onClick={() => setSelected(c)}
                  className="cursor-pointer border-b border-slate-100 transition-colors last:border-0 hover:bg-[#F4F8FF]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF6FF] text-[0.7rem] font-bold text-[#0088FF]">
                        {c.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-[#050A13]">{c.fullName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.subject ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{c.email}</td>
                  <td className="px-4 py-3 text-slate-600">{c.phone}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
