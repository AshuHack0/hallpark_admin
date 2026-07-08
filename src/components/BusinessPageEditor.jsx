import { useState, useEffect } from "react";
import { Save, Loader2, Plus, Trash2, ChevronDown, Upload } from "lucide-react";
import { api, uploadMediaToCloudinary } from "../lib/api";
import { FIELD_LIMITS, CharCount, FieldError, ArInput } from "./CappedField";
import { validateUrl, validateImageFile } from "../lib/validators";

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
    image: "",
    colorFrom: "#0088FF",
    colorTo: "#0066CC",
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

// "Show this section on the website" toggle. Writes `enabled` on the section
// object; the website hides a section only when enabled === false.
/* eslint-disable-next-line react/prop-types */
function EnabledToggle({ enabled, onChange }) {
  return (
    <label className="mt-4 mb-2 flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
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
          const dbSections = data.page.sections;
          setSections((prev) => ({
            ...prev,
            ...dbSections,
            // The DB is the single source of truth for these card arrays. Once
            // the page has ever been saved, honour the stored array EXACTLY
            // (including an empty one) so deleted cards never resurface from the
            // built-in defaults.
            solutions: Array.isArray(dbSections.solutions) ? dbSections.solutions : [],
            whyChoose: Array.isArray(dbSections.whyChoose) ? dbSections.whyChoose : [],
          }));
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

  // "Show this section on the website" — writes `enabled` on the given section
  // (or its companion header object for array-based sections).
  const setSectionEnabled = (key, nextEnabled) => {
    setSections((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? {}), enabled: nextEnabled },
    }));
  };

  async function handleImageUpload(section, field, file, itemIndex = null) {
    const validationError = validateImageFile(file);
    if (validationError) { setError(validationError); return; }
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
          <EnabledToggle enabled={sections.hero?.enabled} onChange={(v) => setSectionEnabled("hero", v)} />
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
              <ArInput label="Title" kind="heading" value={sections.hero.ar?.title} onChange={(v) => setSections({ ...sections, hero: { ...sections.hero, ar: { ...(sections.hero.ar ?? {}), title: v } } })} multiline={false} />
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
              <label className={labelClass}>Checklist Items (comma-separated)</label>
              <input
                value={Array.isArray(sections.hero?.features) ? sections.hero.features.join(", ") : ""}
                onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, features: e.target.value.split(",").map((x) => x.trim()) } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.long}
              />
              <label className={labelClass} style={{ marginTop: 6 }}>Checklist Items — Arabic (comma-separated, same order)</label>
              <input dir="rtl"
                value={Array.isArray(sections.hero?.ar?.features) ? sections.hero.ar.features.join("، ") : ""}
                onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, ar: { ...(sections.hero?.ar ?? {}), features: e.target.value.split(/،|,/).map((x) => x.trim()) } } })}
                className={inputClass} style={{ borderColor: "#16a34a" }} maxLength={FIELD_LIMITS.long}
              />
            </div>
            <div>
              <label className={labelClass}>Primary Button (Get Proposal)</label>
              <input
                value={sections.hero?.ctaPrimary ?? ""}
                onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, ctaPrimary: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.button}
                placeholder="Get Proposal"
              />
              <CharCount value={sections.hero?.ctaPrimary ?? ""} max={FIELD_LIMITS.button} />
              <ArInput label="Cta Primary" kind="button" value={sections.hero?.ar?.ctaPrimary} onChange={(v) => setSections({ ...sections, hero: { ...sections.hero, ar: { ...(sections.hero?.ar ?? {}), ctaPrimary: v } } })} />
            </div>
            <div>
              <label className={labelClass}>Secondary Button (Book a Free Consultation)</label>
              <input
                value={sections.hero?.ctaSecondary ?? ""}
                onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, ctaSecondary: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.button}
                placeholder="Book a Free Consultation"
              />
              <CharCount value={sections.hero?.ctaSecondary ?? ""} max={FIELD_LIMITS.button} />
              <ArInput label="Cta Secondary" kind="button" value={sections.hero?.ar?.ctaSecondary} onChange={(v) => setSections({ ...sections, hero: { ...sections.hero, ar: { ...(sections.hero?.ar ?? {}), ctaSecondary: v } } })} />
            </div>
          </div>
        </CollapsibleSection>

        {/* 2. Built For Every Space */}
        <CollapsibleSection
          title="2. BuiltForEverySpace"
          isOpen={openSections.builtForSpace}
          onToggle={() => toggleSection("builtForSpace")}
        >
          <EnabledToggle enabled={sections.builtForSpace?.enabled} onChange={(v) => setSectionEnabled("builtForSpace", v)} />
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
              <ArInput label="Title" kind="heading" value={sections.builtForSpace.ar?.title} onChange={(v) => setSections({ ...sections, builtForSpace: { ...sections.builtForSpace, ar: { ...(sections.builtForSpace.ar ?? {}), title: v } } })} multiline={false} />
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
              <ArInput label="Description" kind="description" value={sections.builtForSpace.ar?.description} onChange={(v) => setSections({ ...sections, builtForSpace: { ...sections.builtForSpace, ar: { ...(sections.builtForSpace.ar ?? {}), description: v } } })} multiline={true} />
            </div>
          </div>
        </CollapsibleSection>

        {/* 3. Why Choose HalaPark */}
        <CollapsibleSection
          title="3. WhyChooseHalaPark"
          isOpen={openSections.whyChoose}
          onToggle={() => toggleSection("whyChoose")}
        >
          <EnabledToggle enabled={sections.whyChooseHeader?.enabled} onChange={(v) => setSectionEnabled("whyChooseHeader", v)} />
          <div className="mb-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Section Header</p>
            <div>
              <label className={labelClass}>Heading (first part)</label>
              <input
                value={sections.whyChooseHeader?.heading ?? ""}
                onChange={(e) => setSections({ ...sections, whyChooseHeader: { ...sections.whyChooseHeader, heading: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
                placeholder="..."
              />
              <CharCount value={sections.whyChooseHeader?.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={sections.whyChooseHeader?.ar?.heading} onChange={(v) => setSections({ ...sections, whyChooseHeader: { ...sections.whyChooseHeader, ar: { ...(sections.whyChooseHeader?.ar ?? {}), heading: v } } })} />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient (highlighted word)</label>
              <input
                value={sections.whyChooseHeader?.headingGradient ?? ""}
                onChange={(e) => setSections({ ...sections, whyChooseHeader: { ...sections.whyChooseHeader, headingGradient: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.label}
                placeholder="..."
              />
              <CharCount value={sections.whyChooseHeader?.headingGradient ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Heading Gradient" kind="label" value={sections.whyChooseHeader?.ar?.headingGradient} onChange={(v) => setSections({ ...sections, whyChooseHeader: { ...sections.whyChooseHeader, ar: { ...(sections.whyChooseHeader?.ar ?? {}), headingGradient: v } } })} />
            </div>
            <div>
              <label className={labelClass}>Card Eyebrow (e.g. Smart Solutions)</label>
              <input
                value={sections.whyChooseHeader?.cardEyebrow ?? ""}
                onChange={(e) => setSections({ ...sections, whyChooseHeader: { ...sections.whyChooseHeader, cardEyebrow: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.label}
                placeholder="Smart Solutions"
              />
              <CharCount value={sections.whyChooseHeader?.cardEyebrow ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Card Eyebrow" kind="label" value={sections.whyChooseHeader?.ar?.cardEyebrow} onChange={(v) => setSections({ ...sections, whyChooseHeader: { ...sections.whyChooseHeader, ar: { ...(sections.whyChooseHeader?.ar ?? {}), cardEyebrow: v } } })} />
            </div>
          </div>
          <ArrayItemEditor
            items={sections.whyChoose}
            onItemsChange={(items) => setSections({ ...sections, whyChoose: items })}
            title="Reason Card"
            addButtonText="Add Reason"
            defaultItem={{
              title: "New Reason",
              description: "Description here",
              image: "",
              colorFrom: "#0088FF",
              colorTo: "#0066CC",
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
                  <ArInput label="Title" kind="heading" value={item.ar?.title} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), title: v } })} multiline={false} />
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
                  <label className={labelClass}>Card Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.image ?? ""}
                      onChange={(e) => update(i, { image: e.target.value })}
                      className={inputClass}
                      placeholder="Image URL or /path (leave blank to use the color gradient)"
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
                          if (file) handleImageUpload("whyChoose", "image", file, i);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  <FieldError error={validateUrl(item.image ?? "")} />
                  <p className="mt-1 text-[11px] text-slate-400">Shown on the left side of the card. If left blank, the gradient colors below are used instead.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Gradient Color — From</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={item.colorFrom || "#0088FF"} onChange={(e) => update(i, { colorFrom: e.target.value })} className="h-10 w-16 shrink-0 cursor-pointer rounded-lg" />
                      <input type="text" value={item.colorFrom ?? ""} onChange={(e) => update(i, { colorFrom: e.target.value })} className={inputClass} placeholder="#0088FF" maxLength="9" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Gradient Color — To</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={item.colorTo || "#0066CC"} onChange={(e) => update(i, { colorTo: e.target.value })} className="h-10 w-16 shrink-0 cursor-pointer rounded-lg" />
                      <input type="text" value={item.colorTo ?? ""} onChange={(e) => update(i, { colorTo: e.target.value })} className={inputClass} placeholder="#0066CC" maxLength="9" />
                    </div>
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
          <EnabledToggle enabled={sections.solutionsHeader?.enabled} onChange={(v) => setSectionEnabled("solutionsHeader", v)} />
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
              <ArInput label="Heading" kind="heading" value={sections.solutionsHeader?.ar?.heading} onChange={(v) => setSections({ ...sections, solutionsHeader: { ...sections.solutionsHeader, ar: { ...(sections.solutionsHeader?.ar ?? {}), heading: v } } })} multiline={false} />
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
              <ArInput label="Heading Accent" kind="label" value={sections.solutionsHeader?.ar?.headingAccent} onChange={(v) => setSections({ ...sections, solutionsHeader: { ...sections.solutionsHeader, ar: { ...(sections.solutionsHeader?.ar ?? {}), headingAccent: v } } })} multiline={false} />
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
              <ArInput label="Description" kind="description" value={sections.solutionsHeader?.ar?.description} onChange={(v) => setSections({ ...sections, solutionsHeader: { ...sections.solutionsHeader, ar: { ...(sections.solutionsHeader?.ar ?? {}), description: v } } })} multiline={true} />
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
              <ArInput label="Description2" kind="description" value={sections.solutionsHeader?.ar?.description2} onChange={(v) => setSections({ ...sections, solutionsHeader: { ...sections.solutionsHeader, ar: { ...(sections.solutionsHeader?.ar ?? {}), description2: v } } })} multiline={true} />
            </div>
            <div>
              <label className={labelClass}>CTA Button (Explore All Solutions)</label>
              <input
                value={sections.solutionsHeader?.ctaLabel ?? ""}
                onChange={(e) => setSections({ ...sections, solutionsHeader: { ...sections.solutionsHeader, ctaLabel: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.button}
                placeholder="Explore All Solutions"
              />
              <CharCount value={sections.solutionsHeader?.ctaLabel ?? ""} max={FIELD_LIMITS.button} />
              <ArInput label="CTA Label" kind="button" value={sections.solutionsHeader?.ar?.ctaLabel} onChange={(v) => setSections({ ...sections, solutionsHeader: { ...sections.solutionsHeader, ar: { ...(sections.solutionsHeader?.ar ?? {}), ctaLabel: v } } })} />
            </div>
            <div>
              <label className={labelClass}>CTA Button Link</label>
              <input
                value={sections.solutionsHeader?.ctaLink ?? ""}
                onChange={(e) => setSections({ ...sections, solutionsHeader: { ...sections.solutionsHeader, ctaLink: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.link}
                placeholder="/solutions"
              />
              <p className="mt-1 text-[11px] text-slate-400">Where the &quot;Explore&quot; button goes (page path or full URL). Default: /solutions</p>
              <FieldError error={validateUrl(sections.solutionsHeader?.ctaLink ?? "")} />
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
              link: "",
              color: "#0088FF",
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
                  <ArInput label="Title" kind="heading" value={item.ar?.title} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), title: v } })} multiline={false} />
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
                    <FieldError error={validateUrl(item.image)} />
                  </div>
                  <div>
                    <label className={labelClass}>Icon (emoji)</label>
                    <input
                      type="text"
                      value={item.icon ?? ""}
                      onChange={(e) => update(i, { icon: e.target.value })}
                      className={inputClass}
                      placeholder="🅿️"
                      maxLength="4"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">Shown as a badge on the card image. Paste any emoji (e.g. 🅿️ 🏠 🏢 🛍️ 🤖 ⚡).</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Link (redirect on click)</label>
                    <input
                      type="text"
                      value={item.link ?? ""}
                      onChange={(e) => update(i, { link: e.target.value })}
                      className={inputClass}
                      maxLength={FIELD_LIMITS.link}
                      placeholder="/solutions/smart-public-parking"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">Page path or URL the card opens. Leave blank to make the card non-clickable.</p>
                    <FieldError error={validateUrl(item.link ?? "")} />
                  </div>
                  <div>
                    <label className={labelClass}>Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={item.color || "#0088FF"}
                        onChange={(e) => update(i, { color: e.target.value })}
                        className="h-10 w-16 shrink-0 cursor-pointer rounded-lg"
                      />
                      <input
                        type="text"
                        value={item.color ?? ""}
                        onChange={(e) => update(i, { color: e.target.value })}
                        className={inputClass}
                        placeholder="#0088FF"
                        maxLength="9"
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">Card accent (icon badge, hover glow, underline).</p>
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
          <EnabledToggle enabled={sections.whoWeWorkHeader?.enabled} onChange={(v) => setSectionEnabled("whoWeWorkHeader", v)} />
          <div className="mb-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Section Header</p>
            <div>
              <label className={labelClass}>Heading (first part)</label>
              <input
                value={sections.whoWeWorkHeader?.heading ?? ""}
                onChange={(e) => setSections({ ...sections, whoWeWorkHeader: { ...sections.whoWeWorkHeader, heading: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
                placeholder="..."
              />
              <CharCount value={sections.whoWeWorkHeader?.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={sections.whoWeWorkHeader?.ar?.heading} onChange={(v) => setSections({ ...sections, whoWeWorkHeader: { ...sections.whoWeWorkHeader, ar: { ...(sections.whoWeWorkHeader?.ar ?? {}), heading: v } } })} />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient</label>
              <input
                value={sections.whoWeWorkHeader?.headingGradient ?? ""}
                onChange={(e) => setSections({ ...sections, whoWeWorkHeader: { ...sections.whoWeWorkHeader, headingGradient: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.label}
                placeholder="..."
              />
              <CharCount value={sections.whoWeWorkHeader?.headingGradient ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Heading Gradient" kind="label" value={sections.whoWeWorkHeader?.ar?.headingGradient} onChange={(v) => setSections({ ...sections, whoWeWorkHeader: { ...sections.whoWeWorkHeader, ar: { ...(sections.whoWeWorkHeader?.ar ?? {}), headingGradient: v } } })} />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <input
                value={sections.whoWeWorkHeader?.subtitle ?? ""}
                onChange={(e) => setSections({ ...sections, whoWeWorkHeader: { ...sections.whoWeWorkHeader, subtitle: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.subtitle}
                placeholder="..."
              />
              <CharCount value={sections.whoWeWorkHeader?.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
              <ArInput label="Subtitle" kind="subtitle" value={sections.whoWeWorkHeader?.ar?.subtitle} onChange={(v) => setSections({ ...sections, whoWeWorkHeader: { ...sections.whoWeWorkHeader, ar: { ...(sections.whoWeWorkHeader?.ar ?? {}), subtitle: v } } })} />
            </div>
            <div>
              <label className={labelClass}>Category Label</label>
              <input
                value={sections.whoWeWorkHeader?.categoryLabel ?? ""}
                onChange={(e) => setSections({ ...sections, whoWeWorkHeader: { ...sections.whoWeWorkHeader, categoryLabel: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.label}
                placeholder="..."
              />
              <CharCount value={sections.whoWeWorkHeader?.categoryLabel ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Category Label" kind="label" value={sections.whoWeWorkHeader?.ar?.categoryLabel} onChange={(v) => setSections({ ...sections, whoWeWorkHeader: { ...sections.whoWeWorkHeader, ar: { ...(sections.whoWeWorkHeader?.ar ?? {}), categoryLabel: v } } })} />
            </div>
            <div>
              <label className={labelClass}>Benefits Label (Key Benefits)</label>
              <input
                value={sections.whoWeWorkHeader?.benefitsLabel ?? ""}
                onChange={(e) => setSections({ ...sections, whoWeWorkHeader: { ...sections.whoWeWorkHeader, benefitsLabel: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.label}
                placeholder="Key Benefits"
              />
              <CharCount value={sections.whoWeWorkHeader?.benefitsLabel ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Benefits Label" kind="label" value={sections.whoWeWorkHeader?.ar?.benefitsLabel} onChange={(v) => setSections({ ...sections, whoWeWorkHeader: { ...sections.whoWeWorkHeader, ar: { ...(sections.whoWeWorkHeader?.ar ?? {}), benefitsLabel: v } } })} />
            </div>
            <div>
              <label className={labelClass}>Learn More Button</label>
              <input
                value={sections.whoWeWorkHeader?.ctaLabel ?? ""}
                onChange={(e) => setSections({ ...sections, whoWeWorkHeader: { ...sections.whoWeWorkHeader, ctaLabel: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.button}
                placeholder="Learn More"
              />
              <CharCount value={sections.whoWeWorkHeader?.ctaLabel ?? ""} max={FIELD_LIMITS.button} />
              <ArInput label="CTA Label" kind="button" value={sections.whoWeWorkHeader?.ar?.ctaLabel} onChange={(v) => setSections({ ...sections, whoWeWorkHeader: { ...sections.whoWeWorkHeader, ar: { ...(sections.whoWeWorkHeader?.ar ?? {}), ctaLabel: v } } })} />
            </div>
          </div>
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
                  <ArInput label="Title" kind="heading" value={item.ar?.title} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), title: v } })} multiline={false} />
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
                  <FieldError error={validateUrl(item.image)} />
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

        {/* 7. Transform Parking */}
        <CollapsibleSection
          title="7. TransformParking"
          isOpen={openSections.transformParking}
          onToggle={() => toggleSection("transformParking")}
        >
          <EnabledToggle enabled={sections.transformParking?.enabled} onChange={(v) => setSectionEnabled("transformParking", v)} />
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
                  <ArInput label="Title" kind="heading" value={sections.transformParking.ar?.title} onChange={(v) => setSections({ ...sections, transformParking: { ...sections.transformParking, ar: { ...(sections.transformParking.ar ?? {}), title: v } } })} multiline={false} />
                </div>
                <div>
                  <label className={labelClass}>Title Accent (gradient part — must be the end of the title)</label>
                  <input
                    type="text"
                    value={sections.transformParking.titleAccent ?? ""}
                    onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, titleAccent: e.target.value } })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.label}
                    placeholder="Parking Business?"
                  />
                  <CharCount value={sections.transformParking.titleAccent ?? ""} max={FIELD_LIMITS.label} />
                  <ArInput label="Title Accent" kind="label" value={sections.transformParking.ar?.titleAccent} onChange={(v) => setSections({ ...sections, transformParking: { ...sections.transformParking, ar: { ...(sections.transformParking.ar ?? {}), titleAccent: v } } })} multiline={false} />
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
                  <ArInput label="Description" kind="description" value={sections.transformParking.ar?.description} onChange={(v) => setSections({ ...sections, transformParking: { ...sections.transformParking, ar: { ...(sections.transformParking.ar ?? {}), description: v } } })} multiline={true} />
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
                  <ArInput label="Parking Partner Title" kind="heading" value={sections.transformParking.ar?.parkingPartnerTitle} onChange={(v) => setSections({ ...sections, transformParking: { ...sections.transformParking, ar: { ...(sections.transformParking.ar ?? {}), parkingPartnerTitle: v } } })} multiline={false} />
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
                  <ArInput label="Parking Partner Subtitle" kind="subtitle" value={sections.transformParking.ar?.parkingPartnerSubtitle} onChange={(v) => setSections({ ...sections, transformParking: { ...sections.transformParking, ar: { ...(sections.transformParking.ar ?? {}), parkingPartnerSubtitle: v } } })} multiline={false} />
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
                  <ArInput label="Parking Partner Description" kind="description" value={sections.transformParking.ar?.parkingPartnerDescription} onChange={(v) => setSections({ ...sections, transformParking: { ...sections.transformParking, ar: { ...(sections.transformParking.ar ?? {}), parkingPartnerDescription: v } } })} multiline={true} />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className={labelClass}>Perks (points)</label>
                    <button
                      type="button"
                      onClick={() => setSections({ ...sections, transformParking: { ...sections.transformParking, parkingPartnerPerks: [...(sections.transformParking.parkingPartnerPerks ?? []), ""] } })}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Perk
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(sections.transformParking.parkingPartnerPerks ?? []).map((perk, pi) => (
                      <div key={pi} className="flex gap-2">
                        <input
                          value={perk ?? ""}
                          onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, parkingPartnerPerks: (sections.transformParking.parkingPartnerPerks ?? []).map((p, idx) => (idx === pi ? e.target.value : p)) } })}
                          className={inputClass}
                          placeholder={`Perk ${pi + 1}`}
                          maxLength={FIELD_LIMITS.item}
                        />
                        <button
                          type="button"
                          onClick={() => setSections({ ...sections, transformParking: { ...sections.transformParking, parkingPartnerPerks: (sections.transformParking.parkingPartnerPerks ?? []).filter((_, idx) => idx !== pi) } })}
                          className="shrink-0 inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-2.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
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
                  <ArInput label="Service Partner Title" kind="heading" value={sections.transformParking.ar?.servicePartnerTitle} onChange={(v) => setSections({ ...sections, transformParking: { ...sections.transformParking, ar: { ...(sections.transformParking.ar ?? {}), servicePartnerTitle: v } } })} multiline={false} />
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
                  <ArInput label="Service Partner Subtitle" kind="subtitle" value={sections.transformParking.ar?.servicePartnerSubtitle} onChange={(v) => setSections({ ...sections, transformParking: { ...sections.transformParking, ar: { ...(sections.transformParking.ar ?? {}), servicePartnerSubtitle: v } } })} multiline={false} />
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
                  <ArInput label="Service Partner Description1" kind="description" value={sections.transformParking.ar?.servicePartnerDescription1} onChange={(v) => setSections({ ...sections, transformParking: { ...sections.transformParking, ar: { ...(sections.transformParking.ar ?? {}), servicePartnerDescription1: v } } })} multiline={true} />
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
                  <ArInput label="Service Partner Description2" kind="description" value={sections.transformParking.ar?.servicePartnerDescription2} onChange={(v) => setSections({ ...sections, transformParking: { ...sections.transformParking, ar: { ...(sections.transformParking.ar ?? {}), servicePartnerDescription2: v } } })} multiline={true} />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className={labelClass}>Partnership Opportunities (points)</label>
                    <button
                      type="button"
                      onClick={() => setSections({ ...sections, transformParking: { ...sections.transformParking, servicePartnerPerks: [...(sections.transformParking.servicePartnerPerks ?? []), ""] } })}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(sections.transformParking.servicePartnerPerks ?? []).map((perk, pi) => (
                      <div key={pi} className="flex gap-2">
                        <input
                          value={perk ?? ""}
                          onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, servicePartnerPerks: (sections.transformParking.servicePartnerPerks ?? []).map((p, idx) => (idx === pi ? e.target.value : p)) } })}
                          className={inputClass}
                          placeholder={`Item ${pi + 1}`}
                          maxLength={FIELD_LIMITS.item}
                        />
                        <button
                          type="button"
                          onClick={() => setSections({ ...sections, transformParking: { ...sections.transformParking, servicePartnerPerks: (sections.transformParking.servicePartnerPerks ?? []).filter((_, idx) => idx !== pi) } })}
                          className="shrink-0 inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-2.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
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
          <EnabledToggle enabled={sections.advantageHeader?.enabled} onChange={(v) => setSectionEnabled("advantageHeader", v)} />
          <div className="mb-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Section Header</p>
            <div>
              <label className={labelClass}>Heading (first part)</label>
              <input
                value={sections.advantageHeader?.heading ?? ""}
                onChange={(e) => setSections({ ...sections, advantageHeader: { ...sections.advantageHeader, heading: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
                placeholder="..."
              />
              <CharCount value={sections.advantageHeader?.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={sections.advantageHeader?.ar?.heading} onChange={(v) => setSections({ ...sections, advantageHeader: { ...sections.advantageHeader, ar: { ...(sections.advantageHeader?.ar ?? {}), heading: v } } })} />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient (Advantage)</label>
              <input
                value={sections.advantageHeader?.headingGradient ?? ""}
                onChange={(e) => setSections({ ...sections, advantageHeader: { ...sections.advantageHeader, headingGradient: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.label}
                placeholder="Advantage"
              />
              <CharCount value={sections.advantageHeader?.headingGradient ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Heading Gradient" kind="label" value={sections.advantageHeader?.ar?.headingGradient} onChange={(v) => setSections({ ...sections, advantageHeader: { ...sections.advantageHeader, ar: { ...(sections.advantageHeader?.ar ?? {}), headingGradient: v } } })} />
            </div>
          </div>
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
                  <ArInput label="Title" kind="heading" value={item.ar?.title} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), title: v } })} multiline={false} />
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
          <EnabledToggle enabled={sections.partnersShowcase?.enabled} onChange={(v) => setSectionEnabled("partnersShowcase", v)} />
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
                <ArInput label="Heading" kind="heading" value={sections.partnersShowcase.ar?.heading} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ar: { ...(sections.partnersShowcase.ar ?? {}), heading: v } } })} multiline={false} />
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
                <ArInput label="Heading Gradient" kind="label" value={sections.partnersShowcase.ar?.headingGradient} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ar: { ...(sections.partnersShowcase.ar ?? {}), headingGradient: v } } })} multiline={false} />
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
                <ArInput label="Subheading" kind="subtitle" value={sections.partnersShowcase.ar?.subheading} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ar: { ...(sections.partnersShowcase.ar ?? {}), subheading: v } } })} multiline={false} />
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
                <ArInput label="Description" kind="description" value={sections.partnersShowcase.ar?.description} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ar: { ...(sections.partnersShowcase.ar ?? {}), description: v } } })} multiline={true} />
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
                    <div className="flex-1">
                      <input
                        value={stat.label}
                        onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, stats: sections.partnersShowcase.stats.map((s, idx) => idx === i ? { ...s, label: e.target.value } : s) } })}
                        className={inputClass}
                        placeholder="Label"
                        maxLength={FIELD_LIMITS.label}
                      />
                      <ArInput label="Label" kind="label" value={stat.ar?.label} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, stats: sections.partnersShowcase.stats.map((s, idx) => idx === i ? { ...s, ar: { ...(s.ar ?? {}), label: v } } : s) } })} multiline={false} />
                    </div>
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
                <FieldError error={validateUrl(sections.partnersShowcase.image)} />
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
                <ArInput label="CTA Label" kind="button" value={sections.partnersShowcase.ar?.ctaLabel} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ar: { ...(sections.partnersShowcase.ar ?? {}), ctaLabel: v } } })} multiline={false} />
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
                <ArInput label="Heading" kind="heading" value={sections.partnersShowcase.partners?.ar?.heading} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, partners: { ...sections.partnersShowcase.partners, ar: { ...(sections.partnersShowcase.partners?.ar ?? {}), heading: v } } } })} multiline={false} />
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
                <ArInput label="Subheading" kind="subtitle" value={sections.partnersShowcase.partners?.ar?.subheading} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, partners: { ...sections.partnersShowcase.partners, ar: { ...(sections.partnersShowcase.partners?.ar ?? {}), subheading: v } } } })} multiline={false} />
              </div>
              <div>
                <label className={labelClass}>Carousel Heading (Trusted by Industry Leaders)</label>
                <input
                  value={sections.partnersShowcase?.carouselHeading ?? ""}
                  onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, carouselHeading: e.target.value } })}
                  className={inputClass}
                  maxLength={FIELD_LIMITS.heading}
                  placeholder="Trusted by Industry Leaders"
                />
                <CharCount value={sections.partnersShowcase?.carouselHeading ?? ""} max={FIELD_LIMITS.heading} />
                <ArInput label="Carousel Heading" kind="heading" value={sections.partnersShowcase?.ar?.carouselHeading} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ar: { ...(sections.partnersShowcase?.ar ?? {}), carouselHeading: v } } })} />
              </div>
              <div>
                <label className={labelClass}>Carousel Subheading</label>
                <input
                  value={sections.partnersShowcase?.carouselSubheading ?? ""}
                  onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, carouselSubheading: e.target.value } })}
                  className={inputClass}
                  maxLength={FIELD_LIMITS.subtitle}
                  placeholder="..."
                />
                <CharCount value={sections.partnersShowcase?.carouselSubheading ?? ""} max={FIELD_LIMITS.subtitle} />
                <ArInput label="Carousel Subheading" kind="subtitle" value={sections.partnersShowcase?.ar?.carouselSubheading} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ar: { ...(sections.partnersShowcase?.ar ?? {}), carouselSubheading: v } } })} />
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs font-semibold text-slate-700 mb-4">Row 1 Partners ({sections.partnersShowcase.partners?.row1?.length ?? 0})</p>
                <div className="space-y-2">
                  {(sections.partnersShowcase.partners?.row1 ?? []).map((partner, i) => (
                    <div key={i} className="flex gap-2 items-end">
                      <div className="flex-1">
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
                        <ArInput label="Name" kind="label" value={partner.ar?.name} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, partners: { ...sections.partnersShowcase.partners, row1: sections.partnersShowcase.partners.row1.map((p, idx) => idx === i ? { ...p, ar: { ...(p.ar ?? {}), name: v } } : p) } } })} multiline={false} />
                      </div>
                      <div className="flex-1">
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
                        <ArInput label="Industry" kind="label" value={partner.ar?.industry} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, partners: { ...sections.partnersShowcase.partners, row1: sections.partnersShowcase.partners.row1.map((p, idx) => idx === i ? { ...p, ar: { ...(p.ar ?? {}), industry: v } } : p) } } })} multiline={false} />
                      </div>
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
                      <div className="flex-1">
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
                        <ArInput label="Name" kind="label" value={partner.ar?.name} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, partners: { ...sections.partnersShowcase.partners, row2: sections.partnersShowcase.partners.row2.map((p, idx) => idx === i ? { ...p, ar: { ...(p.ar ?? {}), name: v } } : p) } } })} multiline={false} />
                      </div>
                      <div className="flex-1">
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
                        <ArInput label="Industry" kind="label" value={partner.ar?.industry} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, partners: { ...sections.partnersShowcase.partners, row2: sections.partnersShowcase.partners.row2.map((p, idx) => idx === i ? { ...p, ar: { ...(p.ar ?? {}), industry: v } } : p) } } })} multiline={false} />
                      </div>
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
                <ArInput label="Title" kind="heading" value={sections.partnersShowcase.ctaSection?.ar?.title} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ctaSection: { ...sections.partnersShowcase.ctaSection, ar: { ...(sections.partnersShowcase.ctaSection?.ar ?? {}), title: v } } } })} multiline={false} />
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
                <ArInput label="Description" kind="description" value={sections.partnersShowcase.ctaSection?.ar?.description} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ctaSection: { ...sections.partnersShowcase.ctaSection, ar: { ...(sections.partnersShowcase.ctaSection?.ar ?? {}), description: v } } } })} multiline={true} />
              </div>
              <div>
                <label className={labelClass}>Bottom CTA Button (Get in Touch)</label>
                <input
                  value={sections.partnersShowcase?.ctaSectionLabel ?? ""}
                  onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ctaSectionLabel: e.target.value } })}
                  className={inputClass}
                  maxLength={FIELD_LIMITS.button}
                  placeholder="Get in Touch"
                />
                <CharCount value={sections.partnersShowcase?.ctaSectionLabel ?? ""} max={FIELD_LIMITS.button} />
                <ArInput label="Cta Section Label" kind="button" value={sections.partnersShowcase?.ar?.ctaSectionLabel} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ar: { ...(sections.partnersShowcase?.ar ?? {}), ctaSectionLabel: v } } })} />
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
                          const err = validateImageFile(file);
                          if (err) { setError(err); e.target.value = ""; return; }
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
                <FieldError error={validateUrl(sections.partnersShowcase.ctaSection?.image || "")} />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* 9. Business CTA */}
        <CollapsibleSection
          title="9. BusinessCTA"
          isOpen={openSections.cta}
          onToggle={() => toggleSection("cta")}
        >
          <EnabledToggle enabled={sections.cta?.enabled} onChange={(v) => setSectionEnabled("cta", v)} />
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
              <ArInput label="Heading" kind="heading" value={sections.cta.ar?.heading} onChange={(v) => setSections({ ...sections, cta: { ...sections.cta, ar: { ...(sections.cta.ar ?? {}), heading: v } } })} multiline={false} />
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
              <ArInput label="Heading Accent" kind="label" value={sections.cta.ar?.headingAccent} onChange={(v) => setSections({ ...sections, cta: { ...sections.cta, ar: { ...(sections.cta.ar ?? {}), headingAccent: v } } })} multiline={false} />
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
              <ArInput label="Description" kind="description" value={sections.cta.ar?.description} onChange={(v) => setSections({ ...sections, cta: { ...sections.cta, ar: { ...(sections.cta.ar ?? {}), description: v } } })} multiline={true} />
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
                <ArInput label="CTA Label" kind="button" value={sections.cta.ar?.ctaLabel} onChange={(v) => setSections({ ...sections, cta: { ...sections.cta, ar: { ...(sections.cta.ar ?? {}), ctaLabel: v } } })} multiline={false} />
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
                <FieldError error={validateUrl(sections.cta.ctaLink ?? "")} />
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
              <FieldError error={validateUrl(sections.cta.image)} />
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
