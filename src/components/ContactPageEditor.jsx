import { useState, useEffect } from "react";
import { Save, Loader2, Plus, Trash2, ChevronDown } from "lucide-react";
import { api } from "../lib/api";
import { validateUrl, validateEmail, validatePhone } from "../lib/validators";
import { FIELD_LIMITS, CharCount, FieldError, ArInput } from "./CappedField";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15";
const labelClass = "block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 mb-2";

// Options for the details item `key` — the public site maps this to an icon.
const DETAIL_KEY_OPTIONS = [
  { value: "address", label: "Address" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "supportEmail", label: "Support Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "hours", label: "Working Hours" },
];

const DEFAULT_HERO = {
  eyebrow: "",
  heading: "",
  description: "",
  ar: { eyebrow: "", heading: "", description: "" },
};

const DEFAULT_DETAILS = {
  eyebrow: "",
  heading: "",
  intro: "",
  items: [],
  ar: { eyebrow: "", heading: "", intro: "" },
};

const DEFAULT_FORM = {
  eyebrow: "",
  heading: "",
  note: "",
  subjects: [],
  ar: { eyebrow: "", heading: "", note: "", subjects: [] },
};

const DEFAULT_WHATSAPP_CTA = {
  eyebrow: "",
  heading: "",
  body: "",
  button: "",
  note: "",
  link: "",
  ar: { eyebrow: "", heading: "", body: "", button: "", note: "" },
};

const DEFAULT_MAP = {
  heading: "",
  officeName: "",
  address: "",
  phone: "",
  email: "",
  hours: "",
  weekend: "",
  ar: { heading: "", officeName: "", address: "", hours: "", weekend: "" },
};

function emptyDetailItem() {
  return {
    key: "address",
    title: "",
    value: "",
    href: "",
    description: "",
    ar: { title: "", value: "", description: "" },
  };
}

// Merge a loaded section over its defaults so every field falls back to "".
function mergeSection(defaults, loaded) {
  if (!loaded || typeof loaded !== "object") return defaults;
  return {
    ...defaults,
    ...loaded,
    ar: { ...(defaults.ar ?? {}), ...(loaded.ar ?? {}) },
  };
}

function mergeContactSections(raw = {}) {
  const details = {
    ...mergeSection(DEFAULT_DETAILS, raw.details),
    items: Array.isArray(raw.details?.items)
      ? raw.details.items.map((item) => ({
          ...emptyDetailItem(),
          ...item,
          ar: { ...emptyDetailItem().ar, ...(item?.ar ?? {}) },
        }))
      : [],
  };
  return {
    hero: mergeSection(DEFAULT_HERO, raw.hero),
    details,
    form: mergeSection(DEFAULT_FORM, raw.form),
    whatsappCta: mergeSection(DEFAULT_WHATSAPP_CTA, raw.whatsappCta),
    map: mergeSection(DEFAULT_MAP, raw.map),
  };
}

function CollapsibleSection({ title, isOpen, onToggle, children }) {
  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition"
      >
        <h2 className="text-xl font-bold text-[#050A13]">{title}</h2>
        <ChevronDown className={`h-5 w-5 text-slate-500 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="border-t border-slate-200 px-6 pb-6 pt-4">{children}</div>}
    </div>
  );
}

export default function ContactPageEditor() {
  const slug = "contact";
  const [page, setPage] = useState(null);
  const [sections, setSections] = useState(mergeContactSections());
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [openSections, setOpenSections] = useState({ hero: true });

  useEffect(() => {
    document.title = "Contact — HalaPark Admin";
    setLoading(true);
    api
      .getPage(slug)
      .then((data) => {
        setPage(data.page);
        setSections(mergeContactSections(data.page?.sections));
        setPublished(data.page?.published ?? true);
      })
      .catch((err) => setError(err.message ?? "Failed to load page"))
      .finally(() => setLoading(false));
  }, []);

  const toggleSection = (name) =>
    setOpenSections((prev) => ({ ...prev, [name]: !prev[name] }));

  function setHero(fn) {
    setSections((prev) => ({ ...prev, hero: typeof fn === "function" ? fn(prev.hero) : fn }));
  }
  function setForm(fn) {
    setSections((prev) => ({ ...prev, form: typeof fn === "function" ? fn(prev.form) : fn }));
  }
  function setDetails(fn) {
    setSections((prev) => ({
      ...prev,
      details: typeof fn === "function" ? fn(prev.details) : fn,
    }));
  }
  function setWhatsapp(fn) {
    setSections((prev) => ({
      ...prev,
      whatsappCta: typeof fn === "function" ? fn(prev.whatsappCta) : fn,
    }));
  }
  function setMap(fn) {
    setSections((prev) => ({ ...prev, map: typeof fn === "function" ? fn(prev.map) : fn }));
  }

  function updateDetailItem(index, updates) {
    setSections((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        items: prev.details.items.map((item, i) => (i === index ? { ...item, ...updates } : item)),
      },
    }));
  }

  function addDetailItem() {
    setSections((prev) => ({
      ...prev,
      details: { ...prev.details, items: [...prev.details.items, emptyDetailItem()] },
    }));
  }

  function removeDetailItem(index) {
    setSections((prev) => ({
      ...prev,
      details: { ...prev.details, items: prev.details.items.filter((_, i) => i !== index) },
    }));
  }

  function validateBeforeSave() {
    if (!sections.hero.heading?.trim()) {
      return "Hero heading is required.";
    }
    if (!sections.details.items.length) {
      return "Add at least one contact detail item.";
    }
    for (let i = 0; i < sections.details.items.length; i += 1) {
      const item = sections.details.items[i];
      if (!item.title?.trim() || !item.value?.trim()) {
        return `Contact detail ${i + 1} needs both a title and a value.`;
      }
    }
    return "";
  }

  async function handleSave() {
    const validationError = validateBeforeSave();
    if (validationError) {
      setError(validationError);
      setSuccess("");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const data = await api.updatePage(slug, { sections, published });
      setPage(data.page);
      setSections(mergeContactSections(data.page?.sections));
      setSuccess("Contact page saved successfully!");
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      setError(err.message ?? "Failed to save page");
    } finally {
      setSaving(false);
    }
  }

  // Per-type warning for a detail item's value (non-blocking).
  function detailValueError(item) {
    if (item.key === "phone" || item.key === "whatsapp") return validatePhone(item.value);
    if (item.key === "email" || item.key === "supportEmail") return validateEmail(item.value);
    return "";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#0088FF]" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
        {error || "Page not found"}
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 px-6 py-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#050A13]">Contact Page Editor</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage hero, contact details, form panel, WhatsApp section and map
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-600">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-700">
          ✅ {success}
        </div>
      ) : null}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-lg bg-[#0088FF] px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? "Saving..." : "Save Changes"}
      </button>

      <div>
        {/* Hero */}
        <CollapsibleSection
          title="Hero"
          isOpen={!!openSections.hero}
          onToggle={() => toggleSection("hero")}
        >
          <div className="grid gap-4">
            <div>
              <label className={labelClass}>Eyebrow</label>
              <input
                value={sections.hero.eyebrow ?? ""}
                onChange={(e) => setHero((p) => ({ ...p, eyebrow: e.target.value }))}
                className={inputClass}
                placeholder="Contact Us"
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={sections.hero.eyebrow ?? ""} max={FIELD_LIMITS.label} />
              <ArInput
                label="Eyebrow"
                kind="label"
                value={sections.hero.ar?.eyebrow}
                onChange={(v) => setHero((p) => ({ ...p, ar: { ...(p.ar ?? {}), eyebrow: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={sections.hero.heading ?? ""}
                onChange={(e) => setHero((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
                placeholder="We're here to help"
                maxLength={FIELD_LIMITS.heading}
              />
              <CharCount value={sections.hero.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput
                label="Heading"
                kind="heading"
                value={sections.hero.ar?.heading}
                onChange={(v) => setHero((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={sections.hero.description ?? ""}
                onChange={(e) => setHero((p) => ({ ...p, description: e.target.value }))}
                className={inputClass}
                rows={3}
                maxLength={FIELD_LIMITS.description}
              />
              <CharCount value={sections.hero.description ?? ""} max={FIELD_LIMITS.description} />
              <ArInput
                label="Description"
                kind="description"
                multiline
                value={sections.hero.ar?.description}
                onChange={(v) =>
                  setHero((p) => ({ ...p, ar: { ...(p.ar ?? {}), description: v } }))
                }
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Contact Details */}
        <CollapsibleSection
          title={`Contact Details (${sections.details.items.length})`}
          isOpen={!!openSections.details}
          onToggle={() => toggleSection("details")}
        >
          {/* Panel header copy (section-level, not the items) */}
          <div className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Panel Header
            </p>
            <div>
              <label className={labelClass}>Eyebrow</label>
              <input
                value={sections.details.eyebrow ?? ""}
                onChange={(e) => setDetails((p) => ({ ...p, eyebrow: e.target.value }))}
                className={inputClass}
                placeholder="Reach us"
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={sections.details.eyebrow ?? ""} max={FIELD_LIMITS.label} />
              <ArInput
                label="Eyebrow"
                kind="label"
                value={sections.details.ar?.eyebrow}
                onChange={(v) => setDetails((p) => ({ ...p, ar: { ...(p.ar ?? {}), eyebrow: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={sections.details.heading ?? ""}
                onChange={(e) => setDetails((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
              />
              <CharCount value={sections.details.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput
                label="Heading"
                kind="heading"
                value={sections.details.ar?.heading}
                onChange={(v) => setDetails((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Intro</label>
              <textarea
                value={sections.details.intro ?? ""}
                onChange={(e) => setDetails((p) => ({ ...p, intro: e.target.value }))}
                className={inputClass}
                rows={3}
                maxLength={FIELD_LIMITS.description}
              />
              <CharCount value={sections.details.intro ?? ""} max={FIELD_LIMITS.description} />
              <ArInput
                label="Intro"
                kind="description"
                multiline
                value={sections.details.ar?.intro}
                onChange={(v) => setDetails((p) => ({ ...p, ar: { ...(p.ar ?? {}), intro: v } }))}
              />
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-slate-600">
              {sections.details.items.length} item{sections.details.items.length === 1 ? "" : "s"}
            </p>
            <button
              type="button"
              onClick={addDetailItem}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Detail
            </button>
          </div>

          <div className="space-y-4">
            {sections.details.items.map((item, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Detail {i + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeDetailItem(i)}
                    className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                    title="Delete this detail"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid gap-4">
                  <div>
                    <label className={labelClass}>Type — controls the icon</label>
                    <select
                      value={item.key ?? "address"}
                      onChange={(e) => updateDetailItem(i, { key: e.target.value })}
                      className={inputClass}
                    >
                      {DETAIL_KEY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Title</label>
                    <input
                      value={item.title ?? ""}
                      onChange={(e) => updateDetailItem(i, { title: e.target.value })}
                      className={inputClass}
                      placeholder="Head Office"
                      maxLength={FIELD_LIMITS.label}
                    />
                    <CharCount value={item.title ?? ""} max={FIELD_LIMITS.label} />
                    <ArInput
                      label="Title"
                      kind="label"
                      value={item.ar?.title}
                      onChange={(v) => updateDetailItem(i, { ar: { ...(item.ar ?? {}), title: v } })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Value</label>
                    <input
                      value={item.value ?? ""}
                      onChange={(e) => updateDetailItem(i, { value: e.target.value })}
                      className={inputClass}
                      placeholder="Dubai, United Arab Emirates"
                      maxLength={FIELD_LIMITS.item}
                    />
                    <CharCount value={item.value ?? ""} max={FIELD_LIMITS.item} />
                    <FieldError error={detailValueError(item)} />
                    <ArInput
                      label="Value"
                      kind="item"
                      value={item.ar?.value}
                      onChange={(v) => updateDetailItem(i, { ar: { ...(item.ar ?? {}), value: v } })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Link</label>
                    <input
                      value={item.href ?? ""}
                      onChange={(e) => updateDetailItem(i, { href: e.target.value })}
                      className={inputClass}
                      placeholder="tel:+971... / mailto:... / https://..."
                      maxLength={FIELD_LIMITS.link}
                    />
                    <CharCount value={item.href ?? ""} max={FIELD_LIMITS.link} />
                    <FieldError error={validateUrl(item.href)} />
                    <span className="text-[11px] text-slate-400">
                      optional — tel:/mailto:/https link
                    </span>
                  </div>
                  <div>
                    <label className={labelClass}>Description (optional)</label>
                    <textarea
                      value={item.description ?? ""}
                      onChange={(e) => updateDetailItem(i, { description: e.target.value })}
                      className={inputClass}
                      rows={2}
                      maxLength={FIELD_LIMITS.summary}
                    />
                    <CharCount value={item.description ?? ""} max={FIELD_LIMITS.summary} />
                    <ArInput
                      label="Description"
                      kind="summary"
                      multiline
                      value={item.ar?.description}
                      onChange={(v) =>
                        updateDetailItem(i, { ar: { ...(item.ar ?? {}), description: v } })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            {sections.details.items.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-400">
                No contact details yet. Click &quot;Add Detail&quot; — at least one is required to save.
              </p>
            ) : null}
          </div>
        </CollapsibleSection>

        {/* Form Panel */}
        <CollapsibleSection
          title="Form Panel"
          isOpen={!!openSections.form}
          onToggle={() => toggleSection("form")}
        >
          <div className="grid gap-4">
            <div>
              <label className={labelClass}>Eyebrow</label>
              <input
                value={sections.form.eyebrow ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, eyebrow: e.target.value }))}
                className={inputClass}
                placeholder="Send a message"
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={sections.form.eyebrow ?? ""} max={FIELD_LIMITS.label} />
              <ArInput
                label="Eyebrow"
                kind="label"
                value={sections.form.ar?.eyebrow}
                onChange={(v) => setForm((p) => ({ ...p, ar: { ...(p.ar ?? {}), eyebrow: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={sections.form.heading ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
              />
              <CharCount value={sections.form.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput
                label="Heading"
                kind="heading"
                value={sections.form.ar?.heading}
                onChange={(v) => setForm((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Note (small text under the form)</label>
              <input
                value={sections.form.note ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
                className={inputClass}
                maxLength={FIELD_LIMITS.subtitle}
              />
              <CharCount value={sections.form.note ?? ""} max={FIELD_LIMITS.subtitle} />
              <ArInput
                label="Note"
                kind="subtitle"
                value={sections.form.ar?.note}
                onChange={(v) => setForm((p) => ({ ...p, ar: { ...(p.ar ?? {}), note: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Subjects (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(sections.form.subjects) ? sections.form.subjects.join(", ") : ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    subjects: e.target.value.split(",").map((s) => s.trim()),
                  }))
                }
                className={inputClass}
                placeholder="General Inquiry, Support, Partnership"
                maxLength={FIELD_LIMITS.summary}
              />
              <CharCount
                value={Array.isArray(sections.form.subjects) ? sections.form.subjects.join(", ") : ""}
                max={FIELD_LIMITS.summary}
              />
              <label className={labelClass} style={{ marginTop: 6 }}>
                Subjects — Arabic (comma-separated, same order)
              </label>
              <input
                type="text"
                dir="rtl"
                value={
                  Array.isArray(sections.form.ar?.subjects)
                    ? sections.form.ar.subjects.join("، ")
                    : ""
                }
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    ar: {
                      ...(p.ar ?? {}),
                      subjects: e.target.value.split(/،|,/).map((s) => s.trim()),
                    },
                  }))
                }
                className={inputClass}
                style={{ borderColor: "#16a34a" }}
                maxLength={FIELD_LIMITS.summary}
                placeholder="استفسار عام، الدعم، شراكة"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* WhatsApp Section */}
        <CollapsibleSection
          title="WhatsApp Section"
          isOpen={!!openSections.whatsappCta}
          onToggle={() => toggleSection("whatsappCta")}
        >
          <div className="grid gap-4">
            <div>
              <label className={labelClass}>Eyebrow</label>
              <input
                value={sections.whatsappCta.eyebrow ?? ""}
                onChange={(e) => setWhatsapp((p) => ({ ...p, eyebrow: e.target.value }))}
                className={inputClass}
                placeholder="Instant support"
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={sections.whatsappCta.eyebrow ?? ""} max={FIELD_LIMITS.label} />
              <ArInput
                label="Eyebrow"
                kind="label"
                value={sections.whatsappCta.ar?.eyebrow}
                onChange={(v) => setWhatsapp((p) => ({ ...p, ar: { ...(p.ar ?? {}), eyebrow: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={sections.whatsappCta.heading ?? ""}
                onChange={(e) => setWhatsapp((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
              />
              <CharCount value={sections.whatsappCta.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput
                label="Heading"
                kind="heading"
                value={sections.whatsappCta.ar?.heading}
                onChange={(v) => setWhatsapp((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Body</label>
              <textarea
                value={sections.whatsappCta.body ?? ""}
                onChange={(e) => setWhatsapp((p) => ({ ...p, body: e.target.value }))}
                className={inputClass}
                rows={3}
                maxLength={FIELD_LIMITS.description}
              />
              <CharCount value={sections.whatsappCta.body ?? ""} max={FIELD_LIMITS.description} />
              <ArInput
                label="Body"
                kind="description"
                multiline
                value={sections.whatsappCta.ar?.body}
                onChange={(v) => setWhatsapp((p) => ({ ...p, ar: { ...(p.ar ?? {}), body: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Button Label</label>
              <input
                value={sections.whatsappCta.button ?? ""}
                onChange={(e) => setWhatsapp((p) => ({ ...p, button: e.target.value }))}
                className={inputClass}
                placeholder="Chat on WhatsApp"
                maxLength={FIELD_LIMITS.button}
              />
              <CharCount value={sections.whatsappCta.button ?? ""} max={FIELD_LIMITS.button} />
              <ArInput
                label="Button"
                kind="button"
                value={sections.whatsappCta.ar?.button}
                onChange={(v) => setWhatsapp((p) => ({ ...p, ar: { ...(p.ar ?? {}), button: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Note</label>
              <input
                value={sections.whatsappCta.note ?? ""}
                onChange={(e) => setWhatsapp((p) => ({ ...p, note: e.target.value }))}
                className={inputClass}
                maxLength={FIELD_LIMITS.subtitle}
              />
              <CharCount value={sections.whatsappCta.note ?? ""} max={FIELD_LIMITS.subtitle} />
              <ArInput
                label="Note"
                kind="subtitle"
                value={sections.whatsappCta.ar?.note}
                onChange={(v) => setWhatsapp((p) => ({ ...p, ar: { ...(p.ar ?? {}), note: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Link</label>
              <input
                value={sections.whatsappCta.link ?? ""}
                onChange={(e) => setWhatsapp((p) => ({ ...p, link: e.target.value }))}
                className={inputClass}
                placeholder="https://wa.me/971..."
                maxLength={FIELD_LIMITS.link}
              />
              <CharCount value={sections.whatsappCta.link ?? ""} max={FIELD_LIMITS.link} />
              <FieldError error={validateUrl(sections.whatsappCta.link)} />
            </div>
          </div>
        </CollapsibleSection>

        {/* Map */}
        <CollapsibleSection
          title="Map"
          isOpen={!!openSections.map}
          onToggle={() => toggleSection("map")}
        >
          <div className="grid gap-4">
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={sections.map.heading ?? ""}
                onChange={(e) => setMap((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
              />
              <CharCount value={sections.map.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput
                label="Heading"
                kind="heading"
                value={sections.map.ar?.heading}
                onChange={(v) => setMap((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Office Name</label>
              <input
                value={sections.map.officeName ?? ""}
                onChange={(e) => setMap((p) => ({ ...p, officeName: e.target.value }))}
                className={inputClass}
                placeholder="HalaPark HQ"
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={sections.map.officeName ?? ""} max={FIELD_LIMITS.label} />
              <ArInput
                label="Office Name"
                kind="label"
                value={sections.map.ar?.officeName}
                onChange={(v) => setMap((p) => ({ ...p, ar: { ...(p.ar ?? {}), officeName: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input
                value={sections.map.address ?? ""}
                onChange={(e) => setMap((p) => ({ ...p, address: e.target.value }))}
                className={inputClass}
                placeholder="Dubai, United Arab Emirates"
                maxLength={FIELD_LIMITS.item}
              />
              <CharCount value={sections.map.address ?? ""} max={FIELD_LIMITS.item} />
              <ArInput
                label="Address"
                kind="item"
                value={sections.map.ar?.address}
                onChange={(v) => setMap((p) => ({ ...p, ar: { ...(p.ar ?? {}), address: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                value={sections.map.phone ?? ""}
                onChange={(e) => setMap((p) => ({ ...p, phone: e.target.value }))}
                className={inputClass}
                placeholder="+971 4 000 0000"
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={sections.map.phone ?? ""} max={FIELD_LIMITS.label} />
              <FieldError error={validatePhone(sections.map.phone)} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                value={sections.map.email ?? ""}
                onChange={(e) => setMap((p) => ({ ...p, email: e.target.value }))}
                className={inputClass}
                placeholder="hello@halapark.com"
                maxLength={FIELD_LIMITS.item}
              />
              <CharCount value={sections.map.email ?? ""} max={FIELD_LIMITS.item} />
              <FieldError error={validateEmail(sections.map.email)} />
            </div>
            <div>
              <label className={labelClass}>Working Hours</label>
              <input
                value={sections.map.hours ?? ""}
                onChange={(e) => setMap((p) => ({ ...p, hours: e.target.value }))}
                className={inputClass}
                placeholder="Monday - Friday: 9:00 AM - 6:00 PM"
                maxLength={FIELD_LIMITS.item}
              />
              <CharCount value={sections.map.hours ?? ""} max={FIELD_LIMITS.item} />
              <ArInput
                label="Working Hours"
                kind="item"
                value={sections.map.ar?.hours}
                onChange={(v) => setMap((p) => ({ ...p, ar: { ...(p.ar ?? {}), hours: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Weekend</label>
              <input
                value={sections.map.weekend ?? ""}
                onChange={(e) => setMap((p) => ({ ...p, weekend: e.target.value }))}
                className={inputClass}
                placeholder="Saturday &amp; Sunday: Closed"
                maxLength={FIELD_LIMITS.item}
              />
              <CharCount value={sections.map.weekend ?? ""} max={FIELD_LIMITS.item} />
              <ArInput
                label="Weekend"
                kind="item"
                value={sections.map.ar?.weekend}
                onChange={(v) => setMap((p) => ({ ...p, ar: { ...(p.ar ?? {}), weekend: v } }))}
              />
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
