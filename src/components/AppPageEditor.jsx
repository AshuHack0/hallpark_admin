import { useState, useEffect } from "react";
import { Save, ExternalLink, Loader2, Plus, Trash2, ChevronDown, Upload } from "lucide-react";
import { api, uploadMediaToCloudinary } from "../lib/api";
import { validateUrl, validateImageFile, validateVideoFile } from "../lib/validators";
import { FIELD_LIMITS, CharCount, FieldError, ArInput } from "./CappedField";
import RichTextArea from "./RichTextArea.jsx";

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15";
const labelClass = "block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 mb-2";

const DEFAULT_HERO = {
  eyebrow: "",
  title: "",
  subtitle: "",
  description: "",
  image: "",
  phoneImage: "",
  ctaLabel: "",
  ctaHref: "",
  stats: [],
  cards: [],
};

const DEFAULT_PLATFORM = {
  title: "",
  subtitle: "",
  description: "",
  appSuffix: "",
  webSuffix: "",
  appBrand: "",
  appBrandAccent: "",
  webBrand: "",
  webBrandAccent: "",
  appScreen: "",
  appButtonLabel: "",
  appButtonLink: "",
  webButtonLabel: "",
  webButtonLink: "",
  appFeatures: [],
  websiteFeatures: [],
};

const DEFAULT_SERVICE_TABS = {
  tabs: [],
  featureChips: [],
  ctaLabel: "",
  ar: { featureChips: [], ctaLabel: "" },
};

// No default copy — screenshots are DB-driven (source of truth). Editors add
// their own items; nothing renders on the site until content is entered.
const DEFAULT_SCREENSHOTS = [];

const DEFAULT_CURRENCY = {
  title: "",
  subtitle: "",
  description: "",
  image: "",
  cardFeatures: [],
  topUpLabel: "",
  topUpSteps: [],
  ar: { title: "", subtitle: "", description: "", topUpLabel: "" },
};

// No default copy — feature cards are DB-driven (source of truth).
const DEFAULT_FEATURE_CARDS = [];

const DEFAULT_HALAPARK_IN_ACTION = {
  title: "HalaPark In Action",
  subtitle: "Experience the future of parking management",
  storeLinks: [
    { icon: "/image--04.png", alt: "App Store", label: "App Store" },
    { icon: "/image 4.png", alt: "Play Store", label: "Play Store" },
  ],
};

const DEFAULT_CTA_FOOTER = {
  heading: "",
  description: "",
  stores: [],
  ar: { heading: "", description: "" },
};

function CollapsibleSection({ title, isOpen, onToggle, children }) {
  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition"
      >
        <h2 className="text-xl font-bold text-[#050A13]">{title}</h2>
        <ChevronDown className={`h-5 w-5 text-slate-500 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="border-t border-slate-200 px-6 pb-6">{children}</div>}
    </div>
  );
}

function ArrayItemEditor({ items, onItemsChange, renderItem, defaultItem, title, addButtonText = "Add Item" }) {
  const addItem = () => {
    onItemsChange([...items, defaultItem]);
  };

  const updateItem = (index, updates) => {
    const updated = [...items];
    updated[index] = { ...updated[index], ...updates };
    onItemsChange(updated);
  };

  const removeItem = (index) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">{items.length} {title.toLowerCase()}</p>
        <button
          onClick={addItem}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
        >
          <Plus className="h-3.5 w-3.5" />
          {addButtonText}
        </button>
      </div>

      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-slate-700">{title} {i + 1}</p>
            <button
              onClick={() => removeItem(i)}
              className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          {renderItem(item, i, updateItem)}
        </div>
      ))}
    </div>
  );
}

export default function AppPageEditor() {
  const [page, setPage] = useState(null);
  const [sections, setSections] = useState({
    hero: DEFAULT_HERO,
    platform: DEFAULT_PLATFORM,
    serviceTabs: DEFAULT_SERVICE_TABS,
    screenshots: DEFAULT_SCREENSHOTS,
    currency: DEFAULT_CURRENCY,
    featureCards: DEFAULT_FEATURE_CARDS,
    halapark: DEFAULT_HALAPARK_IN_ACTION,
    ctaFooter: DEFAULT_CTA_FOOTER,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState({});
  // Per-field upload errors (same keys as uploadProgress) so validation
  // problems show right next to the field they belong to, not at the page top.
  const [uploadErrors, setUploadErrors] = useState({});
  function setUploadError(key, msg) {
    setUploadErrors((p) => ({ ...p, [key]: msg }));
  }
  function clearUploadError(key) {
    setUploadErrors((p) => {
      const next = { ...p };
      delete next[key];
      return next;
    });
  }
  const [openSections, setOpenSections] = useState({ hero: true });

  useEffect(() => {
    document.title = "App — HalaPark Admin";
    setLoading(true);
    api
      .getPage("app")
      .then((data) => {
        setPage(data);
        if (data.page?.sections) {
          setSections((prev) => ({ ...prev, ...data.page.sections }));
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load page");
        console.error("Failed to load page:", err);
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    if (!page) return;
    if (!sections.hero?.title?.trim()) {
      setError("Hero Title is required — please fill it in before saving.");
      setOpenSections((prev) => ({ ...prev, hero: true }));
      return;
    }
    const plat = sections.platform || {};
    const platHasContent =
      (plat.appFeatures?.length || 0) > 0 ||
      (plat.websiteFeatures?.length || 0) > 0 ||
      !!plat.description?.trim();
    if (platHasContent && !plat.appBrand?.trim() && !plat.webBrand?.trim()) {
      setError("App Platform section needs at least an App or Website brand title.");
      setOpenSections((prev) => ({ ...prev, platform: true }));
      return;
    }
    // --- Service Tabs: validate labels, filter blank feature chips ---
    const svc = sections.serviceTabs || {};
    const svcTabs = Array.isArray(svc.tabs) ? svc.tabs : [];
    for (let i = 0; i < svcTabs.length; i++) {
      const t = svcTabs[i] || {};
      const hasContent =
        (Array.isArray(t.steps) && t.steps.some((s) => s?.trim())) ||
        !!t.screen?.trim() ||
        !!t.description?.trim();
      if (hasContent && !t.label?.trim()) {
        setError(`Service Tab ${i + 1} needs a Label before saving.`);
        setOpenSections((prev) => ({ ...prev, serviceTabs: true }));
        return;
      }
    }
    // Never persist blank ("") feature chips — the reported empty-chip bug.
    const filterChips = (arr) =>
      (Array.isArray(arr) ? arr : []).map((s) => (s ?? "").trim()).filter(Boolean);
    const cleanedSections = {
      ...sections,
      serviceTabs: {
        ...svc,
        featureChips: filterChips(svc.featureChips),
        ar: { ...(svc.ar ?? {}), featureChips: filterChips(svc.ar?.featureChips) },
      },
    };
    setSaving(true);
    setError("");
    try {
      await api.updatePage("app", {
        sections: cleanedSections,
      });
      setSuccess("App page saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save page");
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }

  const toggleSection = (sectionName) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  // "Show this section on the website" toggle. The flag lives on the section's
  // object (for array-backed sections it lives on the paired *Header object).
  // A section is hidden on the site only when enabled === false.
  function renderEnabledToggle(sectionKey) {
    const enabled = sections[sectionKey]?.enabled !== false;
    return (
      <label className="mb-4 flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) =>
            setSections((prev) => ({
              ...prev,
              [sectionKey]: { ...prev[sectionKey], enabled: e.target.checked },
            }))
          }
          className="h-4 w-4 rounded border-slate-300 accent-[#0088FF]"
        />
        Show this section on the website
      </label>
    );
  }

  async function handleImageUpload(section, field, file) {
    const key = `${section}-${field}`;
    const err = validateImageFile(file);
    if (err) { setUploadError(key, err); return; }
    clearUploadError(key);
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct }))
      );
      setSections((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: url },
      }));
      setSuccess("Image uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setUploadError(key, err.message ?? "Upload failed");
      console.error(err);
    } finally {
      setUploadProgress((p) => ({ ...p, [key]: undefined }));
    }
  }

  // Upload an image for an item inside an ArrayItemEditor list. `update`/`i` come
  // from the list's renderItem; `field` is the image key on the item (e.g. "image").
  async function handleArrayImageUpload(key, update, i, field, file) {
    const err = validateImageFile(file);
    if (err) { setUploadError(key, err); return; }
    clearUploadError(key);
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct }))
      );
      update(i, { [field]: url });
      setSuccess("Image uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setUploadError(key, err.message ?? "Upload failed");
      console.error(err);
    } finally {
      setUploadProgress((p) => ({ ...p, [key]: undefined }));
    }
  }

  // --- Hero stats helpers (spread-preserve: never drop ar/other keys) ---
  function updateHeroStat(i, updates) {
    setSections((prev) => {
      const stats = [...(prev.hero.stats || [])];
      stats[i] = { ...stats[i], ...updates };
      return { ...prev, hero: { ...prev.hero, stats } };
    });
  }
  function addHeroStat() {
    setSections((prev) => ({
      ...prev,
      hero: { ...prev.hero, stats: [...(prev.hero.stats || []), { value: "", label: "", icon: "Star" }] },
    }));
  }
  function removeHeroStat(i) {
    setSections((prev) => ({
      ...prev,
      hero: { ...prev.hero, stats: (prev.hero.stats || []).filter((_, idx) => idx !== i) },
    }));
  }

  // --- Hero floating cards helpers (spread-preserve) ---
  function updateHeroCard(i, updates) {
    setSections((prev) => {
      const cards = [...(prev.hero.cards || [])];
      cards[i] = { ...cards[i], ...updates };
      return { ...prev, hero: { ...prev.hero, cards } };
    });
  }
  function addHeroCard() {
    setSections((prev) => ({
      ...prev,
      hero: { ...prev.hero, cards: [...(prev.hero.cards || []), { icon: "ParkingCircle", title: "", subtitle: "" }] },
    }));
  }
  function removeHeroCard(i) {
    setSections((prev) => ({
      ...prev,
      hero: { ...prev.hero, cards: (prev.hero.cards || []).filter((_, idx) => idx !== i) },
    }));
  }

  // Upload an icon image for a hero stat/card row (writes item.iconImage).
  async function handleHeroItemIconUpload(kind, i, file) {
    const key = `hero-${kind}-${i}-icon`;
    const err = validateImageFile(file);
    if (err) { setUploadError(key, err); return; }
    clearUploadError(key);
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct }))
      );
      if (kind === "stat") updateHeroStat(i, { iconImage: url });
      else updateHeroCard(i, { iconImage: url });
      setSuccess("Image uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setUploadError(key, e.message ?? "Upload failed");
      console.error(e);
    } finally {
      setUploadProgress((p) => ({ ...p, [key]: undefined }));
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
    return <div className="py-6 text-red-600">Failed to load page</div>;
  }

  return (
    <div className="w-full space-y-6 px-6 py-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#050A13]">App Page Editor</h1>
          <p className="mt-2 text-sm text-slate-600">Manage all 7 app page sections</p>
        </div>
      </div>

      {/* Status Messages */}
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
        {/* 1. Hero Section */}
        <CollapsibleSection
          title="1. HeroSection"
          isOpen={openSections.hero}
          onToggle={() => toggleSection("hero")}
        >
          {renderEnabledToggle("hero")}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Eyebrow (small badge above title)</label>
              <input
                type="text"
                value={sections.hero.eyebrow ?? ""}
                onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, eyebrow: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.subtitle}
              />
              <CharCount value={sections.hero.eyebrow ?? ""} max={FIELD_LIMITS.subtitle} />
              <ArInput label="Eyebrow" kind="subtitle" value={sections.hero.ar?.eyebrow} onChange={(v) => setSections({ ...sections, hero: { ...sections.hero, ar: { ...(sections.hero.ar ?? {}), eyebrow: v } } })} />
            </div>
            <div>
              <label className={labelClass}>Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={sections.hero.title}
                onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, title: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
              />
              <CharCount value={sections.hero.title} max={FIELD_LIMITS.heading} />
              <ArInput label="Title" kind="heading" value={sections.hero.ar?.title} onChange={(v) => setSections({ ...sections, hero: { ...sections.hero, ar: { ...(sections.hero.ar ?? {}), title: v } } })} />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <input
                type="text"
                value={sections.hero.subtitle}
                onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, subtitle: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.subtitle}
              />
              <CharCount value={sections.hero.subtitle} max={FIELD_LIMITS.subtitle} />
              <ArInput label="Subtitle" kind="subtitle" value={sections.hero.ar?.subtitle} onChange={(v) => setSections({ ...sections, hero: { ...sections.hero, ar: { ...(sections.hero.ar ?? {}), subtitle: v } } })} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <RichTextArea
                value={sections.hero.description ?? ""}
                onChange={(v) => setSections({ ...sections, hero: { ...sections.hero, description: v } })}
                maxLength={FIELD_LIMITS.description}
                rows={3}
              />
              <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
              <RichTextArea
                value={sections.hero.ar?.description ?? ""}
                onChange={(v) => setSections({ ...sections, hero: { ...sections.hero, ar: { ...(sections.hero.ar ?? {}), description: v } } })}
                maxLength={FIELD_LIMITS.description}
                rows={3}
                dir="rtl"
                variant="arabic"
              />
            </div>

            {/* CTA */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>CTA Button Label</label>
                <input
                  type="text"
                  value={sections.hero.ctaLabel ?? ""}
                  onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, ctaLabel: e.target.value } })}
                  className={inputClass}
                  placeholder="Get the App"
                  maxLength={FIELD_LIMITS.button}
                />
                <CharCount value={sections.hero.ctaLabel ?? ""} max={FIELD_LIMITS.button} />
                <ArInput label="CTA Button Label" kind="button" value={sections.hero.ar?.ctaLabel} onChange={(v) => setSections({ ...sections, hero: { ...sections.hero, ar: { ...(sections.hero.ar ?? {}), ctaLabel: v } } })} />
              </div>
              <div>
                <label className={labelClass}>CTA Button Link</label>
                <input
                  type="text"
                  value={sections.hero.ctaHref ?? ""}
                  onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, ctaHref: e.target.value } })}
                  className={inputClass}
                  placeholder="https://…"
                  maxLength={FIELD_LIMITS.link}
                />
                <FieldError error={validateUrl(sections.hero.ctaHref)} />
              </div>
            </div>

            {/* Images */}
            <div>
              <label className={labelClass}>Phone Screenshot (inside the frame)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sections.hero.phoneImage ?? ""}
                  onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, phoneImage: e.target.value } })}
                  className={inputClass}
                  maxLength={FIELD_LIMITS.link}
                />
                <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                  {uploadProgress["hero-phoneImage"] !== undefined ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress["hero-phoneImage"]}%</>
                  ) : (
                    <><Upload className="h-3.5 w-3.5" />Upload</>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload("hero", "phoneImage", file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <FieldError error={validateUrl(sections.hero.phoneImage)} />
              {uploadErrors["hero-phoneImage"] ? (
                <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors["hero-phoneImage"]}</p>
              ) : null}
            </div>

            {/* Stats editor */}
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Stats ({(sections.hero.stats || []).length})</p>
                <button
                  onClick={addHeroStat}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Stat
                </button>
              </div>
              {(sections.hero.stats || []).map((stat, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-slate-700">Stat {i + 1}</p>
                    <button
                      onClick={() => removeHeroStat(i)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className={labelClass}>Value</label>
                        <input
                          type="text"
                          value={stat.value ?? ""}
                          onChange={(e) => updateHeroStat(i, { value: e.target.value })}
                          className={inputClass}
                          placeholder="10K"
                          maxLength={FIELD_LIMITS.label}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Suffix</label>
                        <input
                          type="text"
                          value={stat.suffix ?? ""}
                          onChange={(e) => updateHeroStat(i, { suffix: e.target.value })}
                          className={inputClass}
                          placeholder="+"
                          maxLength={FIELD_LIMITS.label}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Label</label>
                      <input
                        type="text"
                        value={stat.label ?? ""}
                        onChange={(e) => updateHeroStat(i, { label: e.target.value })}
                        className={inputClass}
                        maxLength={FIELD_LIMITS.label}
                      />
                      <CharCount value={stat.label ?? ""} max={FIELD_LIMITS.label} />
                      <ArInput label="Label" kind="label" value={stat.ar?.label} onChange={(v) => updateHeroStat(i, { ar: { ...(stat.ar ?? {}), label: v } })} />
                    </div>
                    <div>
                      <label className={labelClass}>Icon</label>
                      <select
                        value={stat.icon ?? "Star"}
                        onChange={(e) => updateHeroStat(i, { icon: e.target.value })}
                        className={inputClass}
                      >
                        <option value="Star">Star</option>
                        <option value="Car">Car</option>
                        <option value="Users">Users</option>
                      </select>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={!!stat.showStars}
                        onChange={(e) => updateHeroStat(i, { showStars: e.target.checked })}
                        className="h-4 w-4 rounded border-slate-300 text-[#0088FF] focus:ring-[#0088FF]/30"
                      />
                      Show ★★★★★ line
                    </label>
                    <div>
                      <label className={labelClass}>Icon Image (overrides the built-in icon)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={stat.iconImage ?? ""}
                          onChange={(e) => updateHeroStat(i, { iconImage: e.target.value })}
                          className={inputClass}
                          maxLength={FIELD_LIMITS.link}
                        />
                        <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                          {uploadProgress[`hero-stat-${i}-icon`] !== undefined ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress[`hero-stat-${i}-icon`]}%</>
                          ) : (
                            <><Upload className="h-3.5 w-3.5" />Upload</>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleHeroItemIconUpload("stat", i, file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                      <FieldError error={validateUrl(stat.iconImage)} />
                      {uploadErrors[`hero-stat-${i}-icon`] ? (
                        <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors[`hero-stat-${i}-icon`]}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating Cards editor */}
            <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Floating Cards ({(sections.hero.cards || []).length}) — only the first 3 show on the site</p>
                <button
                  onClick={addHeroCard}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Card
                </button>
              </div>
              <p className="text-[11px] text-slate-500">Note: the design has 3 slots — only the first 3 cards render on the website.</p>
              {(sections.hero.cards || []).map((card, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-slate-700">Card {i + 1}</p>
                    <button
                      onClick={() => removeHeroCard(i)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Icon</label>
                      <select
                        value={card.icon ?? "ParkingCircle"}
                        onChange={(e) => updateHeroCard(i, { icon: e.target.value })}
                        className={inputClass}
                      >
                        <option value="ParkingCircle">ParkingCircle</option>
                        <option value="Clock">Clock</option>
                        <option value="Check">Check</option>
                        <option value="MapPin">MapPin</option>
                        <option value="Car">Car</option>
                        <option value="Star">Star</option>
                        <option value="Users">Users</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Title</label>
                      <input
                        type="text"
                        value={card.title ?? ""}
                        onChange={(e) => updateHeroCard(i, { title: e.target.value })}
                        className={inputClass}
                        maxLength={FIELD_LIMITS.label}
                      />
                      <CharCount value={card.title ?? ""} max={FIELD_LIMITS.label} />
                      <ArInput label="Title" kind="label" value={card.ar?.title} onChange={(v) => updateHeroCard(i, { ar: { ...(card.ar ?? {}), title: v } })} />
                    </div>
                    <div>
                      <label className={labelClass}>Subtitle</label>
                      <input
                        type="text"
                        value={card.subtitle ?? ""}
                        onChange={(e) => updateHeroCard(i, { subtitle: e.target.value })}
                        className={inputClass}
                        maxLength={FIELD_LIMITS.subtitle}
                      />
                      <CharCount value={card.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
                      <ArInput label="Subtitle" kind="subtitle" value={card.ar?.subtitle} onChange={(v) => updateHeroCard(i, { ar: { ...(card.ar ?? {}), subtitle: v } })} />
                    </div>
                    <div className="rounded-lg border border-dashed border-slate-200 p-3">
                      <p className="mb-2 text-[11px] text-slate-500">Optional — session/payment style extras</p>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className={labelClass}>Timer</label>
                          <input
                            type="text"
                            value={card.timer ?? ""}
                            onChange={(e) => updateHeroCard(i, { timer: e.target.value })}
                            className={inputClass}
                            placeholder="02:15"
                            maxLength={FIELD_LIMITS.label}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Amount</label>
                          <input
                            type="text"
                            value={card.amount ?? ""}
                            onChange={(e) => updateHeroCard(i, { amount: e.target.value })}
                            className={inputClass}
                            placeholder="AED 12"
                            maxLength={FIELD_LIMITS.label}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Button Label</label>
                          <input
                            type="text"
                            value={card.buttonLabel ?? ""}
                            onChange={(e) => updateHeroCard(i, { buttonLabel: e.target.value })}
                            className={inputClass}
                            placeholder="Pay"
                            maxLength={FIELD_LIMITS.button}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Icon Image (overrides the built-in icon)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={card.iconImage ?? ""}
                          onChange={(e) => updateHeroCard(i, { iconImage: e.target.value })}
                          className={inputClass}
                          maxLength={FIELD_LIMITS.link}
                        />
                        <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                          {uploadProgress[`hero-card-${i}-icon`] !== undefined ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress[`hero-card-${i}-icon`]}%</>
                          ) : (
                            <><Upload className="h-3.5 w-3.5" />Upload</>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleHeroItemIconUpload("card", i, file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                      <FieldError error={validateUrl(card.iconImage)} />
                      {uploadErrors[`hero-card-${i}-icon`] ? (
                        <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors[`hero-card-${i}-icon`]}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleSection>

        {/* 2. App Platform Section */}
        <CollapsibleSection
          title="2. AppPlatformSection"
          isOpen={openSections.platform}
          onToggle={() => toggleSection("platform")}
        >
          {renderEnabledToggle("platform")}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-[#050A13]">Main Content</h3>

              {/* Brand titles — App card */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>App Card — Brand</label>
                  <input
                    type="text"
                    value={sections.platform.appBrand ?? ""}
                    onChange={(e) => setSections({ ...sections, platform: { ...sections.platform, appBrand: e.target.value } })}
                    className={inputClass}
                    placeholder="HalaPark"
                    maxLength={FIELD_LIMITS.label}
                  />
                  <CharCount value={sections.platform.appBrand ?? ""} max={FIELD_LIMITS.label} />
                  <ArInput label="App Card — Brand" kind="label" value={sections.platform.ar?.appBrand} onChange={(v) => setSections({ ...sections, platform: { ...sections.platform, ar: { ...(sections.platform.ar ?? {}), appBrand: v } } })} />
                </div>
                <div>
                  <label className={labelClass}>App Card — Brand Accent</label>
                  <input
                    type="text"
                    value={sections.platform.appBrandAccent ?? ""}
                    onChange={(e) => setSections({ ...sections, platform: { ...sections.platform, appBrandAccent: e.target.value } })}
                    className={inputClass}
                    placeholder="App"
                    maxLength={FIELD_LIMITS.label}
                  />
                  <CharCount value={sections.platform.appBrandAccent ?? ""} max={FIELD_LIMITS.label} />
                  <ArInput label="App Card — Brand Accent" kind="label" value={sections.platform.ar?.appBrandAccent} onChange={(v) => setSections({ ...sections, platform: { ...sections.platform, ar: { ...(sections.platform.ar ?? {}), appBrandAccent: v } } })} />
                </div>
              </div>

              {/* Brand titles — Website card */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Website Card — Brand</label>
                  <input
                    type="text"
                    value={sections.platform.webBrand ?? ""}
                    onChange={(e) => setSections({ ...sections, platform: { ...sections.platform, webBrand: e.target.value } })}
                    className={inputClass}
                    placeholder="HalaPark"
                    maxLength={FIELD_LIMITS.label}
                  />
                  <CharCount value={sections.platform.webBrand ?? ""} max={FIELD_LIMITS.label} />
                  <ArInput label="Website Card — Brand" kind="label" value={sections.platform.ar?.webBrand} onChange={(v) => setSections({ ...sections, platform: { ...sections.platform, ar: { ...(sections.platform.ar ?? {}), webBrand: v } } })} />
                </div>
                <div>
                  <label className={labelClass}>Website Card — Brand Accent</label>
                  <input
                    type="text"
                    value={sections.platform.webBrandAccent ?? ""}
                    onChange={(e) => setSections({ ...sections, platform: { ...sections.platform, webBrandAccent: e.target.value } })}
                    className={inputClass}
                    placeholder="Website"
                    maxLength={FIELD_LIMITS.label}
                  />
                  <CharCount value={sections.platform.webBrandAccent ?? ""} max={FIELD_LIMITS.label} />
                  <ArInput label="Website Card — Brand Accent" kind="label" value={sections.platform.ar?.webBrandAccent} onChange={(v) => setSections({ ...sections, platform: { ...sections.platform, ar: { ...(sections.platform.ar ?? {}), webBrandAccent: v } } })} />
                </div>
              </div>
              <p className="text-xs text-slate-500">Renders as &quot;Brand Accent&quot; e.g. HalaPark App</p>

              {/* Legacy heading suffixes (kept for backward compatibility) */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>App Heading (legacy)</label>
                  <input
                    type="text"
                    value={sections.platform.appSuffix ?? ""}
                    onChange={(e) => setSections({ ...sections, platform: { ...sections.platform, appSuffix: e.target.value } })}
                    className={inputClass}
                    placeholder="Online App"
                    maxLength={FIELD_LIMITS.label}
                  />
                  <CharCount value={sections.platform.appSuffix ?? ""} max={FIELD_LIMITS.label} />
                  <p className="text-xs text-slate-400 mt-1">Legacy — use App Card Brand / Brand Accent above instead.</p>
                  <ArInput label="App Heading" kind="label" value={sections.platform.ar?.appSuffix} onChange={(v) => setSections({ ...sections, platform: { ...sections.platform, ar: { ...(sections.platform.ar ?? {}), appSuffix: v } } })} />
                </div>
                <div>
                  <label className={labelClass}>Website Heading (legacy)</label>
                  <input
                    type="text"
                    value={sections.platform.webSuffix ?? ""}
                    onChange={(e) => setSections({ ...sections, platform: { ...sections.platform, webSuffix: e.target.value } })}
                    className={inputClass}
                    placeholder="Online Website"
                    maxLength={FIELD_LIMITS.label}
                  />
                  <CharCount value={sections.platform.webSuffix ?? ""} max={FIELD_LIMITS.label} />
                  <p className="text-xs text-slate-400 mt-1">Legacy — use Website Card Brand / Brand Accent above instead.</p>
                  <ArInput label="Website Heading" kind="label" value={sections.platform.ar?.webSuffix} onChange={(v) => setSections({ ...sections, platform: { ...sections.platform, ar: { ...(sections.platform.ar ?? {}), webSuffix: v } } })} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Title</label>
                <input
                  type="text"
                  value={sections.platform.title}
                  onChange={(e) => setSections({ ...sections, platform: { ...sections.platform, title: e.target.value } })}
                  className={inputClass}
                  maxLength={FIELD_LIMITS.heading}
                />
                <CharCount value={sections.platform.title} max={FIELD_LIMITS.heading} />
                <ArInput label="Title" kind="heading" value={sections.platform.ar?.title} onChange={(v) => setSections({ ...sections, platform: { ...sections.platform, ar: { ...(sections.platform.ar ?? {}), title: v } } })} />
              </div>
              <div>
                <label className={labelClass}>Subtitle</label>
                <input
                  type="text"
                  value={sections.platform.subtitle}
                  onChange={(e) => setSections({ ...sections, platform: { ...sections.platform, subtitle: e.target.value } })}
                  className={inputClass}
                  maxLength={FIELD_LIMITS.subtitle}
                />
                <CharCount value={sections.platform.subtitle} max={FIELD_LIMITS.subtitle} />
                <ArInput label="Subtitle" kind="subtitle" value={sections.platform.ar?.subtitle} onChange={(v) => setSections({ ...sections, platform: { ...sections.platform, ar: { ...(sections.platform.ar ?? {}), subtitle: v } } })} />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <RichTextArea
                  value={sections.platform.description ?? ""}
                  onChange={(v) => setSections({ ...sections, platform: { ...sections.platform, description: v } })}
                  maxLength={FIELD_LIMITS.description}
                  rows={3}
                />
                <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
                <RichTextArea
                  value={sections.platform.ar?.description ?? ""}
                  onChange={(v) => setSections({ ...sections, platform: { ...sections.platform, ar: { ...(sections.platform.ar ?? {}), description: v } } })}
                  maxLength={FIELD_LIMITS.description}
                  rows={3}
                  dir="rtl"
                  variant="arabic"
                />
              </div>

              {/* Phone screenshot */}
              <div>
                <label className={labelClass}>App Phone Screenshot</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sections.platform.appScreen ?? ""}
                    onChange={(e) => setSections({ ...sections, platform: { ...sections.platform, appScreen: e.target.value } })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.link}
                  />
                  <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                    {uploadProgress["platform-appScreen"] !== undefined ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress["platform-appScreen"]}%</>
                    ) : (
                      <><Upload className="h-3.5 w-3.5" />Upload</>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload("platform", "appScreen", file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                <FieldError error={validateUrl(sections.platform.appScreen)} />
                {uploadErrors["platform-appScreen"] ? (
                  <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors["platform-appScreen"]}</p>
                ) : null}
              </div>

              {/* App card button */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>App Button Label</label>
                  <input
                    type="text"
                    value={sections.platform.appButtonLabel ?? ""}
                    onChange={(e) => setSections({ ...sections, platform: { ...sections.platform, appButtonLabel: e.target.value } })}
                    className={inputClass}
                    placeholder="Get the App"
                    maxLength={FIELD_LIMITS.button}
                  />
                  <CharCount value={sections.platform.appButtonLabel ?? ""} max={FIELD_LIMITS.button} />
                  <ArInput label="App Button Label" kind="button" value={sections.platform.ar?.appButtonLabel} onChange={(v) => setSections({ ...sections, platform: { ...sections.platform, ar: { ...(sections.platform.ar ?? {}), appButtonLabel: v } } })} />
                </div>
                <div>
                  <label className={labelClass}>App Button Link</label>
                  <input
                    type="text"
                    value={sections.platform.appButtonLink ?? ""}
                    onChange={(e) => setSections({ ...sections, platform: { ...sections.platform, appButtonLink: e.target.value } })}
                    className={inputClass}
                    placeholder="https://…"
                    maxLength={FIELD_LIMITS.link}
                  />
                  <FieldError error={validateUrl(sections.platform.appButtonLink)} />
                </div>
              </div>

              {/* Website card button */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Website Button Label</label>
                  <input
                    type="text"
                    value={sections.platform.webButtonLabel ?? ""}
                    onChange={(e) => setSections({ ...sections, platform: { ...sections.platform, webButtonLabel: e.target.value } })}
                    className={inputClass}
                    placeholder="Visit Website"
                    maxLength={FIELD_LIMITS.button}
                  />
                  <CharCount value={sections.platform.webButtonLabel ?? ""} max={FIELD_LIMITS.button} />
                  <ArInput label="Website Button Label" kind="button" value={sections.platform.ar?.webButtonLabel} onChange={(v) => setSections({ ...sections, platform: { ...sections.platform, ar: { ...(sections.platform.ar ?? {}), webButtonLabel: v } } })} />
                </div>
                <div>
                  <label className={labelClass}>Website Button Link</label>
                  <input
                    type="text"
                    value={sections.platform.webButtonLink ?? ""}
                    onChange={(e) => setSections({ ...sections, platform: { ...sections.platform, webButtonLink: e.target.value } })}
                    className={inputClass}
                    placeholder="https://…"
                    maxLength={FIELD_LIMITS.link}
                  />
                  <FieldError error={validateUrl(sections.platform.webButtonLink)} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#050A13] mb-4">App Features</h3>
              <ArrayItemEditor
                items={sections.platform.appFeatures || []}
                onItemsChange={(items) => setSections({ ...sections, platform: { ...sections.platform, appFeatures: items } })}
                title="App Feature"
                addButtonText="Add Feature"
                defaultItem={{ title: "New Feature", description: "" }}
                renderItem={(item, i, update) => (
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Title</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => update(i, { title: e.target.value })}
                        className={inputClass}
                        maxLength={FIELD_LIMITS.label}
                      />
                      <CharCount value={item.title} max={FIELD_LIMITS.label} />
                      <ArInput label="Title" kind="label" value={item.ar?.title} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), title: v } })} />
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      {/* Rich text: Bold / Italic / Color toolbar. Stored as safe markup. */}
                      <RichTextArea
                        value={item.description ?? ""}
                        onChange={(v) => update(i, { description: v })}
                        maxLength={FIELD_LIMITS.summary}
                        rows={3}
                      />
                      <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
                      <RichTextArea
                        value={item.ar?.description ?? ""}
                        onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), description: v } })}
                        maxLength={FIELD_LIMITS.summary}
                        rows={3}
                        dir="rtl"
                        variant="arabic"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Icon Image (optional — overrides the built-in icon)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.iconImage ?? ""}
                          onChange={(e) => update(i, { iconImage: e.target.value })}
                          className={inputClass}
                          maxLength={FIELD_LIMITS.link}
                        />
                        <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                          {uploadProgress[`platform-appfeat-${i}-icon`] !== undefined ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress[`platform-appfeat-${i}-icon`]}%</>
                          ) : (
                            <><Upload className="h-3.5 w-3.5" />Upload</>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleArrayImageUpload(`platform-appfeat-${i}-icon`, update, i, "iconImage", file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                      <FieldError error={validateUrl(item.iconImage)} />
                      {uploadErrors[`platform-appfeat-${i}-icon`] ? (
                        <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors[`platform-appfeat-${i}-icon`]}</p>
                      ) : null}
                    </div>
                  </div>
                )}
              />
            </div>

            <div>
              <h3 className="font-semibold text-[#050A13] mb-4">Website Features</h3>
              <ArrayItemEditor
                items={sections.platform.websiteFeatures || []}
                onItemsChange={(items) => setSections({ ...sections, platform: { ...sections.platform, websiteFeatures: items } })}
                title="Website Feature"
                addButtonText="Add Feature"
                defaultItem={{ title: "New Feature", description: "" }}
                renderItem={(item, i, update) => (
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Title</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => update(i, { title: e.target.value })}
                        className={inputClass}
                        maxLength={FIELD_LIMITS.label}
                      />
                      <CharCount value={item.title} max={FIELD_LIMITS.label} />
                      <ArInput label="Title" kind="label" value={item.ar?.title} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), title: v } })} />
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      {/* Rich text: Bold / Italic / Color toolbar. Stored as safe markup. */}
                      <RichTextArea
                        value={item.description ?? ""}
                        onChange={(v) => update(i, { description: v })}
                        maxLength={FIELD_LIMITS.summary}
                        rows={3}
                      />
                      <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
                      <RichTextArea
                        value={item.ar?.description ?? ""}
                        onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), description: v } })}
                        maxLength={FIELD_LIMITS.summary}
                        rows={3}
                        dir="rtl"
                        variant="arabic"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Icon Image (optional — overrides the built-in icon)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.iconImage ?? ""}
                          onChange={(e) => update(i, { iconImage: e.target.value })}
                          className={inputClass}
                          maxLength={FIELD_LIMITS.link}
                        />
                        <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                          {uploadProgress[`platform-webfeat-${i}-icon`] !== undefined ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress[`platform-webfeat-${i}-icon`]}%</>
                          ) : (
                            <><Upload className="h-3.5 w-3.5" />Upload</>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleArrayImageUpload(`platform-webfeat-${i}-icon`, update, i, "iconImage", file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                      <FieldError error={validateUrl(item.iconImage)} />
                      {uploadErrors[`platform-webfeat-${i}-icon`] ? (
                        <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors[`platform-webfeat-${i}-icon`]}</p>
                      ) : null}
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* 3. Service Tabs */}
        <CollapsibleSection
          title="3. AppServiceTabs"
          isOpen={openSections.serviceTabs}
          onToggle={() => toggleSection("serviceTabs")}
        >
          {renderEnabledToggle("serviceTabs")}
          <ArrayItemEditor
            items={sections.serviceTabs?.tabs || []}
            onItemsChange={(items) => setSections({ ...sections, serviceTabs: { ...sections.serviceTabs, tabs: items } })}
            title="Service Tab"
            addButtonText="Add Tab"
            defaultItem={{
              key: "",
              label: "",
              description: "",
              builtFor: "",
              cardKicker: "",
              cta: "",
              steps: [],
              screen: "",
              iconImage: "",
            }}
            renderItem={(item, i, update) => (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Key (unique ID)</label>
                  <input
                    type="text"
                    value={item.key}
                    onChange={(e) => update(i, { key: e.target.value })}
                    className={inputClass}
                    placeholder="e.g., public"
                    maxLength={FIELD_LIMITS.label}
                  />
                  <CharCount value={item.key} max={FIELD_LIMITS.label} />
                </div>
                <div>
                  <label className={labelClass}>Label (display name)</label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => update(i, { label: e.target.value })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.label}
                  />
                  <CharCount value={item.label} max={FIELD_LIMITS.label} />
                  <ArInput label="Label" kind="label" value={item.ar?.label} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), label: v } })} />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <RichTextArea
                    value={item.description ?? ""}
                    onChange={(v) => update(i, { description: v })}
                    maxLength={FIELD_LIMITS.description}
                    rows={3}
                  />
                  <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
                  <RichTextArea
                    value={item.ar?.description ?? ""}
                    onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), description: v } })}
                    maxLength={FIELD_LIMITS.description}
                    rows={3}
                    dir="rtl"
                    variant="arabic"
                  />
                </div>
                <div>
                  <label className={labelClass}>Steps (comma-separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(item.steps) ? item.steps.join(", ") : ""}
                    onChange={(e) => update(i, { steps: e.target.value.split(",").map((s) => s.trim()) })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.subtitle}
                  />
                  <CharCount value={Array.isArray(item.steps) ? item.steps.join(", ") : ""} max={FIELD_LIMITS.subtitle} />
                  <label className={labelClass} style={{ marginTop: 6 }}>Steps — Arabic (comma-separated, same order)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={Array.isArray(item.ar?.steps) ? item.ar.steps.join("، ") : ""}
                    onChange={(e) => update(i, { ar: { ...(item.ar ?? {}), steps: e.target.value.split(/،|,/).map((s) => s.trim()) } })}
                    className={inputClass}
                    style={{ borderColor: "#16a34a" }}
                    maxLength={FIELD_LIMITS.subtitle}
                    placeholder="بحث، حجز، دفع"
                  />
                </div>
                <div>
                  <label className={labelClass}>Card Kicker (small badge)</label>
                  <input
                    type="text"
                    value={item.cardKicker ?? ""}
                    onChange={(e) => update(i, { cardKicker: e.target.value })}
                    className={inputClass}
                    placeholder="Live inventory"
                    maxLength={FIELD_LIMITS.label}
                  />
                  <CharCount value={item.cardKicker ?? ""} max={FIELD_LIMITS.label} />
                  <ArInput label="Card Kicker" kind="label" value={item.ar?.cardKicker} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), cardKicker: v } })} />
                </div>
                <div>
                  <label className={labelClass}>Pill CTA (small outlined button)</label>
                  <input
                    type="text"
                    value={item.cta ?? ""}
                    onChange={(e) => update(i, { cta: e.target.value })}
                    className={inputClass}
                    placeholder="Start parking now"
                    maxLength={FIELD_LIMITS.button}
                  />
                  <CharCount value={item.cta ?? ""} max={FIELD_LIMITS.button} />
                  <ArInput label="Cta" kind="button" value={item.ar?.cta} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), cta: v } })} />
                </div>
                <div>
                  <label className={labelClass}>&quot;Built for&quot; sentence (under the title)</label>
                  <textarea
                    value={item.builtFor ?? ""}
                    onChange={(e) => update(i, { builtFor: e.target.value })}
                    className={inputClass}
                    rows={4}
                    placeholder="City Access Pass is built for fast entry, helping users move from Search to Pay with fewer taps."
                  />
                  <ArInput label="Built For" kind="description" limit={100000} multiline value={item.ar?.builtFor} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), builtFor: v } })} />
                </div>
                <div>
                  <label className={labelClass}>Phone Screen Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.screen ?? ""}
                      onChange={(e) => update(i, { screen: e.target.value })}
                      className={inputClass}
                      placeholder="https://… or /screen.png"
                      maxLength={FIELD_LIMITS.link}
                    />
                    <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                      {uploadProgress[`svc-tab-${i}-screen`] !== undefined ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress[`svc-tab-${i}-screen`]}%</>
                      ) : (
                        <><Upload className="h-3.5 w-3.5" />Upload</>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleArrayImageUpload(`svc-tab-${i}-screen`, update, i, "screen", file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  <FieldError error={validateUrl(item.screen)} />
                  {uploadErrors[`svc-tab-${i}-screen`] ? (
                    <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors[`svc-tab-${i}-screen`]}</p>
                  ) : null}
                </div>
                <div>
                  <label className={labelClass}>Tab Icon (optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.iconImage ?? ""}
                      onChange={(e) => update(i, { iconImage: e.target.value })}
                      className={inputClass}
                      placeholder="https://… or /icon.png"
                      maxLength={FIELD_LIMITS.link}
                    />
                    <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                      {uploadProgress[`svc-tab-${i}-icon`] !== undefined ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress[`svc-tab-${i}-icon`]}%</>
                      ) : (
                        <><Upload className="h-3.5 w-3.5" />Upload</>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleArrayImageUpload(`svc-tab-${i}-icon`, update, i, "iconImage", file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  <FieldError error={validateUrl(item.iconImage)} />
                  {uploadErrors[`svc-tab-${i}-icon`] ? (
                    <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors[`svc-tab-${i}-icon`]}</p>
                  ) : null}
                </div>
              </div>
            )}
          />
          {/* Section-level: feature chips + main CTA button */}
          <div className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Shared (all tabs)</p>
            <div>
              <label className={labelClass}>Feature Chips (comma-separated)</label>
              <input
                type="text"
                value={Array.isArray(sections.serviceTabs?.featureChips) ? sections.serviceTabs.featureChips.join(", ") : ""}
                onChange={(e) => setSections({ ...sections, serviceTabs: { ...sections.serviceTabs, featureChips: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } })}
                className={inputClass}
                placeholder="Real-time updates, Seamless checkout, Mobile-first flow"
                maxLength={FIELD_LIMITS.subtitle}
              />
              <label className={labelClass} style={{ marginTop: 6 }}>Feature Chips — Arabic (comma-separated)</label>
              <input
                type="text"
                dir="rtl"
                value={Array.isArray(sections.serviceTabs?.ar?.featureChips) ? sections.serviceTabs.ar.featureChips.join("، ") : ""}
                onChange={(e) => setSections({ ...sections, serviceTabs: { ...sections.serviceTabs, ar: { ...(sections.serviceTabs?.ar ?? {}), featureChips: e.target.value.split(/،|,/).map((s) => s.trim()).filter(Boolean) } } })}
                className={inputClass}
                style={{ borderColor: "#16a34a" }}
                maxLength={FIELD_LIMITS.subtitle}
              />
              <p className="mt-1 text-[11px] text-slate-400">Empty chips are ignored.</p>
            </div>
            <div>
              <label className={labelClass}>Main CTA Button</label>
              <input
                type="text"
                value={sections.serviceTabs?.ctaLabel ?? ""}
                onChange={(e) => setSections({ ...sections, serviceTabs: { ...sections.serviceTabs, ctaLabel: e.target.value } })}
                className={inputClass}
                placeholder="Find My Parking"
                maxLength={FIELD_LIMITS.button}
              />
              <CharCount value={sections.serviceTabs?.ctaLabel ?? ""} max={FIELD_LIMITS.button} />
              <ArInput label="CTA Label" kind="button" value={sections.serviceTabs?.ar?.ctaLabel} onChange={(v) => setSections({ ...sections, serviceTabs: { ...sections.serviceTabs, ar: { ...(sections.serviceTabs?.ar ?? {}), ctaLabel: v } } })} />
            </div>
          </div>
        </CollapsibleSection>

        {/* 4. Screenshots */}
        <CollapsibleSection
          title="4. AppScreenshots"
          isOpen={openSections.screenshots}
          onToggle={() => toggleSection("screenshots")}
        >
          {renderEnabledToggle("screenshotsHeader")}
          <div className="mb-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Section Header</p>
            <div>
              <label className={labelClass}>Eyebrow (small badge)</label>
              <input
                type="text"
                value={sections.screenshotsHeader?.eyebrow ?? ""}
                onChange={(e) => setSections({ ...sections, screenshotsHeader: { ...sections.screenshotsHeader, eyebrow: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.subtitle}
                placeholder="Built for a cleaner parking flow"
              />
              <CharCount value={sections.screenshotsHeader?.eyebrow ?? ""} max={FIELD_LIMITS.subtitle} />
              <ArInput label="Eyebrow" kind="subtitle" value={sections.screenshotsHeader?.ar?.eyebrow} onChange={(v) => setSections({ ...sections, screenshotsHeader: { ...sections.screenshotsHeader, ar: { ...(sections.screenshotsHeader?.ar ?? {}), eyebrow: v } } })} />
            </div>
            <div>
              <label className={labelClass}>Heading (first line)</label>
              <input
                type="text"
                value={sections.screenshotsHeader?.heading ?? ""}
                onChange={(e) => setSections({ ...sections, screenshotsHeader: { ...sections.screenshotsHeader, heading: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
                placeholder="Parking made simple."
              />
              <CharCount value={sections.screenshotsHeader?.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={sections.screenshotsHeader?.ar?.heading} onChange={(v) => setSections({ ...sections, screenshotsHeader: { ...sections.screenshotsHeader, ar: { ...(sections.screenshotsHeader?.ar ?? {}), heading: v } } })} />
            </div>
            <div>
              <label className={labelClass}>Heading Accent (second line, blue)</label>
              <input
                type="text"
                value={sections.screenshotsHeader?.headingAccent ?? ""}
                onChange={(e) => setSections({ ...sections, screenshotsHeader: { ...sections.screenshotsHeader, headingAccent: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
                placeholder="From start to finish."
              />
              <CharCount value={sections.screenshotsHeader?.headingAccent ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading Accent" kind="heading" value={sections.screenshotsHeader?.ar?.headingAccent} onChange={(v) => setSections({ ...sections, screenshotsHeader: { ...sections.screenshotsHeader, ar: { ...(sections.screenshotsHeader?.ar ?? {}), headingAccent: v } } })} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <RichTextArea
                value={sections.screenshotsHeader?.description ?? ""}
                onChange={(v) => setSections({ ...sections, screenshotsHeader: { ...sections.screenshotsHeader, description: v } })}
                maxLength={FIELD_LIMITS.description}
                rows={3}
                placeholder="Find your spot, book in seconds, pay securely…"
              />
              <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
              <RichTextArea
                value={sections.screenshotsHeader?.ar?.description ?? ""}
                onChange={(v) => setSections({ ...sections, screenshotsHeader: { ...sections.screenshotsHeader, ar: { ...(sections.screenshotsHeader?.ar ?? {}), description: v } } })}
                maxLength={FIELD_LIMITS.description}
                rows={3}
                dir="rtl"
                variant="arabic"
              />
            </div>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Process Steps (Find → Explore → Book → Pay → Confirm)</p>
              <ArrayItemEditor
                items={sections.screenshotsHeader?.processSteps || []}
                onItemsChange={(items) => setSections({ ...sections, screenshotsHeader: { ...sections.screenshotsHeader, processSteps: items } })}
                title="Step"
                addButtonText="Add Step"
                defaultItem={{ title: "", text: "", iconImage: "" }}
                renderItem={(item, i, update) => (
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>Title</label>
                      <input
                        type="text"
                        value={item.title ?? ""}
                        onChange={(e) => update(i, { title: e.target.value })}
                        className={inputClass}
                        maxLength={FIELD_LIMITS.label}
                      />
                      <CharCount value={item.title ?? ""} max={FIELD_LIMITS.label} />
                      <ArInput label="Title" kind="label" value={item.ar?.title} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), title: v } })} />
                    </div>
                    <div>
                      <label className={labelClass}>Text (description)</label>
                      <textarea
                        value={item.text ?? ""}
                        onChange={(e) => update(i, { text: e.target.value })}
                        className={inputClass}
                        rows={2}
                      />
                      <ArInput label="Text" kind="subtitle" value={item.ar?.text} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), text: v } })} multiline={true} />
                    </div>
                    <div>
                      <label className={labelClass}>Icon Image (optional)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.iconImage ?? ""}
                          onChange={(e) => update(i, { iconImage: e.target.value })}
                          className={inputClass}
                          maxLength={FIELD_LIMITS.link}
                        />
                        <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                          {uploadProgress[`scr-step-${i}-icon`] !== undefined ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress[`scr-step-${i}-icon`]}%</>
                          ) : (
                            <><Upload className="h-3.5 w-3.5" />Upload</>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleArrayImageUpload(`scr-step-${i}-icon`, update, i, "iconImage", file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                      <CharCount value={item.iconImage ?? ""} max={FIELD_LIMITS.link} />
                      <FieldError error={validateUrl(item.iconImage)} />
                      {uploadErrors[`scr-step-${i}-icon`] ? (
                        <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors[`scr-step-${i}-icon`]}</p>
                      ) : null}
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
          <ArrayItemEditor
            items={sections.screenshots || []}
            onItemsChange={(items) => setSections({ ...sections, screenshots: items })}
            title="Screenshot"
            addButtonText="Add Screenshot"
            defaultItem={{ title: "", description: "", image: "" }}
            renderItem={(item, i, update) => (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    type="text"
                    value={item.title ?? ""}
                    onChange={(e) => update(i, { title: e.target.value })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.heading}
                  />
                  <CharCount value={item.title ?? ""} max={FIELD_LIMITS.heading} />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <RichTextArea
                    value={item.description ?? ""}
                    onChange={(v) => update(i, { description: v })}
                    maxLength={FIELD_LIMITS.description}
                    rows={2}
                  />
                </div>
                <div>
                  <label className={labelClass}>Screenshot Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.image ?? ""}
                      onChange={(e) => update(i, { image: e.target.value })}
                      className={inputClass}
                      maxLength={FIELD_LIMITS.link}
                    />
                    <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                      {uploadProgress[`screenshot-${i}-image`] !== undefined ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress[`screenshot-${i}-image`]}%</>
                      ) : (
                        <><Upload className="h-3.5 w-3.5" />Upload</>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleArrayImageUpload(`screenshot-${i}-image`, update, i, "image", file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  <CharCount value={item.image ?? ""} max={FIELD_LIMITS.link} />
                  <FieldError error={validateUrl(item.image)} />
                  {uploadErrors[`screenshot-${i}-image`] ? (
                    <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors[`screenshot-${i}-image`]}</p>
                  ) : null}
                </div>
              </div>
            )}
          />
        </CollapsibleSection>

        {/* 5. Currency Section */}
        <CollapsibleSection
          title="5. AppCurrencySection"
          isOpen={openSections.currency}
          onToggle={() => toggleSection("currency")}
        >
          {renderEnabledToggle("currency")}
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Title</label>
                <input
                  type="text"
                  value={sections.currency?.title}
                  onChange={(e) => setSections({ ...sections, currency: { ...sections.currency, title: e.target.value } })}
                  className={inputClass}
                  maxLength={FIELD_LIMITS.heading}
                />
                <CharCount value={sections.currency?.title} max={FIELD_LIMITS.heading} />
                <ArInput label="Title" kind="heading" value={sections.currency?.ar?.title} onChange={(v) => setSections({ ...sections, currency: { ...sections.currency, ar: { ...(sections.currency?.ar ?? {}), title: v } } })} />
              </div>
              <div>
                <label className={labelClass}>Subtitle</label>
                <input
                  type="text"
                  value={sections.currency?.subtitle}
                  onChange={(e) => setSections({ ...sections, currency: { ...sections.currency, subtitle: e.target.value } })}
                  className={inputClass}
                  maxLength={FIELD_LIMITS.subtitle}
                />
                <CharCount value={sections.currency?.subtitle} max={FIELD_LIMITS.subtitle} />
                <ArInput label="Subtitle" kind="subtitle" value={sections.currency?.ar?.subtitle} onChange={(v) => setSections({ ...sections, currency: { ...sections.currency, ar: { ...(sections.currency?.ar ?? {}), subtitle: v } } })} />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                {/* Rich text: Bold / Italic / Color toolbar. Stored as safe markup. */}
                <RichTextArea
                  value={sections.currency?.description ?? ""}
                  onChange={(v) => setSections({ ...sections, currency: { ...sections.currency, description: v } })}
                  maxLength={FIELD_LIMITS.description}
                  rows={4}
                  placeholder="Section description shown on the website"
                />
                <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
                <RichTextArea
                  value={sections.currency?.ar?.description ?? ""}
                  onChange={(v) => setSections({ ...sections, currency: { ...sections.currency, ar: { ...(sections.currency?.ar ?? {}), description: v } } })}
                  maxLength={FIELD_LIMITS.description}
                  rows={3}
                  dir="rtl"
                  variant="arabic"
                />
              </div>
              <div>
                <label className={labelClass}>Section Image (phone screen)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sections.currency?.image ?? ""}
                    onChange={(e) => setSections({ ...sections, currency: { ...sections.currency, image: e.target.value } })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.link}
                  />
                  <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                    {uploadProgress["currency-image"] !== undefined ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress["currency-image"]}%</>
                    ) : (
                      <><Upload className="h-3.5 w-3.5" />Upload</>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload("currency", "image", file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                <FieldError error={validateUrl(sections.currency?.image)} />
                {uploadErrors["currency-image"] ? (
                  <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors["currency-image"]}</p>
                ) : null}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#050A13] mb-4">Quick Features</h3>
              <ArrayItemEditor
                items={sections.currency?.cardFeatures || []}
                onItemsChange={(items) => setSections({ ...sections, currency: { ...sections.currency, cardFeatures: items } })}
                title="Feature"
                addButtonText="Add Feature"
                defaultItem={{ title: "", subtitle: "", icon: "WalletCards" }}
                renderItem={(item, i, update) => (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Title</label>
                        <input
                          type="text"
                          value={item.title ?? ""}
                          onChange={(e) => update(i, { title: e.target.value })}
                          className={inputClass}
                          maxLength={FIELD_LIMITS.label}
                        />
                        <CharCount value={item.title} max={FIELD_LIMITS.label} />
                        <ArInput label="Title" kind="label" value={item.ar?.title} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), title: v } })} />
                      </div>
                      <div>
                        <label className={labelClass}>Subtitle</label>
                        <input
                          type="text"
                          value={item.subtitle ?? ""}
                          onChange={(e) => update(i, { subtitle: e.target.value })}
                          className={inputClass}
                          maxLength={FIELD_LIMITS.label}
                        />
                        <CharCount value={item.subtitle} max={FIELD_LIMITS.label} />
                        <ArInput label="Subtitle" kind="label" value={item.ar?.subtitle} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), subtitle: v } })} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Icon</label>
                      <select
                        value={item.icon ?? "WalletCards"}
                        onChange={(e) => update(i, { icon: e.target.value })}
                        className={inputClass}
                      >
                        <option value="WalletCards">WalletCards</option>
                        <option value="ParkingCircle">ParkingCircle</option>
                        <option value="MapPinned">MapPinned</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Icon Image (optional — overrides the built-in icon)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.iconImage ?? ""}
                          onChange={(e) => update(i, { iconImage: e.target.value })}
                          className={inputClass}
                          maxLength={FIELD_LIMITS.link}
                        />
                        <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                          {uploadProgress[`currency-card-${i}-icon`] !== undefined ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress[`currency-card-${i}-icon`]}%</>
                          ) : (
                            <><Upload className="h-3.5 w-3.5" />Upload</>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleArrayImageUpload(`currency-card-${i}-icon`, update, i, "iconImage", file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                      <FieldError error={validateUrl(item.iconImage)} />
                      {uploadErrors[`currency-card-${i}-icon`] ? (
                        <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors[`currency-card-${i}-icon`]}</p>
                      ) : null}
                    </div>
                  </div>
                )}
              />
            </div>

            <div>
              <label className={labelClass}>Top Up Button Label</label>
              <input
                type="text"
                value={sections.currency?.topUpLabel ?? ""}
                onChange={(e) => setSections({ ...sections, currency: { ...sections.currency, topUpLabel: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={sections.currency?.topUpLabel} max={FIELD_LIMITS.label} />
              <ArInput label="Top Up Button Label" kind="label" value={sections.currency?.ar?.topUpLabel} onChange={(v) => setSections({ ...sections, currency: { ...sections.currency, ar: { ...(sections.currency?.ar ?? {}), topUpLabel: v } } })} />
            </div>

            <div>
              <h3 className="font-semibold text-[#050A13] mb-1">Top Up Steps</h3>
              <p className="mb-4 text-xs text-slate-500">Shown in the &quot;How to top up&quot; popup.</p>
              <ArrayItemEditor
                items={sections.currency?.topUpSteps || []}
                onItemsChange={(items) => setSections({ ...sections, currency: { ...sections.currency, topUpSteps: items } })}
                title="Step"
                addButtonText="Add Step"
                defaultItem={{ title: "", description: "" }}
                renderItem={(item, i, update) => (
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Title</label>
                      <input
                        type="text"
                        value={item.title ?? ""}
                        onChange={(e) => update(i, { title: e.target.value })}
                        className={inputClass}
                        maxLength={FIELD_LIMITS.label}
                      />
                      <CharCount value={item.title} max={FIELD_LIMITS.label} />
                      <ArInput label="Title" kind="label" value={item.ar?.title} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), title: v } })} />
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      <RichTextArea
                        value={item.description ?? ""}
                        onChange={(v) => update(i, { description: v })}
                        maxLength={FIELD_LIMITS.description}
                        rows={3}
                      />
                      <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
                      <RichTextArea
                        value={item.ar?.description ?? ""}
                        onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), description: v } })}
                        maxLength={FIELD_LIMITS.description}
                        rows={3}
                        dir="rtl"
                        variant="arabic"
                      />
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* 6. Feature Cards Section */}
        <CollapsibleSection
          title="6. AppFeatureCardsSection"
          isOpen={openSections.featureCards}
          onToggle={() => toggleSection("featureCards")}
        >
          {renderEnabledToggle("featureCardsHeader")}
          <div className="mb-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Section Header</p>
            <div>
              <label className={labelClass}>Heading (first part)</label>
              <input
                type="text"
                value={sections.featureCardsHeader?.heading ?? ""}
                onChange={(e) => setSections({ ...sections, featureCardsHeader: { ...sections.featureCardsHeader, heading: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
                placeholder="Parking Made"
              />
              <CharCount value={sections.featureCardsHeader?.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={sections.featureCardsHeader?.ar?.heading} onChange={(v) => setSections({ ...sections, featureCardsHeader: { ...sections.featureCardsHeader, ar: { ...(sections.featureCardsHeader?.ar ?? {}), heading: v } } })} />
            </div>
            <div>
              <label className={labelClass}>Heading Accent (blue part)</label>
              <input
                type="text"
                value={sections.featureCardsHeader?.headingAccent ?? ""}
                onChange={(e) => setSections({ ...sections, featureCardsHeader: { ...sections.featureCardsHeader, headingAccent: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
                placeholder="Simple, Smart & Reliable"
              />
              <CharCount value={sections.featureCardsHeader?.headingAccent ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading Accent" kind="heading" value={sections.featureCardsHeader?.ar?.headingAccent} onChange={(v) => setSections({ ...sections, featureCardsHeader: { ...sections.featureCardsHeader, ar: { ...(sections.featureCardsHeader?.ar ?? {}), headingAccent: v } } })} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              {/* Rich text: Bold / Italic / Color toolbar. Stored as safe markup. */}
              <RichTextArea
                value={sections.featureCardsHeader?.description ?? ""}
                onChange={(v) => setSections({ ...sections, featureCardsHeader: { ...sections.featureCardsHeader, description: v } })}
                maxLength={FIELD_LIMITS.description}
                rows={3}
                placeholder="Powerful features designed to save you time, money, and effort."
              />
              <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
              <RichTextArea
                value={sections.featureCardsHeader?.ar?.description ?? ""}
                onChange={(v) => setSections({ ...sections, featureCardsHeader: { ...sections.featureCardsHeader, ar: { ...(sections.featureCardsHeader?.ar ?? {}), description: v } } })}
                maxLength={FIELD_LIMITS.description}
                rows={3}
                dir="rtl"
                variant="arabic"
              />
            </div>
          </div>
          <ArrayItemEditor
            items={sections.featureCards || []}
            onItemsChange={(items) => setSections({ ...sections, featureCards: items })}
            title="Feature Card"
            addButtonText="Add Card"
            defaultItem={{ title: "", description: "", preview: "", iconImage: "", image: "" }}
            renderItem={(item, i, update) => (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    type="text"
                    value={item.title ?? ""}
                    onChange={(e) => update(i, { title: e.target.value })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.heading}
                  />
                  <CharCount value={item.title ?? ""} max={FIELD_LIMITS.heading} />
                  <ArInput label="Title" kind="heading" value={item.ar?.title} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), title: v } })} />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  {/* Rich text: Bold / Italic / Color toolbar. Stored as safe markup. */}
                  <RichTextArea
                    value={item.description ?? ""}
                    onChange={(v) => update(i, { description: v })}
                    maxLength={FIELD_LIMITS.description}
                    rows={3}
                  />
                  <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
                  <RichTextArea
                    value={item.ar?.description ?? ""}
                    onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), description: v } })}
                    maxLength={FIELD_LIMITS.description}
                    rows={3}
                    dir="rtl"
                    variant="arabic"
                  />
                </div>
                <div>
                  <label className={labelClass}>Icon Image (optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.iconImage ?? ""}
                      onChange={(e) => update(i, { iconImage: e.target.value })}
                      className={inputClass}
                      maxLength={FIELD_LIMITS.link}
                    />
                    <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                      {uploadProgress[`feat-card-${i}-icon`] !== undefined ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress[`feat-card-${i}-icon`]}%</>
                      ) : (
                        <><Upload className="h-3.5 w-3.5" />Upload</>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleArrayImageUpload(`feat-card-${i}-icon`, update, i, "iconImage", file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  <CharCount value={item.iconImage ?? ""} max={FIELD_LIMITS.link} />
                  <FieldError error={validateUrl(item.iconImage)} />
                  {uploadErrors[`feat-card-${i}-icon`] ? (
                    <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors[`feat-card-${i}-icon`]}</p>
                  ) : null}
                </div>
                <div>
                  <label className={labelClass}>Card Image (optional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.image ?? ""}
                      onChange={(e) => update(i, { image: e.target.value })}
                      className={inputClass}
                      maxLength={FIELD_LIMITS.link}
                    />
                    <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                      {uploadProgress[`feat-card-${i}-img`] !== undefined ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress[`feat-card-${i}-img`]}%</>
                      ) : (
                        <><Upload className="h-3.5 w-3.5" />Upload</>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleArrayImageUpload(`feat-card-${i}-img`, update, i, "image", file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  <CharCount value={item.image ?? ""} max={FIELD_LIMITS.link} />
                  <FieldError error={validateUrl(item.image)} />
                  {uploadErrors[`feat-card-${i}-img`] ? (
                    <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors[`feat-card-${i}-img`]}</p>
                  ) : null}
                </div>
                <div>
                  <label className={labelClass}>Preview Type (fallback visual when no Card Image)</label>
                  <input
                    type="text"
                    value={item.preview ?? ""}
                    onChange={(e) => update(i, { preview: e.target.value })}
                    className={inputClass}
                    placeholder="e.g., rates, summary, payment"
                    maxLength={FIELD_LIMITS.label}
                  />
                  <CharCount value={item.preview ?? ""} max={FIELD_LIMITS.label} />
                </div>
              </div>
            )}
          />
        </CollapsibleSection>

        {/* 7. HalaPark In Action */}
        <CollapsibleSection
          title="7. HalaParkInAction"
          isOpen={openSections.halapark}
          onToggle={() => toggleSection("halapark")}
        >
          {renderEnabledToggle("halapark")}
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Title</label>
                <input
                  type="text"
                  value={sections.halapark?.title}
                  onChange={(e) => setSections({ ...sections, halapark: { ...sections.halapark, title: e.target.value } })}
                  className={inputClass}
                  maxLength={FIELD_LIMITS.heading}
                />
                <CharCount value={sections.halapark?.title} max={FIELD_LIMITS.heading} />
                <ArInput label="Title" kind="heading" value={sections.halapark?.ar?.title} onChange={(v) => setSections({ ...sections, halapark: { ...sections.halapark, ar: { ...(sections.halapark?.ar ?? {}), title: v } } })} />
              </div>
              <div>
                <label className={labelClass}>Subtitle</label>
                <input
                  type="text"
                  value={sections.halapark?.subtitle}
                  onChange={(e) => setSections({ ...sections, halapark: { ...sections.halapark, subtitle: e.target.value } })}
                  className={inputClass}
                  maxLength={FIELD_LIMITS.subtitle}
                />
                <CharCount value={sections.halapark?.subtitle} max={FIELD_LIMITS.subtitle} />
                <ArInput label="Subtitle" kind="subtitle" value={sections.halapark?.ar?.subtitle} onChange={(v) => setSections({ ...sections, halapark: { ...sections.halapark, ar: { ...(sections.halapark?.ar ?? {}), subtitle: v } } })} />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#050A13] mb-4">Store Links</h3>
              <ArrayItemEditor
                items={sections.halapark?.storeLinks || []}
                onItemsChange={(items) => setSections({ ...sections, halapark: { ...sections.halapark, storeLinks: items } })}
                title="Store Link"
                addButtonText="Add Store"
                defaultItem={{ icon: "/icon.png", alt: "Store Name", eyebrow: "Download Now On", label: "Store Label", href: "" }}
                renderItem={(item, i, update) => (
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Icon Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.icon}
                          onChange={(e) => update(i, { icon: e.target.value })}
                          className={inputClass}
                          maxLength={FIELD_LIMITS.link}
                        />
                        <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                          {uploadProgress[`storeicon-${i}-icon`] !== undefined ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress[`storeicon-${i}-icon`]}%</>
                          ) : (
                            <><Upload className="h-3.5 w-3.5" />Upload</>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleArrayImageUpload(`storeicon-${i}-icon`, update, i, "icon", file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                      <CharCount value={item.icon} max={FIELD_LIMITS.link} />
                      <FieldError error={validateUrl(item.icon)} />
                      {uploadErrors[`storeicon-${i}-icon`] ? (
                        <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors[`storeicon-${i}-icon`]}</p>
                      ) : null}
                    </div>
                    <div>
                      <label className={labelClass}>Alt Text</label>
                      <input
                        type="text"
                        value={item.alt}
                        onChange={(e) => update(i, { alt: e.target.value })}
                        className={inputClass}
                        maxLength={FIELD_LIMITS.label}
                      />
                      <CharCount value={item.alt} max={FIELD_LIMITS.label} />
                    </div>
                    <div>
                      <label className={labelClass}>Eyebrow (small text above name)</label>
                      <input
                        type="text"
                        value={item.eyebrow ?? ""}
                        onChange={(e) => update(i, { eyebrow: e.target.value })}
                        className={inputClass}
                        placeholder="Download Now On"
                        maxLength={FIELD_LIMITS.label}
                      />
                      <CharCount value={item.eyebrow ?? ""} max={FIELD_LIMITS.label} />
                      <ArInput label="Eyebrow" kind="label" value={item.ar?.eyebrow} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), eyebrow: v } })} />
                    </div>
                    <div>
                      <label className={labelClass}>Label</label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => update(i, { label: e.target.value })}
                        className={inputClass}
                        maxLength={FIELD_LIMITS.label}
                      />
                      <CharCount value={item.label} max={FIELD_LIMITS.label} />
                      <ArInput label="Label" kind="label" value={item.ar?.label} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), label: v } })} />
                    </div>
                    <div>
                      <label className={labelClass}>Store Page URL (makes the badge clickable)</label>
                      <input
                        type="text"
                        value={item.href ?? ""}
                        onChange={(e) => update(i, { href: e.target.value })}
                        className={inputClass}
                        placeholder="https://…"
                        maxLength={FIELD_LIMITS.link}
                      />
                      <CharCount value={item.href ?? ""} max={FIELD_LIMITS.link} />
                      <FieldError error={validateUrl(item.href ?? "")} />
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* 8. App CTA Footer */}
        <CollapsibleSection
          title="8. App CTA Footer"
          isOpen={openSections.ctaFooter}
          onToggle={() => toggleSection("ctaFooter")}
        >
          {renderEnabledToggle("ctaFooter")}
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Heading</label>
                <input
                  type="text"
                  value={sections.ctaFooter?.heading ?? ""}
                  onChange={(e) => setSections({ ...sections, ctaFooter: { ...sections.ctaFooter, heading: e.target.value } })}
                  className={inputClass}
                  maxLength={FIELD_LIMITS.heading}
                />
                <CharCount value={sections.ctaFooter?.heading ?? ""} max={FIELD_LIMITS.heading} />
                <ArInput label="Heading" kind="heading" value={sections.ctaFooter?.ar?.heading} onChange={(v) => setSections({ ...sections, ctaFooter: { ...sections.ctaFooter, ar: { ...(sections.ctaFooter?.ar ?? {}), heading: v } } })} />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <RichTextArea
                  value={sections.ctaFooter?.description ?? ""}
                  onChange={(v) => setSections({ ...sections, ctaFooter: { ...sections.ctaFooter, description: v } })}
                  maxLength={FIELD_LIMITS.description}
                  rows={3}
                />
                <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
                <RichTextArea
                  value={sections.ctaFooter?.ar?.description ?? ""}
                  onChange={(v) => setSections({ ...sections, ctaFooter: { ...sections.ctaFooter, ar: { ...(sections.ctaFooter?.ar ?? {}), description: v } } })}
                  maxLength={FIELD_LIMITS.description}
                  rows={3}
                  dir="rtl"
                  variant="arabic"
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#050A13] mb-4">Store Badges</h3>
              <ArrayItemEditor
                items={sections.ctaFooter?.stores || []}
                onItemsChange={(items) => setSections({ ...sections, ctaFooter: { ...sections.ctaFooter, stores: items } })}
                title="Store"
                addButtonText="Add Store"
                defaultItem={{ key: "appstore", label: "", icon: "", href: "" }}
                renderItem={(item, i, update) => (
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Store — controls default handling</label>
                      <select
                        value={item.key ?? "appstore"}
                        onChange={(e) => update(i, { key: e.target.value })}
                        className={inputClass}
                      >
                        <option value="appstore">App Store</option>
                        <option value="playstore">Play Store</option>
                        <option value="huawei">Huawei AppGallery</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Label</label>
                      <input
                        type="text"
                        value={item.label ?? ""}
                        onChange={(e) => update(i, { label: e.target.value })}
                        className={inputClass}
                        maxLength={FIELD_LIMITS.label}
                      />
                      <CharCount value={item.label ?? ""} max={FIELD_LIMITS.label} />
                    </div>
                    <div>
                      <label className={labelClass}>Icon Image</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={item.icon ?? ""}
                          onChange={(e) => update(i, { icon: e.target.value })}
                          className={inputClass}
                          maxLength={FIELD_LIMITS.link}
                        />
                        <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                          {uploadProgress[`ctafooter-store-${i}-icon`] !== undefined ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress[`ctafooter-store-${i}-icon`]}%</>
                          ) : (
                            <><Upload className="h-3.5 w-3.5" />Upload</>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleArrayImageUpload(`ctafooter-store-${i}-icon`, update, i, "icon", file);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                      <FieldError error={validateUrl(item.icon)} />
                      {uploadErrors[`ctafooter-store-${i}-icon`] ? (
                        <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors[`ctafooter-store-${i}-icon`]}</p>
                      ) : null}
                    </div>
                    <div>
                      <label className={labelClass}>Store URL</label>
                      <input
                        type="text"
                        value={item.href ?? ""}
                        onChange={(e) => update(i, { href: e.target.value })}
                        className={inputClass}
                        placeholder="https://…"
                        maxLength={FIELD_LIMITS.link}
                      />
                      <FieldError error={validateUrl(item.href ?? "")} />
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
