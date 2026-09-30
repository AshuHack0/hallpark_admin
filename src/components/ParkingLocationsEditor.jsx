/* eslint-disable react/prop-types -- internal presentational helpers for this editor only */
import { createContext, useContext, useEffect, useState } from "react";
import { Save, Loader2, Plus, Trash2, ChevronDown, Upload, MapPin } from "lucide-react";
import { api, uploadMediaToCloudinary } from "../lib/api";
import { validateUrl, validateImageFile } from "../lib/validators";
import { FIELD_LIMITS, CharCount, FieldError, ArInput } from "./CappedField";
import { confirmDelete } from "../lib/confirmDelete";
import { scrollToNewItem } from "../lib/scrollToNewItem";
import RichTextArea from "./RichTextArea.jsx";
import { CsvInput } from "./ListInput.jsx";
import PageLinkSelect from "./PageLinkSelect.jsx";

/*
 * PARKING LOCATIONS PAGE EDITOR — /parking-locations
 *
 * Manages the page every "Find My Parking" / "Explore Parking" /
 * "Explore Our Locations" button points at: towers & projects per emirate,
 * certificates and Google reviews.
 *
 * Nothing is hardcoded on the website — an empty field hides its element and an
 * empty list hides its whole section.
 */

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15";
const labelClass = "block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 mb-2";

const DEFAULT_HERO = {
  eyebrow: "",
  heading: "",
  headingGradient: "",
  description: "",
  image: "",
  searchPlaceholder: "",
  ar: { eyebrow: "", heading: "", headingGradient: "", description: "", searchPlaceholder: "" },
};

const DEFAULT_STATS = { items: [] };

const DEFAULT_LOCATIONS = {
  eyebrow: "",
  heading: "",
  headingGradient: "",
  description: "",
  allLabel: "",
  emptyText: "",
  emirates: [],
  items: [],
  ar: { eyebrow: "", heading: "", headingGradient: "", description: "", allLabel: "", emptyText: "" },
};

const DEFAULT_CERTIFICATES = {
  eyebrow: "",
  heading: "",
  headingGradient: "",
  description: "",
  items: [],
  ar: { eyebrow: "", heading: "", headingGradient: "", description: "" },
};

const DEFAULT_REVIEWS = {
  eyebrow: "",
  heading: "",
  headingGradient: "",
  description: "",
  rating: "",
  reviewCount: "",
  googleLabel: "",
  googleLink: "",
  items: [],
  ar: { eyebrow: "", heading: "", headingGradient: "", description: "", reviewCount: "", googleLabel: "" },
};

const DEFAULT_CTA = {
  heading: "",
  headingGradient: "",
  description: "",
  primaryLabel: "",
  primaryLink: "",
  secondaryLabel: "",
  secondaryLink: "",
  ar: { heading: "", headingGradient: "", description: "", primaryLabel: "", secondaryLabel: "" },
};

function emptyStat() {
  return { value: "", label: "", ar: { label: "" } };
}
function emptyEmirate() {
  return { key: "", name: "", ar: { name: "" } };
}
function emptyLocation() {
  return {
    name: "",
    emirate: "",
    area: "",
    image: "",
    description: "",
    tag: "",
    features: [],
    mapLink: "",
    mapLabel: "",
    ar: { name: "", area: "", description: "", tag: "", mapLabel: "", features: [] },
  };
}
function emptyCertificate() {
  return { title: "", issuer: "", image: "", ar: { title: "", issuer: "" } };
}
function emptyReview() {
  return {
    name: "",
    text: "",
    rating: "5",
    location: "",
    date: "",
    avatar: "",
    ar: { name: "", text: "", location: "", date: "" },
  };
}

function mergeSection(defaults, loaded) {
  if (!loaded || typeof loaded !== "object") return { ...defaults };
  return { ...defaults, ...loaded, ar: { ...(defaults.ar ?? {}), ...(loaded.ar ?? {}) } };
}

function mergeList(loaded, factory) {
  if (!Array.isArray(loaded)) return [];
  return loaded.map((item) => ({
    ...factory(),
    ...item,
    ar: { ...factory().ar, ...(item?.ar ?? {}) },
  }));
}

function mergeSections(raw = {}) {
  return {
    hero: mergeSection(DEFAULT_HERO, raw.hero),
    stats: { ...DEFAULT_STATS, ...(raw.stats ?? {}), items: mergeList(raw.stats?.items, emptyStat) },
    locations: {
      ...mergeSection(DEFAULT_LOCATIONS, raw.locations),
      emirates: mergeList(raw.locations?.emirates, emptyEmirate),
      items: mergeList(raw.locations?.items, emptyLocation),
    },
    certificates: {
      ...mergeSection(DEFAULT_CERTIFICATES, raw.certificates),
      items: mergeList(raw.certificates?.items, emptyCertificate),
    },
    reviews: {
      ...mergeSection(DEFAULT_REVIEWS, raw.reviews),
      items: mergeList(raw.reviews?.items, emptyReview),
    },
    cta: mergeSection(DEFAULT_CTA, raw.cta),
  };
}

/* ── shared UI bits (same look as the other page editors) ── */

const SectionSaveContext = createContext(null);

function SectionSaveButton() {
  const save = useContext(SectionSaveContext);
  if (!save) return null;
  return (
    <div className="mb-4 flex justify-end">
      <button
        type="button"
        onClick={save.onSave}
        disabled={save.saving}
        className="inline-flex items-center gap-2 rounded-lg bg-[#0088FF] px-4 py-2 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-50"
      >
        {save.saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        {save.saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

function CollapsibleSection({ title, subtitle, isOpen, onToggle, children }) {
  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition text-start"
      >
        <span>
          <h2 className="text-xl font-bold text-[#050A13]">{title}</h2>
          {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
        </span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-slate-500 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="border-t border-slate-200 px-6 pb-6 pt-4">
          <SectionSaveButton />
          {children}
        </div>
      )}
    </div>
  );
}

function EnabledToggle({ enabled, onChange }) {
  return (
    <label className="mb-4 flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
                checked={enabled !== false}
                onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 accent-[#0088FF]"
      />
      Show this section on the website
    </label>
  );
}

function MediaField({ label, value, uploading, progress, onChange, onUpload, uploadError, hint }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          maxLength={FIELD_LIMITS.link}
          className={inputClass}
          placeholder={`${label} URL or /path`}
        />
        <label
          className={`shrink-0 inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold ${
            uploading
              ? "cursor-not-allowed border-slate-200 text-slate-400"
              : "cursor-pointer border-[#0088FF]/30 bg-[#EEF6FF] text-[#0088FF] hover:bg-[#dcecff]"
          }`}
          title={`Upload ${label}`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {progress}%
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
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) onUpload(file);
            }}
          />
        </label>
      </div>
      <FieldError error={validateUrl(value)} />
      {uploadError ? (
        <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadError}</p>
      ) : null}
      {hint ? <p className="mt-1 text-[11px] text-slate-400">{hint}</p> : null}
      {(value ?? "").trim() ? (
        <img
          src={value}
          alt=""
          className="mt-2 h-20 w-auto rounded-lg border border-slate-200 bg-white object-contain p-1"
        />
      ) : null}
    </div>
  );
}

function HeaderFields({ block, onChange, withDescription = true }) {
  const set = (patch) => onChange({ ...block, ...patch });
  const setAr = (patch) => onChange({ ...block, ar: { ...(block.ar ?? {}), ...patch } });
  return (
    <div className="grid gap-4">
      <div>
        <label className={labelClass}>Eyebrow (small label above the heading)</label>
        <input
          value={block.eyebrow ?? ""}
          onChange={(e) => set({ eyebrow: e.target.value })}
          className={inputClass}
          maxLength={FIELD_LIMITS.label}
        />
        <CharCount value={block.eyebrow ?? ""} max={FIELD_LIMITS.label} />
        <ArInput label="Eyebrow" kind="label" value={block.ar?.eyebrow} onChange={(v) => setAr({ eyebrow: v })} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Heading — first line</label>
          <input
            value={block.heading ?? ""}
            onChange={(e) => set({ heading: e.target.value })}
            className={inputClass}
            maxLength={FIELD_LIMITS.heading}
          />
          <CharCount value={block.heading ?? ""} max={FIELD_LIMITS.heading} />
          <ArInput label="Heading" kind="heading" value={block.ar?.heading} onChange={(v) => setAr({ heading: v })} />
        </div>
        <div>
          <label className={labelClass}>Heading — gradient second line</label>
          <input
            value={block.headingGradient ?? ""}
            onChange={(e) => set({ headingGradient: e.target.value })}
            className={inputClass}
            maxLength={FIELD_LIMITS.heading}
          />
          <CharCount value={block.headingGradient ?? ""} max={FIELD_LIMITS.heading} />
          <ArInput
            label="Gradient line"
            kind="heading"
            value={block.ar?.headingGradient}
            onChange={(v) => setAr({ headingGradient: v })}
          />
        </div>
      </div>
      {withDescription ? (
        <div>
          <label className={labelClass}>Description</label>
          <RichTextArea value={block.description ?? ""} onChange={(v) => set({ description: v })} rows={3} />
          <CharCount value={block.description ?? ""} max={FIELD_LIMITS.description} />
          <ArInput
            label="Description"
            kind="description"
            multiline
            rows={3}
            value={block.ar?.description}
            onChange={(v) => setAr({ description: v })}
          />
        </div>
      ) : null}
    </div>
  );
}

function ItemRow({ title, onRemove, children }) {
  return (
    <div data-new-item-row className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{title}</span>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>
      {children}
    </div>
  );
}

function AddButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-4 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff]"
    >
      <Plus className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

/* ═══════════════════════════ EDITOR ═══════════════════════════ */

export default function ParkingLocationsEditor() {
  const slug = "parking-locations";
  const [page, setPage] = useState(null);
  const [sections, setSections] = useState(mergeSections());
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [openSections, setOpenSections] = useState({ locations: true });
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});

  useEffect(() => {
    document.title = "Parking Locations — HalaPark Admin";
    setLoading(true);
    api
      .getPage(slug)
      .then((data) => {
        setPage(data.page);
        setSections(mergeSections(data.page?.sections));
        setPublished(data.page?.published ?? true);
      })
      .catch((err) => setError(err.message ?? "Failed to load page"))
      .finally(() => setLoading(false));
  }, []);

  const toggleSection = (name) => setOpenSections((prev) => ({ ...prev, [name]: !prev[name] }));

  function setSection(key, next) {
    setSections((prev) => ({ ...prev, [key]: typeof next === "function" ? next(prev[key]) : next }));
  }
  function setSectionEnabled(key, nextEnabled) {
    setSections((prev) => ({ ...prev, [key]: { ...(prev[key] ?? {}), enabled: nextEnabled } }));
  }
  // Update one entry of a list that lives at sections[key].<listName>
  function updateListItem(key, listName, index, updates) {
    setSections((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [listName]: prev[key][listName].map((item, i) => (i === index ? { ...item, ...updates } : item)),
      },
    }));
  }
  function addListItem(key, listName, factory, e) {
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], [listName]: [...prev[key][listName], factory()] },
    }));
    scrollToNewItem(e);
  }
  function removeListItem(key, listName, index) {
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], [listName]: prev[key][listName].filter((_, i) => i !== index) },
    }));
  }

  // Shared image upload — `key` identifies the field for the progress spinner.
  async function handleUpload(key, file, apply) {
    const err = validateImageFile(file);
    if (err) {
      setUploadErrors((p) => ({ ...p, [key]: err }));
      return;
    }
    setUploadErrors((p) => ({ ...p, [key]: undefined }));
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct })),
      );
      apply(url);
      setSuccess("Image uploaded. Remember to Save.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (uploadErr) {
      setUploadErrors((p) => ({ ...p, [key]: uploadErr.message ?? "Upload failed" }));
    } finally {
      setUploadProgress((p) => ({ ...p, [key]: undefined }));
    }
  }

  function validateBeforeSave() {
    const emirates = sections.locations.emirates;
    for (let i = 0; i < emirates.length; i += 1) {
      if (!emirates[i].name?.trim()) return `Emirate ${i + 1} needs a name.`;
    }
    const items = sections.locations.items;
    for (let i = 0; i < items.length; i += 1) {
      if (!items[i].name?.trim()) return `Location ${i + 1} needs a name.`;
    }
    return "";
  }

  // Emirate key is derived from the name so the admin never types a slug.
  function slugify(value) {
    return (value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
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
      // Fill in any missing emirate keys before saving, and keep the locations
      // pointing at the right emirate if a name was renamed.
      const payload = {
        ...sections,
        locations: {
          ...sections.locations,
          emirates: sections.locations.emirates.map((e) => ({
            ...e,
            key: (e.key || "").trim() || slugify(e.name),
          })),
        },
      };
      const data = await api.updatePage(slug, { sections: payload, published });
      setPage(data.page);
      setSections(mergeSections(data.page?.sections));
      setSuccess("Parking Locations page saved successfully!");
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      setError(err.message ?? "Failed to save page");
    } finally {
      setSaving(false);
    }
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
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error || "Page not found"}</div>
    );
  }

  const emirateOptions = sections.locations.emirates
    .map((e) => ({ key: (e.key || "").trim() || slugify(e.name), name: e.name }))
    .filter((e) => e.key && e.name);

  return (
    <SectionSaveContext.Provider value={{ onSave: handleSave, saving }}>
      <div className="w-full space-y-6 px-6 py-6">
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-bold text-[#050A13]">Parking Locations Page Editor</h1>
          <p className="mt-2 text-sm text-slate-600">
            All towers and projects across the UAE, plus certificates and Google reviews. This is the page the
            “Find My Parking”, “Explore Parking” and “Explore Our Locations” buttons open.
          </p>
        </div>

        <div className="sticky top-0 z-40 -mx-2 flex flex-wrap items-center gap-3 rounded-b-xl border-b border-slate-200/70 bg-white/90 px-2 py-3 backdrop-blur">
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          ) : null}
          {success ? (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              ✅ {success}
            </div>
          ) : null}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0088FF] px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* ── HERO ── */}
        <CollapsibleSection
          title="Hero"
          subtitle="Top of the page — heading, description, search box and the figures beside it"
          isOpen={!!openSections.hero}
          onToggle={() => toggleSection("hero")}
        >
          <EnabledToggle enabled={sections.hero?.enabled} onChange={(v) => setSectionEnabled("hero", v)} />
          <HeaderFields block={sections.hero} onChange={(next) => setSection("hero", next)} />

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Search box placeholder</label>
              <input
                value={sections.hero.searchPlaceholder ?? ""}
                onChange={(e) => setSection("hero", (p) => ({ ...p, searchPlaceholder: e.target.value }))}
                className={inputClass}
                placeholder="Search by tower, project or area"
                maxLength={FIELD_LIMITS.subtitle}
              />
              <CharCount value={sections.hero.searchPlaceholder ?? ""} max={FIELD_LIMITS.subtitle} />
              <ArInput
                label="Search placeholder"
                kind="subtitle"
                value={sections.hero.ar?.searchPlaceholder}
                onChange={(v) => setSection("hero", (p) => ({ ...p, ar: { ...(p.ar ?? {}), searchPlaceholder: v } }))}
              />
            </div>
            <MediaField
              label="Hero image"
              value={sections.hero.image}
              uploading={uploadProgress["hero-image"] !== undefined}
              progress={uploadProgress["hero-image"] ?? 0}
              uploadError={uploadErrors["hero-image"]}
              onChange={(v) => setSection("hero", (p) => ({ ...p, image: v }))}
              onUpload={(file) =>
                handleUpload("hero-image", file, (url) => setSection("hero", (p) => ({ ...p, image: url })))
              }
              hint="Optional. Leave empty to show the text full width."
            />
          </div>

          {/* Stats */}
          <div data-item-list-root className="mt-6 border-t border-slate-200 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#050A13]">Figures beside the hero</h3>
                <p className="text-xs text-slate-500">e.g. “40+ / Towers Powered”. Leave empty to hide.</p>
              </div>
              <AddButton label="Add Figure" onClick={(e) => addListItem("stats", "items", emptyStat, e)} />
            </div>
            <EnabledToggle enabled={sections.stats?.enabled} onChange={(v) => setSectionEnabled("stats", v)} />
            <div className="grid gap-3">
              {sections.stats.items.map((stat, i) => (
                <ItemRow
                  key={i}
                  title={`Figure ${i + 1}`}
                  onRemove={() => {
                    if (!confirmDelete(`figure ${i + 1}`)) return;
                    removeListItem("stats", "items", i);
                  }}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Value</label>
                      <input
                        value={stat.value ?? ""}
                        onChange={(e) => updateListItem("stats", "items", i, { value: e.target.value })}
                        className={inputClass}
                        placeholder="40+"
                        maxLength={FIELD_LIMITS.label}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Label</label>
                      <input
                        value={stat.label ?? ""}
                        onChange={(e) => updateListItem("stats", "items", i, { label: e.target.value })}
                        className={inputClass}
                        placeholder="Towers Powered"
                        maxLength={FIELD_LIMITS.label}
                      />
                      <ArInput
                        label="Label"
                        kind="label"
                        value={stat.ar?.label}
                        onChange={(v) =>
                          updateListItem("stats", "items", i, { ar: { ...(stat.ar ?? {}), label: v } })
                        }
                      />
                    </div>
                  </div>
                </ItemRow>
              ))}
              {sections.stats.items.length === 0 ? (
                <p className="text-xs text-slate-400">No figures yet.</p>
              ) : null}
            </div>
          </div>
        </CollapsibleSection>

        {/* ── LOCATIONS ── */}
        <CollapsibleSection
          title="Towers & Projects"
          subtitle="The emirate filter and every parking location shown on the page"
          isOpen={!!openSections.locations}
          onToggle={() => toggleSection("locations")}
        >
          <EnabledToggle
            enabled={sections.locations?.enabled}
            onChange={(v) => setSectionEnabled("locations", v)}
          />
          <HeaderFields block={sections.locations} onChange={(next) => setSection("locations", next)} />

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>“All emirates” tab label</label>
              <input
                value={sections.locations.allLabel ?? ""}
                onChange={(e) => setSection("locations", (p) => ({ ...p, allLabel: e.target.value }))}
                className={inputClass}
                placeholder="All Emirates"
                maxLength={FIELD_LIMITS.label}
              />
              <ArInput
                label="All emirates label"
                kind="label"
                value={sections.locations.ar?.allLabel}
                onChange={(v) => setSection("locations", (p) => ({ ...p, ar: { ...(p.ar ?? {}), allLabel: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>“Nothing found” message</label>
              <input
                value={sections.locations.emptyText ?? ""}
                onChange={(e) => setSection("locations", (p) => ({ ...p, emptyText: e.target.value }))}
                className={inputClass}
                placeholder="No locations match your search yet."
                maxLength={FIELD_LIMITS.subtitle}
              />
              <ArInput
                label="Nothing found message"
                kind="subtitle"
                value={sections.locations.ar?.emptyText}
                onChange={(v) => setSection("locations", (p) => ({ ...p, ar: { ...(p.ar ?? {}), emptyText: v } }))}
              />
            </div>
          </div>

          {/* Emirates */}
          <div data-item-list-root className="mt-6 border-t border-slate-200 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#050A13]">Emirates (filter tabs)</h3>
                <p className="text-xs text-slate-500">
                  Each location below is assigned to one of these. Deleting one clears it from its locations.
                </p>
              </div>
              <AddButton
                label="Add Emirate"
                onClick={(e) => addListItem("locations", "emirates", emptyEmirate, e)}
              />
            </div>
            <div className="grid gap-3">
              {sections.locations.emirates.map((em, i) => (
                <ItemRow
                  key={i}
                  title={em.name?.trim() || `Emirate ${i + 1}`}
                  onRemove={() => {
                    if (!confirmDelete(`the emirate “${em.name || i + 1}”`)) return;
                    removeListItem("locations", "emirates", i);
                  }}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>Name</label>
                      <input
                        value={em.name ?? ""}
                        onChange={(e) => {
                          const name = e.target.value;
                          updateListItem("locations", "emirates", i, {
                            name,
                            key: (em.key || "").trim() || slugify(name),
                          });
                        }}
                        className={inputClass}
                        placeholder="Dubai"
                        maxLength={FIELD_LIMITS.label}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Name (Arabic)</label>
                      <ArInput
                        label="Name"
                        kind="label"
                        value={em.ar?.name}
                        onChange={(v) =>
                          updateListItem("locations", "emirates", i, { ar: { ...(em.ar ?? {}), name: v } })
                        }
                      />
                    </div>
                  </div>
                </ItemRow>
              ))}
              {sections.locations.emirates.length === 0 ? (
                <p className="text-xs text-slate-400">No emirates yet — add Dubai, Abu Dhabi, Sharjah, Ajman…</p>
              ) : null}
            </div>
          </div>

          {/* Locations */}
          <div data-item-list-root className="mt-6 border-t border-slate-200 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#050A13]">Locations</h3>
                <p className="text-xs text-slate-500">Every tower / project card shown in the grid.</p>
              </div>
              <AddButton
                label="Add Location"
                onClick={(e) => addListItem("locations", "items", emptyLocation, e)}
              />
            </div>
            <div className="grid gap-3">
              {sections.locations.items.map((loc, i) => {
                const key = `loc-${i}-image`;
                return (
                  <ItemRow
                    key={i}
                    title={loc.name?.trim() || `Location ${i + 1}`}
                    onRemove={() => {
                      if (!confirmDelete(`the location “${loc.name || i + 1}”`)) return;
                      removeListItem("locations", "items", i);
                    }}
                  >
                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className={labelClass}>Tower / project name</label>
                          <input
                            value={loc.name ?? ""}
                            onChange={(e) => updateListItem("locations", "items", i, { name: e.target.value })}
                            className={inputClass}
                            placeholder="Marina Heights Tower"
                            maxLength={FIELD_LIMITS.heading}
                          />
                          <CharCount value={loc.name ?? ""} max={FIELD_LIMITS.heading} />
                          <ArInput
                            label="Name"
                            kind="heading"
                            value={loc.ar?.name}
                            onChange={(v) =>
                              updateListItem("locations", "items", i, { ar: { ...(loc.ar ?? {}), name: v } })
                            }
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Emirate</label>
                          <select
                            value={loc.emirate ?? ""}
                            onChange={(e) => updateListItem("locations", "items", i, { emirate: e.target.value })}
                            className={inputClass}
                          >
                            <option value="">— Select an emirate —</option>
                            {emirateOptions.map((opt) => (
                              <option key={opt.key} value={opt.key}>
                                {opt.name}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1 text-[11px] text-slate-400">
                            Controls which filter tab this location appears under.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className={labelClass}>Area / address line</label>
                          <input
                            value={loc.area ?? ""}
                            onChange={(e) => updateListItem("locations", "items", i, { area: e.target.value })}
                            className={inputClass}
                            placeholder="Dubai Marina, Dubai"
                            maxLength={FIELD_LIMITS.subtitle}
                          />
                          <ArInput
                            label="Area"
                            kind="subtitle"
                            value={loc.ar?.area}
                            onChange={(v) =>
                              updateListItem("locations", "items", i, { ar: { ...(loc.ar ?? {}), area: v } })
                            }
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Badge (top-right of the card)</label>
                          <input
                            value={loc.tag ?? ""}
                            onChange={(e) => updateListItem("locations", "items", i, { tag: e.target.value })}
                            className={inputClass}
                            placeholder="Now Live"
                            maxLength={FIELD_LIMITS.label}
                          />
                          <ArInput
                            label="Badge"
                            kind="label"
                            value={loc.ar?.tag}
                            onChange={(v) =>
                              updateListItem("locations", "items", i, { ar: { ...(loc.ar ?? {}), tag: v } })
                            }
                          />
                        </div>
                      </div>

                      <MediaField
                        label="Photo"
                        value={loc.image}
                        uploading={uploadProgress[key] !== undefined}
                        progress={uploadProgress[key] ?? 0}
                        uploadError={uploadErrors[key]}
                        onChange={(v) => updateListItem("locations", "items", i, { image: v })}
                        onUpload={(file) =>
                          handleUpload(key, file, (url) => updateListItem("locations", "items", i, { image: url }))
                        }
                      />

                      <div>
                        <label className={labelClass}>Description</label>
                        <RichTextArea
                          value={loc.description ?? ""}
                          onChange={(v) => updateListItem("locations", "items", i, { description: v })}
                          rows={3}
                        />
                        <ArInput
                          label="Description"
                          kind="description"
                          multiline
                          rows={3}
                          value={loc.ar?.description}
                          onChange={(v) =>
                            updateListItem("locations", "items", i, { ar: { ...(loc.ar ?? {}), description: v } })
                          }
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Features (comma separated)</label>
                        <CsvInput
                          value={loc.features}
                          onChange={(v) => updateListItem("locations", "items", i, { features: v })}
                          className={inputClass}
                          placeholder="EV Charging, Valet, 24/7 Access"
                        />
                        <label className="mb-1 mt-2 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">
                          Features (Arabic)
                        </label>
                        <CsvInput
                          arabic
                          value={loc.ar?.features}
                          onChange={(v) =>
                            updateListItem("locations", "items", i, { ar: { ...(loc.ar ?? {}), features: v } })
                          }
                          className="w-full rounded-xl border border-emerald-200 bg-emerald-50/40 px-4 py-2.5 text-sm text-right outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-300/30"
                          placeholder="اتركه فارغًا لإخفاء المزايا بالعربية"
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className={labelClass}>Google Maps link</label>
                          <input
                            value={loc.mapLink ?? ""}
                            onChange={(e) => updateListItem("locations", "items", i, { mapLink: e.target.value })}
                            className={inputClass}
                            placeholder="https://maps.google.com/…"
                            maxLength={FIELD_LIMITS.link}
                          />
                          <FieldError error={validateUrl(loc.mapLink)} />
                        </div>
                        <div>
                          <label className={labelClass}>Map link text</label>
                          <input
                            value={loc.mapLabel ?? ""}
                            onChange={(e) => updateListItem("locations", "items", i, { mapLabel: e.target.value })}
                            className={inputClass}
                            placeholder="View on map"
                            maxLength={FIELD_LIMITS.button}
                          />
                          <ArInput
                            label="Map link text"
                            kind="button"
                            value={loc.ar?.mapLabel}
                            onChange={(v) =>
                              updateListItem("locations", "items", i, { ar: { ...(loc.ar ?? {}), mapLabel: v } })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </ItemRow>
                );
              })}
              {sections.locations.items.length === 0 ? (
                <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                  <MapPin className="mr-1 inline h-3.5 w-3.5" />
                  No locations added yet — this section stays hidden on the website until you add one.
                </p>
              ) : null}
            </div>
          </div>
        </CollapsibleSection>

        {/* ── CERTIFICATES ── */}
        <CollapsibleSection
          title="Certificates"
          subtitle="Licences, approvals and accreditations shown as logo cards"
          isOpen={!!openSections.certificates}
          onToggle={() => toggleSection("certificates")}
        >
          <EnabledToggle
            enabled={sections.certificates?.enabled}
            onChange={(v) => setSectionEnabled("certificates", v)}
          />
          <HeaderFields block={sections.certificates} onChange={(next) => setSection("certificates", next)} />

          <div data-item-list-root className="mt-6 border-t border-slate-200 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#050A13]">Certificates</h3>
              <AddButton
                label="Add Certificate"
                onClick={(e) => addListItem("certificates", "items", emptyCertificate, e)}
              />
            </div>
            <div className="grid gap-3">
              {sections.certificates.items.map((cert, i) => {
                const key = `cert-${i}-image`;
                return (
                  <ItemRow
                    key={i}
                    title={cert.title?.trim() || `Certificate ${i + 1}`}
                    onRemove={() => {
                      if (!confirmDelete(`the certificate “${cert.title || i + 1}”`)) return;
                      removeListItem("certificates", "items", i);
                    }}
                  >
                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className={labelClass}>Title</label>
                          <input
                            value={cert.title ?? ""}
                            onChange={(e) => updateListItem("certificates", "items", i, { title: e.target.value })}
                            className={inputClass}
                            placeholder="ISO 9001:2015"
                            maxLength={FIELD_LIMITS.heading}
                          />
                          <ArInput
                            label="Title"
                            kind="heading"
                            value={cert.ar?.title}
                            onChange={(v) =>
                              updateListItem("certificates", "items", i, { ar: { ...(cert.ar ?? {}), title: v } })
                            }
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Issued by</label>
                          <input
                            value={cert.issuer ?? ""}
                            onChange={(e) => updateListItem("certificates", "items", i, { issuer: e.target.value })}
                            className={inputClass}
                            placeholder="Dubai Municipality"
                            maxLength={FIELD_LIMITS.subtitle}
                          />
                          <ArInput
                            label="Issued by"
                            kind="subtitle"
                            value={cert.ar?.issuer}
                            onChange={(v) =>
                              updateListItem("certificates", "items", i, { ar: { ...(cert.ar ?? {}), issuer: v } })
                            }
                          />
                        </div>
                      </div>
                      <MediaField
                        label="Certificate / logo image"
                        value={cert.image}
                        uploading={uploadProgress[key] !== undefined}
                        progress={uploadProgress[key] ?? 0}
                        uploadError={uploadErrors[key]}
                        onChange={(v) => updateListItem("certificates", "items", i, { image: v })}
                        onUpload={(file) =>
                          handleUpload(key, file, (url) =>
                            updateListItem("certificates", "items", i, { image: url }),
                          )
                        }
                        hint="Shown at its natural shape — a transparent PNG works best."
                      />
                    </div>
                  </ItemRow>
                );
              })}
              {sections.certificates.items.length === 0 ? (
                <p className="text-xs text-slate-400">
                  No certificates yet — this section stays hidden until you add one.
                </p>
              ) : null}
            </div>
          </div>
        </CollapsibleSection>

        {/* ── REVIEWS ── */}
        <CollapsibleSection
          title="Google Reviews"
          subtitle="Overall rating plus the individual reviews shown on the dark band"
          isOpen={!!openSections.reviews}
          onToggle={() => toggleSection("reviews")}
        >
          <EnabledToggle enabled={sections.reviews?.enabled} onChange={(v) => setSectionEnabled("reviews", v)} />
          <HeaderFields block={sections.reviews} onChange={(next) => setSection("reviews", next)} />

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Overall rating (1–5)</label>
              <input
                value={sections.reviews.rating ?? ""}
                onChange={(e) => setSection("reviews", (p) => ({ ...p, rating: e.target.value }))}
                className={inputClass}
                placeholder="4.8"
                maxLength={5}
              />
            </div>
            <div>
              <label className={labelClass}>Review count text</label>
              <input
                value={sections.reviews.reviewCount ?? ""}
                onChange={(e) => setSection("reviews", (p) => ({ ...p, reviewCount: e.target.value }))}
                className={inputClass}
                placeholder="Based on 312 Google reviews"
                maxLength={FIELD_LIMITS.subtitle}
              />
              <ArInput
                label="Review count text"
                kind="subtitle"
                value={sections.reviews.ar?.reviewCount}
                onChange={(v) => setSection("reviews", (p) => ({ ...p, ar: { ...(p.ar ?? {}), reviewCount: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Google reviews button text</label>
              <input
                value={sections.reviews.googleLabel ?? ""}
                onChange={(e) => setSection("reviews", (p) => ({ ...p, googleLabel: e.target.value }))}
                className={inputClass}
                placeholder="Read all reviews on Google"
                maxLength={FIELD_LIMITS.button}
              />
              <ArInput
                label="Button text"
                kind="button"
                value={sections.reviews.ar?.googleLabel}
                onChange={(v) => setSection("reviews", (p) => ({ ...p, ar: { ...(p.ar ?? {}), googleLabel: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Google reviews link</label>
              <input
                value={sections.reviews.googleLink ?? ""}
                onChange={(e) => setSection("reviews", (p) => ({ ...p, googleLink: e.target.value }))}
                className={inputClass}
                placeholder="https://g.page/r/…"
                maxLength={FIELD_LIMITS.link}
              />
              <FieldError error={validateUrl(sections.reviews.googleLink)} />
              <p className="mt-1 text-[11px] text-slate-400">The button shows only when it has both text and a link.</p>
            </div>
          </div>

          <div data-item-list-root className="mt-6 border-t border-slate-200 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#050A13]">Reviews</h3>
              <AddButton label="Add Review" onClick={(e) => addListItem("reviews", "items", emptyReview, e)} />
            </div>
            <div className="grid gap-3">
              {sections.reviews.items.map((review, i) => {
                const key = `review-${i}-avatar`;
                return (
                  <ItemRow
                    key={i}
                    title={review.name?.trim() || `Review ${i + 1}`}
                    onRemove={() => {
                      if (!confirmDelete(`the review from “${review.name || i + 1}”`)) return;
                      removeListItem("reviews", "items", i);
                    }}
                  >
                    <div className="grid gap-4">
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <label className={labelClass}>Reviewer name</label>
                          <input
                            value={review.name ?? ""}
                            onChange={(e) => updateListItem("reviews", "items", i, { name: e.target.value })}
                            className={inputClass}
                            maxLength={FIELD_LIMITS.label}
                          />
                          <ArInput
                            label="Name"
                            kind="label"
                            value={review.ar?.name}
                            onChange={(v) =>
                              updateListItem("reviews", "items", i, { ar: { ...(review.ar ?? {}), name: v } })
                            }
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Stars</label>
                          <select
                            value={String(review.rating ?? "5")}
                            onChange={(e) => updateListItem("reviews", "items", i, { rating: e.target.value })}
                            className={inputClass}
                          >
                            {["5", "4", "3", "2", "1"].map((n) => (
                              <option key={n} value={n}>
                                {n} ★
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Date text</label>
                          <input
                            value={review.date ?? ""}
                            onChange={(e) => updateListItem("reviews", "items", i, { date: e.target.value })}
                            className={inputClass}
                            placeholder="2 weeks ago"
                            maxLength={FIELD_LIMITS.label}
                          />
                          <ArInput
                            label="Date text"
                            kind="label"
                            value={review.ar?.date}
                            onChange={(v) =>
                              updateListItem("reviews", "items", i, { ar: { ...(review.ar ?? {}), date: v } })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Review text</label>
                        <RichTextArea
                          value={review.text ?? ""}
                          onChange={(v) => updateListItem("reviews", "items", i, { text: v })}
                          rows={3}
                        />
                        <ArInput
                          label="Review text"
                          kind="description"
                          multiline
                          rows={3}
                          value={review.ar?.text}
                          onChange={(v) =>
                            updateListItem("reviews", "items", i, { ar: { ...(review.ar ?? {}), text: v } })
                          }
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className={labelClass}>Location (under the name)</label>
                          <input
                            value={review.location ?? ""}
                            onChange={(e) => updateListItem("reviews", "items", i, { location: e.target.value })}
                            className={inputClass}
                            placeholder="Marina Heights, Dubai"
                            maxLength={FIELD_LIMITS.subtitle}
                          />
                          <ArInput
                            label="Location"
                            kind="subtitle"
                            value={review.ar?.location}
                            onChange={(v) =>
                              updateListItem("reviews", "items", i, { ar: { ...(review.ar ?? {}), location: v } })
                            }
                          />
                        </div>
                        <MediaField
                          label="Reviewer photo"
                          value={review.avatar}
                          uploading={uploadProgress[key] !== undefined}
                          progress={uploadProgress[key] ?? 0}
                          uploadError={uploadErrors[key]}
                          onChange={(v) => updateListItem("reviews", "items", i, { avatar: v })}
                          onUpload={(file) =>
                            handleUpload(key, file, (url) =>
                              updateListItem("reviews", "items", i, { avatar: url }),
                            )
                          }
                          hint="Optional — the first letter of the name is used when empty."
                        />
                      </div>
                    </div>
                  </ItemRow>
                );
              })}
              {sections.reviews.items.length === 0 ? (
                <p className="text-xs text-slate-400">
                  No reviews yet — this section stays hidden until you add one.
                </p>
              ) : null}
            </div>
          </div>
        </CollapsibleSection>

        {/* ── CTA ── */}
        <CollapsibleSection
          title="Closing CTA"
          subtitle="The band at the bottom of the page"
          isOpen={!!openSections.cta}
          onToggle={() => toggleSection("cta")}
        >
          <EnabledToggle enabled={sections.cta?.enabled} onChange={(v) => setSectionEnabled("cta", v)} />
          <HeaderFields block={sections.cta} onChange={(next) => setSection("cta", next)} />

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>Primary button text</label>
              <input
                value={sections.cta.primaryLabel ?? ""}
                onChange={(e) => setSection("cta", (p) => ({ ...p, primaryLabel: e.target.value }))}
                className={inputClass}
                maxLength={FIELD_LIMITS.button}
              />
              <ArInput
                label="Primary button"
                kind="button"
                value={sections.cta.ar?.primaryLabel}
                onChange={(v) => setSection("cta", (p) => ({ ...p, ar: { ...(p.ar ?? {}), primaryLabel: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Primary button link</label>
              <PageLinkSelect
                value={sections.cta.primaryLink}
                onChange={(v) => setSection("cta", (p) => ({ ...p, primaryLink: v }))}
              />
            </div>
            <div>
              <label className={labelClass}>Secondary button text</label>
              <input
                value={sections.cta.secondaryLabel ?? ""}
                onChange={(e) => setSection("cta", (p) => ({ ...p, secondaryLabel: e.target.value }))}
                className={inputClass}
                maxLength={FIELD_LIMITS.button}
              />
              <ArInput
                label="Secondary button"
                kind="button"
                value={sections.cta.ar?.secondaryLabel}
                onChange={(v) => setSection("cta", (p) => ({ ...p, ar: { ...(p.ar ?? {}), secondaryLabel: v } }))}
              />
            </div>
            <div>
              <label className={labelClass}>Secondary button link</label>
              <PageLinkSelect
                value={sections.cta.secondaryLink}
                onChange={(v) => setSection("cta", (p) => ({ ...p, secondaryLink: v }))}
              />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">Each button shows only when it has both text and a link.</p>
        </CollapsibleSection>
      </div>
    </SectionSaveContext.Provider>
  );
}
