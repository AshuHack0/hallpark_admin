import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Save, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import { FIELD_LIMITS, CharCount, ArInput } from "./CappedField";
import RichHtmlEditor from "./RichHtmlEditor.jsx";

// Shared editor for the long-text legal pages: Terms & Conditions, Privacy
// Policy, Refund Policy. Each page stores a single `legal` section with a
// `title` + rich-HTML `body` (and an Arabic sibling under `ar`), edited with
// TinyMCE. The public page renders the HTML (with a plain-text fallback for
// bodies saved before the rich editor existed).

const PAGE_TITLES = {
  "terms-conditions": "Terms & Conditions",
  "privacy-policy": "Privacy Policy",
  "refund-policy": "Refund Policy",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15";
const labelClass = "block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 mb-2";
const DEFAULT_LEGAL = { title: "", body: "", ar: { title: "", body: "" } };

export default function LegalPageEditor() {
  const { slug } = useParams();
  const pageName = PAGE_TITLES[slug] ?? "Legal Page";

  const [page, setPage] = useState(null);
  const [legal, setLegal] = useState(DEFAULT_LEGAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = `${pageName} — HalaPark Admin`;
    setLoading(true);
    setError("");
    api
      .getPage(slug)
      .then((data) => {
        setPage(data.page);
        const l = data.page?.sections?.legal ?? {};
        setLegal({
          ...DEFAULT_LEGAL,
          ...l,
          ar: { ...DEFAULT_LEGAL.ar, ...(l.ar ?? {}) },
        });
      })
      .catch((err) => setError(err.message || "Failed to load page"))
      .finally(() => setLoading(false));
  }, [slug, pageName]);

  const setField = (key, value) => setLegal((prev) => ({ ...prev, [key]: value }));
  const setArField = (key, value) =>
    setLegal((prev) => ({ ...prev, ar: { ...(prev.ar ?? {}), [key]: value } }));

  async function handleSave() {
    if (!page) return;
    setSaving(true);
    setError("");
    try {
      await api.updatePage(slug, { sections: { legal }, published: true });
      setSuccess(`${pageName} saved.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save page");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Loading {pageName}…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#050A13]">{pageName}</h1>
          <p className="text-sm text-slate-500">
            Edit the page heading and body text. The website hides this page when the body is empty.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0088FF] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
      ) : null}
      {success ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{success}</div>
      ) : null}

      {/* Page heading */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <label className={labelClass}>Page Heading</label>
        <input
          className={inputClass}
          value={legal.title ?? ""}
          maxLength={FIELD_LIMITS.heading}
          onChange={(e) => setField("title", e.target.value)}
          placeholder={pageName}
        />
        <CharCount value={legal.title ?? ""} max={FIELD_LIMITS.heading} />
        <ArInput label="Page Heading" kind="heading" value={legal.ar?.title} onChange={(v) => setArField("title", v)} />
      </div>

      {/* Body — rich text (TinyMCE). Headings, bold, lists, links, tables. */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <label className={labelClass}>Body Text</label>
        <p className="mb-2 text-xs text-slate-400">
          Format the document with headings, bold, lists, links and tables — it renders on the website exactly as styled here.
        </p>
        <RichHtmlEditor
          value={legal.body ?? ""}
          onChange={(html) => setField("body", html)}
          placeholder={`Paste the ${pageName} text here…`}
        />

        {/* Arabic body — blank shows nothing on the Arabic site (never English). */}
        <div className="mt-6">
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">
            Body Text (Arabic)
          </label>
          <RichHtmlEditor
            rtl
            value={legal.ar?.body ?? ""}
            onChange={(html) => setArField("body", html)}
            placeholder="اتركه فارغًا لعدم عرض النص العربي"
          />
        </div>
      </div>
    </div>
  );
}
