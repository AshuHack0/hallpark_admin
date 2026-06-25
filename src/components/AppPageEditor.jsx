import { useState, useEffect } from "react";
import { Save, ExternalLink, Loader2, Plus, Trash2, ChevronDown, Upload } from "lucide-react";
import { api, uploadMediaToCloudinary } from "../lib/api";
import { validateUrl, validateImageFile, validateVideoFile } from "../lib/validators";
import { FIELD_LIMITS, CharCount, FieldError, ArInput } from "./CappedField";

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15";
const labelClass = "block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 mb-2";

const DEFAULT_HERO = {
  title: "Find Parking in Seconds Across UAE",
  subtitle: "",
  description: "Find nearby parking, reserve instantly, and pay cashless, all in one seamless app experience.",
  image: "/j3.png",
};

const DEFAULT_PLATFORM = {
  title: "HalaPark Online App",
  subtitle: "Your parking, in your hands.",
  description: "",
  appFeatures: [
    { title: "Manage with ease", description: "Access your account and manage parking anytime, anywhere." },
  ],
  websiteFeatures: [
    { title: "Simple & intuitive", description: "A clean, smooth experience designed for quick access." },
  ],
};

const DEFAULT_SERVICE_TABS = {
  tabs: [
    {
      key: "public",
      label: "Public Parking",
      description: "Find and book public parking spaces easily",
      steps: ["Search", "Book", "Pay"],
    },
  ],
};

const DEFAULT_SCREENSHOTS = [
  {
    title: "Find",
    description: "Set your location",
    image: "/Map.png",
  },
];

const DEFAULT_CURRENCY = {
  title: "HalaPark Payments",
  subtitle: "Top up your wallet",
  description: "Secure and flexible payment options for your parking sessions.",
  cardFeatures: [
    { title: "Top Up", subtitle: "your wallet" },
  ],
};

const DEFAULT_FEATURE_CARDS = [
  {
    title: "Real-Time Parking Rates",
    description: "Always get the most accurate rates when booking.",
    preview: "rates",
  },
];

const DEFAULT_HALAPARK_IN_ACTION = {
  title: "HalaPark In Action",
  subtitle: "Experience the future of parking management",
  storeLinks: [
    { icon: "/image--04.png", alt: "App Store", label: "App Store" },
    { icon: "/image 4.png", alt: "Play Store", label: "Play Store" },
  ],
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
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState({});
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
    setSaving(true);
    setError("");
    try {
      await api.updatePage("app", {
        sections,
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

  async function handleImageUpload(section, field, file) {
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    const key = `${section}-${field}`;
    setError("");
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
      setError("Image upload failed");
      console.error(err);
    } finally {
      setUploadProgress((p) => ({ ...p, [key]: undefined }));
    }
  }

  // Upload an image for an item inside an ArrayItemEditor list. `update`/`i` come
  // from the list's renderItem; `field` is the image key on the item (e.g. "image").
  async function handleArrayImageUpload(key, update, i, field, file) {
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct }))
      );
      update(i, { [field]: url });
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
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Title</label>
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
              <textarea
                value={sections.hero.description}
                onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, description: e.target.value } })}
                className={inputClass}
                rows={3}
                maxLength={FIELD_LIMITS.description}
              />
              <CharCount value={sections.hero.description} max={FIELD_LIMITS.description} />
              <ArInput label="Description" kind="description" value={sections.hero.ar?.description} onChange={(v) => setSections({ ...sections, hero: { ...sections.hero, ar: { ...(sections.hero.ar ?? {}), description: v } } })} multiline={true} />
            </div>
            <div>
              <label className={labelClass}>Hero Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sections.hero.image}
                  onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, image: e.target.value } })}
                  className={inputClass}
                  maxLength={FIELD_LIMITS.link}
                />
                <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload("hero", "image", file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <FieldError error={validateUrl(sections.hero.image)} />
            </div>
          </div>
        </CollapsibleSection>

        {/* 2. App Platform Section */}
        <CollapsibleSection
          title="2. AppPlatformSection"
          isOpen={openSections.platform}
          onToggle={() => toggleSection("platform")}
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-[#050A13]">Main Content</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>App Heading (after &quot;Halapark&quot;)</label>
                  <input
                    type="text"
                    value={sections.platform.appSuffix ?? ""}
                    onChange={(e) => setSections({ ...sections, platform: { ...sections.platform, appSuffix: e.target.value } })}
                    className={inputClass}
                    placeholder="Online App"
                    maxLength={FIELD_LIMITS.label}
                  />
                  <CharCount value={sections.platform.appSuffix ?? ""} max={FIELD_LIMITS.label} />
                  <ArInput label="App Heading" kind="label" value={sections.platform.ar?.appSuffix} onChange={(v) => setSections({ ...sections, platform: { ...sections.platform, ar: { ...(sections.platform.ar ?? {}), appSuffix: v } } })} />
                </div>
                <div>
                  <label className={labelClass}>Website Heading (after &quot;Halapark&quot;)</label>
                  <input
                    type="text"
                    value={sections.platform.webSuffix ?? ""}
                    onChange={(e) => setSections({ ...sections, platform: { ...sections.platform, webSuffix: e.target.value } })}
                    className={inputClass}
                    placeholder="Online Website"
                    maxLength={FIELD_LIMITS.label}
                  />
                  <CharCount value={sections.platform.webSuffix ?? ""} max={FIELD_LIMITS.label} />
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
                <textarea
                  value={sections.platform.description}
                  onChange={(e) => setSections({ ...sections, platform: { ...sections.platform, description: e.target.value } })}
                  className={inputClass}
                  rows={2}
                  maxLength={FIELD_LIMITS.description}
                />
                <CharCount value={sections.platform.description} max={FIELD_LIMITS.description} />
                <ArInput label="Description" kind="description" value={sections.platform.ar?.description} onChange={(v) => setSections({ ...sections, platform: { ...sections.platform, ar: { ...(sections.platform.ar ?? {}), description: v } } })} multiline={true} />
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
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => update(i, { description: e.target.value })}
                        className={inputClass}
                        maxLength={FIELD_LIMITS.summary}
                      />
                      <CharCount value={item.description} max={FIELD_LIMITS.summary} />
                      <ArInput label="Description" kind="summary" value={item.ar?.description} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), description: v } })} />
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
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => update(i, { description: e.target.value })}
                        className={inputClass}
                        maxLength={FIELD_LIMITS.summary}
                      />
                      <CharCount value={item.description} max={FIELD_LIMITS.summary} />
                      <ArInput label="Description" kind="summary" value={item.ar?.description} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), description: v } })} />
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
          <ArrayItemEditor
            items={sections.serviceTabs?.tabs || []}
            onItemsChange={(items) => setSections({ ...sections, serviceTabs: { ...sections.serviceTabs, tabs: items } })}
            title="Service Tab"
            addButtonText="Add Tab"
            defaultItem={{
              key: "new-service",
              label: "New Service",
              description: "Service description",
              steps: ["Step 1", "Step 2", "Step 3"],
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
                  <textarea
                    value={item.description}
                    onChange={(e) => update(i, { description: e.target.value })}
                    className={inputClass}
                    rows={2}
                    maxLength={FIELD_LIMITS.description}
                  />
                  <CharCount value={item.description} max={FIELD_LIMITS.description} />
                  <ArInput label="Description" kind="description" value={item.ar?.description} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), description: v } })} multiline={true} />
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
                    rows={2}
                    placeholder="City Access Pass is built for fast entry, helping users move from Search to Pay with fewer taps."
                    maxLength={FIELD_LIMITS.description}
                  />
                  <CharCount value={item.builtFor ?? ""} max={FIELD_LIMITS.description} />
                  <ArInput label="Built For" kind="description" multiline value={item.ar?.builtFor} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), builtFor: v } })} />
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
                onChange={(e) => setSections({ ...sections, serviceTabs: { ...sections.serviceTabs, featureChips: e.target.value.split(",").map((s) => s.trim()) } })}
                className={inputClass}
                placeholder="Real-time updates, Seamless checkout, Mobile-first flow"
                maxLength={FIELD_LIMITS.subtitle}
              />
              <label className={labelClass} style={{ marginTop: 6 }}>Feature Chips — Arabic (comma-separated)</label>
              <input
                type="text"
                dir="rtl"
                value={Array.isArray(sections.serviceTabs?.ar?.featureChips) ? sections.serviceTabs.ar.featureChips.join("، ") : ""}
                onChange={(e) => setSections({ ...sections, serviceTabs: { ...sections.serviceTabs, ar: { ...(sections.serviceTabs?.ar ?? {}), featureChips: e.target.value.split(/،|,/).map((s) => s.trim()) } } })}
                className={inputClass}
                style={{ borderColor: "#16a34a" }}
                maxLength={FIELD_LIMITS.subtitle}
              />
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
              <textarea
                value={sections.screenshotsHeader?.description ?? ""}
                onChange={(e) => setSections({ ...sections, screenshotsHeader: { ...sections.screenshotsHeader, description: e.target.value } })}
                className={inputClass}
                rows={2}
                maxLength={FIELD_LIMITS.description}
                placeholder="Find your spot, book in seconds, pay securely…"
              />
              <CharCount value={sections.screenshotsHeader?.description ?? ""} max={FIELD_LIMITS.description} />
              <ArInput label="Description" kind="description" value={sections.screenshotsHeader?.ar?.description} onChange={(v) => setSections({ ...sections, screenshotsHeader: { ...sections.screenshotsHeader, ar: { ...(sections.screenshotsHeader?.ar ?? {}), description: v } } })} multiline={true} />
            </div>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Process Steps (Find → Explore → Book → Pay → Confirm)</p>
              <ArrayItemEditor
                items={sections.screenshotsHeader?.processSteps || []}
                onItemsChange={(items) => setSections({ ...sections, screenshotsHeader: { ...sections.screenshotsHeader, processSteps: items } })}
                title="Step"
                addButtonText="Add Step"
                defaultItem={{ title: "Step", text: "" }}
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
                      <label className={labelClass}>Text</label>
                      <input
                        type="text"
                        value={item.text ?? ""}
                        onChange={(e) => update(i, { text: e.target.value })}
                        className={inputClass}
                        maxLength={FIELD_LIMITS.subtitle}
                      />
                      <CharCount value={item.text ?? ""} max={FIELD_LIMITS.subtitle} />
                      <ArInput label="Text" kind="subtitle" value={item.ar?.text} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), text: v } })} />
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
            defaultItem={{ title: "New Screenshot", description: "", image: "/screenshot.png" }}
            renderItem={(item, i, update) => (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => update(i, { title: e.target.value })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.heading}
                  />
                  <CharCount value={item.title} max={FIELD_LIMITS.heading} />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => update(i, { description: e.target.value })}
                    className={inputClass}
                    rows={2}
                    maxLength={FIELD_LIMITS.description}
                  />
                  <CharCount value={item.description} max={FIELD_LIMITS.description} />
                </div>
                <div>
                  <label className={labelClass}>Screenshot Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.image}
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
                  <CharCount value={item.image} max={FIELD_LIMITS.link} />
                  <FieldError error={validateUrl(item.image)} />
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
                <textarea
                  value={sections.currency?.description}
                  onChange={(e) => setSections({ ...sections, currency: { ...sections.currency, description: e.target.value } })}
                  className={inputClass}
                  rows={2}
                  maxLength={FIELD_LIMITS.description}
                />
                <CharCount value={sections.currency?.description} max={FIELD_LIMITS.description} />
                <ArInput label="Description" kind="description" value={sections.currency?.ar?.description} onChange={(v) => setSections({ ...sections, currency: { ...sections.currency, ar: { ...(sections.currency?.ar ?? {}), description: v } } })} multiline={true} />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#050A13] mb-4">Quick Features</h3>
              <ArrayItemEditor
                items={sections.currency?.cardFeatures || []}
                onItemsChange={(items) => setSections({ ...sections, currency: { ...sections.currency, cardFeatures: items } })}
                title="Feature"
                addButtonText="Add Feature"
                defaultItem={{ title: "Feature", subtitle: "subtitle" }}
                renderItem={(item, i, update) => (
                  <div className="grid grid-cols-2 gap-4">
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
                      <label className={labelClass}>Subtitle</label>
                      <input
                        type="text"
                        value={item.subtitle}
                        onChange={(e) => update(i, { subtitle: e.target.value })}
                        className={inputClass}
                        maxLength={FIELD_LIMITS.label}
                      />
                      <CharCount value={item.subtitle} max={FIELD_LIMITS.label} />
                      <ArInput label="Subtitle" kind="label" value={item.ar?.subtitle} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), subtitle: v } })} />
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
              <textarea
                value={sections.featureCardsHeader?.description ?? ""}
                onChange={(e) => setSections({ ...sections, featureCardsHeader: { ...sections.featureCardsHeader, description: e.target.value } })}
                className={inputClass}
                rows={2}
                maxLength={FIELD_LIMITS.description}
                placeholder="Powerful features designed to save you time, money, and effort."
              />
              <CharCount value={sections.featureCardsHeader?.description ?? ""} max={FIELD_LIMITS.description} />
              <ArInput label="Description" kind="description" value={sections.featureCardsHeader?.ar?.description} onChange={(v) => setSections({ ...sections, featureCardsHeader: { ...sections.featureCardsHeader, ar: { ...(sections.featureCardsHeader?.ar ?? {}), description: v } } })} multiline={true} />
            </div>
          </div>
          <ArrayItemEditor
            items={sections.featureCards || []}
            onItemsChange={(items) => setSections({ ...sections, featureCards: items })}
            title="Feature Card"
            addButtonText="Add Card"
            defaultItem={{ title: "New Feature", description: "", preview: "rates" }}
            renderItem={(item, i, update) => (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => update(i, { title: e.target.value })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.heading}
                  />
                  <CharCount value={item.title} max={FIELD_LIMITS.heading} />
                  <ArInput label="Title" kind="heading" value={item.ar?.title} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), title: v } })} />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => update(i, { description: e.target.value })}
                    className={inputClass}
                    rows={2}
                    maxLength={FIELD_LIMITS.description}
                  />
                  <CharCount value={item.description} max={FIELD_LIMITS.description} />
                  <ArInput label="Description" kind="description" value={item.ar?.description} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), description: v } })} multiline={true} />
                </div>
                <div>
                  <label className={labelClass}>Preview Type</label>
                  <input
                    type="text"
                    value={item.preview}
                    onChange={(e) => update(i, { preview: e.target.value })}
                    className={inputClass}
                    placeholder="e.g., rates, summary, payment"
                    maxLength={FIELD_LIMITS.label}
                  />
                  <CharCount value={item.preview} max={FIELD_LIMITS.label} />
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
                defaultItem={{ icon: "/icon.png", alt: "Store Name", label: "Store Label" }}
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
