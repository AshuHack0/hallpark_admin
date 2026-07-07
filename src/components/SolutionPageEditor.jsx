import { useEffect, useState } from "react";
import { Plus, Trash2, Save, ChevronDown, Loader2, Upload, Pencil, X, ImageIcon } from "lucide-react";
import { api, uploadMediaToCloudinary } from "../lib/api";
import { FIELD_LIMITS, CharCount, FieldError, ArInput } from "./CappedField";
import { validateUrl, validateImageFile, validateVideoFile } from "../lib/validators";
import { FRONTEND_PAGES } from "../constants/pages.js";

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500";

// Reusable page-link picker for CTA link fields. Renders a <select> of the
// configured FRONTEND_PAGES paths plus an "Other…" option that reveals a free
// text input — so existing custom/non-listed links are preserved and editable.
// eslint-disable-next-line react/prop-types
function PageLinkSelect({ value, onChange }) {
  const val = value ?? "";
  const pagePaths = FRONTEND_PAGES.map((p) => p.path);
  const isKnown = val === "" || pagePaths.includes(val);
  const [custom, setCustom] = useState(!isKnown);
  const handleSelect = (e) => {
    const next = e.target.value;
    if (next === "__other__") {
      setCustom(true);
      return;
    }
    setCustom(false);
    onChange(next);
  };
  return (
    <div className="space-y-2">
      <select value={custom ? "__other__" : val} onChange={handleSelect} className={inputClass}>
        <option value="">— Select a page —</option>
        {FRONTEND_PAGES.map((p) => (
          <option key={p.slug} value={p.path}>{p.name} ({p.path})</option>
        ))}
        <option value="__other__">Other… (custom URL)</option>
      </select>
      {custom && (
        <>
          <input
            value={val}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            placeholder="/custom-path or https://…"
            maxLength={FIELD_LIMITS.link}
          />
          <FieldError error={validateUrl(val)} />
        </>
      )}
    </div>
  );
}

const DEFAULT_HERO = {
  title: "",
  titleAccent: "",
  subtitle: "",
  ctaLabel: "",
  ctaLink: "",
  mediaType: "video",
  image: "",
  videoUrl: "",
  ar: {},
};

const DEFAULT_CHALLENGES = {
  heading: "",
  headingGradient: "",
  subtitle: "",
  description: "",
  image: "",
  items: [],
  ctaLabel: "",
  ctaLink: "",
  ar: {},
};

const DEFAULT_SOLUTIONS = {
  heading: "Our Solutions",
  headingGradient: "Solutions",
  subtitle: "Intelligent parking systems built for efficiency, control, and scale",
  cards: [
    { title: "Smart Parking Management", description: "Centralized platform for monitoring occupancy, controlling parking operations, and managing multiple facilities in real time.", image: "/hf_20260327_064316_9c7b1a28-dbfa-456e-b88a-0087cb567a61.png" },
    { title: "Automated Access Control", description: "ANPR and smart barrier systems enabling seamless and secure vehicle access.", image: "/hf_20260327_061010_f3bc038b-576f-4903-8896-5d998cc78527.png" },
    { title: "Parking Guidance System", description: "Real-time wayfinding and space guidance to reduce congestion and improve traffic flow inside facilities.", image: "/hf_20260327_060926_cbb82448-441c-42ee-9589-785e7acd7565.png" },
    { title: "Mobile & Digital Experience", description: "Mobile reservations, digital payments, subscriptions, and contactless parking interactions.", image: "/hf_20260327_065515_cd3808b8-d99d-4faa-817d-e3f772726da6.png" },
    { title: "Digital Valet Operations", description: "Structured valet workflows with digital ticketing, vehicle tracking, and retrieval management.", image: "/hf_20260327_061900_db12a62e-2867-44b6-83f0-ea7f1a5442ef.png" },
    { title: "EV Charging Integration", description: "Integrated EV charging infrastructure with smart billing and charging management.", image: "/hf_20260327_070648_996630bc-828e-4cd7-8cb1-f42c30332d86.png" },
    { title: "AI & Parking Analytics", description: "Advanced occupancy analytics, traffic insights, predictive trends, and reporting dashboards.", image: "/hf_20260327_062407_6dca49c0-90dd-468a-96f9-b36bba13ea8b.png" },
  ],
};

const DEFAULT_INTEGRATION = {
  heading: "Solution Integration",
  headingGradient: "Integration",
  subtitle: "End-to-End Integrated Parking Solution",
  cards: [
    { title: "All-in-One Barrier Integration", description: "All-in-one compact system with barriers, AI cameras, and lighting for efficient parking.", points: ["Smart barrier control", "AI camera integration", "Automated lighting"], image: "/hf_20260327_061900_db12a62e-2867-44b6-83f0-ea7f1a5442ef.png", gradient: "from-[#0078E0]/85 via-[#0088FF]/60 to-[#0088FF]/20" },
    { title: "ANPR & AI Camera Integration", description: "ANPR and AI cameras enable secure, real-time parking detection.", points: ["License plate recognition", "Real-time detection", "Secure access control"], image: "/hf_20260327_064316_9c7b1a28-dbfa-456e-b88a-0087cb567a61.png", gradient: "from-[#0050B3]/85 via-[#0066CC]/60 to-[#0088FF]/20" },
    { title: "Guidance Display Integration", description: "Smart displays show real-time parking info for better user experience.", points: ["Live space availability", "Wayfinding signage", "Zone-level guidance"], image: "/hf_20260327_062407_6dca49c0-90dd-468a-96f9-b36bba13ea8b.png", gradient: "from-[#004F9A]/85 via-[#0070D0]/60 to-[#1AB2FF]/20" },
    { title: "Software & Kiosk Integration", description: "Unified system with apps, operations, and kiosks for quick payments and access.", points: ["Mobile app & web portal", "Self-service kiosks", "Integrated payments"], image: "/hf_20260327_065515_cd3808b8-d99d-4faa-817d-e3f772726da6.png", gradient: "from-[#005FA3]/85 via-[#0078C8]/60 to-[#1AB2FF]/20" },
    { title: "Sensor-Based Parking Management", description: "IoT sensors enable real-time parking tracking and space management.", points: ["Bay-level occupancy", "Instant alerts", "Predictive analytics"], image: "/hf_20260327_071129_800d49da-6fb8-4b7e-a1ba-b32db4c31565.png", gradient: "from-[#003F7F]/85 via-[#005BB8]/60 to-[#0088FF]/20" },
    { title: "End-to-End System Integration", description: "Integrated platform for scalable, automated parking operations.", points: ["IoT sensor management", "Guidance display system", "Full stack automation"], image: "/hf_20260327_060926_cbb82448-441c-42ee-9589-785e7acd7565.png", gradient: "from-[#003F7F]/85 via-[#0060B8]/60 to-[#0088FF]/20" },
  ],
};

const DEFAULT_TRUST = {
  heading: "Built for Smart Cities",
  headingGradient: "Smart Cities",
  subtitle: "HalaPark extends beyond parking into urban mobility infrastructure, supporting large-scale smart city development and city-wide optimization.",
};

const DEFAULT_FEATURES = {
  heading: "Built for High-Demand Environments",
  headingGradient: "Environments",
  subtitle: "From airports to smart cities, HalaPark scales across every high-traffic environment.",
  image: "",
  industries: [
    { icon: "Zap", label: "Airports" },
    { icon: "Building2", label: "Shopping Malls" },
    { icon: "BadgeCheck", label: "Hotels" },
    { icon: "Cctv", label: "Residential Towers" },
    { icon: "Shield", label: "Hospitals" },
    { icon: "MapPin", label: "Universities" },
    { icon: "Lock", label: "Government Facilities" },
    { icon: "TrendingUp", label: "Smart Cities" },
  ],
};

// Icon names the frontend (INDUSTRY_ICONS) knows how to render.
const INDUSTRY_ICON_NAMES = [
  "Zap", "Building2", "BadgeCheck", "Cctv", "Shield", "MapPin", "Lock", "TrendingUp", "Car", "CreditCard", "Check",
];

const DEFAULT_DEPLOYMENT = {
  heading: "Deployment",
  headingGradient: "Journey",
  subtitle: "We ensure a smooth rollout by understanding your environment, integrating with existing systems, and improving performance over time without disruption.",
  steps: [
    { step: "01", title: "Audit Current Setup", description: "Mapping gates, cameras, payment flows, access rules, and workflows." },
    { step: "02", title: "Connect the Stack", description: "Integration with hardware, software, and payment systems while preserving operations." },
    { step: "03", title: "Launch & Optimize", description: "Go live with dashboards, alerts, reporting, and continuous optimization." },
  ],
  image: "",
  panelTitle: "Go live in days,",
  panelTitleAccent: "not months.",
};

const DEFAULT_WHY = {
  heading: "Why Leading Developments Choose Halapark?",
  headingGradient: "Choose Halapark?",
};

const DEFAULT_CTA = {
  heading: "Transform Parking Into a Fully Connected Mobility Infrastructure",
  headingGradient: "Mobility Infrastructure",
  subtitle: "Halapark replaces fragmented parking systems with one intelligent platform that connects access control, real-time operations, and data-driven intelligence. Built for scale, designed for modern developments, and engineered to upgrade existing infrastructure without disruption.",
  ctaLabel: "Request Demo",
  ctaSecondaryLabel: "Talk to Our Team",
};

// Detail (blog-style) pages rendered at /solutions/[slug]. Empty by default —
// loadData() pulls the real list from the DB.
const DEFAULT_DETAILS = [];

const slugify = (s = "") =>
  s
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function makeBlankDetail() {
  return {
    slug: "",
    group: "",
    eyebrow: "New Solution",
    image: "/image.png",
    // 1. Banner
    title: "New Solution",
    subtitle: "",
    shortDescription: "",
    ctaLabel: "Contact Us",
    ctaLink: "/contact",
    // 2. Why X Matters
    whyHeading: "",
    whyBody: "",
    whyImage: "",
    // 3. Problem We Face
    problemHeading: "Problem We Face",
    problemBody: "",
    // 4. Our Solution
    solutionHeading: "Our Solution",
    solutionBody: "",
    // 5. Key Benefits — [{ title, description }]
    benefitsHeading: "Key Benefits",
    keyBenefits: [],
    // 6. How It Works — steps [{ title, description }] OR a paragraph
    howItWorksHeading: "How It Works",
    howItWorksBody: "",
    steps: [],
    // 7. Other Related Services — array of slugs
    relatedHeading: "Other Related Services",
    relatedServices: [],
    ar: {},
  };
}

// Editor for a bilingual list of { title, description } objects (Key Benefits,
// How-It-Works steps). EN fields live on the item; AR fields live on a parallel
// `ar.<field>` array by index.
// eslint-disable-next-line react/prop-types
function ObjListEditor({ label, items, arItems, onItemsChange, onArItemsChange, showStepNumber }) {
  const list = Array.isArray(items) ? items : [];
  const arList = Array.isArray(arItems) ? arItems : [];
  const setItem = (i, patch) => onItemsChange(list.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const setAr = (i, patch) => {
    const next = [...arList];
    while (next.length <= i) next.push({});
    next[i] = { ...(next[i] ?? {}), ...patch };
    onArItemsChange(next);
  };
  const add = () => onItemsChange([...list, { title: "", description: "" }]);
  const remove = (i) => {
    onItemsChange(list.filter((_, idx) => idx !== i));
    onArItemsChange(arList.filter((_, idx) => idx !== i));
  };
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">{label} ({list.length})</span>
        <button type="button" onClick={add} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      <div className="space-y-3">
        {list.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400">No items yet.</p>
        ) : (
          list.map((item, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                  {showStepNumber ? `Step ${i + 1}` : `Item ${i + 1}`}
                </span>
                <button type="button" onClick={() => remove(i)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100">
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
              <label className={labelClass}>Title</label>
              <input value={item.title ?? ""} onChange={(e) => setItem(i, { title: e.target.value })} className={inputClass} maxLength={FIELD_LIMITS.heading} />
              <ArInput label="Title" kind="heading" value={arList[i]?.title} onChange={(v) => setAr(i, { title: v })} />
              <label className={labelClass} style={{ marginTop: 6 }}>Description</label>
              <textarea value={item.description ?? ""} onChange={(e) => setItem(i, { description: e.target.value })} className={inputClass} rows={2} maxLength={FIELD_LIMITS.summary} />
              <ArInput label="Description" kind="summary" multiline value={arList[i]?.description} onChange={(v) => setAr(i, { description: v })} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Picker for "Other Related Services" — choose other solution detail slugs to
// cross-link. `allDetails` is the full list (so options exclude the current one).
// eslint-disable-next-line react/prop-types
function RelatedServicesPicker({ currentSlug, selected, allDetails, onChange }) {
  const chosen = Array.isArray(selected) ? selected : [];
  const options = (allDetails ?? []).filter((d) => d.slug && d.slug !== currentSlug);
  const toggle = (slug) => onChange(chosen.includes(slug) ? chosen.filter((s) => s !== slug) : [...chosen, slug]);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="mb-2 text-xs font-semibold text-slate-600">Pick related solutions ({chosen.length} selected)</p>
      {options.length === 0 ? (
        <p className="text-xs text-slate-400">No other solutions yet. Add more first.</p>
      ) : (
        <div className="max-h-44 space-y-1 overflow-y-auto">
          {options.map((d) => (
            <label key={d.slug} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50">
              <input type="checkbox" checked={chosen.includes(d.slug)} onChange={() => toggle(d.slug)} className="h-4 w-4 accent-[#0088FF]" />
              <span className="truncate text-slate-700">{d.title || d.slug}</span>
              <span className="ml-auto shrink-0 text-[10px] text-slate-400">/{d.slug}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// Manager for the solution dropdown CATEGORIES (`solutions.groups` — an ordered
// list of group names). Add / rename / reorder / delete. The navbar dropdown
// shows these groups (in this order); each card is assigned to one of them.
// `cards` is passed so we can warn when deleting a group still in use.
// eslint-disable-next-line react/prop-types
function CategoryManager({ groups, arGroups, cards, onChange, onArChange }) {
  const list = Array.isArray(groups) ? groups : [];
  const arList = Array.isArray(arGroups) ? arGroups : [];
  const usage = (name) => (cards ?? []).filter((c) => (c.group || "") === name).length;
  const rename = (i, value) => onChange(list.map((g, idx) => (idx === i ? value : g)));
  const renameAr = (i, value) => {
    const next = [...arList];
    while (next.length <= i) next.push("");
    next[i] = value;
    onArChange(next);
  };
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    // Keep Arabic names aligned by index.
    const nextAr = [...arList];
    while (nextAr.length <= Math.max(i, j)) nextAr.push("");
    [nextAr[i], nextAr[j]] = [nextAr[j], nextAr[i]];
    onArChange(nextAr);
  };
  const remove = (i) => {
    onChange(list.filter((_, idx) => idx !== i));
    onArChange(arList.filter((_, idx) => idx !== i));
  };
  const add = () => onChange([...list, "New Category"]);
  return (
    <div className="mb-5 rounded-xl border border-[#0088FF]/20 bg-[#F4F9FF] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Solution Categories ({list.length})</h3>
          <p className="text-[11px] text-slate-500">The groups shown in the Solutions dropdown. Assign each card to one below.</p>
        </div>
        <button
          type="button"
          onClick={add}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
        >
          <Plus className="h-3.5 w-3.5" /> Add Category
        </button>
      </div>
      {list.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-200 bg-white px-3 py-2 text-xs text-slate-400">
          No categories yet. Cards with no category fall under a generic &quot;Solutions&quot; group.
        </p>
      ) : (
        <div className="space-y-2">
          {list.map((g, i) => {
            const count = usage(g);
            return (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2">
                <span className="text-[11px] font-bold text-slate-300 w-5 text-center">{i + 1}</span>
                <div className="flex-1 space-y-1">
                  <input
                    value={g}
                    onChange={(e) => rename(i, e.target.value)}
                    className={inputClass}
                    placeholder="Category (English)"
                    maxLength={FIELD_LIMITS.label}
                  />
                  <input
                    dir="rtl"
                    value={arList[i] ?? ""}
                    onChange={(e) => renameAr(i, e.target.value)}
                    className={inputClass}
                    style={{ borderColor: "#16a34a" }}
                    placeholder="الفئة (عربي)"
                    maxLength={FIELD_LIMITS.label}
                  />
                </div>
                <span className="shrink-0 text-[10px] font-semibold text-slate-400">{count} card{count === 1 ? "" : "s"}</span>
                <div className="flex shrink-0 items-center gap-1">
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Move up" className="rounded border border-slate-200 px-1.5 py-1 text-xs text-slate-500 hover:text-[#0088FF] disabled:opacity-30">↑</button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} title="Move down" className="rounded border border-slate-200 px-1.5 py-1 text-xs text-slate-500 hover:text-[#0088FF] disabled:opacity-30">↓</button>
                  <button
                    type="button"
                    onClick={() => { if (count === 0 || window.confirm(`Delete "${g}"? ${count} card(s) use it and will become ungrouped.`)) remove(i); }}
                    title="Delete category"
                    className="rounded border border-red-200 bg-red-50 px-1.5 py-1 text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Full add/edit modal for a single solution detail page. Edits a local draft and
// returns it via onSave; the parent merges it into `details` (persisted on the
// page's main "Save Changes").
// eslint-disable-next-line react/prop-types
function DetailEditModal({ initial, isNew, allDetails, onSave, onClose }) {
  const [draft, setDraft] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [err, setErr] = useState("");

  const setField = (field, value) => setDraft((d) => ({ ...d, [field]: value }));

  async function handleUpload(file) {
    const err = validateImageFile(file);
    if (err) { setErr(err); return; }
    setErr("");
    setUploading(true);
    setUploadPct(0);
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) => setUploadPct(pct));
      setField("image", url);
    } catch {
      setErr("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit() {
    if (!draft.slug?.trim()) {
      setErr("A slug is required (the URL: /solutions/<slug>).");
      return;
    }
    const cleanedSlug = slugify(draft.slug);
    onSave({ ...draft, slug: cleanedSlug });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 className="text-lg font-bold text-[#050A13]">
              {isNew ? "Add Solution Detail" : "Edit Solution Detail"}
            </h3>
            <p className="text-xs text-slate-500">
              Shown at <code className="rounded bg-slate-100 px-1 py-0.5">/solutions/{draft.slug || "<slug>"}</code>
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {err && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm font-medium text-red-700">
              {err}
            </div>
          )}

          {/* Slug + Eyebrow */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Slug (URL) *</label>
              <div className="flex gap-2">
                <input
                  value={draft.slug ?? ""}
                  onChange={(e) => setField("slug", e.target.value)}
                  className={inputClass}
                  placeholder="seamless-integrations"
                  maxLength={FIELD_LIMITS.link}
                />
                <button
                  type="button"
                  onClick={() => setField("slug", slugify(draft.title || draft.eyebrow))}
                  className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:text-[#0088FF]"
                  title="Generate slug from title"
                >
                  Auto
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Eyebrow (card label)</label>
              <input
                value={draft.eyebrow ?? ""}
                onChange={(e) => setField("eyebrow", e.target.value)}
                className={inputClass}
                placeholder="Seamless Integrations"
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={draft.eyebrow ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Eyebrow" kind="label" value={draft.ar?.eyebrow} onChange={(v) => setField("ar", { ...(draft.ar ?? {}), eyebrow: v })} />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className={labelClass}>Title</label>
            <input
              value={draft.title ?? ""}
              onChange={(e) => setField("title", e.target.value)}
              className={inputClass}
              placeholder="End-to-End Connected Infrastructure for Smart Parking"
              maxLength={FIELD_LIMITS.heading}
            />
            <CharCount value={draft.title ?? ""} max={FIELD_LIMITS.heading} />
            <ArInput label="Title" kind="heading" value={draft.ar?.title} onChange={(v) => setField("ar", { ...(draft.ar ?? {}), title: v })} />
          </div>

          {/* ── 1. BANNER ─────────────────────────────────────────────── */}
          <p className="pt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0088FF]">1 · Banner</p>
          <div>
            <label className={labelClass}>Subtitle (eyebrow above title)</label>
            <input
              value={draft.subtitle ?? ""}
              onChange={(e) => setField("subtitle", e.target.value)}
              className={inputClass}
              placeholder="The Digital Backbone of Modern Parking Management"
              maxLength={FIELD_LIMITS.subtitle}
            />
            <CharCount value={draft.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
            <ArInput label="Subtitle" kind="subtitle" value={draft.ar?.subtitle} onChange={(v) => setField("ar", { ...(draft.ar ?? {}), subtitle: v })} />
          </div>
          <div>
            <label className={labelClass}>Short Description</label>
            <textarea
              value={draft.shortDescription ?? ""}
              onChange={(e) => setField("shortDescription", e.target.value)}
              className={inputClass}
              rows={2}
              placeholder="Seamlessly connect parking operations, security systems..."
              maxLength={FIELD_LIMITS.long}
            />
            <CharCount value={draft.shortDescription ?? ""} max={FIELD_LIMITS.long} />
            <ArInput label="Short Description" kind="long" multiline value={draft.ar?.shortDescription} onChange={(v) => setField("ar", { ...(draft.ar ?? {}), shortDescription: v })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>CTA Label</label>
              <input value={draft.ctaLabel ?? ""} onChange={(e) => setField("ctaLabel", e.target.value)} className={inputClass} placeholder="Contact Us" maxLength={FIELD_LIMITS.button} />
              <CharCount value={draft.ctaLabel ?? ""} max={FIELD_LIMITS.button} />
              <ArInput label="CTA Label" kind="button" value={draft.ar?.ctaLabel} onChange={(v) => setField("ar", { ...(draft.ar ?? {}), ctaLabel: v })} />
            </div>
            <div>
              <label className={labelClass}>CTA Link</label>
              <PageLinkSelect value={draft.ctaLink} onChange={(v) => setField("ctaLink", v)} />
            </div>
          </div>

          {/* Banner Image */}
          <div>
            <label className={labelClass}>Banner Image</label>
            <div className="flex items-start gap-3">
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                {draft.image && draft.image !== "/image.png" ? (
                  <img src={draft.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  value={draft.image ?? ""}
                  onChange={(e) => setField("image", e.target.value)}
                  className={inputClass}
                  placeholder="Image URL"
                  maxLength={FIELD_LIMITS.link}
                />
                <FieldError error={validateUrl(draft.image ?? "")} />
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff]">
                  {uploading ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {uploadPct}%</>
                  ) : (
                    <><Upload className="h-3.5 w-3.5" /> Upload image</>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* ── 2. WHY X MATTERS ──────────────────────────────────────── */}
          <p className="pt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0088FF]">2 · Why It Matters</p>
          <div>
            <label className={labelClass}>Why Heading</label>
            <input value={draft.whyHeading ?? ""} onChange={(e) => setField("whyHeading", e.target.value)} className={inputClass} placeholder="Why Smart Ecosystem Integration Matters?" maxLength={FIELD_LIMITS.heading} />
            <CharCount value={draft.whyHeading ?? ""} max={FIELD_LIMITS.heading} />
            <ArInput label="Why Heading" kind="heading" value={draft.ar?.whyHeading} onChange={(v) => setField("ar", { ...(draft.ar ?? {}), whyHeading: v })} />
          </div>
          <div>
            <label className={labelClass}>Why Body (use blank lines to split paragraphs)</label>
            <textarea value={draft.whyBody ?? ""} onChange={(e) => setField("whyBody", e.target.value)} className={inputClass} rows={5} maxLength={2400} />
            <ArInput label="Why Body" kind="long" multiline value={draft.ar?.whyBody} onChange={(v) => setField("ar", { ...(draft.ar ?? {}), whyBody: v })} />
          </div>
          <div>
            <label className={labelClass}>Why-Section Image URL (optional — defaults to banner image)</label>
            <input value={draft.whyImage ?? ""} onChange={(e) => setField("whyImage", e.target.value)} className={inputClass} placeholder="Image URL" maxLength={FIELD_LIMITS.link} />
            <FieldError error={validateUrl(draft.whyImage ?? "")} />
          </div>

          {/* ── 3. PROBLEM WE FACE ────────────────────────────────────── */}
          <p className="pt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0088FF]">3 · Problem We Face</p>
          <div>
            <label className={labelClass}>Problem Heading</label>
            <input value={draft.problemHeading ?? ""} onChange={(e) => setField("problemHeading", e.target.value)} className={inputClass} placeholder="Problem We Face" maxLength={FIELD_LIMITS.heading} />
            <ArInput label="Problem Heading" kind="heading" value={draft.ar?.problemHeading} onChange={(v) => setField("ar", { ...(draft.ar ?? {}), problemHeading: v })} />
          </div>
          <div>
            <label className={labelClass}>Problem Body (blank lines split paragraphs)</label>
            <textarea value={draft.problemBody ?? ""} onChange={(e) => setField("problemBody", e.target.value)} className={inputClass} rows={4} maxLength={2400} />
            <ArInput label="Problem Body" kind="long" multiline value={draft.ar?.problemBody} onChange={(v) => setField("ar", { ...(draft.ar ?? {}), problemBody: v })} />
          </div>

          {/* ── 4. OUR SOLUTION ───────────────────────────────────────── */}
          <p className="pt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0088FF]">4 · Our Solution</p>
          <div>
            <label className={labelClass}>Solution Heading</label>
            <input value={draft.solutionHeading ?? ""} onChange={(e) => setField("solutionHeading", e.target.value)} className={inputClass} placeholder="Our Solution" maxLength={FIELD_LIMITS.heading} />
            <ArInput label="Solution Heading" kind="heading" value={draft.ar?.solutionHeading} onChange={(v) => setField("ar", { ...(draft.ar ?? {}), solutionHeading: v })} />
          </div>
          <div>
            <label className={labelClass}>Solution Body (blank lines split paragraphs)</label>
            <textarea value={draft.solutionBody ?? ""} onChange={(e) => setField("solutionBody", e.target.value)} className={inputClass} rows={4} maxLength={2400} />
            <ArInput label="Solution Body" kind="long" multiline value={draft.ar?.solutionBody} onChange={(v) => setField("ar", { ...(draft.ar ?? {}), solutionBody: v })} />
          </div>

          {/* ── 5. KEY BENEFITS ───────────────────────────────────────── */}
          <p className="pt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0088FF]">5 · Key Benefits</p>
          <div>
            <label className={labelClass}>Benefits Heading</label>
            <input value={draft.benefitsHeading ?? ""} onChange={(e) => setField("benefitsHeading", e.target.value)} className={inputClass} placeholder="Key Benefits" maxLength={FIELD_LIMITS.heading} />
            <ArInput label="Benefits Heading" kind="heading" value={draft.ar?.benefitsHeading} onChange={(v) => setField("ar", { ...(draft.ar ?? {}), benefitsHeading: v })} />
          </div>
          <ObjListEditor
            label="Key Benefits"
            items={draft.keyBenefits ?? []}
            arItems={draft.ar?.keyBenefits ?? []}
            onItemsChange={(items) => setField("keyBenefits", items)}
            onArItemsChange={(items) => setField("ar", { ...(draft.ar ?? {}), keyBenefits: items })}
          />

          {/* ── 6. HOW IT WORKS ───────────────────────────────────────── */}
          <p className="pt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0088FF]">6 · How It Works</p>
          <div>
            <label className={labelClass}>How It Works Heading</label>
            <input value={draft.howItWorksHeading ?? ""} onChange={(e) => setField("howItWorksHeading", e.target.value)} className={inputClass} placeholder="How It Works" maxLength={FIELD_LIMITS.heading} />
            <ArInput label="How It Works Heading" kind="heading" value={draft.ar?.howItWorksHeading} onChange={(v) => setField("ar", { ...(draft.ar ?? {}), howItWorksHeading: v })} />
          </div>
          <p className="text-[11px] text-slate-400">Add numbered Steps below, OR leave steps empty and write a single paragraph.</p>
          <ObjListEditor
            label="Steps"
            showStepNumber
            items={draft.steps ?? []}
            arItems={draft.ar?.steps ?? []}
            onItemsChange={(items) => setField("steps", items)}
            onArItemsChange={(items) => setField("ar", { ...(draft.ar ?? {}), steps: items })}
          />
          <div>
            <label className={labelClass}>How It Works Paragraph (used only if no Steps)</label>
            <textarea value={draft.howItWorksBody ?? ""} onChange={(e) => setField("howItWorksBody", e.target.value)} className={inputClass} rows={3} maxLength={FIELD_LIMITS.long} />
            <ArInput label="How It Works Body" kind="long" multiline value={draft.ar?.howItWorksBody} onChange={(v) => setField("ar", { ...(draft.ar ?? {}), howItWorksBody: v })} />
          </div>

          {/* ── 7. OTHER RELATED SERVICES ─────────────────────────────── */}
          <p className="pt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0088FF]">7 · Other Related Services</p>
          <div>
            <label className={labelClass}>Related Heading</label>
            <input value={draft.relatedHeading ?? ""} onChange={(e) => setField("relatedHeading", e.target.value)} className={inputClass} placeholder="Other Related Services" maxLength={FIELD_LIMITS.heading} />
            <ArInput label="Related Heading" kind="heading" value={draft.ar?.relatedHeading} onChange={(v) => setField("ar", { ...(draft.ar ?? {}), relatedHeading: v })} />
          </div>
          <RelatedServicesPicker
            currentSlug={draft.slug}
            selected={draft.relatedServices ?? []}
            allDetails={allDetails}
            onChange={(slugs) => setField("relatedServices", slugs)}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0088FF] px-5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isNew ? "Add detail" : "Apply changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 sm:px-5 hover:bg-slate-50 transition"
      >
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="border-t border-slate-200 px-4 py-4 sm:px-5">{children}</div>}
    </div>
  );
}

export default function SolutionPageEditor() {
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [challenges, setChallenges] = useState(DEFAULT_CHALLENGES);
  const [solutions, setSolutions] = useState(DEFAULT_SOLUTIONS);
  const [integration, setIntegration] = useState(DEFAULT_INTEGRATION);
  const [trust, setTrust] = useState(DEFAULT_TRUST);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [deployment, setDeployment] = useState(DEFAULT_DEPLOYMENT);
  const [why, setWhy] = useState(DEFAULT_WHY);
  const [cta, setCtA] = useState(DEFAULT_CTA);
  const [details, setDetails] = useState(DEFAULT_DETAILS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState({});
  // Detail modal: editingDetail = { index, draft, isNew } | null
  const [editingDetail, setEditingDetail] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  // Open the detail-page editor modal for a given solution card. Finds the
  // matching detail by slug, or seeds a new one from the card's own fields.
  function openDetailForCard(card) {
    const cardSlug = card.slug || slugify(card.title);
    // Backfill the slug onto the card itself — the navbar/grid filter cards by
    // slug, so a card with an empty slug silently disappears from the menu.
    if (cardSlug && card.slug !== cardSlug) {
      setSolutions((p) => ({
        ...p,
        cards: (p.cards ?? []).map((c) =>
          c === card || (c.title === card.title && !c.slug) ? { ...c, slug: cardSlug } : c
        ),
      }));
    }
    const existing = details.find((d) => d.slug === cardSlug);
    if (existing) {
      setEditingDetail({ slug: cardSlug, draft: { ...existing }, isNew: false });
    } else {
      setEditingDetail({
        slug: cardSlug,
        isNew: true,
        draft: {
          ...makeBlankDetail(),
          slug: cardSlug,
          eyebrow: card.title || "New Solution",
          title: card.title || "New Solution Detail",
          intro: card.description || "",
          image: card.image && card.image !== "/image.png" ? card.image : "/image.png",
        },
      });
    }
  }

  // Merge the modal's draft back into `details` by slug (update or append).
  function saveDetailFromModal(updated) {
    setDetails((list) => {
      const idx = list.findIndex((d) => d.slug === updated.slug);
      if (idx === -1) return [...list, updated];
      const next = [...list];
      next[idx] = updated;
      return next;
    });
    setEditingDetail(null);
  }

  async function loadData() {
    try {
      setLoading(true);
      const data = await api.getPage("solutions");
      if (data?.page?.sections) {
        setHero(data.page.sections.hero || DEFAULT_HERO);
        setChallenges(data.page.sections.challenges || DEFAULT_CHALLENGES);
        setSolutions(data.page.sections.solutions || DEFAULT_SOLUTIONS);
        setIntegration(data.page.sections.integration || DEFAULT_INTEGRATION);
        setTrust(data.page.sections.trust || DEFAULT_TRUST);
        setFeatures({ ...DEFAULT_FEATURES, ...(data.page.sections.features || {}) });
        setDeployment({ ...DEFAULT_DEPLOYMENT, ...(data.page.sections.deployment || {}) });
        setWhy(data.page.sections.why || DEFAULT_WHY);
        setCtA(data.page.sections.cta || DEFAULT_CTA);
        setDetails(Array.isArray(data.page.sections.details) ? data.page.sections.details : DEFAULT_DETAILS);
      }
    } catch (err) {
      setError("Failed to load page data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await api.updatePage("solutions", {
        sections: { hero, challenges, solutions, integration, trust, features, deployment, why, cta, details },
      });
      setSuccess("Solutions page saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save page");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleVideoUpload(file) {
    const err = validateVideoFile(file);
    if (err) { setError(err); return; }
    const key = "hero-video";
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "video", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct }))
      );
      setHero((p) => ({ ...p, videoUrl: url }));
      setSuccess("Video uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Video upload failed");
      console.error(err);
    } finally {
      setUploadProgress((p) => ({ ...p, [key]: undefined }));
    }
  }

  async function handleHeroImageUpload(file) {
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    const key = "hero-image";
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct }))
      );
      setHero((p) => ({ ...p, image: url }));
      setSuccess("Image uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Image upload failed");
      console.error(err);
    } finally {
      setUploadProgress((p) => ({ ...p, [key]: undefined }));
    }
  }

  async function handleChallengesImageUpload(file) {
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    const key = "challenges-image";
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct }))
      );
      setChallenges((p) => ({ ...p, image: url }));
      setSuccess("Image uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Image upload failed");
      console.error(err);
    } finally {
      setUploadProgress((p) => ({ ...p, [key]: undefined }));
    }
  }

  async function handleImageUpload(section, cardIndex, file) {
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    const key = `${section}-${cardIndex}`;
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct }))
      );
      if (section === "solutions") {
        setSolutions((p) => ({
          ...p,
          cards: p.cards.map((c, i) => i === cardIndex ? { ...c, image: url } : c)
        }));
      } else if (section === "integration") {
        setIntegration((p) => ({
          ...p,
          cards: p.cards.map((c, i) => i === cardIndex ? { ...c, image: url } : c)
        }));
      } else if (section === "cta") {
        setCtA((p) => ({ ...p, image: url }));
      } else if (section === "why") {
        setWhy((p) => ({ ...p, image: url }));
      } else if (section === "features") {
        setFeatures((p) => ({ ...p, image: url }));
      } else if (section === "deployment") {
        setDeployment((p) => ({ ...p, image: url }));
      }
      setSuccess("Image uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Image upload failed");
      console.error(err);
    } finally {
      setUploadProgress((p) => ({ ...p, [key]: undefined }));
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="w-full space-y-6 px-6 py-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#050A13]">Solutions Page Editor</h1>
          <p className="mt-2 text-sm text-slate-600">Manage all 8 solution page sections</p>
        </div>
      </div>

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium text-green-700">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-700">
          ❌ {error}
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-lg bg-[#0088FF] px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {saving ? "Saving..." : "Save Changes"}
      </button>

      <div className="space-y-6">

      {/* HERO SECTION */}
      <CollapsibleSection title="Hero Section" defaultOpen={true}>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Title</label>
              <input
                value={hero.title ?? ""}
                onChange={(e) => setHero((p) => ({ ...p, title: e.target.value }))}
                className={inputClass}
                placeholder="Intelligent Parking Experiences"
                maxLength={FIELD_LIMITS.heading}
              />
              <CharCount value={hero.title ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Title" kind="heading" value={hero.ar?.title} onChange={(v) => setHero((p) => ({ ...p, ar: { ...(p.ar ?? {}), title: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Title Accent (gradient part)</label>
              <input
                value={hero.titleAccent ?? ""}
                onChange={(e) => setHero((p) => ({ ...p, titleAccent: e.target.value }))}
                className={inputClass}
                placeholder="Built for the Future"
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={hero.titleAccent ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Title Accent" kind="label" value={hero.ar?.titleAccent} onChange={(v) => setHero((p) => ({ ...p, ar: { ...(p.ar ?? {}), titleAccent: v } }))} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <textarea
              value={hero.subtitle ?? ""}
              onChange={(e) => setHero((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
              rows={2}
              placeholder="HalaPark delivers..."
              maxLength={FIELD_LIMITS.subtitle}
            />
            <CharCount value={hero.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
            <ArInput label="Subtitle" kind="subtitle" multiline value={hero.ar?.subtitle} onChange={(v) => setHero((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>CTA Label</label>
              <input
                value={hero.ctaLabel ?? ""}
                onChange={(e) => setHero((p) => ({ ...p, ctaLabel: e.target.value }))}
                className={inputClass}
                placeholder="Get In Touch"
                maxLength={FIELD_LIMITS.button}
              />
              <CharCount value={hero.ctaLabel ?? ""} max={FIELD_LIMITS.button} />
              <ArInput label="CTA Label" kind="button" value={hero.ar?.ctaLabel} onChange={(v) => setHero((p) => ({ ...p, ar: { ...(p.ar ?? {}), ctaLabel: v } }))} />
            </div>
            <div>
              <label className={labelClass}>CTA Link</label>
              <PageLinkSelect value={hero.ctaLink} onChange={(v) => setHero((p) => ({ ...p, ctaLink: v }))} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Media Type</label>
            <select
              value={hero.mediaType ?? "video"}
              onChange={(e) => setHero((p) => ({ ...p, mediaType: e.target.value }))}
              className={inputClass}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
            <p className="mt-1 text-[11px] text-slate-400">Controls whether the website shows the hero image or video.</p>
          </div>
          <div>
            <label className={labelClass}>Hero Image</label>
            <div className="flex gap-2">
              <input
                value={hero.image ?? ""}
                onChange={(e) => setHero((p) => ({ ...p, image: e.target.value }))}
                className={inputClass}
                placeholder="/path/to/image.png"
                maxLength={FIELD_LIMITS.link}
              />
              <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                {uploadProgress["hero-image"] !== undefined ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {uploadProgress["hero-image"]}%</>
                ) : (
                  <><Upload className="h-3.5 w-3.5" /> Upload</>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadProgress["hero-image"] !== undefined}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleHeroImageUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <FieldError error={validateUrl(hero.image ?? "")} />
          </div>
          <div>
            <label className={labelClass}>Video URL</label>
            <div className="flex gap-2">
              <input
                value={hero.videoUrl ?? ""}
                onChange={(e) => setHero((p) => ({ ...p, videoUrl: e.target.value }))}
                className={inputClass}
                placeholder="/path/to/video.mp4"
                maxLength={FIELD_LIMITS.link}
              />
              <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                <Upload className="h-3.5 w-3.5" />
                Upload
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVideoUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <FieldError error={validateUrl(hero.videoUrl ?? "")} />
          </div>
        </div>
      </CollapsibleSection>

      {/* CHALLENGES SECTION */}
      <CollapsibleSection title="Challenges Section">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={challenges.heading ?? ""}
                onChange={(e) => setChallenges((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
                placeholder="Parking Challenges"
                maxLength={FIELD_LIMITS.heading}
              />
              <CharCount value={challenges.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={challenges.ar?.heading} onChange={(v) => setChallenges((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient</label>
              <input
                value={challenges.headingGradient ?? ""}
                onChange={(e) => setChallenges((p) => ({ ...p, headingGradient: e.target.value }))}
                className={inputClass}
                placeholder="Challenges"
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={challenges.headingGradient ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Heading Gradient" kind="label" value={challenges.ar?.headingGradient} onChange={(v) => setChallenges((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <input
              value={challenges.subtitle ?? ""}
              onChange={(e) => setChallenges((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
              placeholder="Solving Parking Inefficiencies..."
              maxLength={FIELD_LIMITS.subtitle}
            />
            <CharCount value={challenges.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
            <ArInput label="Subtitle" kind="subtitle" value={challenges.ar?.subtitle} onChange={(v) => setChallenges((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={challenges.description ?? ""}
              onChange={(e) => setChallenges((p) => ({ ...p, description: e.target.value }))}
              className={inputClass}
              rows={3}
              placeholder="Traditional parking systems..."
              maxLength={FIELD_LIMITS.description}
            />
            <CharCount value={challenges.description ?? ""} max={FIELD_LIMITS.description} />
            <ArInput label="Description" kind="description" multiline value={challenges.ar?.description} onChange={(v) => setChallenges((p) => ({ ...p, ar: { ...(p.ar ?? {}), description: v } }))} />
          </div>

          {/* Challenges Image */}
          <div>
            <label className={labelClass}>Challenges Image</label>
            <div className="flex gap-2">
              <input
                value={challenges.image ?? ""}
                onChange={(e) => setChallenges((p) => ({ ...p, image: e.target.value }))}
                className={inputClass}
                placeholder="/path/to/image.png"
                maxLength={FIELD_LIMITS.link}
              />
              <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                {uploadProgress["challenges-image"] !== undefined ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {uploadProgress["challenges-image"]}%</>
                ) : (
                  <><Upload className="h-3.5 w-3.5" /> Upload</>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadProgress["challenges-image"] !== undefined}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleChallengesImageUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <FieldError error={validateUrl(challenges.image ?? "")} />
          </div>

          {/* Points list */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className={labelClass}>Points (bullet list)</label>
              <button
                type="button"
                onClick={() => setChallenges((p) => ({ ...p, items: [...(p.items ?? []), ""] }))}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
              >
                <Plus className="h-3.5 w-3.5" /> Add Point
              </button>
            </div>
            <div className="space-y-2">
              {(challenges.items ?? []).map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={item ?? ""}
                    onChange={(e) => setChallenges((p) => ({ ...p, items: (p.items ?? []).map((it, idx) => (idx === i ? e.target.value : it)) }))}
                    className={inputClass}
                    placeholder={`Point ${i + 1}`}
                    maxLength={FIELD_LIMITS.item}
                  />
                  <button
                    type="button"
                    onClick={() => setChallenges((p) => ({ ...p, items: (p.items ?? []).filter((_, idx) => idx !== i) }))}
                    className="shrink-0 inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-2.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Button Label</label>
              <input
                value={challenges.ctaLabel ?? ""}
                onChange={(e) => setChallenges((p) => ({ ...p, ctaLabel: e.target.value }))}
                className={inputClass}
                placeholder="View App Features"
                maxLength={FIELD_LIMITS.button}
              />
              <CharCount value={challenges.ctaLabel ?? ""} max={FIELD_LIMITS.button} />
              <ArInput label="CTA Label" kind="button" value={challenges.ar?.ctaLabel} onChange={(v) => setChallenges((p) => ({ ...p, ar: { ...(p.ar ?? {}), ctaLabel: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Button Link</label>
              <PageLinkSelect value={challenges.ctaLink} onChange={(v) => setChallenges((p) => ({ ...p, ctaLink: v }))} />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* SOLUTIONS SECTION */}
      <CollapsibleSection title="Solutions Section">
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Heading</label>
                  <input
                    value={solutions.heading ?? ""}
                    onChange={(e) => setSolutions((p) => ({ ...p, heading: e.target.value }))}
                    className={inputClass}
                    placeholder="Our Solutions"
                    maxLength={FIELD_LIMITS.heading}
                  />
                  <CharCount value={solutions.heading ?? ""} max={FIELD_LIMITS.heading} />
                  <ArInput label="Heading" kind="heading" value={solutions.ar?.heading} onChange={(v) => setSolutions((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
                </div>
                <div>
                  <label className={labelClass}>Heading Gradient</label>
                  <input
                    value={solutions.headingGradient ?? ""}
                    onChange={(e) => setSolutions((p) => ({ ...p, headingGradient: e.target.value }))}
                    className={inputClass}
                    placeholder="Solutions"
                    maxLength={FIELD_LIMITS.label}
                  />
                  <CharCount value={solutions.headingGradient ?? ""} max={FIELD_LIMITS.label} />
                  <ArInput label="Heading Gradient" kind="label" value={solutions.ar?.headingGradient} onChange={(v) => setSolutions((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Subtitle</label>
                <input
                  value={solutions.subtitle ?? ""}
                  onChange={(e) => setSolutions((p) => ({ ...p, subtitle: e.target.value }))}
                  className={inputClass}
                  placeholder="Intelligent parking systems..."
                  maxLength={FIELD_LIMITS.subtitle}
                />
                <CharCount value={solutions.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
                <ArInput label="Subtitle" kind="subtitle" value={solutions.ar?.subtitle} onChange={(v) => setSolutions((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
              </div>
            </div>
          </div>

          {/* Solution Categories (dropdown groups) */}
          <CategoryManager
            groups={solutions.groups}
            arGroups={solutions.ar?.groups}
            cards={solutions.cards}
            onChange={(groups) => setSolutions((p) => ({ ...p, groups }))}
            onArChange={(arGroups) => setSolutions((p) => ({ ...p, ar: { ...(p.ar ?? {}), groups: arGroups } }))}
          />

          {/* Solution Cards */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Solution Cards ({solutions.cards?.length ?? 0})</h3>
              <button
                onClick={() => setSolutions((p) => ({
                  ...p,
                  cards: [...(p.cards ?? []), { slug: "", title: "New Solution", description: "Description", image: "/image.png" }]
                }))}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Card
              </button>
            </div>
            <div className="space-y-3">
              {(solutions.cards ?? []).map((card, i) => {
                const cardSlug = card.slug || slugify(card.title);
                const hasDetail = details.some((d) => d.slug === cardSlug);
                return (
                <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">Card {i + 1}</p>
                    <button
                      onClick={() => setSolutions((p) => ({
                        ...p,
                        cards: p.cards.filter((_, idx) => idx !== i)
                      }))}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input
                      value={card.title ?? ""}
                      onChange={(e) => setSolutions((p) => ({
                        ...p,
                        cards: p.cards.map((c, idx) => idx === i ? { ...c, title: e.target.value } : c)
                      }))}
                      className={inputClass}
                      placeholder="Card Title"
                      maxLength={FIELD_LIMITS.heading}
                    />
                    <CharCount value={card.title ?? ""} max={FIELD_LIMITS.heading} />
                    <ArInput label="Title" kind="heading" value={card.ar?.title} onChange={(v) => setSolutions((p) => ({
                      ...p,
                      cards: p.cards.map((c, idx) => idx === i ? { ...c, ar: { ...(c.ar ?? {}), title: v } } : c)
                    }))} />
                    <textarea
                      value={card.description ?? ""}
                      onChange={(e) => setSolutions((p) => ({
                        ...p,
                        cards: p.cards.map((c, idx) => idx === i ? { ...c, description: e.target.value } : c)
                      }))}
                      className={inputClass}
                      rows={2}
                      placeholder="Card Description"
                      maxLength={FIELD_LIMITS.summary}
                    />
                    <CharCount value={card.description ?? ""} max={FIELD_LIMITS.summary} />
                    <ArInput label="Description" kind="summary" multiline value={card.ar?.description} onChange={(v) => setSolutions((p) => ({
                      ...p,
                      cards: p.cards.map((c, idx) => idx === i ? { ...c, ar: { ...(c.ar ?? {}), description: v } } : c)
                    }))} />
                    <div className="flex gap-2">
                      <input
                        value={card.image ?? ""}
                        onChange={(e) => setSolutions((p) => ({
                          ...p,
                          cards: p.cards.map((c, idx) => idx === i ? { ...c, image: e.target.value } : c)
                        }))}
                        className={inputClass}
                        placeholder="Image URL"
                        maxLength={FIELD_LIMITS.link}
                      />
                      <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                        {uploadProgress[`solutions-${i}`] ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            {uploadProgress[`solutions-${i}`]}%
                          </>
                        ) : (
                          <>
                            <Upload className="h-3.5 w-3.5" />
                            Upload
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadProgress[`solutions-${i}`] !== undefined}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload("solutions", i, file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                    <FieldError error={validateUrl(card.image ?? "")} />

                    {/* Slug — links the card to its detail page */}
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">/solutions/</span>
                      <input
                        value={card.slug ?? ""}
                        onChange={(e) => setSolutions((p) => ({
                          ...p,
                          cards: p.cards.map((c, idx) => idx === i ? { ...c, slug: e.target.value } : c)
                        }))}
                        className={inputClass}
                        placeholder={slugify(card.title) || "slug"}
                        maxLength={FIELD_LIMITS.link}
                      />
                      <button
                        type="button"
                        onClick={() => setSolutions((p) => ({
                          ...p,
                          cards: p.cards.map((c, idx) => idx === i ? { ...c, slug: slugify(c.title) } : c)
                        }))}
                        className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#0088FF]"
                        title="Generate slug from title"
                      >
                        Auto
                      </button>
                    </div>

                    {/* Category (which dropdown group this card appears under) */}
                    <div>
                      <label className={labelClass}>Category</label>
                      <select
                        value={card.group ?? ""}
                        onChange={(e) => setSolutions((p) => ({
                          ...p,
                          cards: p.cards.map((c, idx) => idx === i ? { ...c, group: e.target.value } : c)
                        }))}
                        className={inputClass}
                      >
                        <option value="">— Ungrouped (generic &quot;Solutions&quot;) —</option>
                        {(solutions.groups ?? []).map((g, gi) => (
                          <option key={gi} value={g}>{g}</option>
                        ))}
                      </select>
                      {card.group && !(solutions.groups ?? []).includes(card.group) ? (
                        <p className="mt-1 text-[11px] font-semibold text-amber-600">
                          ⚠ &quot;{card.group}&quot; is not in the category list — add it above or pick another.
                        </p>
                      ) : null}
                    </div>

                    {/* Edit this card's detail page */}
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-[#0088FF]/20 bg-[#F4F9FF] px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#0078E0]">Detail Page</p>
                        <p className="truncate text-[11px] text-slate-500">
                          {hasDetail ? "Has its own content — edit it." : "No content yet — add it."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openDetailForCard(card)}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {hasDetail ? "Edit Detail Page" : "Add Detail Page"}
                      </button>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>

          {/* Advantages of Our Solutions (shown on every detail page) */}
          <div className="border-t border-slate-200 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">Advantages of Our Solutions</h3>
                <p className="text-[11px] text-slate-400">Shared block shown on every solution detail page.</p>
              </div>
              <button
                onClick={() => setSolutions((p) => ({
                  ...p,
                  advantages: {
                    heading: p.advantages?.heading || "Advantages of Our Solutions",
                    items: [...(p.advantages?.items ?? []), { title: "New Advantage", description: "" }],
                  },
                }))}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Advantage
              </button>
            </div>

            <div className="mb-3">
              <label className={labelClass}>Heading</label>
              <input
                value={solutions.advantages?.heading ?? ""}
                onChange={(e) => setSolutions((p) => ({
                  ...p,
                  advantages: { ...(p.advantages ?? { items: [] }), heading: e.target.value },
                }))}
                className={inputClass}
                placeholder="Advantages of Our Solutions"
                maxLength={FIELD_LIMITS.heading}
              />
              <CharCount value={solutions.advantages?.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={solutions.advantages?.ar?.heading} onChange={(v) => setSolutions((p) => ({
                ...p,
                advantages: { ...(p.advantages ?? { items: [] }), ar: { ...(p.advantages?.ar ?? {}), heading: v } },
              }))} />
            </div>

            <div className="space-y-3">
              {(solutions.advantages?.items ?? []).map((adv, ai) => (
                <div key={ai} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-600">Advantage {ai + 1}</p>
                    <button
                      onClick={() => setSolutions((p) => ({
                        ...p,
                        advantages: { ...p.advantages, items: p.advantages.items.filter((_, idx) => idx !== ai) },
                      }))}
                      className="rounded p-1 text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    value={adv.title ?? ""}
                    onChange={(e) => setSolutions((p) => ({
                      ...p,
                      advantages: { ...p.advantages, items: p.advantages.items.map((a, idx) => idx === ai ? { ...a, title: e.target.value } : a) },
                    }))}
                    className={`${inputClass} mb-2`}
                    placeholder="Advantage title"
                    maxLength={FIELD_LIMITS.item}
                  />
                  <CharCount value={adv.title ?? ""} max={FIELD_LIMITS.item} />
                  <ArInput label="Title" kind="item" value={adv.ar?.title} onChange={(v) => setSolutions((p) => ({
                    ...p,
                    advantages: { ...p.advantages, items: p.advantages.items.map((a, idx) => idx === ai ? { ...a, ar: { ...(a.ar ?? {}), title: v } } : a) },
                  }))} />
                  <textarea
                    value={adv.description ?? ""}
                    onChange={(e) => setSolutions((p) => ({
                      ...p,
                      advantages: { ...p.advantages, items: p.advantages.items.map((a, idx) => idx === ai ? { ...a, description: e.target.value } : a) },
                    }))}
                    className={inputClass}
                    rows={2}
                    placeholder="Advantage description"
                    maxLength={FIELD_LIMITS.description}
                  />
                  <CharCount value={adv.description ?? ""} max={FIELD_LIMITS.description} />
                  <ArInput label="Description" kind="description" multiline value={adv.ar?.description} onChange={(v) => setSolutions((p) => ({
                    ...p,
                    advantages: { ...p.advantages, items: p.advantages.items.map((a, idx) => idx === ai ? { ...a, ar: { ...(a.ar ?? {}), description: v } } : a) },
                  }))} />
                </div>
              ))}
              {(solutions.advantages?.items ?? []).length === 0 && (
                <p className="text-xs text-slate-400">No advantages yet. Click &quot;Add Advantage&quot;.</p>
              )}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* INTEGRATION SECTION */}
      <CollapsibleSection title="Integration Section">
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Heading</label>
                  <input
                    value={integration.heading ?? ""}
                    onChange={(e) => setIntegration((p) => ({ ...p, heading: e.target.value }))}
                    className={inputClass}
                    placeholder="Solution Integration"
                    maxLength={FIELD_LIMITS.heading}
                  />
                  <CharCount value={integration.heading ?? ""} max={FIELD_LIMITS.heading} />
                  <ArInput label="Heading" kind="heading" value={integration.ar?.heading} onChange={(v) => setIntegration((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
                </div>
                <div>
                  <label className={labelClass}>Heading Gradient</label>
                  <input
                    value={integration.headingGradient ?? ""}
                    onChange={(e) => setIntegration((p) => ({ ...p, headingGradient: e.target.value }))}
                    className={inputClass}
                    placeholder="Integration"
                    maxLength={FIELD_LIMITS.label}
                  />
                  <CharCount value={integration.headingGradient ?? ""} max={FIELD_LIMITS.label} />
                  <ArInput label="Heading Gradient" kind="label" value={integration.ar?.headingGradient} onChange={(v) => setIntegration((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Subtitle</label>
                <input
                  value={integration.subtitle ?? ""}
                  onChange={(e) => setIntegration((p) => ({ ...p, subtitle: e.target.value }))}
                  className={inputClass}
                  placeholder="End-to-End Integrated Parking Solution"
                  maxLength={FIELD_LIMITS.subtitle}
                />
                <CharCount value={integration.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
                <ArInput label="Subtitle" kind="subtitle" value={integration.ar?.subtitle} onChange={(v) => setIntegration((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
              </div>
            </div>
          </div>

          {/* Integration Cards */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Integration Cards ({integration.cards?.length ?? 0})</h3>
              <button
                onClick={() => setIntegration((p) => ({
                  ...p,
                  cards: [...(p.cards ?? []), { title: "New Integration", description: "Description", points: [], image: "/image.png", gradient: "from-[#0078E0]/85 via-[#0088FF]/60 to-[#0088FF]/20" }]
                }))}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Card
              </button>
            </div>
            <div className="space-y-3">
              {(integration.cards ?? []).map((card, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">Card {i + 1}</p>
                    <button
                      onClick={() => setIntegration((p) => ({
                        ...p,
                        cards: p.cards.filter((_, idx) => idx !== i)
                      }))}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input
                      value={card.title ?? ""}
                      onChange={(e) => setIntegration((p) => ({
                        ...p,
                        cards: p.cards.map((c, idx) => idx === i ? { ...c, title: e.target.value } : c)
                      }))}
                      className={inputClass}
                      placeholder="Card Title"
                      maxLength={FIELD_LIMITS.heading}
                    />
                    <CharCount value={card.title ?? ""} max={FIELD_LIMITS.heading} />
                    <ArInput label="Title" kind="heading" value={card.ar?.title} onChange={(v) => setIntegration((p) => ({
                      ...p,
                      cards: p.cards.map((c, idx) => idx === i ? { ...c, ar: { ...(c.ar ?? {}), title: v } } : c)
                    }))} />
                    <textarea
                      value={card.description ?? ""}
                      onChange={(e) => setIntegration((p) => ({
                        ...p,
                        cards: p.cards.map((c, idx) => idx === i ? { ...c, description: e.target.value } : c)
                      }))}
                      className={inputClass}
                      rows={2}
                      placeholder="Card Description"
                      maxLength={FIELD_LIMITS.summary}
                    />
                    <CharCount value={card.description ?? ""} max={FIELD_LIMITS.summary} />
                    <ArInput label="Description" kind="summary" multiline value={card.ar?.description} onChange={(v) => setIntegration((p) => ({
                      ...p,
                      cards: p.cards.map((c, idx) => idx === i ? { ...c, ar: { ...(c.ar ?? {}), description: v } } : c)
                    }))} />
                    <div className="flex gap-2">
                      <input
                        value={card.image ?? ""}
                        onChange={(e) => setIntegration((p) => ({
                          ...p,
                          cards: p.cards.map((c, idx) => idx === i ? { ...c, image: e.target.value } : c)
                        }))}
                        className={inputClass}
                        placeholder="Image URL"
                        maxLength={FIELD_LIMITS.link}
                      />
                      <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                        {uploadProgress[`integration-${i}`] ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            {uploadProgress[`integration-${i}`]}%
                          </>
                        ) : (
                          <>
                            <Upload className="h-3.5 w-3.5" />
                            Upload
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadProgress[`integration-${i}`] !== undefined}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload("integration", i, file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                    <FieldError error={validateUrl(card.image ?? "")} />
                    <input
                      value={card.gradient ?? ""}
                      onChange={(e) => setIntegration((p) => ({
                        ...p,
                        cards: p.cards.map((c, idx) => idx === i ? { ...c, gradient: e.target.value } : c)
                      }))}
                      className={inputClass}
                      placeholder="Gradient (e.g., from-[#0078E0]/85 via-[#0088FF]/60 to-[#0088FF]/20)"
                      maxLength={FIELD_LIMITS.subtitle}
                    />
                    <CharCount value={card.gradient ?? ""} max={FIELD_LIMITS.subtitle} />
                    <textarea
                      value={Array.isArray(card.points) ? card.points.join("\n") : ""}
                      onChange={(e) => setIntegration((p) => ({
                        ...p,
                        cards: p.cards.map((c, idx) => idx === i ? { ...c, points: e.target.value.split("\n").map(p => p.trim()).filter(Boolean) } : c)
                      }))}
                      className={inputClass}
                      rows={3}
                      placeholder="Points (one per line)"
                      maxLength={FIELD_LIMITS.description}
                    />
                    <CharCount value={Array.isArray(card.points) ? card.points.join("\n") : ""} max={FIELD_LIMITS.description} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* TRUST SECTION */}
      <CollapsibleSection title="Trust Section (Smart Cities)">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={trust.heading ?? ""}
                onChange={(e) => setTrust((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
                placeholder="Built for Smart Cities"
                maxLength={FIELD_LIMITS.heading}
              />
              <CharCount value={trust.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={trust.ar?.heading} onChange={(v) => setTrust((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient</label>
              <input
                value={trust.headingGradient ?? ""}
                onChange={(e) => setTrust((p) => ({ ...p, headingGradient: e.target.value }))}
                className={inputClass}
                placeholder="Smart Cities"
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={trust.headingGradient ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Heading Gradient" kind="label" value={trust.ar?.headingGradient} onChange={(v) => setTrust((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <textarea
              value={trust.subtitle ?? ""}
              onChange={(e) => setTrust((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
              rows={2}
              placeholder="HalaPark extends beyond parking..."
              maxLength={FIELD_LIMITS.subtitle}
            />
            <CharCount value={trust.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
            <ArInput label="Subtitle" kind="subtitle" multiline value={trust.ar?.subtitle} onChange={(v) => setTrust((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
          </div>
        </div>
      </CollapsibleSection>

      {/* FEATURES SECTION */}
      <CollapsibleSection title="Features Section (High-Demand)">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={features.heading ?? ""}
                onChange={(e) => setFeatures((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
                placeholder="Built for High-Demand Environments"
                maxLength={FIELD_LIMITS.heading}
              />
              <CharCount value={features.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={features.ar?.heading} onChange={(v) => setFeatures((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient</label>
              <input
                value={features.headingGradient ?? ""}
                onChange={(e) => setFeatures((p) => ({ ...p, headingGradient: e.target.value }))}
                className={inputClass}
                placeholder="Environments"
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={features.headingGradient ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Heading Gradient" kind="label" value={features.ar?.headingGradient} onChange={(v) => setFeatures((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <input
              value={features.subtitle ?? ""}
              onChange={(e) => setFeatures((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
              placeholder="From airports to smart cities..."
              maxLength={FIELD_LIMITS.subtitle}
            />
            <CharCount value={features.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
            <ArInput label="Subtitle" kind="subtitle" value={features.ar?.subtitle} onChange={(v) => setFeatures((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
          </div>

          {/* Background image */}
          <div>
            <label className={labelClass}>Background Image</label>
            <div className="flex items-start gap-3">
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {features.image && features.image !== "/image.png" ? (
                  <img src={features.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  value={features.image ?? ""}
                  onChange={(e) => setFeatures((p) => ({ ...p, image: e.target.value }))}
                  className={inputClass}
                  placeholder="Image URL (leave blank for default)"
                  maxLength={FIELD_LIMITS.link}
                />
                <CharCount value={features.image ?? ""} max={FIELD_LIMITS.link} />
                <FieldError error={validateUrl(features.image ?? "")} />
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff]">
                  {uploadProgress["features-0"] !== undefined ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress["features-0"]}%</>
                  ) : (
                    <><Upload className="h-3.5 w-3.5" />Upload image</>
                  )}
                  <input type="file" accept="image/*" className="hidden" disabled={uploadProgress["features-0"] !== undefined}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload("features", 0, f); e.target.value = ""; }} />
                </label>
              </div>
            </div>
          </div>

          {/* Industries / Environments list */}
          <div className="border-t border-slate-200 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Environments ({(features.industries ?? []).length})</h3>
              <button
                onClick={() => setFeatures((p) => ({ ...p, industries: [...(p.industries ?? []), { icon: "Building2", label: "New Environment" }] }))}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
              >
                <Plus className="h-3.5 w-3.5" /> Add Environment
              </button>
            </div>
            <div className="space-y-2">
              {(features.industries ?? []).map((ind, ii) => (
                <div key={ii}>
                  <div className="flex items-center gap-2">
                    <select
                      value={ind.icon ?? "Building2"}
                      onChange={(e) => setFeatures((p) => ({ ...p, industries: p.industries.map((x, idx) => idx === ii ? { ...x, icon: e.target.value } : x) }))}
                      className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2.5 text-sm outline-none focus:border-[#0088FF]"
                    >
                      {INDUSTRY_ICON_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <input
                      value={ind.label ?? ""}
                      onChange={(e) => setFeatures((p) => ({ ...p, industries: p.industries.map((x, idx) => idx === ii ? { ...x, label: e.target.value } : x) }))}
                      className={inputClass}
                      placeholder="Environment label (e.g. Airports)"
                      maxLength={FIELD_LIMITS.item}
                    />
                    <button
                      onClick={() => setFeatures((p) => ({ ...p, industries: p.industries.filter((_, idx) => idx !== ii) }))}
                      className="shrink-0 rounded p-1.5 text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <ArInput label="Label" kind="item" value={ind.ar?.label} onChange={(v) => setFeatures((p) => ({ ...p, industries: p.industries.map((x, idx) => idx === ii ? { ...x, ar: { ...(x.ar ?? {}), label: v } } : x) }))} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* DEPLOYMENT JOURNEY SECTION */}
      <CollapsibleSection title="Deployment Journey Section">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={deployment.heading ?? ""}
                onChange={(e) => setDeployment((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
                placeholder="Deployment"
                maxLength={FIELD_LIMITS.heading}
              />
              <CharCount value={deployment.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={deployment.ar?.heading} onChange={(v) => setDeployment((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient</label>
              <input
                value={deployment.headingGradient ?? ""}
                onChange={(e) => setDeployment((p) => ({ ...p, headingGradient: e.target.value }))}
                className={inputClass}
                placeholder="Journey"
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={deployment.headingGradient ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Heading Gradient" kind="label" value={deployment.ar?.headingGradient} onChange={(v) => setDeployment((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <textarea
              value={deployment.subtitle ?? ""}
              onChange={(e) => setDeployment((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
              rows={2}
              placeholder="We ensure a smooth rollout by understanding your environment..."
              maxLength={FIELD_LIMITS.subtitle}
            />
            <CharCount value={deployment.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
            <ArInput label="Subtitle" kind="subtitle" multiline value={deployment.ar?.subtitle} onChange={(v) => setDeployment((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
          </div>

          {/* Steps */}
          <div className="border-t border-slate-200 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">Steps ({(deployment.steps ?? []).length})</h3>
              <button
                onClick={() => setDeployment((p) => ({ ...p, steps: [...(p.steps ?? []), { step: String((p.steps?.length ?? 0) + 1).padStart(2, "0"), title: "New Step", description: "" }] }))}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
              >
                <Plus className="h-3.5 w-3.5" /> Add Step
              </button>
            </div>
            <div className="space-y-3">
              {(deployment.steps ?? []).map((st, si) => (
                <div key={si} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-600">Step {si + 1}</p>
                    <button
                      onClick={() => setDeployment((p) => ({ ...p, steps: p.steps.filter((_, idx) => idx !== si) }))}
                      className="rounded p-1 text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={st.step ?? ""}
                      onChange={(e) => setDeployment((p) => ({ ...p, steps: p.steps.map((x, idx) => idx === si ? { ...x, step: e.target.value } : x) }))}
                      className={`${inputClass} w-20 shrink-0`}
                      placeholder="01"
                      maxLength={FIELD_LIMITS.label}
                    />
                    <input
                      value={st.title ?? ""}
                      onChange={(e) => setDeployment((p) => ({ ...p, steps: p.steps.map((x, idx) => idx === si ? { ...x, title: e.target.value } : x) }))}
                      className={inputClass}
                      placeholder="Step title"
                      maxLength={FIELD_LIMITS.heading}
                    />
                  </div>
                  <ArInput label="Title" kind="heading" value={st.ar?.title} onChange={(v) => setDeployment((p) => ({ ...p, steps: p.steps.map((x, idx) => idx === si ? { ...x, ar: { ...(x.ar ?? {}), title: v } } : x) }))} />
                  <textarea
                    value={st.description ?? ""}
                    onChange={(e) => setDeployment((p) => ({ ...p, steps: p.steps.map((x, idx) => idx === si ? { ...x, description: e.target.value } : x) }))}
                    className={`${inputClass} mt-2`}
                    rows={2}
                    placeholder="Step description"
                    maxLength={FIELD_LIMITS.description}
                  />
                  <CharCount value={st.description ?? ""} max={FIELD_LIMITS.description} />
                  <ArInput label="Description" kind="description" multiline value={st.ar?.description} onChange={(v) => setDeployment((p) => ({ ...p, steps: p.steps.map((x, idx) => idx === si ? { ...x, ar: { ...(x.ar ?? {}), description: v } } : x) }))} />
                </div>
              ))}
            </div>
          </div>

          {/* Side panel */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Side Panel</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Panel Title</label>
                <input
                  value={deployment.panelTitle ?? ""}
                  onChange={(e) => setDeployment((p) => ({ ...p, panelTitle: e.target.value }))}
                  className={inputClass}
                  placeholder="Go live in days,"
                  maxLength={FIELD_LIMITS.heading}
                />
                <CharCount value={deployment.panelTitle ?? ""} max={FIELD_LIMITS.heading} />
                <ArInput label="Panel Title" kind="heading" value={deployment.ar?.panelTitle} onChange={(v) => setDeployment((p) => ({ ...p, ar: { ...(p.ar ?? {}), panelTitle: v } }))} />
              </div>
              <div>
                <label className={labelClass}>Panel Title (accent)</label>
                <input
                  value={deployment.panelTitleAccent ?? ""}
                  onChange={(e) => setDeployment((p) => ({ ...p, panelTitleAccent: e.target.value }))}
                  className={inputClass}
                  placeholder="not months."
                  maxLength={FIELD_LIMITS.label}
                />
                <CharCount value={deployment.panelTitleAccent ?? ""} max={FIELD_LIMITS.label} />
                <ArInput label="Panel Title Accent" kind="label" value={deployment.ar?.panelTitleAccent} onChange={(v) => setDeployment((p) => ({ ...p, ar: { ...(p.ar ?? {}), panelTitleAccent: v } }))} />
              </div>
            </div>
            <div className="mt-3">
              <label className={labelClass}>Panel Background Image</label>
              <div className="flex items-start gap-3">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  {deployment.image && deployment.image !== "/image.png" ? (
                    <img src={deployment.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    value={deployment.image ?? ""}
                    onChange={(e) => setDeployment((p) => ({ ...p, image: e.target.value }))}
                    className={inputClass}
                    placeholder="Image URL (leave blank for default)"
                    maxLength={FIELD_LIMITS.link}
                  />
                  <CharCount value={deployment.image ?? ""} max={FIELD_LIMITS.link} />
                  <FieldError error={validateUrl(deployment.image ?? "")} />
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff]">
                    {uploadProgress["deployment-0"] !== undefined ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress["deployment-0"]}%</>
                    ) : (
                      <><Upload className="h-3.5 w-3.5" />Upload image</>
                    )}
                    <input type="file" accept="image/*" className="hidden" disabled={uploadProgress["deployment-0"] !== undefined}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload("deployment", 0, f); e.target.value = ""; }} />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* WHY SECTION */}
      <CollapsibleSection title="Why Section">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={why.heading ?? ""}
                onChange={(e) => setWhy((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
                placeholder="Why Leading Developments Choose Halapark?"
                maxLength={FIELD_LIMITS.heading}
              />
              <CharCount value={why.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={why.ar?.heading} onChange={(v) => setWhy((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient</label>
              <input
                value={why.headingGradient ?? ""}
                onChange={(e) => setWhy((p) => ({ ...p, headingGradient: e.target.value }))}
                className={inputClass}
                placeholder="Choose Halapark?"
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={why.headingGradient ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Heading Gradient" kind="label" value={why.ar?.headingGradient} onChange={(v) => setWhy((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
            </div>
          </div>

          {/* Points list */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className={labelClass}>Points / Reasons</label>
              <button
                type="button"
                onClick={() => setWhy((p) => ({ ...p, points: [...(p.points ?? []), ""] }))}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
              >
                <Plus className="h-3.5 w-3.5" /> Add Point
              </button>
            </div>
            <div className="space-y-2">
              {(why.points ?? []).map((point, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={point ?? ""}
                    onChange={(e) => setWhy((p) => ({ ...p, points: (p.points ?? []).map((pt, idx) => (idx === i ? e.target.value : pt)) }))}
                    className={inputClass}
                    placeholder={`Point ${i + 1}`}
                    maxLength={FIELD_LIMITS.item}
                  />
                  <button
                    type="button"
                    onClick={() => setWhy((p) => ({ ...p, points: (p.points ?? []).filter((_, idx) => idx !== i) }))}
                    className="shrink-0 inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-2.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: badge + caption */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Panel Badge</label>
              <input
                value={why.badge ?? ""}
                onChange={(e) => setWhy((p) => ({ ...p, badge: e.target.value }))}
                className={inputClass}
                placeholder="Live Operations"
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={why.badge ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Badge" kind="label" value={why.ar?.badge} onChange={(v) => setWhy((p) => ({ ...p, ar: { ...(p.ar ?? {}), badge: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Panel Caption</label>
              <input
                value={why.panelTitle ?? ""}
                onChange={(e) => setWhy((p) => ({ ...p, panelTitle: e.target.value }))}
                className={inputClass}
                placeholder="Control room visibility"
                maxLength={FIELD_LIMITS.subtitle}
              />
              <CharCount value={why.panelTitle ?? ""} max={FIELD_LIMITS.subtitle} />
              <ArInput label="Panel Title" kind="subtitle" value={why.ar?.panelTitle} onChange={(v) => setWhy((p) => ({ ...p, ar: { ...(p.ar ?? {}), panelTitle: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Caption Accent</label>
              <input
                value={why.panelTitleAccent ?? ""}
                onChange={(e) => setWhy((p) => ({ ...p, panelTitleAccent: e.target.value }))}
                className={inputClass}
                placeholder="across every site."
                maxLength={FIELD_LIMITS.subtitle}
              />
              <CharCount value={why.panelTitleAccent ?? ""} max={FIELD_LIMITS.subtitle} />
              <ArInput label="Panel Title Accent" kind="subtitle" value={why.ar?.panelTitleAccent} onChange={(v) => setWhy((p) => ({ ...p, ar: { ...(p.ar ?? {}), panelTitleAccent: v } }))} />
            </div>
          </div>

          {/* Right panel image */}
          <div>
            <label className={labelClass}>Panel Image</label>
            <div className="flex items-start gap-3">
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {why.image ? (
                  <img src={why.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  value={why.image ?? ""}
                  onChange={(e) => setWhy((p) => ({ ...p, image: e.target.value }))}
                  className={inputClass}
                  placeholder="Image URL (leave blank for the default)"
                  maxLength={FIELD_LIMITS.link}
                />
                <CharCount value={why.image ?? ""} max={FIELD_LIMITS.link} />
                <FieldError error={validateUrl(why.image ?? "")} />
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff]">
                  {uploadProgress["why-0"] !== undefined ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {uploadProgress["why-0"]}%
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      Upload image
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadProgress["why-0"] !== undefined}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload("why", 0, file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* CTA SECTION */}
      <CollapsibleSection title="Final CTA Section">
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Heading</label>
            <input
              value={cta.heading ?? ""}
              onChange={(e) => setCtA((p) => ({ ...p, heading: e.target.value }))}
              className={inputClass}
              placeholder="Transform Parking Into a Fully Connected Mobility Infrastructure"
              maxLength={FIELD_LIMITS.heading}
            />
            <CharCount value={cta.heading ?? ""} max={FIELD_LIMITS.heading} />
            <ArInput label="Heading" kind="heading" value={cta.ar?.heading} onChange={(v) => setCtA((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
          </div>
          <div>
            <label className={labelClass}>Heading Gradient</label>
            <input
              value={cta.headingGradient ?? ""}
              onChange={(e) => setCtA((p) => ({ ...p, headingGradient: e.target.value }))}
              className={inputClass}
              placeholder="Mobility Infrastructure"
              maxLength={FIELD_LIMITS.label}
            />
            <CharCount value={cta.headingGradient ?? ""} max={FIELD_LIMITS.label} />
            <ArInput label="Heading Gradient" kind="label" value={cta.ar?.headingGradient} onChange={(v) => setCtA((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <textarea
              value={cta.subtitle ?? ""}
              onChange={(e) => setCtA((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
              rows={3}
              placeholder="Halapark replaces fragmented parking systems..."
              maxLength={FIELD_LIMITS.subtitle}
            />
            <CharCount value={cta.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
            <ArInput label="Subtitle" kind="subtitle" multiline value={cta.ar?.subtitle} onChange={(v) => setCtA((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Primary CTA Label</label>
              <input
                value={cta.ctaLabel ?? ""}
                onChange={(e) => setCtA((p) => ({ ...p, ctaLabel: e.target.value }))}
                className={inputClass}
                placeholder="Request Demo"
                maxLength={FIELD_LIMITS.button}
              />
              <CharCount value={cta.ctaLabel ?? ""} max={FIELD_LIMITS.button} />
              <ArInput label="CTA Label" kind="button" value={cta.ar?.ctaLabel} onChange={(v) => setCtA((p) => ({ ...p, ar: { ...(p.ar ?? {}), ctaLabel: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Secondary CTA Label</label>
              <input
                value={cta.ctaSecondaryLabel ?? ""}
                onChange={(e) => setCtA((p) => ({ ...p, ctaSecondaryLabel: e.target.value }))}
                className={inputClass}
                placeholder="Talk to Our Team"
                maxLength={FIELD_LIMITS.button}
              />
              <CharCount value={cta.ctaSecondaryLabel ?? ""} max={FIELD_LIMITS.button} />
              <ArInput label="Cta Secondary Label" kind="button" value={cta.ar?.ctaSecondaryLabel} onChange={(v) => setCtA((p) => ({ ...p, ar: { ...(p.ar ?? {}), ctaSecondaryLabel: v } }))} />
            </div>
          </div>

          {/* Background Image */}
          <div>
            <label className={labelClass}>Background Image</label>
            <div className="flex items-start gap-3">
              <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                {cta.image && cta.image !== "/image.png" ? (
                  <img src={cta.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  value={cta.image ?? ""}
                  onChange={(e) => setCtA((p) => ({ ...p, image: e.target.value }))}
                  className={inputClass}
                  placeholder="Image URL (leave blank to use the default skyline)"
                  maxLength={FIELD_LIMITS.link}
                />
                <CharCount value={cta.image ?? ""} max={FIELD_LIMITS.link} />
                <FieldError error={validateUrl(cta.image ?? "")} />
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff]">
                  {uploadProgress["cta-0"] !== undefined ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {uploadProgress["cta-0"]}%
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      Upload image
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadProgress["cta-0"] !== undefined}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload("cta", 0, file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>
      </div>

      {editingDetail && (
        <DetailEditModal
          initial={editingDetail.draft}
          isNew={editingDetail.isNew}
          allDetails={details}
          onSave={saveDetailFromModal}
          onClose={() => setEditingDetail(null)}
        />
      )}
    </div>
  );
}
