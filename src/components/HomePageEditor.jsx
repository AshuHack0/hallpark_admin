import { useEffect, useState } from "react";
import { ExternalLink, Plus, Trash2, Upload, Loader2, Save, ChevronDown } from "lucide-react";
import { api, uploadMediaToCloudinary } from "../lib/api";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500";

// Mirrors DEFAULT_HOME_CONTENT.whoWeAre on the frontend. Icon options match
// the lucide icons mapped in WhoWeAre.jsx.
const WHO_WE_ARE_ICONS = ["Layers", "TrendingUp", "Building2"];
const DEFAULT_WHO_WE_ARE = {
  eyebrowHeading: "Who We Are",
  audiences: {
    business: { heading: "Who We Are", body: "" },
    users: { heading: "Parking Made Simple for Users", body: "" },
  },
  highlights: [
    { icon: "Layers", title: "", description: "" },
    { icon: "TrendingUp", title: "", description: "" },
    { icon: "Building2", title: "", description: "" },
  ],
};

const WHY_ICONS = ["Gauge", "ScanLine", "CircleDollarSign", "Clock3", "BarChart3", "Zap", "Package", "Activity", "TrendingUp", "Users", "Lock"];
const DEFAULT_WHY = {
  heading: "Why HalaPark",
  subtitle: "What Makes Us Different",
  items: [
    {
      title: "AI-Powered Intelligence",
      subtitle: "Smart automation that learns and adapts to deliver the best parking experience.",
      icon: "Zap",
      image: "",
    },
    {
      title: "End-to-End Solutions",
      subtitle: "From mobile apps to backend operations, we handle every aspect of modern parking.",
      icon: "Package",
      image: "",
    },
    {
      title: "Real-Time Operations",
      subtitle: "Live tracking, instant updates, and immediate insights to optimize your parking ecosystem.",
      icon: "Activity",
      image: "",
    },
    {
      title: "Scalable Infrastructure",
      subtitle: "Built to grow with your business, from single properties to enterprise networks.",
      icon: "TrendingUp",
      image: "",
    },
    {
      title: "User-Centric Design",
      subtitle: "Intuitive interfaces and seamless experiences that customers love.",
      icon: "Users",
      image: "",
    },
    {
      title: "Security & Compliance",
      subtitle: "Enterprise-grade security with full compliance for financial and operational data.",
      icon: "Lock",
      image: "",
    },
  ],
};

// 9 Remaining sections defaults
const DEFAULT_AI_POWERED_PARKING = {
  cards: [
    {
      title: "For User",
      audienceTag: "APP EXPERIENCE",
      description: "Intelligent automation helps you find and access available parking faster, reducing wait time and making every journey smooth and stress-free.",
      ctaLabel: "View for Customer",
      href: "/app",
    },
    {
      title: "For Businesses / Property owners",
      audienceTag: "BUSINESS SUITE",
      description: "Advanced automation streamlines parking management, improves space utilization, and delivers real-time insights to increase efficiency and revenue.",
      ctaLabel: "View for Business",
      href: "/business",
    },
  ],
};

const DEFAULT_HOW_IT_WORKS = {
  heading: "HOW IT",
  headingGradient: "WORKS",
  subtitle: "Watch the quick demo showing how easy it is to discover an open spot, reserve instantly, and complete payment inside HalaPark.",
  steps: [
    { id: "01", title: "Search", description: "Find available parking near you." },
    { id: "02", title: "Book", description: "Reserve instantly or schedule ahead." },
    { id: "03", title: "Park", description: "Arrive stress-free - your spot is ready." },
  ],
  ctaLabel: "Find Parking",
  ctaHref: "/app",
  videoUrl: "/HalaPark.mp4",
};

const DEFAULT_BLACK_BANNER = {
  title: "AI-Powered Smart Parking Solutions",
  description: "Seamlessly manage parking experiences for both customers and landlords through intelligent automation, real-time insights, and optimized operations designed to improve efficiency and performance.",
  ctas: [
    { label: "View for Customers", href: "/solutions?view=customers" },
    { label: "View for Landlords", href: "/solutions?view=landlords" },
  ],
};

const DEFAULT_GOOD_LOOKING_SERVICES = {
  parkingIntegrations: [
    { name: "Technical Support", bgcolor: "bg-[#EC4899]", img: "/Group11.svg" },
    { name: "Operations", bgcolor: "bg-[#4A44FE]", img: "/Group66.png" },
    { name: "Installation", bgcolor: "bg-[#EC4899]", img: "/Group22.svg" },
    { name: "Equipment Supply", bgcolor: "bg-[#0088FF]", img: "/Group55.png" },
    { name: "Advisory Services", bgcolor: "bg-[#FA4162]", img: "/Group33.svg" },
    { name: "Management", bgcolor: "bg-[#923BE2]", img: "/Group44.svg" },
  ],
};

const DEFAULT_SOLUTION_INTEGRATION = {
  heading: "Solution",
  headingGradient: "Integration",
  subtitle: "End-to-end integrated parking solution that connects hardware, software, and operations into one unified platform.",
  solutionCards: [
    { id: "barrier", title: "All-in-One Barrier Integration", description: "All-in-one compact system with barriers, AI cameras, and lighting for efficient parking." },
    { id: "camera", title: "ANPR & AI Camera Integration", description: "ANPR and AI cameras enable secure, real-time parking detection." },
    { id: "systems", title: "Guidance Display Integration", description: "Smart displays show real-time parking info for better user experience." },
    { id: "kiosk", title: "Software & Kiosk Integration", description: "Unified system with apps, operations, and kiosks for quick payments and access." },
    { id: "sensor", title: "Sensor-Based Parking Management", description: "Smart displays show real-time parking info for better user experience." },
    { id: "end-to-end", title: "End-to-End System Integration", description: "Integrated platform for scalable, automated parking operations." },
  ],
};

const DEFAULT_TECHNOLOGY_SECTION = {
  heading: "All-in-One Intelligent",
  headingGradient: "System",
  subtitle: "Redefining the future of smart parking management with one connected system for automation, insights, and operations.",
};

const DEFAULT_CLIENTS_PARTNERS = {
  heading: "Built Together with Our",
  headingBr: true,
  headingEnd: "Clients & Partners",
  logoPlaceholders: [
    "Client Logo",
    "Partner Logo",
    "Retail Logo",
    "Enterprise Logo",
    "Property Logo",
    "Technology Logo",
    "Operator Logo",
    "Platform Logo",
  ],
};

const DEFAULT_GLOBAL_MOBILITY = {
  heading: "Global Mobility Network",
  subtitle: "Connected parking solutions across continents",
  capabilities: [
    {
      title: "Unified Ecosystem",
      description: "Seamless integration with leading industry partners across the UAE.",
    },
    {
      title: "Global Reach",
      description: "Designed to connect with third-party and toll systems across the UAE.",
    },
    {
      title: "Cashless & Flexible",
      description: "Pay-later options with secure online payments via encrypted links.",
    },
  ],
  impactStats: [
    { value: "10K+", label: "Parking Zones Powered" },
    { value: "1M+", label: "Users Served" },
    { value: "100%", label: "Cashless Experience" },
    { value: "1 Vision", label: "Partnering for a Smarter Tomorrow" },
  ],
};

const DEFAULT_HALAPARK_IN_ACTION = {
  heading: "HalaPark In Action",
  subtitle: "Experience the future of parking management",
  storeLinks: [
    { icon: "/image--04.png", alt: "App Store", label: "App Store" },
    { icon: "/image 4.png", alt: "Play Store", label: "Play Store" },
    { icon: "/channels4_profile.jpg", alt: "Huawei AppGallery", label: "Huawei" },
  ],
};

function emptySlide() {
  return {
    id: Date.now(),
    tag: "",
    title: "",
    subtitle: "",
    description: "",
    image: "",
    cardImg: "",
    video: "",
  };
}

// A labelled text input + Cloudinary upload button for one media field.
function MediaField({ label, value, accept, resourceType, uploading, progress, onChange, onUpload }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
          placeholder={`${label} URL or /path`}
        />
        <label
          className={`shrink-0 inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold ${
            uploading
              ? "cursor-not-allowed border-slate-200 text-slate-400"
              : "cursor-pointer border-[#0088FF]/30 bg-[#EEF6FF] text-[#0088FF] hover:bg-[#dcecff]"
          }`}
          title={`Upload ${label} to Cloudinary`}
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
            accept={accept}
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) onUpload(file, resourceType);
            }}
          />
        </label>
      </div>
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(6,6,22,0.04)]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-5 hover:bg-slate-50"
      >
        <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-slate-500">{title}</h3>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="border-t border-slate-200 p-5">{children}</div>}
    </div>
  );
}

export default function HomePageEditor() {
  const slug = "home";
  const [page, setPage] = useState(null);
  const [slides, setSlides] = useState([]);
  const [whoWeAre, setWhoWeAre] = useState(DEFAULT_WHO_WE_ARE);
  const [whyHalapark, setWhyHalapark] = useState(DEFAULT_WHY);
  const [aiPoweredParking, setAiPoweredParking] = useState(DEFAULT_AI_POWERED_PARKING);
  const [howItWorks, setHowItWorks] = useState(DEFAULT_HOW_IT_WORKS);
  const [blackBanner, setBlackBanner] = useState(DEFAULT_BLACK_BANNER);
  const [goodLookingServices, setGoodLookingServices] = useState(DEFAULT_GOOD_LOOKING_SERVICES);
  const [solutionIntegration, setSolutionIntegration] = useState(DEFAULT_SOLUTION_INTEGRATION);
  const [technologySection, setTechnologySection] = useState(DEFAULT_TECHNOLOGY_SECTION);
  const [clientsPartners, setClientsPartners] = useState(DEFAULT_CLIENTS_PARTNERS);
  const [globalMobility, setGlobalMobility] = useState(DEFAULT_GLOBAL_MOBILITY);
  const [halaParkInAction, setHalaParkInAction] = useState(DEFAULT_HALAPARK_IN_ACTION);
  const [sectionsObj, setSectionsObj] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    document.title = "Home — HalaPark Admin";
    setLoading(true);
    api
      .getPage(slug)
      .then((data) => {
        setPage(data.page);
        const sections = data.page.sections ?? {};
        setSectionsObj(sections);
        setSlides(Array.isArray(sections.hero?.slides) ? sections.hero.slides : []);
        setWhoWeAre({ ...DEFAULT_WHO_WE_ARE, ...(sections.whoWeAre ?? {}) });
        setWhyHalapark({ ...DEFAULT_WHY, ...(sections.whyHalapark ?? {}) });
        setAiPoweredParking({ ...DEFAULT_AI_POWERED_PARKING, ...(sections.aiPoweredParking ?? {}) });
        setHowItWorks({ ...DEFAULT_HOW_IT_WORKS, ...(sections.howItWorks ?? {}) });
        setBlackBanner({ ...DEFAULT_BLACK_BANNER, ...(sections.blackBanner ?? {}) });
        setGoodLookingServices({ ...DEFAULT_GOOD_LOOKING_SERVICES, ...(sections.goodLookingServices ?? {}) });
        setSolutionIntegration({ ...DEFAULT_SOLUTION_INTEGRATION, ...(sections.solutionIntegration ?? {}) });
        setTechnologySection({ ...DEFAULT_TECHNOLOGY_SECTION, ...(sections.technologySection ?? {}) });
        setClientsPartners({ ...DEFAULT_CLIENTS_PARTNERS, ...(sections.clientsPartners ?? {}) });
        setGlobalMobility({ ...DEFAULT_GLOBAL_MOBILITY, ...(sections.globalMobility ?? {}) });
        setHalaParkInAction({ ...DEFAULT_HALAPARK_IN_ACTION, ...(sections.halaParkInAction ?? {}) });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function updateSlide(index, field, value) {
    setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  }

  function updateWhoAudience(which, field, value) {
    setWhoWeAre((prev) => ({
      ...prev,
      audiences: {
        ...prev.audiences,
        [which]: { ...prev.audiences[which], [field]: value },
      },
    }));
  }

  function updateWhoHighlight(i, field, value) {
    setWhoWeAre((prev) => ({
      ...prev,
      highlights: prev.highlights.map((h, idx) => (idx === i ? { ...h, [field]: value } : h)),
    }));
  }

  function updateWhyItem(i, field, value) {
    setWhyHalapark((prev) => ({
      ...prev,
      items: (prev.items ?? []).map((it, idx) => (idx === i ? { ...it, [field]: value } : it)),
    }));
  }

  function addWhyItem() {
    setWhyHalapark((prev) => ({
      ...prev,
      items: [...(prev.items ?? []), { icon: "Gauge", title: "", subtitle: "", image: "" }],
    }));
  }

  function removeWhyItem(i) {
    setWhyHalapark((prev) => ({
      ...prev,
      items: (prev.items ?? []).filter((_, idx) => idx !== i),
    }));
  }

  function updateAiCard(i, field, value) {
    setAiPoweredParking((prev) => ({
      ...prev,
      cards: prev.cards.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
    }));
  }

  function updateHowStep(i, field, value) {
    setHowItWorks((prev) => ({
      ...prev,
      steps: prev.steps.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)),
    }));
  }

  function updateBlackBannerCta(i, field, value) {
    setBlackBanner((prev) => ({
      ...prev,
      ctas: prev.ctas.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
    }));
  }

  function updateGoodServiceIntegration(i, field, value) {
    setGoodLookingServices((prev) => ({
      ...prev,
      parkingIntegrations: prev.parkingIntegrations.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)),
    }));
  }

  function updateSolutionCard(i, field, value) {
    setSolutionIntegration((prev) => ({
      ...prev,
      solutionCards: prev.solutionCards.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
    }));
  }

  function updateCapability(i, field, value) {
    setGlobalMobility((prev) => ({
      ...prev,
      capabilities: prev.capabilities.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
    }));
  }

  function updateImpactStat(i, field, value) {
    setGlobalMobility((prev) => ({
      ...prev,
      impactStats: prev.impactStats.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)),
    }));
  }

  function updateStoreLink(i, field, value) {
    setHalaParkInAction((prev) => ({
      ...prev,
      storeLinks: prev.storeLinks.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)),
    }));
  }

  async function handleWhyImageUpload(i, file) {
    const key = `why-${i}-image`;
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct })),
      );
      updateWhyItem(i, "image", url);
      setSuccess("Image uploaded. Remember to Save.");
    } catch (err) {
      setError(err.message ?? "Upload failed");
    } finally {
      setUploadProgress((p) => {
        const next = { ...p };
        delete next[key];
        return next;
      });
    }
  }

  function addSlide() {
    setSlides((prev) => [...prev, emptySlide()]);
  }

  function removeSlide(index) {
    setSlides((prev) => prev.filter((_, i) => i !== index));
  }

  function moveSlide(index, dir) {
    setSlides((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function handleUpload(index, field, file, resourceType) {
    const key = `${index}-${field}`;
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, resourceType, (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct })),
      );
      updateSlide(index, field, url);
      setSuccess("Media uploaded. Remember to Save.");
    } catch (err) {
      setError(err.message ?? "Upload failed");
    } finally {
      setUploadProgress((p) => {
        const next = { ...p };
        delete next[key];
        return next;
      });
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const sections = {
        ...sectionsObj,
        hero: { ...(sectionsObj.hero ?? {}), slides },
        whoWeAre,
        whyHalapark,
        aiPoweredParking,
        howItWorks,
        blackBanner,
        goodLookingServices,
        solutionIntegration,
        technologySection,
        clientsPartners,
        globalMobility,
        halaParkInAction,
      };
      const data = await api.updatePage(slug, { sections });
      setPage(data.page);
      setSectionsObj(data.page.sections ?? sections);
      setSuccess("Home page saved successfully.");
    } catch (err) {
      setError(err.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-500">Loading home page…</p>;
  if (!page) {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
        {error || "Home page not found"}
      </div>
    );
  }

  const prog = (i, f) => uploadProgress[`${i}-${f}`];

  return (
    <div className="w-full space-y-6 px-6 py-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#050A13]">Home Page Editor</h1>
          <p className="mt-2 text-sm text-slate-600">Manage all hero slides and page sections</p>
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

        {/* HERO SLIDES */}
        <div className="space-y-4">
          {slides.map((slide, index) => (
            <div key={slide.id ?? index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(6,6,22,0.04)]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-slate-500">
                  Slide {index + 1}
                  {index < 3 ? null : <span className="ml-2 text-[10px] font-medium normal-case text-amber-500">(not shown — only first 3)</span>}
                </h3>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveSlide(index, -1)} disabled={index === 0} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 disabled:opacity-40 hover:border-[#0088FF]">↑</button>
                  <button type="button" onClick={() => moveSlide(index, 1)} disabled={index === slides.length - 1} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 disabled:opacity-40 hover:border-[#0088FF]">↓</button>
                  <button type="button" onClick={() => removeSlide(index)} className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50" title="Remove slide">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                <div>
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>Tag (eyebrow / headline)</label>
                    <span className={`text-[10px] font-medium ${(slide.tag ?? "").length > 60 ? "text-red-500" : "text-slate-400"}`}>
                      {(slide.tag ?? "").length}/60
                    </span>
                  </div>
                  <input
                    value={slide.tag ?? ""}
                    onChange={(e) => updateSlide(index, "tag", e.target.value)}
                    maxLength={60}
                    className={inputClass}
                    placeholder="Tag"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">Keep it short — long headlines may clip on the slider.</p>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className={labelClass}>Title</label>
                    <span className={`text-[10px] font-medium ${(slide.title ?? "").length > 160 ? "text-red-500" : "text-slate-400"}`}>
                      {(slide.title ?? "").length}/160
                    </span>
                  </div>
                  <textarea
                    value={slide.title ?? ""}
                    onChange={(e) => updateSlide(index, "title", e.target.value)}
                    maxLength={160}
                    className={inputClass}
                    rows={2}
                    placeholder="Title"
                  />
                </div>
                <div>
                  <label className={labelClass}>Subtitle</label>
                  <textarea value={slide.subtitle ?? ""} onChange={(e) => updateSlide(index, "subtitle", e.target.value)} className={inputClass} rows={2} placeholder="Subtitle" />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea value={slide.description ?? ""} onChange={(e) => updateSlide(index, "description", e.target.value)} className={inputClass} rows={2} placeholder="Description" />
                </div>

                <MediaField
                  label="Background image"
                  value={slide.image}
                  accept="image/*"
                  resourceType="image"
                  uploading={prog(index, "image") !== undefined}
                  progress={prog(index, "image")}
                  onChange={(v) => updateSlide(index, "image", v)}
                  onUpload={(file, rt) => handleUpload(index, "image", file, rt)}
                />
                <MediaField
                  label="Card image"
                  value={slide.cardImg}
                  accept="image/*"
                  resourceType="image"
                  uploading={prog(index, "cardImg") !== undefined}
                  progress={prog(index, "cardImg")}
                  onChange={(v) => updateSlide(index, "cardImg", v)}
                  onUpload={(file, rt) => handleUpload(index, "cardImg", file, rt)}
                />
                <MediaField
                  label="Background video (optional)"
                  value={slide.video}
                  accept="video/*"
                  resourceType="video"
                  uploading={prog(index, "video") !== undefined}
                  progress={prog(index, "video")}
                  onChange={(v) => updateSlide(index, "video", v)}
                  onUpload={(file, rt) => handleUpload(index, "video", file, rt)}
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addSlide}
            className="inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Slide
          </button>
        </div>

        {/* WHO WE ARE SECTION */}
        <CollapsibleSection title="Who We Are Section">
          <div className="grid gap-3">
            <div>
              <label className={labelClass}>Eyebrow heading (animated)</label>
              <input
                value={whoWeAre.eyebrowHeading ?? ""}
                onChange={(e) => setWhoWeAre((p) => ({ ...p, eyebrowHeading: e.target.value }))}
                className={inputClass}
                placeholder="Who We Are"
              />
            </div>

            {["business", "users"].map((which) => (
              <div key={which} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {which === "business" ? "Business tab" : "Users tab"}
                </p>
                <div className="grid gap-2">
                  <input
                    value={whoWeAre.audiences?.[which]?.heading ?? ""}
                    onChange={(e) => updateWhoAudience(which, "heading", e.target.value)}
                    className={inputClass}
                    placeholder="Heading"
                  />
                  <textarea
                    value={whoWeAre.audiences?.[which]?.body ?? ""}
                    onChange={(e) => updateWhoAudience(which, "body", e.target.value)}
                    className={inputClass}
                    rows={3}
                    placeholder="Body"
                  />
                </div>
              </div>
            ))}

            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Highlights
            </p>
            {(whoWeAre.highlights ?? []).map((h, i) => (
              <div key={i} className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-[140px_1fr]">
                <select
                  value={h.icon ?? "Layers"}
                  onChange={(e) => updateWhoHighlight(i, "icon", e.target.value)}
                  className={inputClass}
                >
                  {WHO_WE_ARE_ICONS.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <div className="grid gap-2">
                  <input
                    value={h.title ?? ""}
                    onChange={(e) => updateWhoHighlight(i, "title", e.target.value)}
                    className={inputClass}
                    placeholder="Title"
                  />
                  <textarea
                    value={h.description ?? ""}
                    onChange={(e) => updateWhoHighlight(i, "description", e.target.value)}
                    className={inputClass}
                    rows={2}
                    placeholder="Description"
                  />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* WHY HALAPARK SECTION */}
        <CollapsibleSection title="Why Halapark Section">
          <div className="grid gap-3">
            <div>
              <label className={labelClass}>Heading (first word plain, rest gradient)</label>
              <input
                value={whyHalapark.heading ?? ""}
                onChange={(e) => setWhyHalapark((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
                placeholder="Why Halapark"
              />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <input
                value={whyHalapark.subtitle ?? ""}
                onChange={(e) => setWhyHalapark((p) => ({ ...p, subtitle: e.target.value }))}
                className={inputClass}
                placeholder="Subtitle"
              />
            </div>

            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Feature items (first 5 shown)
            </p>
            {(whyHalapark.items ?? []).map((it, i) => {
              const upKey = `why-${i}-image`;
              const uploading = uploadProgress[upKey] !== undefined;
              return (
                <div key={i} className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
                    <select
                      value={it.icon ?? "Gauge"}
                      onChange={(e) => updateWhyItem(i, "icon", e.target.value)}
                      className={inputClass}
                    >
                      {WHY_ICONS.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                    <input
                      value={it.title ?? ""}
                      onChange={(e) => updateWhyItem(i, "title", e.target.value)}
                      className={inputClass}
                      placeholder="Title"
                    />
                  </div>
                  <textarea
                    value={it.subtitle ?? ""}
                    onChange={(e) => updateWhyItem(i, "subtitle", e.target.value)}
                    className={inputClass}
                    rows={2}
                    placeholder="Subtitle"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      value={it.image ?? ""}
                      onChange={(e) => updateWhyItem(i, "image", e.target.value)}
                      className={inputClass}
                      placeholder="Image URL or /path"
                    />
                    <label
                      className={`shrink-0 inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold ${
                        uploading
                          ? "cursor-not-allowed border-slate-200 text-slate-400"
                          : "cursor-pointer border-[#0088FF]/30 bg-[#EEF6FF] text-[#0088FF] hover:bg-[#dcecff]"
                      }`}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          {uploadProgress[upKey]}%
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
                          if (file) handleWhyImageUpload(i, file);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeWhyItem(i)}
                      className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              onClick={addWhyItem}
              className="inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Feature Item
            </button>
          </div>
        </CollapsibleSection>

        {/* AI POWERED PARKING SERVICE */}
        <CollapsibleSection title="AI Powered Parking Service Section">
          <div className="grid gap-3">
            {(aiPoweredParking.cards ?? []).map((card, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Card {i + 1}</p>
                <div className="grid gap-2">
                  <input
                    value={card.title ?? ""}
                    onChange={(e) => updateAiCard(i, "title", e.target.value)}
                    className={inputClass}
                    placeholder="Title"
                  />
                  <input
                    value={card.audienceTag ?? ""}
                    onChange={(e) => updateAiCard(i, "audienceTag", e.target.value)}
                    className={inputClass}
                    placeholder="Audience Tag"
                  />
                  <textarea
                    value={card.description ?? ""}
                    onChange={(e) => updateAiCard(i, "description", e.target.value)}
                    className={inputClass}
                    rows={2}
                    placeholder="Description"
                  />
                  <input
                    value={card.ctaLabel ?? ""}
                    onChange={(e) => updateAiCard(i, "ctaLabel", e.target.value)}
                    className={inputClass}
                    placeholder="CTA Label"
                  />
                  <input
                    value={card.href ?? ""}
                    onChange={(e) => updateAiCard(i, "href", e.target.value)}
                    className={inputClass}
                    placeholder="Link href"
                  />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* HOW IT WORKS */}
        <CollapsibleSection title="How It Works Section">
          <div className="grid gap-3">
            <div>
              <label className={labelClass}>Heading (first part)</label>
              <input
                value={howItWorks.heading ?? ""}
                onChange={(e) => setHowItWorks((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient (second part)</label>
              <input
                value={howItWorks.headingGradient ?? ""}
                onChange={(e) => setHowItWorks((p) => ({ ...p, headingGradient: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <textarea
                value={howItWorks.subtitle ?? ""}
                onChange={(e) => setHowItWorks((p) => ({ ...p, subtitle: e.target.value }))}
                className={inputClass}
                rows={2}
              />
            </div>
            <div>
              <label className={labelClass}>Video URL</label>
              <input
                value={howItWorks.videoUrl ?? ""}
                onChange={(e) => setHowItWorks((p) => ({ ...p, videoUrl: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>CTA Label</label>
              <input
                value={howItWorks.ctaLabel ?? ""}
                onChange={(e) => setHowItWorks((p) => ({ ...p, ctaLabel: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>CTA Href</label>
              <input
                value={howItWorks.ctaHref ?? ""}
                onChange={(e) => setHowItWorks((p) => ({ ...p, ctaHref: e.target.value }))}
                className={inputClass}
              />
            </div>

            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Steps</p>
            {(howItWorks.steps ?? []).map((step, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Step {i + 1}</p>
                <div className="grid gap-2">
                  <input
                    value={step.title ?? ""}
                    onChange={(e) => updateHowStep(i, "title", e.target.value)}
                    className={inputClass}
                    placeholder="Title"
                  />
                  <textarea
                    value={step.description ?? ""}
                    onChange={(e) => updateHowStep(i, "description", e.target.value)}
                    className={inputClass}
                    rows={2}
                    placeholder="Description"
                  />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* BLACK BANNER */}
        <CollapsibleSection title="Black Banner Section">
          <div className="grid gap-3">
            <div>
              <label className={labelClass}>Title</label>
              <textarea
                value={blackBanner.title ?? ""}
                onChange={(e) => setBlackBanner((p) => ({ ...p, title: e.target.value }))}
                className={inputClass}
                rows={2}
              />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={blackBanner.description ?? ""}
                onChange={(e) => setBlackBanner((p) => ({ ...p, description: e.target.value }))}
                className={inputClass}
                rows={3}
              />
            </div>

            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">CTAs</p>
            {(blackBanner.ctas ?? []).map((cta, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">CTA {i + 1}</p>
                <div className="grid gap-2">
                  <input
                    value={cta.label ?? ""}
                    onChange={(e) => updateBlackBannerCta(i, "label", e.target.value)}
                    className={inputClass}
                    placeholder="Label"
                  />
                  <input
                    value={cta.href ?? ""}
                    onChange={(e) => updateBlackBannerCta(i, "href", e.target.value)}
                    className={inputClass}
                    placeholder="Href"
                  />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* GOOD LOOKING SERVICES */}
        <CollapsibleSection title="Good Looking Services Section">
          <div className="grid gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Parking Integrations</p>
            {(goodLookingServices.parkingIntegrations ?? []).map((integration, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Integration {i + 1}</p>
                <div className="grid gap-2">
                  <input
                    value={integration.name ?? ""}
                    onChange={(e) => updateGoodServiceIntegration(i, "name", e.target.value)}
                    className={inputClass}
                    placeholder="Name"
                  />
                  <input
                    value={integration.bgcolor ?? ""}
                    onChange={(e) => updateGoodServiceIntegration(i, "bgcolor", e.target.value)}
                    className={inputClass}
                    placeholder="Background color class (e.g., bg-[#EC4899])"
                  />
                  <input
                    value={integration.img ?? ""}
                    onChange={(e) => updateGoodServiceIntegration(i, "img", e.target.value)}
                    className={inputClass}
                    placeholder="Image path"
                  />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* SOLUTION INTEGRATION */}
        <CollapsibleSection title="Solution Integration Section">
          <div className="grid gap-3">
            <div>
              <label className={labelClass}>Heading (first part)</label>
              <input
                value={solutionIntegration.heading ?? ""}
                onChange={(e) => setSolutionIntegration((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient (second part)</label>
              <input
                value={solutionIntegration.headingGradient ?? ""}
                onChange={(e) => setSolutionIntegration((p) => ({ ...p, headingGradient: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <textarea
                value={solutionIntegration.subtitle ?? ""}
                onChange={(e) => setSolutionIntegration((p) => ({ ...p, subtitle: e.target.value }))}
                className={inputClass}
                rows={2}
              />
            </div>

            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Solution Cards</p>
            {(solutionIntegration.solutionCards ?? []).map((card, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Card {i + 1}</p>
                <div className="grid gap-2">
                  <input
                    value={card.title ?? ""}
                    onChange={(e) => updateSolutionCard(i, "title", e.target.value)}
                    className={inputClass}
                    placeholder="Title"
                  />
                  <textarea
                    value={card.description ?? ""}
                    onChange={(e) => updateSolutionCard(i, "description", e.target.value)}
                    className={inputClass}
                    rows={2}
                    placeholder="Description"
                  />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* TECHNOLOGY SECTION */}
        <CollapsibleSection title="Technology Section">
          <div className="grid gap-3">
            <div>
              <label className={labelClass}>Heading (first part)</label>
              <input
                value={technologySection.heading ?? ""}
                onChange={(e) => setTechnologySection((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient (second part)</label>
              <input
                value={technologySection.headingGradient ?? ""}
                onChange={(e) => setTechnologySection((p) => ({ ...p, headingGradient: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <textarea
                value={technologySection.subtitle ?? ""}
                onChange={(e) => setTechnologySection((p) => ({ ...p, subtitle: e.target.value }))}
                className={inputClass}
                rows={2}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* CLIENTS & PARTNERS */}
        <CollapsibleSection title="Clients & Partners Section">
          <div className="grid gap-3">
            <div>
              <label className={labelClass}>Heading (first part)</label>
              <input
                value={clientsPartners.heading ?? ""}
                onChange={(e) => setClientsPartners((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={clientsPartners.headingBr ?? false}
                  onChange={(e) => setClientsPartners((p) => ({ ...p, headingBr: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-[#0088FF]"
                />
                Add line break before end text
              </label>
            </div>
            <div>
              <label className={labelClass}>Heading End (second part)</label>
              <input
                value={clientsPartners.headingEnd ?? ""}
                onChange={(e) => setClientsPartners((p) => ({ ...p, headingEnd: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* GLOBAL MOBILITY NETWORK */}
        <CollapsibleSection title="Global Mobility Network Section">
          <div className="grid gap-3">
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={globalMobility.heading ?? ""}
                onChange={(e) => setGlobalMobility((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <input
                value={globalMobility.subtitle ?? ""}
                onChange={(e) => setGlobalMobility((p) => ({ ...p, subtitle: e.target.value }))}
                className={inputClass}
              />
            </div>

            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Capabilities</p>
            {(globalMobility.capabilities ?? []).map((cap, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Capability {i + 1}</p>
                <div className="grid gap-2">
                  <input
                    value={cap.title ?? ""}
                    onChange={(e) => updateCapability(i, "title", e.target.value)}
                    className={inputClass}
                    placeholder="Title"
                  />
                  <textarea
                    value={cap.description ?? ""}
                    onChange={(e) => updateCapability(i, "description", e.target.value)}
                    className={inputClass}
                    rows={2}
                    placeholder="Description"
                  />
                </div>
              </div>
            ))}

            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Impact Stats</p>
            {(globalMobility.impactStats ?? []).map((stat, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Stat {i + 1}</p>
                <div className="grid gap-2">
                  <input
                    value={stat.value ?? ""}
                    onChange={(e) => updateImpactStat(i, "value", e.target.value)}
                    className={inputClass}
                    placeholder="Value (e.g., 10K+)"
                  />
                  <input
                    value={stat.label ?? ""}
                    onChange={(e) => updateImpactStat(i, "label", e.target.value)}
                    className={inputClass}
                    placeholder="Label"
                  />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* HALAPARK IN ACTION */}
        <CollapsibleSection title="HalaPark In Action Section">
          <div className="grid gap-3">
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={halaParkInAction.heading ?? ""}
                onChange={(e) => setHalaParkInAction((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <input
                value={halaParkInAction.subtitle ?? ""}
                onChange={(e) => setHalaParkInAction((p) => ({ ...p, subtitle: e.target.value }))}
                className={inputClass}
              />
            </div>

            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Store Links</p>
            {(halaParkInAction.storeLinks ?? []).map((link, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Store {i + 1}</p>
                <div className="grid gap-2">
                  <input
                    value={link.icon ?? ""}
                    onChange={(e) => updateStoreLink(i, "icon", e.target.value)}
                    className={inputClass}
                    placeholder="Icon path"
                  />
                  <input
                    value={link.alt ?? ""}
                    onChange={(e) => updateStoreLink(i, "alt", e.target.value)}
                    className={inputClass}
                    placeholder="Alt text"
                  />
                  <input
                    value={link.label ?? ""}
                    onChange={(e) => updateStoreLink(i, "label", e.target.value)}
                    className={inputClass}
                    placeholder="Store label (e.g., App Store)"
                  />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
