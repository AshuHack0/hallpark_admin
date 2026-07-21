import { useState, useEffect } from "react";
import { Save, Loader2, Plus, Trash2, ChevronDown, Upload } from "lucide-react";
import { api, uploadMediaToCloudinary } from "../lib/api";
import { FIELD_LIMITS, CharCount, FieldError, ArInput } from "./CappedField";
import RichTextArea from "./RichTextArea.jsx";
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
  // Upload failures are shown inline per field (uploadErrors below); nothing
  // sets the global error banner anymore, so only the value is kept.
  const [error] = useState("");
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
            whoWeWork: Array.isArray(dbSections.whoWeWork) ? dbSections.whoWeWork : [],
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

  // Hero popup helpers — write text config under hero.<formKey>.<field> (+ ar),
  // and the selectable option arrays under hero.<optKey>.
  const setHeroForm = (formKey, field, value) => {
    setSections((prev) => ({ ...prev, hero: { ...prev.hero, [formKey]: { ...(prev.hero?.[formKey] ?? {}), [field]: value } } }));
  };
  const setHeroFormAr = (formKey, field, value) => {
    setSections((prev) => ({ ...prev, hero: { ...prev.hero, [formKey]: { ...(prev.hero?.[formKey] ?? {}), ar: { ...(prev.hero?.[formKey]?.ar ?? {}), [field]: value } } } }));
  };
  const setHeroOptions = (optKey, nextArr) => {
    setSections((prev) => ({ ...prev, hero: { ...prev.hero, [optKey]: nextArr } }));
  };

  // Upload a hero deck image → hero.deckImages[index].img
  async function handleDeckImageUpload(index, file) {
    const key = `hero-deck-${index}`;
    const validationError = validateImageFile(file);
    if (validationError) { setUploadError(key, validationError); return; }
    clearUploadError(key);
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) => setUploadProgress((p) => ({ ...p, [key]: pct })));
      setSections((prev) => ({
        ...prev,
        hero: { ...prev.hero, deckImages: (prev.hero?.deckImages ?? []).map((s, i) => (i === index ? { ...s, img: url } : s)) },
      }));
    } catch (err) {
      setUploadError(key, err.message ?? "Image upload failed");
      console.error(err);
    } finally {
      setUploadProgress((p) => ({ ...p, [key]: undefined }));
    }
  }

  async function handleImageUpload(section, field, file, itemIndex = null) {
    const key = `${section}-${field}`;
    const validationError = validateImageFile(file);
    if (validationError) { setUploadError(key, validationError); return; }
    clearUploadError(key);
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
      setUploadError(key, err.message ?? "Image upload failed");
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
              {/* Rich text: Bold / Italic / Color toolbar. Stored as safe markup. */}
              <RichTextArea
                value={sections.hero.description ?? ""}
                onChange={(v) => setSections({ ...sections, hero: { ...sections.hero, description: v } })}
                maxLength={FIELD_LIMITS.description}
                rows={3}
              />
              <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
              <RichTextArea value={sections.hero.ar?.description ?? ""} onChange={(v) => setSections({ ...sections, hero: { ...sections.hero, ar: { ...(sections.hero.ar ?? {}), description: v } } })} maxLength={FIELD_LIMITS.description} rows={3} dir="rtl" variant="arabic" />
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
              <div className="flex items-center justify-between">
                <label className={labelClass}>Primary Button (Get Proposal)</label>
                <label className="mb-2 inline-flex cursor-pointer items-center gap-2 text-[11px] font-semibold text-slate-500">
                  <input
                    type="checkbox"
                    checked={sections.hero?.showProposal !== false}
                    onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, showProposal: e.target.checked } })}
                    className="h-3.5 w-3.5 accent-[#0088FF]"
                  />
                  Show button
                </label>
              </div>
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
              <div className="flex items-center justify-between">
                <label className={labelClass}>Secondary Button (Book a Free Consultation)</label>
                <label className="mb-2 inline-flex cursor-pointer items-center gap-2 text-[11px] font-semibold text-slate-500">
                  <input
                    type="checkbox"
                    checked={sections.hero?.showConsultation !== false}
                    onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, showConsultation: e.target.checked } })}
                    className="h-3.5 w-3.5 accent-[#0088FF]"
                  />
                  Show button
                </label>
              </div>
              <input
                value={sections.hero?.ctaSecondary ?? ""}
                onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, ctaSecondary: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.button}
                placeholder="Book a Free Consultation"
              />
              <CharCount value={sections.hero?.ctaSecondary ?? ""} max={FIELD_LIMITS.button} />
              <ArInput label="Cta Secondary" kind="button" value={sections.hero?.ar?.ctaSecondary} onChange={(v) => setSections({ ...sections, hero: { ...sections.hero, ar: { ...(sections.hero?.ar ?? {}), ctaSecondary: v } } })} />
              <p className="mt-1 text-[11px] text-slate-400">Each button shows only when it has a label and its “Show button” toggle is on. They open the Proposal / Consultation popups below.</p>
            </div>

            {/* ── Right-side image deck (multi-image) ── */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <div className="mb-2 flex items-center justify-between">
                <label className={labelClass}>Hero Images (deck) ({(sections.hero?.deckImages ?? []).length})</label>
                <button
                  type="button"
                  onClick={() => setSections({ ...sections, hero: { ...sections.hero, deckImages: [...(sections.hero?.deckImages ?? []), { img: "", label: "" }] } })}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-2.5 py-1.5 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff]"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Image
                </button>
              </div>
              <p className="mb-2 text-[11px] text-slate-400">The rotating photo cards on the right of the hero. Add 3–4 for the best effect. Leave empty to use the built-in images.</p>
              <div className="space-y-2">
                {(sections.hero?.deckImages ?? []).map((slide, di) => (
                  <div key={di}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                      {slide.img ? <img src={slide.img} alt="" className="h-full w-full object-cover" /> : <span className="text-[9px] text-slate-300">—</span>}
                    </div>
                    <input
                      value={slide.img ?? ""}
                      onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, deckImages: (sections.hero?.deckImages ?? []).map((s, idx) => idx === di ? { ...s, img: e.target.value } : s) } })}
                      className={inputClass}
                      placeholder="Image URL or /path"
                      maxLength={FIELD_LIMITS.link}
                    />
                    <input
                      value={slide.label ?? ""}
                      onChange={(e) => setSections({ ...sections, hero: { ...sections.hero, deckImages: (sections.hero?.deckImages ?? []).map((s, idx) => idx === di ? { ...s, label: e.target.value } : s) } })}
                      className="w-32 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white"
                      placeholder="Caption"
                      maxLength={FIELD_LIMITS.label}
                    />
                    <label className="shrink-0 inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-2.5 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff]">
                      {uploadProgress[`hero-deck-${di}`] !== undefined ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {uploadProgress[`hero-deck-${di}`]}%</>
                      ) : (<Upload className="h-3.5 w-3.5" />)}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDeckImageUpload(di, f); e.target.value = ""; }} />
                    </label>
                    <button type="button" onClick={() => setSections({ ...sections, hero: { ...sections.hero, deckImages: (sections.hero?.deckImages ?? []).filter((_, idx) => idx !== di) } })} className="shrink-0 rounded-lg border border-red-200 bg-red-50 p-2 text-red-500 hover:bg-red-100">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {uploadErrors[`hero-deck-${di}`] ? (
                    <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors[`hero-deck-${di}`]}</p>
                  ) : null}
                  </div>
                ))}
              </div>
            </div>

            {/* ── Get Proposal popup ── */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Get Proposal Popup</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Popup Heading</label>
                  <input value={sections.hero?.proposalForm?.heading ?? ""} onChange={(e) => setHeroForm("proposalForm", "heading", e.target.value)} className={inputClass} placeholder="Get a Proposal" maxLength={FIELD_LIMITS.heading} />
                  <ArInput label="Heading" kind="heading" value={sections.hero?.proposalForm?.ar?.heading} onChange={(v) => setHeroFormAr("proposalForm", "heading", v)} />
                </div>
                <div>
                  <label className={labelClass}>Options Label</label>
                  <input value={sections.hero?.proposalForm?.optionsLabel ?? ""} onChange={(e) => setHeroForm("proposalForm", "optionsLabel", e.target.value)} className={inputClass} placeholder="Required Solutions" maxLength={FIELD_LIMITS.label} />
                  <ArInput label="Options Label" kind="label" value={sections.hero?.proposalForm?.ar?.optionsLabel} onChange={(v) => setHeroFormAr("proposalForm", "optionsLabel", v)} />
                </div>
              </div>
              <div className="mt-3">
                <label className={labelClass}>Subtitle</label>
                <textarea value={sections.hero?.proposalForm?.subtitle ?? ""} onChange={(e) => setHeroForm("proposalForm", "subtitle", e.target.value)} className={inputClass} rows={2} maxLength={FIELD_LIMITS.subtitle} />
                <ArInput label="Subtitle" kind="subtitle" multiline value={sections.hero?.proposalForm?.ar?.subtitle} onChange={(v) => setHeroFormAr("proposalForm", "subtitle", v)} />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Success Title</label>
                  <input value={sections.hero?.proposalForm?.successTitle ?? ""} onChange={(e) => setHeroForm("proposalForm", "successTitle", e.target.value)} className={inputClass} placeholder="Request Received!" maxLength={FIELD_LIMITS.heading} />
                  <ArInput label="Success Title" kind="heading" value={sections.hero?.proposalForm?.ar?.successTitle} onChange={(v) => setHeroFormAr("proposalForm", "successTitle", v)} />
                </div>
                <div>
                  <label className={labelClass}>Success Message</label>
                  <textarea value={sections.hero?.proposalForm?.successMessage ?? ""} onChange={(e) => setHeroForm("proposalForm", "successMessage", e.target.value)} className={inputClass} rows={2} maxLength={FIELD_LIMITS.description} />
                  <ArInput label="Success Message" kind="description" multiline value={sections.hero?.proposalForm?.ar?.successMessage} onChange={(v) => setHeroFormAr("proposalForm", "successMessage", v)} />
                </div>
              </div>
              {/* Selectable solutions */}
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <label className={labelClass}>Selectable Solutions ({(sections.hero?.proposalOptions ?? []).length})</label>
                  <button type="button" onClick={() => setHeroOptions("proposalOptions", [...(sections.hero?.proposalOptions ?? []), { label: "", ar: "" }])} className="inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-2.5 py-1.5 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff]"><Plus className="h-3.5 w-3.5" /> Add Option</button>
                </div>
                <div className="space-y-2">
                  {(sections.hero?.proposalOptions ?? []).map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input value={opt.label ?? ""} onChange={(e) => setHeroOptions("proposalOptions", (sections.hero?.proposalOptions ?? []).map((o, idx) => idx === oi ? { ...o, label: e.target.value } : o))} className={inputClass} placeholder="Solution name (English)" maxLength={FIELD_LIMITS.item} />
                      <input dir="rtl" value={opt.ar ?? ""} onChange={(e) => setHeroOptions("proposalOptions", (sections.hero?.proposalOptions ?? []).map((o, idx) => idx === oi ? { ...o, ar: e.target.value } : o))} className={inputClass} style={{ borderColor: "#16a34a" }} placeholder="بالعربية" maxLength={FIELD_LIMITS.item} />
                      <button type="button" onClick={() => setHeroOptions("proposalOptions", (sections.hero?.proposalOptions ?? []).filter((_, idx) => idx !== oi))} className="shrink-0 rounded-lg border border-red-200 bg-red-50 p-2 text-red-500 hover:bg-red-100"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Book a Free Consultation popup ── */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Book a Free Consultation Popup</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Popup Heading</label>
                  <input value={sections.hero?.consultationForm?.heading ?? ""} onChange={(e) => setHeroForm("consultationForm", "heading", e.target.value)} className={inputClass} placeholder="Book a Free Consultation" maxLength={FIELD_LIMITS.heading} />
                  <ArInput label="Heading" kind="heading" value={sections.hero?.consultationForm?.ar?.heading} onChange={(v) => setHeroFormAr("consultationForm", "heading", v)} />
                </div>
                <div>
                  <label className={labelClass}>Options Label</label>
                  <input value={sections.hero?.consultationForm?.optionsLabel ?? ""} onChange={(e) => setHeroForm("consultationForm", "optionsLabel", e.target.value)} className={inputClass} placeholder="Discussion Topics" maxLength={FIELD_LIMITS.label} />
                  <ArInput label="Options Label" kind="label" value={sections.hero?.consultationForm?.ar?.optionsLabel} onChange={(v) => setHeroFormAr("consultationForm", "optionsLabel", v)} />
                </div>
              </div>
              <div className="mt-3">
                <label className={labelClass}>Subtitle</label>
                <textarea value={sections.hero?.consultationForm?.subtitle ?? ""} onChange={(e) => setHeroForm("consultationForm", "subtitle", e.target.value)} className={inputClass} rows={2} maxLength={FIELD_LIMITS.subtitle} />
                <ArInput label="Subtitle" kind="subtitle" multiline value={sections.hero?.consultationForm?.ar?.subtitle} onChange={(v) => setHeroFormAr("consultationForm", "subtitle", v)} />
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Success Title</label>
                  <input value={sections.hero?.consultationForm?.successTitle ?? ""} onChange={(e) => setHeroForm("consultationForm", "successTitle", e.target.value)} className={inputClass} placeholder="Request Received!" maxLength={FIELD_LIMITS.heading} />
                  <ArInput label="Success Title" kind="heading" value={sections.hero?.consultationForm?.ar?.successTitle} onChange={(v) => setHeroFormAr("consultationForm", "successTitle", v)} />
                </div>
                <div>
                  <label className={labelClass}>Success Message</label>
                  <textarea value={sections.hero?.consultationForm?.successMessage ?? ""} onChange={(e) => setHeroForm("consultationForm", "successMessage", e.target.value)} className={inputClass} rows={2} maxLength={FIELD_LIMITS.description} />
                  <ArInput label="Success Message" kind="description" multiline value={sections.hero?.consultationForm?.ar?.successMessage} onChange={(v) => setHeroFormAr("consultationForm", "successMessage", v)} />
                </div>
              </div>
              {/* Selectable topics */}
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <label className={labelClass}>Discussion Topics ({(sections.hero?.consultationTopics ?? []).length})</label>
                  <button type="button" onClick={() => setHeroOptions("consultationTopics", [...(sections.hero?.consultationTopics ?? []), { label: "", ar: "" }])} className="inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-2.5 py-1.5 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff]"><Plus className="h-3.5 w-3.5" /> Add Topic</button>
                </div>
                <div className="space-y-2">
                  {(sections.hero?.consultationTopics ?? []).map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input value={opt.label ?? ""} onChange={(e) => setHeroOptions("consultationTopics", (sections.hero?.consultationTopics ?? []).map((o, idx) => idx === oi ? { ...o, label: e.target.value } : o))} className={inputClass} placeholder="Topic (English)" maxLength={FIELD_LIMITS.item} />
                      <input dir="rtl" value={opt.ar ?? ""} onChange={(e) => setHeroOptions("consultationTopics", (sections.hero?.consultationTopics ?? []).map((o, idx) => idx === oi ? { ...o, ar: e.target.value } : o))} className={inputClass} style={{ borderColor: "#16a34a" }} placeholder="بالعربية" maxLength={FIELD_LIMITS.item} />
                      <button type="button" onClick={() => setHeroOptions("consultationTopics", (sections.hero?.consultationTopics ?? []).filter((_, idx) => idx !== oi))} className="shrink-0 rounded-lg border border-red-200 bg-red-50 p-2 text-red-500 hover:bg-red-100"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>
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
              <label className={labelClass}>Title Gradient (second line, highlighted)</label>
              <input
                type="text"
                value={sections.builtForSpace.titleGradient ?? ""}
                onChange={(e) => setSections({ ...sections, builtForSpace: { ...sections.builtForSpace, titleGradient: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
                placeholder="Every Space"
              />
              <p className="mt-1 text-[11px] text-slate-400">Shows on the second line in the blue gradient. Leave blank to auto-use the last two words of the Title.</p>
              <CharCount value={sections.builtForSpace.titleGradient ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Title Gradient" kind="heading" value={sections.builtForSpace.ar?.titleGradient} onChange={(v) => setSections({ ...sections, builtForSpace: { ...sections.builtForSpace, ar: { ...(sections.builtForSpace.ar ?? {}), titleGradient: v } } })} multiline={false} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <RichTextArea
                value={sections.builtForSpace.description ?? ""}
                onChange={(v) => setSections({ ...sections, builtForSpace: { ...sections.builtForSpace, description: v } })}
                maxLength={FIELD_LIMITS.description}
                rows={3}
              />
              <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
              <RichTextArea value={sections.builtForSpace.ar?.description ?? ""} onChange={(v) => setSections({ ...sections, builtForSpace: { ...sections.builtForSpace, ar: { ...(sections.builtForSpace.ar ?? {}), description: v } } })} maxLength={FIELD_LIMITS.description} rows={3} dir="rtl" variant="arabic" />
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
                  <RichTextArea
                    value={item.description ?? ""}
                    onChange={(v) => update(i, { description: v })}
                    maxLength={FIELD_LIMITS.description}
                    rows={2}
                  />
                  <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
                  <RichTextArea value={item.ar?.description ?? ""} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), description: v } })} maxLength={FIELD_LIMITS.description} rows={2} dir="rtl" variant="arabic" />
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
                  {uploadErrors["whyChoose-image"] ? (
                    <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors["whyChoose-image"]}</p>
                  ) : null}
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
              <RichTextArea
                value={sections.solutionsHeader?.description ?? ""}
                onChange={(v) => setSections({ ...sections, solutionsHeader: { ...sections.solutionsHeader, description: v } })}
                maxLength={FIELD_LIMITS.description}
                rows={2}
                placeholder="Intelligent parking systems built for every business type…"
              />
              <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
              <RichTextArea value={sections.solutionsHeader?.ar?.description ?? ""} onChange={(v) => setSections({ ...sections, solutionsHeader: { ...sections.solutionsHeader, ar: { ...(sections.solutionsHeader?.ar ?? {}), description: v } } })} maxLength={FIELD_LIMITS.description} rows={2} dir="rtl" variant="arabic" />
            </div>
            <div>
              <label className={labelClass}>Description (second, smaller)</label>
              <RichTextArea
                value={sections.solutionsHeader?.description2 ?? ""}
                onChange={(v) => setSections({ ...sections, solutionsHeader: { ...sections.solutionsHeader, description2: v } })}
                maxLength={FIELD_LIMITS.description}
                rows={2}
                placeholder="We make it possible to invest in parking infrastructure…"
              />
              <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
              <RichTextArea value={sections.solutionsHeader?.ar?.description2 ?? ""} onChange={(v) => setSections({ ...sections, solutionsHeader: { ...sections.solutionsHeader, ar: { ...(sections.solutionsHeader?.ar ?? {}), description2: v } } })} maxLength={FIELD_LIMITS.description} rows={2} dir="rtl" variant="arabic" />
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
                  <RichTextArea
                    value={item.description ?? ""}
                    onChange={(v) => update(i, { description: v })}
                    maxLength={FIELD_LIMITS.description}
                    rows={2}
                  />
                  <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
                  <RichTextArea value={item.ar?.description ?? ""} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), description: v } })} maxLength={FIELD_LIMITS.description} rows={2} dir="rtl" variant="arabic" />
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
                    {uploadErrors["solutions-image"] ? (
                      <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors["solutions-image"]}</p>
                    ) : null}
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
            <div>
              <label className={labelClass}>Learn More Link (URL)</label>
              <input
                value={sections.whoWeWorkHeader?.ctaLink ?? ""}
                onChange={(e) => setSections({ ...sections, whoWeWorkHeader: { ...sections.whoWeWorkHeader, ctaLink: e.target.value } })}
                className={inputClass}
                maxLength={FIELD_LIMITS.link}
                placeholder="/contact-us or https://..."
              />
              <FieldError error={validateUrl(sections.whoWeWorkHeader?.ctaLink ?? "")} />
              <p className="mt-1 text-[11px] text-slate-400">Where the Learn More button links. Leave blank for a non-navigating button.</p>
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
              image: "",
              icon: "",
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
                  <RichTextArea
                    value={item.description ?? ""}
                    onChange={(v) => update(i, { description: v })}
                    maxLength={FIELD_LIMITS.description}
                    rows={2}
                  />
                  <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
                  <RichTextArea value={item.ar?.description ?? ""} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), description: v } })} maxLength={FIELD_LIMITS.description} rows={2} dir="rtl" variant="arabic" />
                </div>
                <div>
                  <label className={labelClass}>Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.image ?? ""}
                      onChange={(e) => update(i, { image: e.target.value })}
                      className={inputClass}
                      placeholder="Image URL or /path (leave blank for no image)"
                      maxLength={FIELD_LIMITS.link}
                    />
                    <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                      {uploadProgress[`whoWeWork-image`] !== undefined ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {uploadProgress[`whoWeWork-image`]}%</>
                      ) : (<Upload className="h-3.5 w-3.5" />)}
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
                  <FieldError error={validateUrl(item.image ?? "")} />
                  {uploadErrors["whoWeWork-image"] ? (
                    <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors["whoWeWork-image"]}</p>
                  ) : null}
                  <p className="mt-1 text-[11px] text-slate-400">Shown on the right side of the partner card. Leave blank to render no photo.</p>
                </div>
                <div>
                  <label className={labelClass}>Icon</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={item.icon ?? ""}
                      onChange={(e) => update(i, { icon: e.target.value })}
                      className={inputClass}
                      placeholder="Icon URL or /path (leave blank for no icon)"
                      maxLength={FIELD_LIMITS.link}
                    />
                    <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                      {uploadProgress[`whoWeWork-icon`] !== undefined ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {uploadProgress[`whoWeWork-icon`]}%</>
                      ) : (<Upload className="h-3.5 w-3.5" />)}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload("whoWeWork", "icon", file, i);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  <FieldError error={validateUrl(item.icon ?? "")} />
                  {uploadErrors["whoWeWork-icon"] ? (
                    <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors["whoWeWork-icon"]}</p>
                  ) : null}
                  <p className="mt-1 text-[11px] text-slate-400">Small badge shown next to the partner category label.</p>
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
                  <label className={labelClass} style={{ marginTop: 6 }}>Benefits — Arabic (comma-separated, same order)</label>
                  <input dir="rtl"
                    type="text"
                    value={Array.isArray(item.ar?.benefits) ? item.ar.benefits.join("، ") : ""}
                    onChange={(e) => update(i, { ar: { ...(item.ar ?? {}), benefits: e.target.value.split(/،|,/).map((b) => b.trim()) } })}
                    className={inputClass}
                    style={{ borderColor: "#16a34a" }}
                    maxLength={FIELD_LIMITS.item}
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
                  <RichTextArea
                    value={sections.transformParking.description ?? ""}
                    onChange={(v) => setSections({ ...sections, transformParking: { ...sections.transformParking, description: v } })}
                    maxLength={FIELD_LIMITS.description}
                    rows={3}
                  />
                  <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
                  <RichTextArea value={sections.transformParking.ar?.description ?? ""} onChange={(v) => setSections({ ...sections, transformParking: { ...sections.transformParking, ar: { ...(sections.transformParking.ar ?? {}), description: v } } })} maxLength={FIELD_LIMITS.description} rows={3} dir="rtl" variant="arabic" />
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
                  <RichTextArea
                    value={sections.transformParking.parkingPartnerDescription ?? ""}
                    onChange={(v) => setSections({ ...sections, transformParking: { ...sections.transformParking, parkingPartnerDescription: v } })}
                    maxLength={FIELD_LIMITS.long}
                    rows={4}
                  />
                  <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
                  <RichTextArea value={sections.transformParking.ar?.parkingPartnerDescription ?? ""} onChange={(v) => setSections({ ...sections, transformParking: { ...sections.transformParking, ar: { ...(sections.transformParking.ar ?? {}), parkingPartnerDescription: v } } })} maxLength={FIELD_LIMITS.long} rows={4} dir="rtl" variant="arabic" />
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
                <div>
                  <label className={labelClass}>CTA Button Label</label>
                  <input
                    type="text"
                    value={sections.transformParking.parkingPartnerCtaLabel ?? ""}
                    onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, parkingPartnerCtaLabel: e.target.value } })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.button}
                    placeholder="Start Earning with HalaPark"
                  />
                  <CharCount value={sections.transformParking.parkingPartnerCtaLabel ?? ""} max={FIELD_LIMITS.button} />
                  <ArInput label="Parking Partner Cta Label" kind="button" value={sections.transformParking.ar?.parkingPartnerCtaLabel} onChange={(v) => setSections({ ...sections, transformParking: { ...sections.transformParking, ar: { ...(sections.transformParking.ar ?? {}), parkingPartnerCtaLabel: v } } })} multiline={false} />
                </div>
                <div>
                  <label className={labelClass}>CTA Button Link</label>
                  <input
                    type="text"
                    value={sections.transformParking.parkingPartnerCtaLink ?? ""}
                    onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, parkingPartnerCtaLink: e.target.value } })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.link}
                    placeholder="/contact"
                  />
                  <FieldError error={validateUrl(sections.transformParking.parkingPartnerCtaLink ?? "")} />
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
                  <RichTextArea
                    value={sections.transformParking.servicePartnerDescription1 ?? ""}
                    onChange={(v) => setSections({ ...sections, transformParking: { ...sections.transformParking, servicePartnerDescription1: v } })}
                    maxLength={FIELD_LIMITS.description}
                    rows={3}
                  />
                  <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
                  <RichTextArea value={sections.transformParking.ar?.servicePartnerDescription1 ?? ""} onChange={(v) => setSections({ ...sections, transformParking: { ...sections.transformParking, ar: { ...(sections.transformParking.ar ?? {}), servicePartnerDescription1: v } } })} maxLength={FIELD_LIMITS.description} rows={3} dir="rtl" variant="arabic" />
                </div>
                <div>
                  <label className={labelClass}>Description 2</label>
                  <RichTextArea
                    value={sections.transformParking.servicePartnerDescription2 ?? ""}
                    onChange={(v) => setSections({ ...sections, transformParking: { ...sections.transformParking, servicePartnerDescription2: v } })}
                    maxLength={FIELD_LIMITS.description}
                    rows={3}
                  />
                  <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
                  <RichTextArea value={sections.transformParking.ar?.servicePartnerDescription2 ?? ""} onChange={(v) => setSections({ ...sections, transformParking: { ...sections.transformParking, ar: { ...(sections.transformParking.ar ?? {}), servicePartnerDescription2: v } } })} maxLength={FIELD_LIMITS.description} rows={3} dir="rtl" variant="arabic" />
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
                <div>
                  <label className={labelClass}>CTA Button Label</label>
                  <input
                    type="text"
                    value={sections.transformParking.servicePartnerCtaLabel ?? ""}
                    onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, servicePartnerCtaLabel: e.target.value } })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.button}
                    placeholder="Partner With Us Today"
                  />
                  <CharCount value={sections.transformParking.servicePartnerCtaLabel ?? ""} max={FIELD_LIMITS.button} />
                  <ArInput label="Service Partner Cta Label" kind="button" value={sections.transformParking.ar?.servicePartnerCtaLabel} onChange={(v) => setSections({ ...sections, transformParking: { ...sections.transformParking, ar: { ...(sections.transformParking.ar ?? {}), servicePartnerCtaLabel: v } } })} multiline={false} />
                </div>
                <div>
                  <label className={labelClass}>CTA Button Link</label>
                  <input
                    type="text"
                    value={sections.transformParking.servicePartnerCtaLink ?? ""}
                    onChange={(e) => setSections({ ...sections, transformParking: { ...sections.transformParking, servicePartnerCtaLink: e.target.value } })}
                    className={inputClass}
                    maxLength={FIELD_LIMITS.link}
                    placeholder="/contact"
                  />
                  <FieldError error={validateUrl(sections.transformParking.servicePartnerCtaLink ?? "")} />
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
                  <RichTextArea
                    value={item.description ?? ""}
                    onChange={(v) => update(i, { description: v })}
                    maxLength={FIELD_LIMITS.description}
                    rows={2}
                  />
                  <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
                  <RichTextArea value={item.ar?.description ?? ""} onChange={(v) => update(i, { ar: { ...(item.ar ?? {}), description: v } })} maxLength={FIELD_LIMITS.description} rows={2} dir="rtl" variant="arabic" />
                </div>
              </div>
            )}
          />
        </CollapsibleSection>

        {/* 8.5. Partner Showcase */}
        <CollapsibleSection
          title="8.5. Partner Showcase"
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
                <RichTextArea
                  value={sections.partnersShowcase.description ?? ""}
                  onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, description: v } })}
                  maxLength={FIELD_LIMITS.description}
                  rows={4}
                  placeholder="Description text..."
                />
                <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
                <RichTextArea value={sections.partnersShowcase.ar?.description ?? ""} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ar: { ...(sections.partnersShowcase.ar ?? {}), description: v } } })} maxLength={FIELD_LIMITS.description} rows={4} dir="rtl" variant="arabic" />
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
              <div className="space-y-3">
                {(sections.partnersShowcase.stats ?? []).map((stat, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Stat {i + 1}</p>
                      <button
                        type="button"
                        onClick={() => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, stats: sections.partnersShowcase.stats.filter((_, idx) => idx !== i) } })}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                      <div>
                        <label className={labelClass}>Value</label>
                        <input
                          value={stat.value ?? ""}
                          onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, stats: sections.partnersShowcase.stats.map((s, idx) => idx === i ? { ...s, value: e.target.value } : s) } })}
                          className={inputClass}
                          placeholder="e.g. 5th, 95%"
                          maxLength={FIELD_LIMITS.label}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Label</label>
                        <input
                          value={stat.label ?? ""}
                          onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, stats: sections.partnersShowcase.stats.map((s, idx) => idx === i ? { ...s, label: e.target.value } : s) } })}
                          className={inputClass}
                          placeholder="Label"
                          maxLength={FIELD_LIMITS.label}
                        />
                        <ArInput label="Label" kind="label" value={stat.ar?.label} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, stats: sections.partnersShowcase.stats.map((s, idx) => idx === i ? { ...s, ar: { ...(s.ar ?? {}), label: v } } : s) } })} multiline={false} />
                      </div>
                    </div>
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
                {uploadErrors["partnersShowcase-image"] ? (
                  <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors["partnersShowcase-image"]}</p>
                ) : null}
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
              <div>
                <label className={labelClass}>CTA Link</label>
                <input
                  type="text"
                  value={sections.partnersShowcase.ctaLink ?? ""}
                  onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ctaLink: e.target.value } })}
                  className={inputClass}
                  placeholder="/contact"
                  maxLength={FIELD_LIMITS.link}
                />
                <FieldError error={validateUrl(sections.partnersShowcase.ctaLink)} />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* 8.6. Partner Carousel */}
        <CollapsibleSection
          title="8.6. Partner Carousel"
          isOpen={openSections.partnerCarousel}
          onToggle={() => toggleSection("partnerCarousel")}
        >
          <EnabledToggle enabled={sections.partnersShowcase?.carousel?.enabled} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, carousel: { ...(sections.partnersShowcase?.carousel ?? {}), enabled: v } } })} />
          <div className="space-y-6">
            {/* Partners Carousel Section */}
            <div className="space-y-4">
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
                    <div key={i}>
                    <div className="flex gap-2 items-end">
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
                      {partner.logo ? (
                        <img src={partner.logo} alt={partner.name} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: partner.color }}>{partner.initials}</div>
                      )}
                      <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                        {uploadProgress[`partnersShowcase-row1-logo-${i}`] !== undefined ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {uploadProgress[`partnersShowcase-row1-logo-${i}`]}%</>
                        ) : (<Upload className="h-3.5 w-3.5" />)}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const key = `partnersShowcase-row1-logo-${i}`;
                              const err = validateImageFile(file);
                              if (err) { setUploadError(key, err); e.target.value = ""; return; }
                              clearUploadError(key);
                              setUploadProgress((prev) => ({ ...prev, [key]: 0 }));
                              uploadMediaToCloudinary(file, "image", (progress) => {
                                setUploadProgress((prev) => ({ ...prev, [key]: progress }));
                              }).then((url) => {
                                setSections((prevSections) => ({ ...prevSections, partnersShowcase: { ...prevSections.partnersShowcase, partners: { ...prevSections.partnersShowcase.partners, row1: prevSections.partnersShowcase.partners.row1.map((p, idx) => idx === i ? { ...p, logo: url } : p) } } }));
                                setUploadProgress((prev) => ({ ...prev, [key]: undefined }));
                              }).catch((uploadErr) => {
                                setUploadError(key, uploadErr.message ?? "Image upload failed");
                                setUploadProgress((prev) => ({ ...prev, [key]: undefined }));
                              });
                            }
                            e.target.value = "";
                          }}
                        />
                      </label>
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
                    {uploadErrors[`partnersShowcase-row1-logo-${i}`] ? (
                      <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors[`partnersShowcase-row1-logo-${i}`]}</p>
                    ) : null}
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
                    <div key={i}>
                    <div className="flex gap-2 items-end">
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
                      {partner.logo ? (
                        <img src={partner.logo} alt={partner.name} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: partner.color }}>{partner.initials}</div>
                      )}
                      <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                        {uploadProgress[`partnersShowcase-row2-logo-${i}`] !== undefined ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin" /> {uploadProgress[`partnersShowcase-row2-logo-${i}`]}%</>
                        ) : (<Upload className="h-3.5 w-3.5" />)}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const key = `partnersShowcase-row2-logo-${i}`;
                              const err = validateImageFile(file);
                              if (err) { setUploadError(key, err); e.target.value = ""; return; }
                              clearUploadError(key);
                              setUploadProgress((prev) => ({ ...prev, [key]: 0 }));
                              uploadMediaToCloudinary(file, "image", (progress) => {
                                setUploadProgress((prev) => ({ ...prev, [key]: progress }));
                              }).then((url) => {
                                setSections((prevSections) => ({ ...prevSections, partnersShowcase: { ...prevSections.partnersShowcase, partners: { ...prevSections.partnersShowcase.partners, row2: prevSections.partnersShowcase.partners.row2.map((p, idx) => idx === i ? { ...p, logo: url } : p) } } }));
                                setUploadProgress((prev) => ({ ...prev, [key]: undefined }));
                              }).catch((uploadErr) => {
                                setUploadError(key, uploadErr.message ?? "Image upload failed");
                                setUploadProgress((prev) => ({ ...prev, [key]: undefined }));
                              });
                            }
                            e.target.value = "";
                          }}
                        />
                      </label>
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
                    {uploadErrors[`partnersShowcase-row2-logo-${i}`] ? (
                      <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors[`partnersShowcase-row2-logo-${i}`]}</p>
                    ) : null}
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
          </div>
        </CollapsibleSection>

        {/* 8.7. Partner CTA (Get in Touch) */}
        <CollapsibleSection
          title="8.7. Partner CTA (Get in Touch)"
          isOpen={openSections.partnerCta}
          onToggle={() => toggleSection("partnerCta")}
        >
          <EnabledToggle enabled={sections.partnersShowcase?.ctaSection?.enabled} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ctaSection: { ...(sections.partnersShowcase?.ctaSection ?? {}), enabled: v } } })} />
          <div className="space-y-6">
            {/* CTA Section */}
            <div className="space-y-4">
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
                <RichTextArea
                  value={sections.partnersShowcase.ctaSection?.description ?? ""}
                  onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ctaSection: { ...sections.partnersShowcase.ctaSection, description: v } } })}
                  maxLength={FIELD_LIMITS.description}
                  rows={3}
                  placeholder="Join our growing network..."
                />
                <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
                <RichTextArea value={sections.partnersShowcase.ctaSection?.ar?.description ?? ""} onChange={(v) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ctaSection: { ...sections.partnersShowcase.ctaSection, ar: { ...(sections.partnersShowcase.ctaSection?.ar ?? {}), description: v } } } })} maxLength={FIELD_LIMITS.description} rows={3} dir="rtl" variant="arabic" />
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
                <label className={labelClass}>CTA Link</label>
                <input
                  type="text"
                  value={sections.partnersShowcase.ctaSectionLink ?? ""}
                  onChange={(e) => setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ctaSectionLink: e.target.value } })}
                  className={inputClass}
                  placeholder="/contact"
                  maxLength={FIELD_LIMITS.link}
                />
                <FieldError error={validateUrl(sections.partnersShowcase.ctaSectionLink)} />
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
                          if (err) { setUploadError("partnersShowcase-ctaSection-image", err); e.target.value = ""; return; }
                          clearUploadError("partnersShowcase-ctaSection-image");
                          setUploadProgress((prev) => ({ ...prev, "partnersShowcase-ctaSection-image": 0 }));
                          uploadMediaToCloudinary(file, "image", (progress) => {
                            setUploadProgress((prev) => ({ ...prev, "partnersShowcase-ctaSection-image": progress }));
                          }).then((url) => {
                            setSections({ ...sections, partnersShowcase: { ...sections.partnersShowcase, ctaSection: { ...sections.partnersShowcase.ctaSection, image: url } } });
                            setUploadProgress((prev) => ({ ...prev, "partnersShowcase-ctaSection-image": null }));
                          }).catch((uploadErr) => {
                            setUploadError("partnersShowcase-ctaSection-image", uploadErr.message ?? "Image upload failed");
                            setUploadProgress((prev) => ({ ...prev, "partnersShowcase-ctaSection-image": null }));
                          });
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
                <FieldError error={validateUrl(sections.partnersShowcase.ctaSection?.image || "")} />
                {uploadErrors["partnersShowcase-ctaSection-image"] ? (
                  <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors["partnersShowcase-ctaSection-image"]}</p>
                ) : null}
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
              <RichTextArea
                value={sections.cta.description ?? ""}
                onChange={(v) => setSections({ ...sections, cta: { ...sections.cta, description: v } })}
                maxLength={FIELD_LIMITS.description}
                rows={3}
              />
              <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
              <RichTextArea value={sections.cta.ar?.description ?? ""} onChange={(v) => setSections({ ...sections, cta: { ...sections.cta, ar: { ...(sections.cta.ar ?? {}), description: v } } })} maxLength={FIELD_LIMITS.description} rows={3} dir="rtl" variant="arabic" />
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
              {uploadErrors["cta-image"] ? (
                <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors["cta-image"]}</p>
              ) : null}
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
