import { useState, useEffect } from "react";
import { Save, ExternalLink, Loader2, Plus, Trash2, ChevronDown, Upload } from "lucide-react";
import { api, uploadMediaToCloudinary } from "../lib/api";
import { FIELD_LIMITS, CharCount } from "./CappedField";

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
    description: "Transform residential and commercial projects with intelligent parking infrastructure that increases property value, improves traffic flow, and delivers future-ready smart mobility experiences.",
    image: "/hf_20260327_065515_cd3808b8-d99d-4faa-817d-e3f772726da6.png",
    benefits: ["Increased Property Value", "Smart Infrastructure", "Future-Ready Design"],
  },
  {
    title: "Shopping Malls & Retail",
    description: "Create faster, smoother, and stress-free visitor experiences with automated parking, digital payments, real-time availability tracking, and seamless customer journeys.",
    image: "/hf_20260327_061010_f3bc038b-576f-4903-8896-5d998cc78527.png",
    benefits: ["Better Customer Experience", "Increased Foot Traffic", "Digital Payments"],
  },
  {
    title: "Residential Communities",
    description: "Deliver secure, organized, and hassle-free parking management for residents, visitors, and tenants with smart access control and automated entry systems.",
    image: "/hf_20260327_061900_db12a62e-2867-44b6-83f0-ea7f1a5442ef.png",
    benefits: ["Secure Access Control", "Visitor Management", "Resident Satisfaction"],
  },
  {
    title: "Hotels & Hospitality",
    description: "Enhance guest experiences with premium valet integration, frictionless parking access, digital visitor management, and luxury smart parking services.",
    image: "/hf_20260327_060926_cbb82448-441c-42ee-9589-785e7acd7565.png",
    benefits: ["Premium Guest Experience", "Valet Integration", "Digital Management"],
  },
  {
    title: "Government & Public",
    description: "Support smart city initiatives with scalable parking ecosystems, AI-powered mobility solutions, real-time analytics, and intelligent urban traffic management.",
    image: "/hf_20260327_064457_c75923ba-dc06-4c6e-9b63-fa181e94bcfa.png",
    benefits: ["Smart City Solutions", "Traffic Management", "Real-Time Analytics"],
  },
  {
    title: "Service Providers",
    description: "Collaborate with HalaPark to integrate innovative parking technologies, EV charging systems, automation tools, and mobility solutions into a growing smart ecosystem.",
    image: "/hf_20260327_070648_996630bc-828e-4cd7-8cb1-f42c30332d86.png",
    benefits: ["Technology Integration", "Scalable Solutions", "Growing Ecosystem"],
  },
  {
    title: "Commercial Towers",
    description: "Simplify employee and visitor parking with automated access control, reserved parking management, and seamless daily parking experiences for modern workplaces.",
    image: "/hf_20260327_064316_9c7b1a28-dbfa-456e-b88a-0087cb567a61.png",
    benefits: ["Employee Satisfaction", "Automated Access", "Reserved Spaces"],
  },
  {
    title: "Airports & Hubs",
    description: "Reduce congestion and improve vehicle movement with intelligent parking systems designed for high-traffic environments and large-scale mobility operations.",
    image: "/hf_20260327_062407_6dca49c0-90dd-468a-96f9-b36bba13ea8b.png",
    benefits: ["Congestion Reduction", "High-Volume Handling", "Smooth Traffic"],
  },
  {
    title: "Universities",
    description: "Manage student, faculty, and visitor parking efficiently using smart permits, digital parking management, and real-time occupancy monitoring.",
    image: "/hf_20260327_065515_cd3808b8-d99d-4faa-817d-e3f772726da6.png",
    benefits: ["Smart Permits", "Digital Management", "Occupancy Tracking"],
  },
  {
    title: "Healthcare Facilities",
    description: "Provide stress-free parking experiences for patients, staff, and visitors with smart guidance systems, automated entry, and optimized traffic flow.",
    image: "/hf_20260327_061010_f3bc038b-576f-4903-8896-5d998cc78527.png",
    benefits: ["Patient Comfort", "Staff Efficiency", "Visitor Guidance"],
  },
  {
    title: "Event Venues",
    description: "Handle large parking demand during concerts, exhibitions, and events with intelligent crowd management, dynamic parking allocation, and faster vehicle access.",
    image: "/hf_20260327_064457_c75923ba-dc06-4c6e-9b63-fa181e94bcfa.png",
    benefits: ["Crowd Management", "Dynamic Allocation", "Fast Access"],
  },
];

const DEFAULT_PARTNERS_STATS = [
  { value: "5th", label: "Field Expertise" },
  { value: "95%", label: "Client Satisfaction" },
  { value: "120", label: "CP Clients Trusted" },
];

const DEFAULT_TRANSFORM_PARKING = {
  title: "Ready to Transform Your Parking Business?",
  description: "Partner with HalaPark and unlock the future of intelligent parking management, smart mobility, and connected urban infrastructure.",
  parkingPartnerTitle: "Become a Parking Partner",
  parkingPartnerSubtitle: "Turn your parking assets into profitable smart mobility solutions.",
  parkingPartnerDescription: "HalaPark enables landlords, parking operators, residential buildings, commercial properties, and public entities to digitize and monetize their parking infrastructure through advanced automation and intelligent management tools. Existing parking platforms increasingly focus on ticketless entry, occupancy optimization, AI-powered access control, and cloud-based management systems to improve efficiency and user convenience.",
  parkingPartnerPerks: ["Smart parking management dashboard", "Digital payment integration", "Parking categorization & organization", "Real-time occupancy monitoring", "Traffic & congestion management", "Advanced reporting & analytics", "Secure automated access systems", "Mobile & cloud-based management", "Revenue optimization tools", "Flexible subscription & booking models"],
  servicePartnerTitle: "Become a Service Partner",
  servicePartnerSubtitle: "Join the future of smart mobility and parking innovation.",
  servicePartnerDescription1: "HalaPark collaborates with service providers, technology suppliers, hardware manufacturers, and mobility partners to deliver integrated parking experiences across the UAE and beyond.",
  servicePartnerDescription2: "Whether you specialize in automation, EV charging, security systems, maintenance services, mobility solutions, or smart city technologies, we create opportunities for strategic growth and long-term collaboration.",
  servicePartnerPerks: ["Smart parking hardware", "AI & automation systems", "EV charging infrastructure", "Security & surveillance solutions", "Facility management services", "Mobility & logistics solutions", "Software integrations", "IoT & smart city technologies"],
};

const DEFAULT_ADVANTAGE = [
  {
    title: "Smart Mobility Ecosystem",
    description: "We connect drivers, property owners, operators, and service providers through one intelligent platform.",
  },
  {
    title: "Seamless Digital Experience",
    description: "From booking to payment and access control, every interaction is optimized for speed, simplicity, and convenience.",
  },
  {
    title: "Future-Ready Technology",
    description: "Built for modern cities, evolving mobility demands, and scalable smart infrastructure.",
  },
  {
    title: "Data-Driven Operations",
    description: "Make smarter business decisions using live operational insights, occupancy analytics, and performance reporting.",
  },
];

const DEFAULT_PARTNERS_SHOWCASE = {
  heading: "Helping you to correctly",
  headingGradient: "set-up, build,",
  subheading: "and protect your brand and business",
  description: "Unsure of the next steps toward your business expansion? Want to ensure your logistics are in order? With 20+ years of business experience & extensive legal training, we'll help you navigate your legal issue and provide the best solution for:",
  image: "/hf_20260327_064457_c75923ba-dc06-4c6e-9b63-fa181e94bcfa.png",
  stats: [
    { value: "5th", label: "Field Expertise" },
    { value: "95%", label: "Client Satisfaction" },
    { value: "120", label: "CP Clients Trusted" },
  ],
  ctaLabel: "Get Started",
  partners: {
    heading: "Trusted by Industry Leaders",
    subheading: "Work with some of the most recognized brands and organizations",
    row1: [
      { name: "Company A", industry: "Retail", initials: "CA", color: "#0088FF" },
      { name: "Company B", industry: "Tech", initials: "CB", color: "#1AB2FF" },
    ],
    row2: [
      { name: "Company C", industry: "Finance", initials: "CC", color: "#FF6B6B" },
      { name: "Company D", industry: "Hospitality", initials: "CD", color: "#FFB347" },
    ],
  },
  ctaSection: {
    title: "Ready to Partner with HalaPark?",
    description: "Join our growing network of trusted partners and transform your parking infrastructure today.",
    image: "/hf_20260327_064457_c75923ba-dc06-4c6e-9b63-fa181e94bcfa.png",
  },
};

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
    partnersShowcase: DEFAULT_PARTNERS_SHOWCASE,
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
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={sections.hero.eyebrow} max={FIELD_LIMITS.label} />
            </div>
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
                maxLength={FIELD_LIMITS.heading}
              />
              <CharCount value={sections.builtForSpace.title} max={FIELD_LIMITS.heading} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={sections.builtForSpace.description}
                onChange={(e) => setSections({ ...sections, builtForSpace: { ...sections.builtForSpace, description: e.target.value } })}
                className={inputClass}
                rows={3}
                maxLength={FIELD_LIMITS.description}
              />
              <CharCount value={sections.builtForSpace.description} max={FIELD_LIMITS.description} />
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Background Gradient</label>
                    <input
                      type="text"
                      value={item.bgGradient}
                      onChange={(e) => update(i, { bgGradient: e.target.value })}
                      className={inputClass}
                      placeholder="e.g., from-[#0088FF] to-[#0066CC]"
                      maxLength={FIELD_LIMITS.label}
                    />
                    <CharCount value={item.bgGradient} max={FIELD_LIMITS.label} />
                  </div>
                  <div>
                    <label className={labelClass}>Accent Color Class</label>
                    <input
                      type="text"
                      value={item.accentColor}
                      onChange={(e) => update(i, { accentColor: e.target.value })}
                      className={inputClass}
                      placeholder="e.g., bg-[#0088FF]"
                      maxLength={FIELD_LIMITS.label}
                    />
                    <CharCount value={item.accentColor} max={FIELD_LIMITS.label} />
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
          <div className="mb-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Section Header</p>
            <div>
              <label className={labelClass}>Heading (first part)</label>
              <input
                type="text"
                value={sections.solutionsHeader?.heading ?? ""}
                onChange={(e) => setSections({ ...sections, solutionsHeader: { ...sections.solutionsHeader, heading: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
                placeholder="Our Business"
              />
              <CharCount value={sections.solutionsHeader?.heading ?? ""} max={FIELD_LIMITS.heading} />
            </div>
            <div>
              <label className={labelClass}>Heading Accent (gradient part)</label>
              <input
                type="text"
                value={sections.solutionsHeader?.headingAccent ?? ""}
                onChange={(e) => setSections({ ...sections, solutionsHeader: { ...sections.solutionsHeader, headingAccent: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
                placeholder="Solutions"
              />
              <CharCount value={sections.solutionsHeader?.headingAccent ?? ""} max={FIELD_LIMITS.heading} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={sections.solutionsHeader?.description ?? ""}
                onChange={(e) => setSections({ ...sections, solutionsHeader: { ...sections.solutionsHeader, description: e.target.value } })}
                className={inputClass}
                rows={2}
                maxLength={FIELD_LIMITS.description}
                placeholder="Intelligent parking systems built for every business type…"
              />
              <CharCount value={sections.solutionsHeader?.description ?? ""} max={FIELD_LIMITS.description} />
            </div>
            <div>
              <label className={labelClass}>Description (second, smaller)</label>
              <textarea
                value={sections.solutionsHeader?.description2 ?? ""}
                onChange={(e) => setSections({ ...sections, solutionsHeader: { ...sections.solutionsHeader, description2: e.target.value } })}
                className={inputClass}
                rows={2}
                maxLength={FIELD_LIMITS.description}
                placeholder="We make it possible to invest in parking infrastructure…"
              />
              <CharCount value={sections.solutionsHeader?.description2 ?? ""} max={FIELD_LIMITS.description} />
            </div>
          </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={item.image}
                        onChange={(e) => update(i, { image: e.target.value })}
                        className={inputClass}
                        maxLength={FIELD_LIMITS.link}
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
                  <label className={labelClass}>Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.image}
                      onChange={(e) => update(i, { image: e.target.value })}
                      className={inputClass}
                      maxLength={FIELD_LIMITS.link}
                    />
                    <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                      <Upload className="h-3.5 w-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload("whoWeWork", "image", file, i);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Benefits (comma-separated)</label>
                  <input
                    type="text"
                    value={Array.isArray(item.benefits) ? item.benefits.join(", ") : ""}
                    onChange={(e) => update(i, { benefits: e.target.value.split(",").map((b) => b.trim()) })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.item}
                  />
                  <CharCount value={Array.isArray(item.benefits) ? item.benefits.join(", ") : ""} max={FIELD_LIMITS.item} />
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
                    maxLength={FIELD_LIMITS.label}
                  />
                  <CharCount value={item.value} max={FIELD_LIMITS.label} />
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
          <div className="space-y-6">
            {/* Main Section */}
            <div className="border-b border-slate-200 pb-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-700">Main Section</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    type="text"
                    value={sections.transformParking.title}
                    onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, title: e.target.value } })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.heading}
                  />
                  <CharCount value={sections.transformParking.title} max={FIELD_LIMITS.heading} />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={sections.transformParking.description}
                    onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, description: e.target.value } })}
                    className={inputClass}
                    rows={3}
                    maxLength={FIELD_LIMITS.description}
                  />
                  <CharCount value={sections.transformParking.description} max={FIELD_LIMITS.description} />
                </div>
              </div>
            </div>

            {/* Parking Partner */}
            <div className="border-b border-slate-200 pb-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-700">Parking Partner Card</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    type="text"
                    value={sections.transformParking.parkingPartnerTitle}
                    onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, parkingPartnerTitle: e.target.value } })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.heading}
                  />
                  <CharCount value={sections.transformParking.parkingPartnerTitle} max={FIELD_LIMITS.heading} />
                </div>
                <div>
                  <label className={labelClass}>Subtitle</label>
                  <input
                    type="text"
                    value={sections.transformParking.parkingPartnerSubtitle}
                    onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, parkingPartnerSubtitle: e.target.value } })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.subtitle}
                  />
                  <CharCount value={sections.transformParking.parkingPartnerSubtitle} max={FIELD_LIMITS.subtitle} />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={sections.transformParking.parkingPartnerDescription}
                    onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, parkingPartnerDescription: e.target.value } })}
                    className={inputClass}
                    rows={4}
                    maxLength={FIELD_LIMITS.long}
                  />
                  <CharCount value={sections.transformParking.parkingPartnerDescription} max={FIELD_LIMITS.long} />
                </div>
                <div>
                  <label className={labelClass}>Perks (comma-separated)</label>
                  <textarea
                    value={Array.isArray(sections.transformParking.parkingPartnerPerks) ? sections.transformParking.parkingPartnerPerks.join(", ") : ""}
                    onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, parkingPartnerPerks: e.target.value.split(",").map((p) => p.trim()) } })}
                    className={inputClass}
                    rows={4}
                    placeholder="Smart parking management dashboard, Digital payment integration, ..."
                    maxLength={FIELD_LIMITS.long}
                  />
                  <CharCount value={Array.isArray(sections.transformParking.parkingPartnerPerks) ? sections.transformParking.parkingPartnerPerks.join(", ") : ""} max={FIELD_LIMITS.long} />
                </div>
              </div>
            </div>

            {/* Service Partner */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-slate-700">Service Partner Card</h3>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    type="text"
                    value={sections.transformParking.servicePartnerTitle}
                    onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, servicePartnerTitle: e.target.value } })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.heading}
                  />
                  <CharCount value={sections.transformParking.servicePartnerTitle} max={FIELD_LIMITS.heading} />
                </div>
                <div>
                  <label className={labelClass}>Subtitle</label>
                  <input
                    type="text"
                    value={sections.transformParking.servicePartnerSubtitle}
                    onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, servicePartnerSubtitle: e.target.value } })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.subtitle}
                  />
                  <CharCount value={sections.transformParking.servicePartnerSubtitle} max={FIELD_LIMITS.subtitle} />
                </div>
                <div>
                  <label className={labelClass}>Description 1</label>
                  <textarea
                    value={sections.transformParking.servicePartnerDescription1}
                    onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, servicePartnerDescription1: e.target.value } })}
                    className={inputClass}
                    rows={3}
                    maxLength={FIELD_LIMITS.description}
                  />
                  <CharCount value={sections.transformParking.servicePartnerDescription1} max={FIELD_LIMITS.description} />
                </div>
                <div>
                  <label className={labelClass}>Description 2</label>
                  <textarea
                    value={sections.transformParking.servicePartnerDescription2}
                    onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, servicePartnerDescription2: e.target.value } })}
                    className={inputClass}
                    rows={3}
                    maxLength={FIELD_LIMITS.description}
                  />
                  <CharCount value={sections.transformParking.servicePartnerDescription2} max={FIELD_LIMITS.description} />
                </div>
                <div>
                  <label className={labelClass}>Partnership Opportunities (comma-separated)</label>
                  <textarea
                    value={Array.isArray(sections.transformParking.servicePartnerPerks) ? sections.transformParking.servicePartnerPerks.join(", ") : ""}
                    onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, servicePartnerPerks: e.target.value.split(",").map((p) => p.trim()) } })}
                    className={inputClass}
                    rows={4}
                    placeholder="Smart parking hardware, AI & automation systems, ..."
                    maxLength={FIELD_LIMITS.long}
                  />
                  <CharCount value={Array.isArray(sections.transformParking.servicePartnerPerks) ? sections.transformParking.servicePartnerPerks.join(", ") : ""} max={FIELD_LIMITS.long} />
                </div>
              </div>
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
              </div>
            )}
          />
        </CollapsibleSection>

        {/* 8.5. Partners Showcase */}
        <CollapsibleSection
          title="8.5. PartnersShowcase"
          isOpen={openSections.partnersShowcase}
          onToggle={() => toggleSection("partnersShowcase")}
        >
          <div className="space-y-6">
            <div className="space-y-4 border-b border-slate-200 pb-4">
              <div>
                <label className={labelClass}>Heading</label>
                <input
                  type="text"
                  value={sections.partnersShowcase.heading}
                  onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, heading: e.target.value } })}
                  className={inputClass}
                  placeholder="Helping you to correctly"
                  maxLength={FIELD_LIMITS.heading}
                />
                <CharCount value={sections.partnersShowcase.heading} max={FIELD_LIMITS.heading} />
              </div>
              <div>
                <label className={labelClass}>Heading Gradient (highlighted text)</label>
                <input
                  type="text"
                  value={sections.partnersShowcase.headingGradient}
                  onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, headingGradient: e.target.value } })}
                  className={inputClass}
                  placeholder="set-up, build,"
                  maxLength={FIELD_LIMITS.heading}
                />
                <CharCount value={sections.partnersShowcase.headingGradient} max={FIELD_LIMITS.heading} />
              </div>
              <div>
                <label className={labelClass}>Subheading</label>
                <input
                  type="text"
                  value={sections.partnersShowcase.subheading}
                  onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, subheading: e.target.value } })}
                  className={inputClass}
                  placeholder="and protect your brand and business"
                  maxLength={FIELD_LIMITS.subtitle}
                />
                <CharCount value={sections.partnersShowcase.subheading} max={FIELD_LIMITS.subtitle} />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={sections.partnersShowcase.description}
                  onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, description: e.target.value } })}
                  className={inputClass}
                  rows={4}
                  placeholder="Description text..."
                  maxLength={FIELD_LIMITS.description}
                />
                <CharCount value={sections.partnersShowcase.description} max={FIELD_LIMITS.description} />
              </div>
            </div>

            {/* Stats */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Stats ({sections.partnersShowcase.stats?.length ?? 0})</h3>
                <button
                  onClick={() => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, stats: [...(sections.partnersShowcase.stats ?? []), { value: "0", label: "New Stat" }] } })}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Stat
                </button>
              </div>
              <div className="space-y-2">
                {(sections.partnersShowcase.stats ?? []).map((stat, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <input
                      value={stat.value}
                      onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, stats: sections.partnersShowcase.stats.map((s, idx) => idx === i ? { ...s, value: e.target.value } : s) } })}
                      className={inputClass}
                      placeholder="Value (e.g., 5th, 95%)"
                      maxLength={FIELD_LIMITS.label}
                    />
                    <input
                      value={stat.label}
                      onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, stats: sections.partnersShowcase.stats.map((s, idx) => idx === i ? { ...s, label: e.target.value } : s) } })}
                      className={inputClass}
                      placeholder="Label"
                      maxLength={FIELD_LIMITS.label}
                    />
                    <button
                      onClick={() => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, stats: sections.partnersShowcase.stats.filter((_, idx) => idx !== i) } })}
                      className="text-red-600 hover:bg-red-50 p-2 rounded transition shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-200 pt-4">
              <div>
                <label className={labelClass}>Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sections.partnersShowcase.image}
                    onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, image: e.target.value } })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.link}
                  />
                  <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload("partnersShowcase", "image", file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className={labelClass}>CTA Label</label>
                <input
                  type="text"
                  value={sections.partnersShowcase.ctaLabel}
                  onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ctaLabel: e.target.value } })}
                  className={inputClass}
                  placeholder="Get Started"
                  maxLength={FIELD_LIMITS.button}
                />
                <CharCount value={sections.partnersShowcase.ctaLabel} max={FIELD_LIMITS.button} />
              </div>
            </div>

            {/* Partners Carousel Section */}
            <div className="space-y-4 border-t border-slate-200 pt-4">
              <h3 className="text-sm font-semibold text-slate-700">Partners Carousel</h3>
              <div>
                <label className={labelClass}>Carousel Heading</label>
                <input
                  type="text"
                  value={sections.partnersShowcase.partners?.heading || ""}
                  onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, partners: { ...sections.partnersShowcase.partners, heading: e.target.value } } })}
                  className={inputClass}
                  placeholder="Trusted by Industry Leaders"
                  maxLength={FIELD_LIMITS.heading}
                />
                <CharCount value={sections.partnersShowcase.partners?.heading || ""} max={FIELD_LIMITS.heading} />
              </div>
              <div>
                <label className={labelClass}>Carousel Subheading</label>
                <input
                  type="text"
                  value={sections.partnersShowcase.partners?.subheading || ""}
                  onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, partners: { ...sections.partnersShowcase.partners, subheading: e.target.value } } })}
                  className={inputClass}
                  placeholder="Work with some of the most recognized brands..."
                  maxLength={FIELD_LIMITS.subtitle}
                />
                <CharCount value={sections.partnersShowcase.partners?.subheading || ""} max={FIELD_LIMITS.subtitle} />
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-slate-700 mb-4">Row 1 Partners ({sections.partnersShowcase.partners?.row1?.length ?? 0})</p>
                <div className="space-y-2">
                  {(sections.partnersShowcase.partners?.row1 ?? []).map((partner, i) => (
                    <div key={i} className="flex gap-2 items-end">
                      <input
                        value={partner.name}
                        onChange={(e) => {
                          const updated = [...sections.partnersShowcase.partners.row1];
                          updated[i].name = e.target.value;
                          setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, partners: { ...sections.partnersShowcase.partners, row1: updated } } });
                        }}
                        className={inputClass}
                        placeholder="Company Name"
                        maxLength={FIELD_LIMITS.label}
                      />
                      <input
                        value={partner.industry}
                        onChange={(e) => {
                          const updated = [...sections.partnersShowcase.partners.row1];
                          updated[i].industry = e.target.value;
                          setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, partners: { ...sections.partnersShowcase.partners, row1: updated } } });
                        }}
                        className={inputClass}
                        placeholder="Industry"
                        maxLength={FIELD_LIMITS.label}
                      />
                      <input
                        value={partner.initials}
                        onChange={(e) => {
                          const updated = [...sections.partnersShowcase.partners.row1];
                          updated[i].initials = e.target.value;
                          setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, partners: { ...sections.partnersShowcase.partners, row1: updated } } });
                        }}
                        className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15"
                        placeholder="Initials"
                        maxLength="2"
                      />
                      <input
                        type="color"
                        value={partner.color}
                        onChange={(e) => {
                          const updated = [...sections.partnersShowcase.partners.row1];
                          updated[i].color = e.target.value;
                          setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, partners: { ...sections.partnersShowcase.partners, row1: updated } } });
                        }}
                        className="w-16 h-10 rounded-lg cursor-pointer shrink-0"
                      />
                      <button
                        onClick={() => {
                          const updated = sections.partnersShowcase.partners.row1.filter((_, idx) => idx !== i);
                          setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, partners: { ...sections.partnersShowcase.partners, row1: updated } } });
                        }}
                        className="text-red-600 hover:bg-red-50 p-2 rounded transition shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const newPartner = { name: "New Partner", industry: "Industry", initials: "NP", color: "#0088FF" };
                    setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, partners: { ...sections.partnersShowcase.partners, row1: [...(sections.partnersShowcase.partners?.row1 ?? []), newPartner] } } });
                  }}
                  className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Partner
                </button>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-slate-700 mb-4">Row 2 Partners ({sections.partnersShowcase.partners?.row2?.length ?? 0})</p>
                <div className="space-y-2">
                  {(sections.partnersShowcase.partners?.row2 ?? []).map((partner, i) => (
                    <div key={i} className="flex gap-2 items-end">
                      <input
                        value={partner.name}
                        onChange={(e) => {
                          const updated = [...sections.partnersShowcase.partners.row2];
                          updated[i].name = e.target.value;
                          setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, partners: { ...sections.partnersShowcase.partners, row2: updated } } });
                        }}
                        className={inputClass}
                        placeholder="Company Name"
                        maxLength={FIELD_LIMITS.label}
                      />
                      <input
                        value={partner.industry}
                        onChange={(e) => {
                          const updated = [...sections.partnersShowcase.partners.row2];
                          updated[i].industry = e.target.value;
                          setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, partners: { ...sections.partnersShowcase.partners, row2: updated } } });
                        }}
                        className={inputClass}
                        placeholder="Industry"
                        maxLength={FIELD_LIMITS.label}
                      />
                      <input
                        value={partner.initials}
                        onChange={(e) => {
                          const updated = [...sections.partnersShowcase.partners.row2];
                          updated[i].initials = e.target.value;
                          setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, partners: { ...sections.partnersShowcase.partners, row2: updated } } });
                        }}
                        className="w-20 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15"
                        placeholder="Initials"
                        maxLength="2"
                      />
                      <input
                        type="color"
                        value={partner.color}
                        onChange={(e) => {
                          const updated = [...sections.partnersShowcase.partners.row2];
                          updated[i].color = e.target.value;
                          setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, partners: { ...sections.partnersShowcase.partners, row2: updated } } });
                        }}
                        className="w-16 h-10 rounded-lg cursor-pointer shrink-0"
                      />
                      <button
                        onClick={() => {
                          const updated = sections.partnersShowcase.partners.row2.filter((_, idx) => idx !== i);
                          setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, partners: { ...sections.partnersShowcase.partners, row2: updated } } });
                        }}
                        className="text-red-600 hover:bg-red-50 p-2 rounded transition shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const newPartner = { name: "New Partner", industry: "Industry", initials: "NP", color: "#0088FF" };
                    setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, partners: { ...sections.partnersShowcase.partners, row2: [...(sections.partnersShowcase.partners?.row2 ?? []), newPartner] } } });
                  }}
                  className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Partner
                </button>
              </div>
            </div>

            {/* CTA Section */}
            <div className="space-y-4 border-t border-slate-200 pt-4">
              <h3 className="text-sm font-semibold text-slate-700">CTA Section</h3>
              <div>
                <label className={labelClass}>CTA Title</label>
                <input
                  type="text"
                  value={sections.partnersShowcase.ctaSection?.title || ""}
                  onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ctaSection: { ...sections.partnersShowcase.ctaSection, title: e.target.value } } })}
                  className={inputClass}
                  placeholder="Ready to Partner with HalaPark?"
                  maxLength={FIELD_LIMITS.heading}
                />
                <CharCount value={sections.partnersShowcase.ctaSection?.title || ""} max={FIELD_LIMITS.heading} />
              </div>
              <div>
                <label className={labelClass}>CTA Description</label>
                <textarea
                  value={sections.partnersShowcase.ctaSection?.description || ""}
                  onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ctaSection: { ...sections.partnersShowcase.ctaSection, description: e.target.value } } })}
                  className={inputClass}
                  rows={3}
                  placeholder="Join our growing network..."
                  maxLength={FIELD_LIMITS.description}
                />
                <CharCount value={sections.partnersShowcase.ctaSection?.description || ""} max={FIELD_LIMITS.description} />
              </div>
              <div>
                <label className={labelClass}>CTA Section Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sections.partnersShowcase.ctaSection?.image || ""}
                    onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ctaSection: { ...sections.partnersShowcase.ctaSection, image: e.target.value } } })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.link}
                  />
                  <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                    <Upload className="h-3.5 w-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadProgress((prev) => ({ ...prev, "partnersShowcase-ctaSection-image": 0 }));
                          uploadMediaToCloudinary(file, (progress) => {
                            setUploadProgress((prev) => ({ ...prev, "partnersShowcase-ctaSection-image": progress }));
                          }).then((url) => {
                            setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ctaSection: { ...sections.partnersShowcase.ctaSection, image: url } } });
                            setUploadProgress((prev) => ({ ...prev, "partnersShowcase-ctaSection-image": null }));
                          }).catch(() => {
                            setUploadProgress((prev) => ({ ...prev, "partnersShowcase-ctaSection-image": null }));
                          });
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* 8.6 Value Props */}
        <CollapsibleSection
          title="8.6. ValueProps"
          isOpen={openSections.valueProps}
          onToggle={() => toggleSection("valueProps")}
        >
          <div className="mb-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div>
              <label className={labelClass}>Eyebrow (small label)</label>
              <input
                type="text"
                value={sections.valueProps?.eyebrow ?? ""}
                onChange={(e) => setSections({ ...sections, valueProps: { ...sections.valueProps, eyebrow: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.label}
                placeholder="How It Works"
              />
              <CharCount value={sections.valueProps?.eyebrow ?? ""} max={FIELD_LIMITS.label} />
            </div>
            <div>
              <label className={labelClass}>Heading</label>
              <input
                type="text"
                value={sections.valueProps?.heading ?? ""}
                onChange={(e) => setSections({ ...sections, valueProps: { ...sections.valueProps, heading: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
                placeholder="Why Businesses Choose HalaPark"
              />
              <CharCount value={sections.valueProps?.heading ?? ""} max={FIELD_LIMITS.heading} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={sections.valueProps?.description ?? ""}
                onChange={(e) => setSections({ ...sections, valueProps: { ...sections.valueProps, description: e.target.value } })}
                className={inputClass}
                rows={2}
                maxLength={FIELD_LIMITS.description}
              />
              <CharCount value={sections.valueProps?.description ?? ""} max={FIELD_LIMITS.description} />
            </div>
          </div>
          <ArrayItemEditor
            items={sections.valueProps?.items ?? []}
            onItemsChange={(items) => setSections({ ...sections, valueProps: { ...sections.valueProps, items } })}
            title="Value Card"
            addButtonText="Add Card"
            defaultItem={{ title: "New Card", description: "" }}
            renderItem={(item, i, update) => (
              <div className="space-y-3">
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
                  <textarea
                    value={item.description ?? ""}
                    onChange={(e) => update(i, { description: e.target.value })}
                    className={inputClass}
                    rows={2}
                    maxLength={FIELD_LIMITS.description}
                  />
                  <CharCount value={item.description ?? ""} max={FIELD_LIMITS.description} />
                </div>
              </div>
            )}
          />
        </CollapsibleSection>

        {/* 8.7 Who It's For */}
        <CollapsibleSection
          title="8.7. WhoItsFor"
          isOpen={openSections.whoItsFor}
          onToggle={() => toggleSection("whoItsFor")}
        >
          <div className="mb-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div>
              <label className={labelClass}>Heading</label>
              <input
                type="text"
                value={sections.whoItsFor?.heading ?? ""}
                onChange={(e) => setSections({ ...sections, whoItsFor: { ...sections.whoItsFor, heading: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
                placeholder="Who It's For"
              />
              <CharCount value={sections.whoItsFor?.heading ?? ""} max={FIELD_LIMITS.heading} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={sections.whoItsFor?.description ?? ""}
                onChange={(e) => setSections({ ...sections, whoItsFor: { ...sections.whoItsFor, description: e.target.value } })}
                className={inputClass}
                rows={3}
                maxLength={FIELD_LIMITS.description}
              />
              <CharCount value={sections.whoItsFor?.description ?? ""} max={FIELD_LIMITS.description} />
            </div>
          </div>
          <ArrayItemEditor
            items={sections.whoItsFor?.items ?? []}
            onItemsChange={(items) => setSections({ ...sections, whoItsFor: { ...sections.whoItsFor, items } })}
            title="Segment"
            addButtonText="Add Segment"
            defaultItem={{ title: "New Segment" }}
            renderItem={(item, i, update) => (
              <div>
                <label className={labelClass}>Title</label>
                <input
                  type="text"
                  value={item.title ?? ""}
                  onChange={(e) => update(i, { title: e.target.value })}
                  className={inputClass}
                  maxLength={FIELD_LIMITS.item}
                />
                <CharCount value={item.title ?? ""} max={FIELD_LIMITS.item} />
              </div>
            )}
          />
        </CollapsibleSection>

        {/* 8.8 How To Get Started */}
        <CollapsibleSection
          title="8.8. HowToGetStarted"
          isOpen={openSections.howToGetStarted}
          onToggle={() => toggleSection("howToGetStarted")}
        >
          <div className="mb-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div>
              <label className={labelClass}>Eyebrow (small label)</label>
              <input
                type="text"
                value={sections.howToGetStarted?.eyebrow ?? ""}
                onChange={(e) => setSections({ ...sections, howToGetStarted: { ...sections.howToGetStarted, eyebrow: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.label}
                placeholder="How It Works"
              />
              <CharCount value={sections.howToGetStarted?.eyebrow ?? ""} max={FIELD_LIMITS.label} />
            </div>
            <div>
              <label className={labelClass}>Heading</label>
              <input
                type="text"
                value={sections.howToGetStarted?.heading ?? ""}
                onChange={(e) => setSections({ ...sections, howToGetStarted: { ...sections.howToGetStarted, heading: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
                placeholder="How to Get Started"
              />
              <CharCount value={sections.howToGetStarted?.heading ?? ""} max={FIELD_LIMITS.heading} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={sections.howToGetStarted?.description ?? ""}
                onChange={(e) => setSections({ ...sections, howToGetStarted: { ...sections.howToGetStarted, description: e.target.value } })}
                className={inputClass}
                rows={2}
                maxLength={FIELD_LIMITS.description}
              />
              <CharCount value={sections.howToGetStarted?.description ?? ""} max={FIELD_LIMITS.description} />
            </div>
          </div>
          <ArrayItemEditor
            items={sections.howToGetStarted?.steps ?? []}
            onItemsChange={(steps) => setSections({ ...sections, howToGetStarted: { ...sections.howToGetStarted, steps } })}
            title="Step"
            addButtonText="Add Step"
            defaultItem={{ title: "New Step", description: "" }}
            renderItem={(item, i, update) => (
              <div className="space-y-3">
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
                  <label className={labelClass}>Description (optional)</label>
                  <textarea
                    value={item.description ?? ""}
                    onChange={(e) => update(i, { description: e.target.value })}
                    className={inputClass}
                    rows={2}
                    maxLength={FIELD_LIMITS.description}
                  />
                  <CharCount value={item.description ?? ""} max={FIELD_LIMITS.description} />
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
              <label className={labelClass}>Heading (first part)</label>
              <input
                type="text"
                value={sections.cta.heading ?? sections.cta.title ?? ""}
                onChange={(e) => setSections({ ...sections, cta: { ...sections.cta, heading: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
                placeholder="Start a Smart Parking Business with"
              />
              <CharCount value={sections.cta.heading ?? sections.cta.title ?? ""} max={FIELD_LIMITS.heading} />
            </div>
            <div>
              <label className={labelClass}>Heading Accent (gradient part)</label>
              <input
                type="text"
                value={sections.cta.headingAccent ?? ""}
                onChange={(e) => setSections({ ...sections, cta: { ...sections.cta, headingAccent: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
                placeholder="No Upfront Investment"
              />
              <CharCount value={sections.cta.headingAccent ?? ""} max={FIELD_LIMITS.heading} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={sections.cta.description}
                onChange={(e) => setSections({ ...sections, cta: { ...sections.cta, description: e.target.value } })}
                className={inputClass}
                rows={3}
                maxLength={FIELD_LIMITS.description}
              />
              <CharCount value={sections.cta.description} max={FIELD_LIMITS.description} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Button Label</label>
                <input
                  type="text"
                  value={sections.cta.ctaLabel ?? ""}
                  onChange={(e) => setSections({ ...sections, cta: { ...sections.cta, ctaLabel: e.target.value } })}
                  className={inputClass}
                  maxLength={FIELD_LIMITS.button}
                  placeholder="Book a Free Consultation"
                />
                <CharCount value={sections.cta.ctaLabel ?? ""} max={FIELD_LIMITS.button} />
              </div>
              <div>
                <label className={labelClass}>Button Link</label>
                <input
                  type="text"
                  value={sections.cta.ctaLink ?? ""}
                  onChange={(e) => setSections({ ...sections, cta: { ...sections.cta, ctaLink: e.target.value } })}
                  className={inputClass}
                  maxLength={FIELD_LIMITS.link}
                  placeholder="/contact"
                />
                <CharCount value={sections.cta.ctaLink ?? ""} max={FIELD_LIMITS.link} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Background Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sections.cta.image}
                  onChange={(e) => setSections({ ...sections, cta: { ...sections.cta, image: e.target.value } })}
                  className={inputClass}
                  maxLength={FIELD_LIMITS.link}
                />
                <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload("cta", "image", file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
