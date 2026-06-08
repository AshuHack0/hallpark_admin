import { useState, useEffect } from "react";
import { Save, ExternalLink, Loader2, Plus, Trash2, ChevronDown } from "lucide-react";
import { api } from "../lib/api";

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
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [openSections, setOpenSections] = useState({ hero: true });

  useEffect(() => {
    document.title = "App — HalaPark Admin";
    setLoading(true);
    api
      .getPage("app")
      .then((data) => {
        setPage(data);
        setPublished(data.published ?? true);
        if (data.page?.sections) {
          setSections((prev) => ({ ...prev, ...data.page.sections }));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load page:", err);
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    if (!page) return;
    setSaving(true);
    try {
      await api.updatePage("app", {
        sections,
        published,
      });
      setSuccess("App page saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
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
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#050A13]">App Page Editor</h1>
          <p className="mt-2 text-sm text-slate-600">Manage all 7 app page sections</p>
        </div>
        <a
          href={`${import.meta.env.VITE_FRONTEND_URL ?? "http://localhost:3000"}/app`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ExternalLink className="h-4 w-4" />
          Preview
        </a>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
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
              />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <input
                type="text"
                value={sections.hero.subtitle}
                onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, subtitle: e.target.value } })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={sections.hero.description}
                onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, description: e.target.value } })}
                className={inputClass}
                rows={3}
              />
            </div>
            <div>
              <label className={labelClass}>Hero Image URL</label>
              <input
                type="text"
                value={sections.hero.image}
                onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, image: e.target.value } })}
                className={inputClass}
              />
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
              <div>
                <label className={labelClass}>Title</label>
                <input
                  type="text"
                  value={sections.platform.title}
                  onChange={(e) => setSections({ ...sections, platform: { ...sections.platform, title: e.target.value } })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Subtitle</label>
                <input
                  type="text"
                  value={sections.platform.subtitle}
                  onChange={(e) => setSections({ ...sections, platform: { ...sections.platform, subtitle: e.target.value } })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={sections.platform.description}
                  onChange={(e) => setSections({ ...sections, platform: { ...sections.platform, description: e.target.value } })}
                  className={inputClass}
                  rows={2}
                />
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
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => update(i, { description: e.target.value })}
                        className={inputClass}
                      />
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
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => update(i, { description: e.target.value })}
                        className={inputClass}
                      />
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
                  />
                </div>
                <div>
                  <label className={labelClass}>Label (display name)</label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => update(i, { label: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => update(i, { description: e.target.value })}
                    className={inputClass}
                    rows={2}
                  />
                </div>
                <div>
                  <label className={labelClass}>Steps (comma-separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(item.steps) ? item.steps.join(", ") : ""}
                    onChange={(e) => update(i, { steps: e.target.value.split(",").map((s) => s.trim()) })}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          />
        </CollapsibleSection>

        {/* 4. Screenshots */}
        <CollapsibleSection
          title="4. AppScreenshots"
          isOpen={openSections.screenshots}
          onToggle={() => toggleSection("screenshots")}
        >
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
                  />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => update(i, { description: e.target.value })}
                    className={inputClass}
                    rows={2}
                  />
                </div>
                <div>
                  <label className={labelClass}>Screenshot Image URL</label>
                  <input
                    type="text"
                    value={item.image}
                    onChange={(e) => update(i, { image: e.target.value })}
                    className={inputClass}
                  />
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
                />
              </div>
              <div>
                <label className={labelClass}>Subtitle</label>
                <input
                  type="text"
                  value={sections.currency?.subtitle}
                  onChange={(e) => setSections({ ...sections, currency: { ...sections.currency, subtitle: e.target.value } })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={sections.currency?.description}
                  onChange={(e) => setSections({ ...sections, currency: { ...sections.currency, description: e.target.value } })}
                  className={inputClass}
                  rows={2}
                />
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
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Subtitle</label>
                      <input
                        type="text"
                        value={item.subtitle}
                        onChange={(e) => update(i, { subtitle: e.target.value })}
                        className={inputClass}
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
                  />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={item.description}
                    onChange={(e) => update(i, { description: e.target.value })}
                    className={inputClass}
                    rows={2}
                  />
                </div>
                <div>
                  <label className={labelClass}>Preview Type</label>
                  <input
                    type="text"
                    value={item.preview}
                    onChange={(e) => update(i, { preview: e.target.value })}
                    className={inputClass}
                    placeholder="e.g., rates, summary, payment"
                  />
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
                />
              </div>
              <div>
                <label className={labelClass}>Subtitle</label>
                <input
                  type="text"
                  value={sections.halapark?.subtitle}
                  onChange={(e) => setSections({ ...sections, halapark: { ...sections.halapark, subtitle: e.target.value } })}
                  className={inputClass}
                />
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
                      <input
                        type="text"
                        value={item.icon}
                        onChange={(e) => update(i, { icon: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Alt Text</label>
                      <input
                        type="text"
                        value={item.alt}
                        onChange={(e) => update(i, { alt: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Label</label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => update(i, { label: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Publish Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-[#0088FF]"
            />
            <div>
              <p className="font-medium text-[#050A13]">Published</p>
              <p className="text-sm text-slate-600">
                {published ? "This page is published and visible" : "This page is hidden"}
              </p>
            </div>
          </label>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0088FF] px-6 py-3 font-semibold text-white hover:brightness-110 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {success}
          </div>
        )}
      </form>
    </div>
  );
}
