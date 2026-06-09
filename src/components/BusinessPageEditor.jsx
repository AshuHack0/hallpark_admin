import { useState, useEffect } from "react";
import { Save, ExternalLink, Loader2, Plus, Trash2, ChevronDown, Upload } from "lucide-react";
import { api, uploadMediaToCloudinary } from "../lib/api";

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15";
const labelClass = "block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 mb-2";

const DEFAULT_HERO = {
  eyebrow: "BUSINESS",
  title: "Turning Smart Parking into Business Growth",
  subtitle: "",
  description: "HalaPark helps businesses maximize revenue, automate parking operations, and deliver seamless smart mobility experiences through AI-powered parking technology.",
  image: "/HalaParkVideo.mp4",
};

const DEFAULT_BUILT_FOR_SPACE = {
  title: "Built for Every Space Where Vehicles Move",
  description: "From luxury towers and shopping malls to smart cities and large-scale mobility hubs, HalaPark powers intelligent parking experiences.",
};

const DEFAULT_WHY_CHOOSE = [
  {
    title: "Increase Revenue",
    description: "Transform unused or underutilized parking spaces into new revenue opportunities.",
    bgGradient: "from-[#0088FF] to-[#0066CC]",
    accentColor: "bg-[#0088FF]",
  },
];

const DEFAULT_SOLUTIONS = [
  {
    title: "Smart Public Parking",
    description: "Modernize public parking operations with mobile payments, virtual tickets, real-time availability tracking, and seamless digital parking experiences.",
    image: "/hf_20260327_064316_9c7b1a28-dbfa-456e-b88a-0087cb567a61.png",
    icon: "🅿️",
  },
  {
    title: "Private Parking Rental",
    description: "Enable property owners and businesses to monetize unused parking spaces through hourly, daily, monthly, or annual rentals.",
    image: "/hf_20260327_062407_6dca49c0-90dd-468a-96f9-b36bba13ea8b.png",
    icon: "🏠",
  },
  {
    title: "Residential Parking Management",
    description: "Simplify resident and visitor parking with secure access control, automated entry systems, guest management, and smart allocation tools.",
    image: "/hf_20260327_065515_cd3808b8-d99d-4faa-817d-e3f772726da6.png",
    icon: "🏢",
  },
  {
    title: "Commercial & Retail Parking",
    description: "Enhance customer convenience with frictionless parking experiences designed for malls, offices, retail destinations, and hospitality environments.",
    image: "/hf_20260327_061010_f3bc038b-576f-4903-8896-5d998cc78527.png",
    icon: "🛍️",
  },
  {
    title: "AI Access & Gate Control",
    description: "Automate entry and exit using smart gate systems, license plate recognition, and digital verification technologies.",
    image: "/hf_20260327_070648_996630bc-828e-4cd7-8cb1-f42c30332d86.png",
    icon: "🤖",
  },
  {
    title: "Fleet & Mobility Solutions",
    description: "Support businesses with fleet parking management, mobility integration, logistics coordination, and operational parking optimization.",
    image: "/hf_20260327_061900_db12a62e-2867-44b6-83f0-ea7f1a5442ef.png",
    icon: "🚗",
  },
  {
    title: "Smart City Parking Integration",
    description: "Connect parking systems with city infrastructure for real-time traffic coordination, municipal dashboards, and urban mobility optimization.",
    image: "/hf_20260327_064457_c75923ba-dc06-4c6e-9b63-fa181e94bcfa.png",
    icon: "🌆",
  },
  {
    title: "Mobile App Parking Ecosystem",
    description: "Provide users with booking, payments, navigation, and parking history in one seamless mobile platform.",
    image: "/hf_20260327_060926_cbb82448-441c-42ee-9589-785e7acd7565.png",
    icon: "📱",
  },
  {
    title: "Data & AI Analytics Dashboard",
    description: "Deliver actionable insights on occupancy trends, peak hours, revenue performance, and space utilization.",
    image: "/hf_20260327_064316_9c7b1a28-dbfa-456e-b88a-0087cb567a61.png",
    icon: "📊",
  },
  {
    title: "Cashless Payment Ecosystem",
    description: "Support multiple payment methods including cards, wallets, QR payments, and subscription billing models.",
    image: "/hf_20260327_062407_6dca49c0-90dd-468a-96f9-b36bba13ea8b.png",
    icon: "💳",
  },
  {
    title: "Security & Surveillance Integration",
    description: "Integrate CCTV, ANPR/LPR systems, and automated alerts to enhance safety and compliance.",
    image: "/hf_20260327_061010_f3bc038b-576f-4903-8896-5d998cc78527.png",
    icon: "🔒",
  },
  {
    title: "EV Charging Parking Integration",
    description: "Combine parking with electric vehicle charging stations for future-ready mobility infrastructure.",
    image: "/hf_20260327_070648_996630bc-828e-4cd7-8cb1-f42c30332d86.png",
    icon: "⚡",
  },
];

const DEFAULT_WHO_WE_WORK = [
  {
    title: "Property Developers",
    description: "Transform residential and commercial projects with intelligent parking infrastructure.",
    image: "/hf_20260327_065515_cd3808b8-d99d-4faa-817d-e3f772726da6.png",
    benefits: ["Increased Property Value", "Smart Infrastructure"],
  },
];

const DEFAULT_PARTNERS_STATS = [
  { value: "5th", label: "Field Expertise" },
  { value: "95%", label: "Client Satisfaction" },
  { value: "120", label: "CP Clients Trusted" },
];

const DEFAULT_TRANSFORM_PARKING = {
  title: "Ready to Transform Your Parking Business?",
  description: "Partner with HalaPark and unlock the future of intelligent parking management.",
  image: "/hf_20260327_064457_c75923ba-dc06-4c6e-9b63-fa181e94bcfa.png",
};

const DEFAULT_ADVANTAGE = [
  {
    title: "Smart Mobility Ecosystem",
    description: "We connect drivers, property owners, operators, and service providers.",
  },
];

const DEFAULT_CTA = {
  title: "Start a Smart Parking Business with No Upfront Investment",
  description: "Partner with HalaPark to launch intelligent parking solutions.",
  image: "/hf_20260327_064457_c75923ba-dc06-4c6e-9b63-fa181e94bcfa.png",
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

export default function BusinessPageEditor() {
  const [page, setPage] = useState(null);
  const [sections, setSections] = useState({
    hero: DEFAULT_HERO,
    builtForSpace: DEFAULT_BUILT_FOR_SPACE,
    whyChoose: DEFAULT_WHY_CHOOSE,
    solutions: DEFAULT_SOLUTIONS,
    whoWeWork: DEFAULT_WHO_WE_WORK,
    partnersStats: DEFAULT_PARTNERS_STATS,
    transformParking: DEFAULT_TRANSFORM_PARKING,
    advantage: DEFAULT_ADVANTAGE,
    cta: DEFAULT_CTA,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState({});
  const [openSections, setOpenSections] = useState({ hero: true });

  useEffect(() => {
    document.title = "Business — HalaPark Admin";
    setLoading(true);
    api
      .getPage("business")
      .then((data) => {
        setPage(data);
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
      await api.updatePage("business", {
        sections,
      });
      setSuccess("Business page saved successfully!");
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

  async function handleImageUpload(section, field, file, itemIndex = null) {
    const key = `${section}-${field}`;
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct }))
      );
      setSections((prev) => {
        if (itemIndex !== null && Array.isArray(prev[section])) {
          const updated = [...prev[section]];
          updated[itemIndex] = { ...updated[itemIndex], [field]: url };
          return { ...prev, [section]: updated };
        }
        return {
          ...prev,
          [section]: { ...prev[section], [field]: url },
        };
      });
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
          <h1 className="text-3xl font-bold text-[#050A13]">Business Page Editor</h1>
          <p className="mt-2 text-sm text-slate-600">Manage all 9 business page sections</p>
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
          title="1. BusinessHero"
          isOpen={openSections.hero}
          onToggle={() => toggleSection("hero")}
        >
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Eyebrow</label>
              <input
                type="text"
                value={sections.hero.eyebrow}
                onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, eyebrow: e.target.value } })}
                className={inputClass}
                placeholder="e.g., BUSINESS"
              />
            </div>
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
              <label className={labelClass}>Description</label>
              <textarea
                value={sections.hero.description}
                onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, description: e.target.value } })}
                className={inputClass}
                rows={3}
              />
            </div>
            <div>
              <label className={labelClass}>Background Image/Video URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sections.hero.image}
                  onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, image: e.target.value } })}
                  className={inputClass}
                  placeholder="e.g., /image.png or https://..."
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
              <p className="mt-1 text-xs text-slate-500">Upload images (PNG, JPG) or use a PNG from your uploads</p>
            </div>
          </div>
        </CollapsibleSection>

        {/* 2. Built For Every Space */}
        <CollapsibleSection
          title="2. BuiltForEverySpace"
          isOpen={openSections.builtForSpace}
          onToggle={() => toggleSection("builtForSpace")}
        >
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={sections.builtForSpace.title}
                onChange={(e) => setSections({ ...sections, builtForSpace: { ...sections.builtForSpace, title: e.target.value } })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={sections.builtForSpace.description}
                onChange={(e) => setSections({ ...sections, builtForSpace: { ...sections.builtForSpace, description: e.target.value } })}
                className={inputClass}
                rows={3}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* 3. Why Choose HalaPark */}
        <CollapsibleSection
          title="3. WhyChooseHalaPark"
          isOpen={openSections.whyChoose}
          onToggle={() => toggleSection("whyChoose")}
        >
          <ArrayItemEditor
            items={sections.whyChoose}
            onItemsChange={(items) => setSections({ ...sections, whyChoose: items })}
            title="Reason Card"
            addButtonText="Add Reason"
            defaultItem={{
              title: "New Reason",
              description: "Description here",
              bgGradient: "from-[#0088FF] to-[#0066CC]",
              accentColor: "bg-[#0088FF]",
            }}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Background Gradient</label>
                    <input
                      type="text"
                      value={item.bgGradient}
                      onChange={(e) => update(i, { bgGradient: e.target.value })}
                      className={inputClass}
                      placeholder="e.g., from-[#0088FF] to-[#0066CC]"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Accent Color Class</label>
                    <input
                      type="text"
                      value={item.accentColor}
                      onChange={(e) => update(i, { accentColor: e.target.value })}
                      className={inputClass}
                      placeholder="e.g., bg-[#0088FF]"
                    />
                  </div>
                </div>
              </div>
            )}
          />
        </CollapsibleSection>

        {/* 4. Business Solutions */}
        <CollapsibleSection
          title="4. BusinessSolutions"
          isOpen={openSections.solutions}
          onToggle={() => toggleSection("solutions")}
        >
          <ArrayItemEditor
            items={sections.solutions}
            onItemsChange={(items) => setSections({ ...sections, solutions: items })}
            title="Solution Card"
            addButtonText="Add Solution"
            defaultItem={{
              title: "New Solution",
              description: "Description here",
              image: "/image.png",
              icon: "🅿️",
            }}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={item.image}
                        onChange={(e) => update(i, { image: e.target.value })}
                        className={inputClass}
                      />
                      <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload("solutions", "image", file, i);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Icon (emoji)</label>
                    <input
                      type="text"
                      value={item.icon}
                      onChange={(e) => update(i, { icon: e.target.value })}
                      className={inputClass}
                      maxLength="2"
                    />
                  </div>
                </div>
              </div>
            )}
          />
        </CollapsibleSection>

        {/* 5. Who We Work With */}
        <CollapsibleSection
          title="5. WhoWeWorkWith"
          isOpen={openSections.whoWeWork}
          onToggle={() => toggleSection("whoWeWork")}
        >
          <ArrayItemEditor
            items={sections.whoWeWork}
            onItemsChange={(items) => setSections({ ...sections, whoWeWork: items })}
            title="Partner Item"
            addButtonText="Add Partner"
            defaultItem={{
              title: "New Partner",
              description: "Description here",
              image: "/image.png",
              benefits: ["Benefit 1", "Benefit 2"],
            }}
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
                  <label className={labelClass}>Image URL</label>
                  <input
                    type="text"
                    value={item.image}
                    onChange={(e) => update(i, { image: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Benefits (comma-separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(item.benefits) ? item.benefits.join(", ") : ""}
                    onChange={(e) => update(i, { benefits: e.target.value.split(",").map((b) => b.trim()) })}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          />
        </CollapsibleSection>

        {/* 6. Partners Showcase Stats */}
        <CollapsibleSection
          title="6. PartnersShowcase (Stats)"
          isOpen={openSections.partnersStats}
          onToggle={() => toggleSection("partnersStats")}
        >
          <ArrayItemEditor
            items={sections.partnersStats}
            onItemsChange={(items) => setSections({ ...sections, partnersStats: items })}
            title="Stat"
            addButtonText="Add Stat"
            defaultItem={{ value: "0", label: "Statistic Label" }}
            renderItem={(item, i, update) => (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Value</label>
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => update(i, { value: e.target.value })}
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
        </CollapsibleSection>

        {/* 7. Transform Parking */}
        <CollapsibleSection
          title="7. TransformParking"
          isOpen={openSections.transformParking}
          onToggle={() => toggleSection("transformParking")}
        >
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={sections.transformParking.title}
                onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, title: e.target.value } })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={sections.transformParking.description}
                onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, description: e.target.value } })}
                className={inputClass}
                rows={3}
              />
            </div>
            <div>
              <label className={labelClass}>Image URL</label>
              <input
                type="text"
                value={sections.transformParking.image}
                onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, image: e.target.value } })}
                className={inputClass}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* 8. HalaPark Advantage */}
        <CollapsibleSection
          title="8. HalaParkAdvantage"
          isOpen={openSections.advantage}
          onToggle={() => toggleSection("advantage")}
        >
          <ArrayItemEditor
            items={sections.advantage}
            onItemsChange={(items) => setSections({ ...sections, advantage: items })}
            title="Advantage Item"
            addButtonText="Add Advantage"
            defaultItem={{
              title: "New Advantage",
              description: "Description here",
            }}
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
              </div>
            )}
          />
        </CollapsibleSection>

        {/* 9. Business CTA */}
        <CollapsibleSection
          title="9. BusinessCTA"
          isOpen={openSections.cta}
          onToggle={() => toggleSection("cta")}
        >
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={sections.cta.title}
                onChange={(e) => setSections({ ...sections, cta: { ...sections.cta, title: e.target.value } })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={sections.cta.description}
                onChange={(e) => setSections({ ...sections, cta: { ...sections.cta, description: e.target.value } })}
                className={inputClass}
                rows={3}
              />
            </div>
            <div>
              <label className={labelClass}>Background Image URL</label>
              <input
                type="text"
                value={sections.cta.image}
                onChange={(e) => setSections({ ...sections, cta: { ...sections.cta, image: e.target.value } })}
                className={inputClass}
              />
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
