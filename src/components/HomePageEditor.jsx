import { useEffect, useState } from "react";
import { ExternalLink, Plus, Trash2, Upload, Loader2, Save, ChevronDown, ImageIcon } from "lucide-react";
import { api, uploadMediaToCloudinary } from "../lib/api";
import { FIELD_LIMITS, CharCount, FieldError, ArInput } from "./CappedField";
import { validateUrl, validateImageFile, validateVideoFile, validateEmail, validatePhone } from "../lib/validators";

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
  heading: "SERVICES",
  exploreCtaLabel: "Explore Services",
  exploreCtaLink: "/services",
  contactCtaLabel: "Talk to us",
  contactCtaLink: "/contact",
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
  // Uploaded logo images shown in the ticker. Each: { image, alt }.
  logos: [],
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
    mediaType: "image", // "image" | "video"
    image: "",
    cardImg: "",
    video: "",
  };
}

// Derive the media type for a slide loaded from the DB (older slides have no
// mediaType): a video means "video", otherwise "image".
function slideMediaType(slide) {
  if (slide.mediaType === "image" || slide.mediaType === "video") return slide.mediaType;
  return slide.video ? "video" : "image";
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
      <FieldError error={validateUrl(value)} />
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
  const [supportCta, setSupportCta] = useState({});
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
        {
          // Ribbon removed: drop the legacy parkingIntegrations key so the next
          // save cleans it out of the DB.
          // eslint-disable-next-line no-unused-vars
          const { parkingIntegrations: _legacyRibbon, ...gls } = sections.goodLookingServices ?? {};
          setGoodLookingServices({ ...DEFAULT_GOOD_LOOKING_SERVICES, ...gls });
        }
        setSolutionIntegration({ ...DEFAULT_SOLUTION_INTEGRATION, ...(sections.solutionIntegration ?? {}) });
        setTechnologySection({ ...DEFAULT_TECHNOLOGY_SECTION, ...(sections.technologySection ?? {}) });
        setClientsPartners({ ...DEFAULT_CLIENTS_PARTNERS, ...(sections.clientsPartners ?? {}) });
        setGlobalMobility({ ...DEFAULT_GLOBAL_MOBILITY, ...(sections.globalMobility ?? {}) });
        setHalaParkInAction({ ...DEFAULT_HALAPARK_IN_ACTION, ...(sections.halaParkInAction ?? {}) });
        setSupportCta(sections.supportCta ?? {});
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

  async function handleAiCardImageUpload(i, file) {
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    const key = `aicard-${i}`;
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct })),
      );
      updateAiCard(i, "imageSrc", url);
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

  function updateHowStep(i, field, value) {
    setHowItWorks((prev) => ({
      ...prev,
      steps: (prev.steps ?? []).map((s, idx) => (idx === i ? { ...s, [field]: value } : s)),
    }));
  }
  function addHowStep() {
    setHowItWorks((prev) => ({ ...prev, steps: [...(prev.steps ?? []), { title: "", description: "" }] }));
  }
  function removeHowStep(i) {
    setHowItWorks((prev) => ({ ...prev, steps: (prev.steps ?? []).filter((_, idx) => idx !== i) }));
  }

  function updateBlackBannerCta(i, field, value) {
    setBlackBanner((prev) => ({
      ...prev,
      ctas: prev.ctas.map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
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
      capabilities: (prev.capabilities ?? []).map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
    }));
  }
  function addCapability() {
    setGlobalMobility((prev) => ({ ...prev, capabilities: [...(prev.capabilities ?? []), { title: "", description: "" }] }));
  }
  function removeCapability(i) {
    setGlobalMobility((prev) => ({ ...prev, capabilities: (prev.capabilities ?? []).filter((_, idx) => idx !== i) }));
  }

  function updateImpactStat(i, field, value) {
    setGlobalMobility((prev) => ({
      ...prev,
      impactStats: (prev.impactStats ?? []).map((s, idx) => (idx === i ? { ...s, [field]: value } : s)),
    }));
  }
  function addImpactStat() {
    setGlobalMobility((prev) => ({ ...prev, impactStats: [...(prev.impactStats ?? []), { value: "", label: "", icon: "building" }] }));
  }
  function removeImpactStat(i) {
    setGlobalMobility((prev) => ({ ...prev, impactStats: (prev.impactStats ?? []).filter((_, idx) => idx !== i) }));
  }

  // ── Global Mobility map animation (mapNodes / mapLinks) ───────────────────
  function updateMapNode(i, field, value) {
    setGlobalMobility((prev) => ({
      ...prev,
      mapNodes: (prev.mapNodes ?? []).map((n, idx) => (idx === i ? { ...n, [field]: value } : n)),
    }));
  }
  function addMapNode() {
    setGlobalMobility((prev) => ({ ...prev, mapNodes: [...(prev.mapNodes ?? []), { id: "", label: "", x: 50, y: 50 }] }));
  }
  function removeMapNode(i) {
    setGlobalMobility((prev) => ({ ...prev, mapNodes: (prev.mapNodes ?? []).filter((_, idx) => idx !== i) }));
  }
  function updateMapLink(i, field, value) {
    setGlobalMobility((prev) => ({
      ...prev,
      mapLinks: (prev.mapLinks ?? []).map((l, idx) => (idx === i ? { ...l, [field]: value } : l)),
    }));
  }
  function addMapLink() {
    setGlobalMobility((prev) => ({ ...prev, mapLinks: [...(prev.mapLinks ?? []), { from: "", to: "", curve: -12 }] }));
  }
  function removeMapLink(i) {
    setGlobalMobility((prev) => ({ ...prev, mapLinks: (prev.mapLinks ?? []).filter((_, idx) => idx !== i) }));
  }

  function updateStoreLink(i, field, value) {
    setHalaParkInAction((prev) => ({
      ...prev,
      storeLinks: (prev.storeLinks ?? []).map((l, idx) => (idx === i ? { ...l, [field]: value } : l)),
    }));
  }
  function addStoreLink() {
    setHalaParkInAction((prev) => ({ ...prev, storeLinks: [...(prev.storeLinks ?? []), { icon: "", alt: "", eyebrow: "Download Now On", label: "" }] }));
  }
  function removeStoreLink(i) {
    setHalaParkInAction((prev) => ({ ...prev, storeLinks: (prev.storeLinks ?? []).filter((_, idx) => idx !== i) }));
  }

  async function handleWhyImageUpload(i, file) {
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
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
    setSlides((prev) => {
      if (prev.length <= 1) {
        setError("At least one hero slide is required — you can't remove the last one.");
        return prev;
      }
      return prev.filter((_, i) => i !== index);
    });
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
    const err = resourceType === "video" ? validateVideoFile(file) : validateImageFile(file);
    if (err) { setError(err); return; }
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

  // ── Home Services cards (goodLookingServices.cards) ────────────────────────
  function updateServiceCard(i, field, value) {
    setGoodLookingServices((prev) => ({
      ...prev,
      cards: (prev.cards ?? []).map((c, idx) => (idx === i ? { ...c, [field]: value } : c)),
    }));
  }
  function addServiceCard() {
    setGoodLookingServices((prev) => ({
      ...prev,
      cards: [...(prev.cards ?? []), { slug: "", name: "New Service", summary: "", mediaType: "image", mediaSrc: "" }],
    }));
  }
  function removeServiceCard(i) {
    setGoodLookingServices((prev) => ({
      ...prev,
      cards: (prev.cards ?? []).filter((_, idx) => idx !== i),
    }));
  }
  async function handleServiceCardMediaUpload(i, file, resourceType) {
    const err = resourceType === "video" ? validateVideoFile(file) : validateImageFile(file);
    if (err) { setError(err); return; }
    const key = `glcard-${i}`;
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, resourceType, (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct })),
      );
      updateServiceCard(i, "mediaSrc", url);
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

  // ── Clients & Partners logos ───────────────────────────────────────────────
  function updateLogo(i, field, value) {
    setClientsPartners((prev) => ({
      ...prev,
      logos: (prev.logos ?? []).map((l, idx) => (idx === i ? { ...l, [field]: value } : l)),
    }));
  }
  function addLogo() {
    setClientsPartners((prev) => ({
      ...prev,
      logos: [...(prev.logos ?? []), { image: "", alt: "" }],
    }));
  }
  function removeLogo(i) {
    setClientsPartners((prev) => ({
      ...prev,
      logos: (prev.logos ?? []).filter((_, idx) => idx !== i),
    }));
  }
  async function handleLogoUpload(i, file) {
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    const key = `logo-${i}`;
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct })),
      );
      updateLogo(i, "image", url);
      setSuccess("Logo uploaded. Remember to Save.");
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

  async function handleHowItWorksVideoUpload(file) {
    const err = validateVideoFile(file);
    if (err) { setError(err); return; }
    const key = "howItWorks-video";
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "video", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct })),
      );
      setHowItWorks((prev) => ({ ...prev, videoUrl: url }));
      setSuccess("Video uploaded. Remember to Save.");
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

  async function handleStoreIconUpload(i, file) {
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    const key = `storeLink-${i}-icon`;
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct })),
      );
      updateStoreLink(i, "icon", url);
      setSuccess("Store icon uploaded. Remember to Save.");
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

  async function handleCapIconUpload(i, file) {
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    const key = `gm-cap-${i}-icon`;
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct })),
      );
      updateCapability(i, "iconImage", url);
      setSuccess("Icon uploaded. Remember to Save.");
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

  async function handleStatIconUpload(i, file) {
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    const key = `gm-stat-${i}-icon`;
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct })),
      );
      updateImpactStat(i, "iconImage", url);
      setSuccess("Icon uploaded. Remember to Save.");
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

  async function handleBlackBannerImageUpload(file) {
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    const key = "blackBanner-image";
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct })),
      );
      setBlackBanner((prev) => ({ ...prev, image: url }));
      setSuccess("Banner image uploaded. Remember to Save.");
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

  async function handleSupportImageUpload(file) {
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    const key = "support-image";
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct })),
      );
      setSupportCta((prev) => ({ ...prev, image: url }));
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

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Validation: the hero slider needs at least one slide, and each slide needs
    // some media (video/card image/image) + a title.
    if (slides.length < 1) {
      setError("Please add at least one hero slide before saving.");
      return;
    }
    const badSlide = slides.findIndex((s) => {
      const media = slideMediaType(s) === "video" ? s.video : s.image;
      return !media || !(s.tag || s.title);
    });
    if (badSlide !== -1) {
      setError(`Slide ${badSlide + 1} needs a title and its ${slideMediaType(slides[badSlide])}.`);
      return;
    }
    // Global Mobility map animation: every location needs an ID + label, and
    // every connection must point at existing location IDs. Empty rows can be
    // deleted instead of being silently dropped.
    const gmNodes = globalMobility.mapNodes ?? [];
    const badNode = gmNodes.findIndex((n) => !String(n.id ?? "").trim() || !String(n.label ?? "").trim());
    if (badNode !== -1) {
      setError(`Global Mobility map location ${badNode + 1} needs both an ID and a label — fill them in or delete the row.`);
      return;
    }
    const gmNodeIds = new Set(gmNodes.map((n) => n.id));
    const badLink = (globalMobility.mapLinks ?? []).findIndex((l) => !gmNodeIds.has(l.from) || !gmNodeIds.has(l.to));
    if (badLink !== -1) {
      setError(`Global Mobility map connection ${badLink + 1} needs valid From and To locations — pick existing locations or delete the row.`);
      return;
    }
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
        supportCta,
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
                  <ArInput label="Tag" kind="label" limit={60} value={slide.ar?.tag} onChange={(v) => updateSlide(index, "ar", { ...(slide.ar ?? {}), tag: v })} />
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
                  <ArInput label="Title" kind="subtitle" limit={160} multiline value={slide.ar?.title} onChange={(v) => updateSlide(index, "ar", { ...(slide.ar ?? {}), title: v })} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Button Label</label>
                    <input
                      value={slide.ctaLabel ?? ""}
                      onChange={(e) => updateSlide(index, "ctaLabel", e.target.value)}
                      className={inputClass}
                      placeholder="Get In Touch"
                      maxLength={FIELD_LIMITS.button}
                    />
                    <CharCount value={slide.ctaLabel ?? ""} max={FIELD_LIMITS.button} />
                    <ArInput label="Button Label" kind="button" value={slide.ar?.ctaLabel} onChange={(v) => updateSlide(index, "ar", { ...(slide.ar ?? {}), ctaLabel: v })} />
                  </div>
                  <div>
                    <label className={labelClass}>Button Link</label>
                    <input
                      value={slide.ctaLink ?? ""}
                      onChange={(e) => updateSlide(index, "ctaLink", e.target.value)}
                      className={inputClass}
                      placeholder="/contact"
                      maxLength={FIELD_LIMITS.link}
                    />
                    <p className="mt-1 text-[10px] text-slate-400">Where the button goes (e.g. /contact).</p>
                  </div>
                </div>

                {/* Media: image OR video (one choice per slide) */}
                <div>
                  <label className={labelClass}>Slide Media</label>
                  <div className="mb-2 inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold">
                    {["image", "video"].map((type) => {
                      const active = slideMediaType(slide) === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => updateSlide(index, "mediaType", type)}
                          className={`rounded-md px-4 py-1.5 capitalize transition ${
                            active ? "bg-white text-[#0088FF] shadow-sm" : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                  {slideMediaType(slide) === "video" ? (
                    <MediaField
                      label="Video"
                      value={slide.video}
                      accept="video/*"
                      resourceType="video"
                      uploading={prog(index, "video") !== undefined}
                      progress={prog(index, "video")}
                      onChange={(v) => updateSlide(index, "video", v)}
                      onUpload={(file, rt) => handleUpload(index, "video", file, rt)}
                    />
                  ) : (
                    <MediaField
                      label="Image"
                      value={slide.image}
                      accept="image/*"
                      resourceType="image"
                      uploading={prog(index, "image") !== undefined}
                      progress={prog(index, "image")}
                      onChange={(v) => updateSlide(index, "image", v)}
                      onUpload={(file, rt) => handleUpload(index, "image", file, rt)}
                    />
                  )}
                </div>
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
              <label className={labelClass}>Heading</label>
              <input
                value={whoWeAre.audiences?.business?.heading ?? ""}
                onChange={(e) => updateWhoAudience("business", "heading", e.target.value)}
                maxLength={FIELD_LIMITS.heading}
                className={inputClass}
                placeholder="Who We Are"
              />
              <CharCount value={whoWeAre.audiences?.business?.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={whoWeAre.audiences?.business?.ar?.heading} onChange={(v) => updateWhoAudience("business", "ar", { ...(whoWeAre.audiences?.business?.ar ?? {}), heading: v })} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              {/* Who We Are main description gets a larger cap (1500) — the
                  layout has no clamp, the paragraph just flows down. */}
              <textarea
                value={whoWeAre.audiences?.business?.body ?? ""}
                onChange={(e) => updateWhoAudience("business", "body", e.target.value)}
                maxLength={1500}
                className={inputClass}
                rows={6}
                placeholder="Section description shown on the website"
              />
              <CharCount value={whoWeAre.audiences?.business?.body ?? ""} max={1500} />
              <ArInput label="Body" kind="description" limit={1500} multiline value={whoWeAre.audiences?.business?.ar?.body} onChange={(v) => updateWhoAudience("business", "ar", { ...(whoWeAre.audiences?.business?.ar ?? {}), body: v })} />
            </div>

            <div className="mt-1 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Highlights ({(whoWeAre.highlights ?? []).length})
              </p>
              <button
                type="button"
                onClick={() =>
                  setWhoWeAre((prev) => ({
                    ...prev,
                    highlights: [...(prev.highlights ?? []), { icon: "Layers", title: "", description: "" }],
                  }))
                }
                className="inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-2.5 py-1.5 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff]"
              >
                + Add Highlight
              </button>
            </div>
            {(whoWeAre.highlights ?? []).map((h, i) => (
              <div key={i} className="relative grid gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-[140px_1fr]">
                <button
                  type="button"
                  onClick={() =>
                    setWhoWeAre((prev) => ({
                      ...prev,
                      highlights: (prev.highlights ?? []).filter((_, idx) => idx !== i),
                    }))
                  }
                  title="Delete highlight"
                  className="absolute right-2 top-2 z-10 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100"
                >
                  Delete
                </button>
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
                    maxLength={FIELD_LIMITS.heading}
                    className={inputClass}
                    placeholder="Title"
                  />
                  <CharCount value={h.title ?? ""} max={FIELD_LIMITS.heading} />
                  <ArInput label="Title" kind="heading" value={h.ar?.title} onChange={(v) => updateWhoHighlight(i, "ar", { ...(h.ar ?? {}), title: v })} />
                  <textarea
                    value={h.description ?? ""}
                    onChange={(e) => updateWhoHighlight(i, "description", e.target.value)}
                    maxLength={FIELD_LIMITS.description}
                    className={inputClass}
                    rows={2}
                    placeholder="Description"
                  />
                  <CharCount value={h.description ?? ""} max={FIELD_LIMITS.description} />
                  <ArInput label="Description" kind="description" multiline value={h.ar?.description} onChange={(v) => updateWhoHighlight(i, "ar", { ...(h.ar ?? {}), description: v })} />
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
                maxLength={FIELD_LIMITS.heading}
                className={inputClass}
                placeholder="Why Halapark"
              />
              <CharCount value={whyHalapark.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={whyHalapark.ar?.heading} onChange={(v) => setWhyHalapark((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <input
                value={whyHalapark.subtitle ?? ""}
                onChange={(e) => setWhyHalapark((p) => ({ ...p, subtitle: e.target.value }))}
                maxLength={FIELD_LIMITS.subtitle}
                className={inputClass}
                placeholder="Subtitle"
              />
              <CharCount value={whyHalapark.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
              <ArInput label="Subtitle" kind="subtitle" value={whyHalapark.ar?.subtitle} onChange={(v) => setWhyHalapark((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
            </div>

            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              Feature items (first 5 shown)
            </p>
            {(whyHalapark.items ?? []).map((it, i) => {
              const upKey = `why-${i}-image`;
              const uploading = uploadProgress[upKey] !== undefined;
              return (
                <div key={i} className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                      Feature Item {i + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeWhyItem(i)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
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
                      maxLength={FIELD_LIMITS.heading}
                      className={inputClass}
                      placeholder="Title"
                    />
                  </div>
                  <ArInput label="Title" kind="heading" value={it.ar?.title} onChange={(v) => updateWhyItem(i, "ar", { ...(it.ar ?? {}), title: v })} />
                  <textarea
                    value={it.subtitle ?? ""}
                    onChange={(e) => updateWhyItem(i, "subtitle", e.target.value)}
                    maxLength={FIELD_LIMITS.subtitle}
                    className={inputClass}
                    rows={2}
                    placeholder="Subtitle"
                  />
                  <CharCount value={it.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
                  <ArInput label="Subtitle" kind="subtitle" multiline value={it.ar?.subtitle} onChange={(v) => updateWhyItem(i, "ar", { ...(it.ar ?? {}), subtitle: v })} />
                  <FieldError error={validateUrl(it.image ?? "")} />
                  <div className="flex items-center gap-2">
                    <input
                      value={it.image ?? ""}
                      onChange={(e) => updateWhyItem(i, "image", e.target.value)}
                      maxLength={FIELD_LIMITS.link}
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
            <div>
              <label className={labelClass}>Heading (first part)</label>
              <input
                value={aiPoweredParking.heading ?? ""}
                onChange={(e) => setAiPoweredParking((p) => ({ ...p, heading: e.target.value }))}
                maxLength={FIELD_LIMITS.heading}
                className={inputClass}
                placeholder="AI-POWERED PARKING"
              />
              <CharCount value={aiPoweredParking.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={aiPoweredParking.ar?.heading} onChange={(v) => setAiPoweredParking((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient (second part)</label>
              <input
                value={aiPoweredParking.headingGradient ?? ""}
                onChange={(e) => setAiPoweredParking((p) => ({ ...p, headingGradient: e.target.value }))}
                maxLength={FIELD_LIMITS.label}
                className={inputClass}
                placeholder="SERVICE"
              />
              <CharCount value={aiPoweredParking.headingGradient ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Heading Gradient" kind="label" value={aiPoweredParking.ar?.headingGradient} onChange={(v) => setAiPoweredParking((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={aiPoweredParking.description ?? ""}
                onChange={(e) => setAiPoweredParking((p) => ({ ...p, description: e.target.value }))}
                maxLength={FIELD_LIMITS.description}
                className={inputClass}
                rows={3}
                placeholder="Section description"
              />
              <CharCount value={aiPoweredParking.description ?? ""} max={FIELD_LIMITS.description} />
              <ArInput label="Description" kind="description" multiline value={aiPoweredParking.ar?.description} onChange={(v) => setAiPoweredParking((p) => ({ ...p, ar: { ...(p.ar ?? {}), description: v } }))} />
            </div>

            <div className="my-1 border-t border-slate-200" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Cards</p>
            {(aiPoweredParking.cards ?? []).map((card, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Card {i + 1}</p>
                <div className="grid gap-2">
                  <input
                    value={card.title ?? ""}
                    onChange={(e) => updateAiCard(i, "title", e.target.value)}
                    maxLength={FIELD_LIMITS.heading}
                    className={inputClass}
                    placeholder="Title"
                  />
                  <CharCount value={card.title ?? ""} max={FIELD_LIMITS.heading} />
                  <ArInput label="Title" kind="heading" value={card.ar?.title} onChange={(v) => updateAiCard(i, "ar", { ...(card.ar ?? {}), title: v })} />
                  <input
                    value={card.audienceTag ?? ""}
                    onChange={(e) => updateAiCard(i, "audienceTag", e.target.value)}
                    maxLength={FIELD_LIMITS.label}
                    className={inputClass}
                    placeholder="Audience Tag"
                  />
                  <CharCount value={card.audienceTag ?? ""} max={FIELD_LIMITS.label} />
                  <ArInput label="Audience Tag" kind="label" value={card.ar?.audienceTag} onChange={(v) => updateAiCard(i, "ar", { ...(card.ar ?? {}), audienceTag: v })} />
                  <textarea
                    value={card.description ?? ""}
                    onChange={(e) => updateAiCard(i, "description", e.target.value)}
                    maxLength={FIELD_LIMITS.description}
                    className={inputClass}
                    rows={2}
                    placeholder="Description"
                  />
                  <CharCount value={card.description ?? ""} max={FIELD_LIMITS.description} />
                  <ArInput label="Description" kind="description" multiline value={card.ar?.description} onChange={(v) => updateAiCard(i, "ar", { ...(card.ar ?? {}), description: v })} />
                  <input
                    value={card.ctaLabel ?? ""}
                    onChange={(e) => updateAiCard(i, "ctaLabel", e.target.value)}
                    maxLength={FIELD_LIMITS.button}
                    className={inputClass}
                    placeholder="CTA Label"
                  />
                  <CharCount value={card.ctaLabel ?? ""} max={FIELD_LIMITS.button} />
                  <ArInput label="CTA Label" kind="button" value={card.ar?.ctaLabel} onChange={(v) => updateAiCard(i, "ar", { ...(card.ar ?? {}), ctaLabel: v })} />
                  <input
                    value={card.href ?? ""}
                    onChange={(e) => updateAiCard(i, "href", e.target.value)}
                    maxLength={FIELD_LIMITS.link}
                    className={inputClass}
                    placeholder="Link href"
                  />
                  <CharCount value={card.href ?? ""} max={FIELD_LIMITS.link} />
                  <FieldError error={validateUrl(card.href ?? "")} />
                  <MediaField
                    label="Card image"
                    value={card.imageSrc}
                    accept="image/*"
                    resourceType="image"
                    uploading={uploadProgress[`aicard-${i}`] !== undefined}
                    progress={uploadProgress[`aicard-${i}`] ?? 0}
                    onChange={(v) => updateAiCard(i, "imageSrc", v)}
                    onUpload={(file) => handleAiCardImageUpload(i, file)}
                  />
                  <input
                    value={card.imageAlt ?? ""}
                    onChange={(e) => updateAiCard(i, "imageAlt", e.target.value)}
                    maxLength={FIELD_LIMITS.label}
                    className={inputClass}
                    placeholder="Image alt text"
                  />
                  <CharCount value={card.imageAlt ?? ""} max={FIELD_LIMITS.label} />
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
                maxLength={FIELD_LIMITS.heading}
                className={inputClass}
              />
              <CharCount value={howItWorks.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={howItWorks.ar?.heading} onChange={(v) => setHowItWorks((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient (second part)</label>
              <input
                value={howItWorks.headingGradient ?? ""}
                onChange={(e) => setHowItWorks((p) => ({ ...p, headingGradient: e.target.value }))}
                maxLength={FIELD_LIMITS.heading}
                className={inputClass}
              />
              <CharCount value={howItWorks.headingGradient ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading Gradient" kind="heading" value={howItWorks.ar?.headingGradient} onChange={(v) => setHowItWorks((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <textarea
                value={howItWorks.subtitle ?? ""}
                onChange={(e) => setHowItWorks((p) => ({ ...p, subtitle: e.target.value }))}
                maxLength={FIELD_LIMITS.subtitle}
                className={inputClass}
                rows={2}
              />
              <CharCount value={howItWorks.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
              <ArInput label="Subtitle" kind="subtitle" multiline value={howItWorks.ar?.subtitle} onChange={(v) => setHowItWorks((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
            </div>
            <div>
              <MediaField
                label="Video (URL or upload)"
                value={howItWorks.videoUrl ?? ""}
                accept="video/*"
                resourceType="video"
                uploading={uploadProgress["howItWorks-video"] !== undefined}
                progress={uploadProgress["howItWorks-video"]}
                onChange={(v) => setHowItWorks((p) => ({ ...p, videoUrl: v }))}
                onUpload={(file) => handleHowItWorksVideoUpload(file)}
              />
            </div>
            <div>
              <label className={labelClass}>CTA Label</label>
              <input
                value={howItWorks.ctaLabel ?? ""}
                onChange={(e) => setHowItWorks((p) => ({ ...p, ctaLabel: e.target.value }))}
                maxLength={FIELD_LIMITS.button}
                className={inputClass}
              />
              <CharCount value={howItWorks.ctaLabel ?? ""} max={FIELD_LIMITS.button} />
              <ArInput label="CTA Label" kind="button" value={howItWorks.ar?.ctaLabel} onChange={(v) => setHowItWorks((p) => ({ ...p, ar: { ...(p.ar ?? {}), ctaLabel: v } }))} />
            </div>
            <div>
              <label className={labelClass}>CTA Href</label>
              <input
                value={howItWorks.ctaHref ?? ""}
                onChange={(e) => setHowItWorks((p) => ({ ...p, ctaHref: e.target.value }))}
                maxLength={FIELD_LIMITS.link}
                className={inputClass}
              />
              <CharCount value={howItWorks.ctaHref ?? ""} max={FIELD_LIMITS.link} />
              <FieldError error={validateUrl(howItWorks.ctaHref ?? "")} />
            </div>

            <div className="mt-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Steps ({(howItWorks.steps ?? []).length})</p>
              <button
                type="button"
                onClick={addHowStep}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
              >
                <Plus className="h-3.5 w-3.5" /> Add Step
              </button>
            </div>
            {(howItWorks.steps ?? []).map((step, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Step {i + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeHowStep(i)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
                <div className="grid gap-2">
                  <input
                    value={step.title ?? ""}
                    onChange={(e) => updateHowStep(i, "title", e.target.value)}
                    maxLength={FIELD_LIMITS.heading}
                    className={inputClass}
                    placeholder="Title"
                  />
                  <CharCount value={step.title ?? ""} max={FIELD_LIMITS.heading} />
                  <ArInput label="Title" kind="heading" value={step.ar?.title} onChange={(v) => updateHowStep(i, "ar", { ...(step.ar ?? {}), title: v })} />
                  <textarea
                    value={step.description ?? ""}
                    onChange={(e) => updateHowStep(i, "description", e.target.value)}
                    maxLength={FIELD_LIMITS.description}
                    className={inputClass}
                    rows={2}
                    placeholder="Description"
                  />
                  <CharCount value={step.description ?? ""} max={FIELD_LIMITS.description} />
                  <ArInput label="Description" kind="description" multiline value={step.ar?.description} onChange={(v) => updateHowStep(i, "ar", { ...(step.ar ?? {}), description: v })} />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* BLACK BANNER */}
        <CollapsibleSection title="AI-Powered Smart Parking Solutions (Box Section)">
          <div className="grid gap-3">
            <div>
              <label className={labelClass}>Title</label>
              <textarea
                value={blackBanner.title ?? ""}
                onChange={(e) => setBlackBanner((p) => ({ ...p, title: e.target.value }))}
                maxLength={FIELD_LIMITS.heading}
                className={inputClass}
                rows={2}
              />
              <CharCount value={blackBanner.title ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Title" kind="heading" multiline value={blackBanner.ar?.title} onChange={(v) => setBlackBanner((p) => ({ ...p, ar: { ...(p.ar ?? {}), title: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={blackBanner.description ?? ""}
                onChange={(e) => setBlackBanner((p) => ({ ...p, description: e.target.value }))}
                maxLength={FIELD_LIMITS.description}
                className={inputClass}
                rows={3}
              />
              <CharCount value={blackBanner.description ?? ""} max={FIELD_LIMITS.description} />
              <ArInput label="Description" kind="description" multiline value={blackBanner.ar?.description} onChange={(v) => setBlackBanner((p) => ({ ...p, ar: { ...(p.ar ?? {}), description: v } }))} />
            </div>
            <div>
              <MediaField
                label="Banner Image (right-side visual)"
                value={blackBanner.image ?? ""}
                accept="image/*"
                resourceType="image"
                uploading={uploadProgress["blackBanner-image"] !== undefined}
                progress={uploadProgress["blackBanner-image"]}
                onChange={(v) => setBlackBanner((p) => ({ ...p, image: v }))}
                onUpload={(file) => handleBlackBannerImageUpload(file)}
              />
              <p className="mt-1 text-[10px] text-slate-400">Leave empty to hide the banner visual. PNG with transparent background recommended.</p>
            </div>

            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">CTAs</p>
            {(blackBanner.ctas ?? []).map((cta, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">CTA {i + 1}</p>
                <div className="grid gap-2">
                  <input
                    value={cta.label ?? ""}
                    onChange={(e) => updateBlackBannerCta(i, "label", e.target.value)}
                    maxLength={FIELD_LIMITS.button}
                    className={inputClass}
                    placeholder="Label"
                  />
                  <CharCount value={cta.label ?? ""} max={FIELD_LIMITS.button} />
                  <ArInput label="Label" kind="button" value={cta.ar?.label} onChange={(v) => updateBlackBannerCta(i, "ar", { ...(cta.ar ?? {}), label: v })} />
                  <input
                    value={cta.href ?? ""}
                    onChange={(e) => updateBlackBannerCta(i, "href", e.target.value)}
                    maxLength={FIELD_LIMITS.link}
                    className={inputClass}
                    placeholder="Href"
                  />
                  <CharCount value={cta.href ?? ""} max={FIELD_LIMITS.link} />
                  <FieldError error={validateUrl(cta.href ?? "")} />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* GOOD LOOKING SERVICES */}
        <CollapsibleSection title="Services Section">
          <div className="grid gap-3">
            <div>
              <label className={labelClass}>Section heading</label>
              <input
                value={goodLookingServices.heading ?? ""}
                onChange={(e) => setGoodLookingServices((p) => ({ ...p, heading: e.target.value }))}
                maxLength={FIELD_LIMITS.heading}
                className={inputClass}
                placeholder="SERVICES"
              />
              <CharCount value={goodLookingServices.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={goodLookingServices.ar?.heading} onChange={(v) => setGoodLookingServices((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Primary button label</label>
                <input
                  value={goodLookingServices.exploreCtaLabel ?? ""}
                  onChange={(e) => setGoodLookingServices((p) => ({ ...p, exploreCtaLabel: e.target.value }))}
                  maxLength={FIELD_LIMITS.button}
                  className={inputClass}
                  placeholder="Explore Services"
                />
                <CharCount value={goodLookingServices.exploreCtaLabel ?? ""} max={FIELD_LIMITS.button} />
                <ArInput label="Explore Cta Label" kind="button" value={goodLookingServices.ar?.exploreCtaLabel} onChange={(v) => setGoodLookingServices((p) => ({ ...p, ar: { ...(p.ar ?? {}), exploreCtaLabel: v } }))} />
              </div>
              <div>
                <label className={labelClass}>Primary button link</label>
                <input
                  value={goodLookingServices.exploreCtaLink ?? ""}
                  onChange={(e) => setGoodLookingServices((p) => ({ ...p, exploreCtaLink: e.target.value }))}
                  maxLength={FIELD_LIMITS.link}
                  className={inputClass}
                  placeholder="/services"
                />
                <CharCount value={goodLookingServices.exploreCtaLink ?? ""} max={FIELD_LIMITS.link} />
                <FieldError error={validateUrl(goodLookingServices.exploreCtaLink ?? "")} />
              </div>
              <div>
                <label className={labelClass}>Secondary button label</label>
                <input
                  value={goodLookingServices.contactCtaLabel ?? ""}
                  onChange={(e) => setGoodLookingServices((p) => ({ ...p, contactCtaLabel: e.target.value }))}
                  maxLength={FIELD_LIMITS.button}
                  className={inputClass}
                  placeholder="Talk to us"
                />
                <CharCount value={goodLookingServices.contactCtaLabel ?? ""} max={FIELD_LIMITS.button} />
                <ArInput label="Contact Cta Label" kind="button" value={goodLookingServices.ar?.contactCtaLabel} onChange={(v) => setGoodLookingServices((p) => ({ ...p, ar: { ...(p.ar ?? {}), contactCtaLabel: v } }))} />
              </div>
              <div>
                <label className={labelClass}>Secondary button link</label>
                <input
                  value={goodLookingServices.contactCtaLink ?? ""}
                  onChange={(e) => setGoodLookingServices((p) => ({ ...p, contactCtaLink: e.target.value }))}
                  maxLength={FIELD_LIMITS.link}
                  className={inputClass}
                  placeholder="/contact"
                />
                <CharCount value={goodLookingServices.contactCtaLink ?? ""} max={FIELD_LIMITS.link} />
                <FieldError error={validateUrl(goodLookingServices.contactCtaLink ?? "")} />
              </div>
            </div>
            <div className="my-1 border-t border-slate-200" />

            {/* Service cards (shown on the home Services section) */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Service Cards ({(goodLookingServices.cards ?? []).length})
              </p>
              <button
                type="button"
                onClick={addServiceCard}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
              >
                <Plus className="h-3.5 w-3.5" /> Add Card
              </button>
            </div>
            {(goodLookingServices.cards ?? []).length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-400">
                No service cards yet. Click &quot;Add Card&quot;.
              </p>
            ) : (
              (goodLookingServices.cards ?? []).map((card, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Card {i + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeServiceCard(i)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                  <div className="grid gap-2">
                    <input
                      value={card.name ?? ""}
                      onChange={(e) => updateServiceCard(i, "name", e.target.value)}
                      maxLength={FIELD_LIMITS.label}
                      className={inputClass}
                      placeholder="Service name (e.g. Self-Parking)"
                    />
                    <CharCount value={card.name ?? ""} max={FIELD_LIMITS.label} />
                    <ArInput label="Name" kind="label" value={card.ar?.name} onChange={(v) => updateServiceCard(i, "ar", { ...(card.ar ?? {}), name: v })} />
                    {/* Card description gets a larger cap (600) than the default
                        summary limit — the card layout flows the text down. */}
                    <textarea
                      value={card.summary ?? ""}
                      onChange={(e) => updateServiceCard(i, "summary", e.target.value)}
                      maxLength={600}
                      className={inputClass}
                      rows={3}
                      placeholder="Description shown on the card"
                    />
                    <CharCount value={card.summary ?? ""} max={600} />
                    <ArInput label="Summary" kind="summary" limit={600} multiline value={card.ar?.summary} onChange={(v) => updateServiceCard(i, "ar", { ...(card.ar ?? {}), summary: v })} />
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Slug (link)</label>
                        <input
                          value={card.slug ?? ""}
                          onChange={(e) => updateServiceCard(i, "slug", e.target.value)}
                          maxLength={FIELD_LIMITS.link}
                          className={inputClass}
                          placeholder="self-parking"
                        />
                        <CharCount value={card.slug ?? ""} max={FIELD_LIMITS.link} />
                      </div>
                      <div>
                        <label className={labelClass}>Media type</label>
                        <select
                          value={card.mediaType ?? "image"}
                          onChange={(e) => updateServiceCard(i, "mediaType", e.target.value)}
                          className={inputClass}
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </div>
                    </div>
                    <MediaField
                      label={card.mediaType === "video" ? "Video" : "Image"}
                      value={card.mediaSrc}
                      accept={card.mediaType === "video" ? "video/*" : "image/*"}
                      resourceType={card.mediaType === "video" ? "video" : "image"}
                      uploading={uploadProgress[`glcard-${i}`] !== undefined}
                      progress={uploadProgress[`glcard-${i}`] ?? 0}
                      onChange={(v) => updateServiceCard(i, "mediaSrc", v)}
                      onUpload={(file, rt) => handleServiceCardMediaUpload(i, file, rt)}
                    />
                  </div>
                </div>
              ))
            )}

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
                maxLength={FIELD_LIMITS.heading}
                className={inputClass}
              />
              <CharCount value={solutionIntegration.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={solutionIntegration.ar?.heading} onChange={(v) => setSolutionIntegration((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient (second part)</label>
              <input
                value={solutionIntegration.headingGradient ?? ""}
                onChange={(e) => setSolutionIntegration((p) => ({ ...p, headingGradient: e.target.value }))}
                maxLength={FIELD_LIMITS.heading}
                className={inputClass}
              />
              <CharCount value={solutionIntegration.headingGradient ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading Gradient" kind="heading" value={solutionIntegration.ar?.headingGradient} onChange={(v) => setSolutionIntegration((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <textarea
                value={solutionIntegration.subtitle ?? ""}
                onChange={(e) => setSolutionIntegration((p) => ({ ...p, subtitle: e.target.value }))}
                maxLength={FIELD_LIMITS.subtitle}
                className={inputClass}
                rows={2}
              />
              <CharCount value={solutionIntegration.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
              <ArInput label="Subtitle" kind="subtitle" multiline value={solutionIntegration.ar?.subtitle} onChange={(v) => setSolutionIntegration((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
            </div>

            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Solution Cards</p>
            {(solutionIntegration.solutionCards ?? []).map((card, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Card {i + 1}</p>
                <div className="grid gap-2">
                  <input
                    value={card.title ?? ""}
                    onChange={(e) => updateSolutionCard(i, "title", e.target.value)}
                    maxLength={FIELD_LIMITS.heading}
                    className={inputClass}
                    placeholder="Title"
                  />
                  <CharCount value={card.title ?? ""} max={FIELD_LIMITS.heading} />
                  <ArInput label="Title" kind="heading" value={card.ar?.title} onChange={(v) => updateSolutionCard(i, "ar", { ...(card.ar ?? {}), title: v })} />
                  <textarea
                    value={card.description ?? ""}
                    onChange={(e) => updateSolutionCard(i, "description", e.target.value)}
                    maxLength={FIELD_LIMITS.description}
                    className={inputClass}
                    rows={2}
                    placeholder="Description"
                  />
                  <CharCount value={card.description ?? ""} max={FIELD_LIMITS.description} />
                  <ArInput label="Description" kind="description" multiline value={card.ar?.description} onChange={(v) => updateSolutionCard(i, "ar", { ...(card.ar ?? {}), description: v })} />
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
                maxLength={FIELD_LIMITS.heading}
                className={inputClass}
              />
              <CharCount value={technologySection.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={technologySection.ar?.heading} onChange={(v) => setTechnologySection((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient (second part)</label>
              <input
                value={technologySection.headingGradient ?? ""}
                onChange={(e) => setTechnologySection((p) => ({ ...p, headingGradient: e.target.value }))}
                maxLength={FIELD_LIMITS.heading}
                className={inputClass}
              />
              <CharCount value={technologySection.headingGradient ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading Gradient" kind="heading" value={technologySection.ar?.headingGradient} onChange={(v) => setTechnologySection((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <textarea
                value={technologySection.subtitle ?? ""}
                onChange={(e) => setTechnologySection((p) => ({ ...p, subtitle: e.target.value }))}
                maxLength={FIELD_LIMITS.subtitle}
                className={inputClass}
                rows={2}
              />
              <CharCount value={technologySection.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
              <ArInput label="Subtitle" kind="subtitle" multiline value={technologySection.ar?.subtitle} onChange={(v) => setTechnologySection((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
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
                maxLength={FIELD_LIMITS.heading}
                className={inputClass}
              />
              <CharCount value={clientsPartners.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={clientsPartners.ar?.heading} onChange={(v) => setClientsPartners((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
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
                maxLength={FIELD_LIMITS.heading}
                className={inputClass}
              />
              <CharCount value={clientsPartners.headingEnd ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading End" kind="heading" value={clientsPartners.ar?.headingEnd} onChange={(v) => setClientsPartners((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingEnd: v } }))} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>CTA Button Label (optional)</label>
                <input
                  value={clientsPartners.ctaLabel ?? ""}
                  onChange={(e) => setClientsPartners((p) => ({ ...p, ctaLabel: e.target.value }))}
                  maxLength={FIELD_LIMITS.button}
                  className={inputClass}
                  placeholder="Leave empty to hide the button"
                />
                <CharCount value={clientsPartners.ctaLabel ?? ""} max={FIELD_LIMITS.button} />
                <ArInput label="CTA Button" kind="button" value={clientsPartners.ar?.ctaLabel} onChange={(v) => setClientsPartners((p) => ({ ...p, ar: { ...(p.ar ?? {}), ctaLabel: v } }))} />
              </div>
              <div>
                <label className={labelClass}>CTA Button Link</label>
                <input
                  value={clientsPartners.ctaHref ?? ""}
                  onChange={(e) => setClientsPartners((p) => ({ ...p, ctaHref: e.target.value }))}
                  maxLength={FIELD_LIMITS.link}
                  className={inputClass}
                  placeholder="/contact"
                />
                <CharCount value={clientsPartners.ctaHref ?? ""} max={FIELD_LIMITS.link} />
                <FieldError error={validateUrl(clientsPartners.ctaHref ?? "")} />
              </div>
            </div>

            <div className="my-1 border-t border-slate-200" />

            {/* Logos */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Logos ({(clientsPartners.logos ?? []).length})
              </p>
              <button
                type="button"
                onClick={addLogo}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
              >
                <Plus className="h-3.5 w-3.5" /> Add Logo
              </button>
            </div>
            <p className="text-[11px] text-slate-400">Upload client/partner logos. Transparent PNG/SVG works best. If none are added, placeholder text is shown.</p>
            {(clientsPartners.logos ?? []).length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-400">
                No logos yet. Click &quot;Add Logo&quot; to upload one.
              </p>
            ) : (
              (clientsPartners.logos ?? []).map((logo, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <div className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                    {logo.image ? (
                      <img src={logo.image} alt={logo.alt || ""} className="max-h-10 max-w-[72px] object-contain" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-slate-300" />
                    )}
                  </div>
                  <div className="grid flex-1 gap-2">
                    <MediaField
                      label="Logo image"
                      value={logo.image}
                      accept="image/*"
                      resourceType="image"
                      uploading={uploadProgress[`logo-${i}`] !== undefined}
                      progress={uploadProgress[`logo-${i}`] ?? 0}
                      onChange={(v) => updateLogo(i, "image", v)}
                      onUpload={(file) => handleLogoUpload(i, file)}
                    />
                    <input
                      value={logo.alt ?? ""}
                      onChange={(e) => updateLogo(i, "alt", e.target.value)}
                      maxLength={FIELD_LIMITS.label}
                      className={inputClass}
                      placeholder="Logo name / alt text (e.g. Concord Tower)"
                    />
                    <CharCount value={logo.alt ?? ""} max={FIELD_LIMITS.label} />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLogo(i)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              ))
            )}
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
                maxLength={FIELD_LIMITS.heading}
                className={inputClass}
              />
              <CharCount value={globalMobility.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={globalMobility.ar?.heading} onChange={(v) => setGlobalMobility((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <input
                value={globalMobility.subtitle ?? ""}
                onChange={(e) => setGlobalMobility((p) => ({ ...p, subtitle: e.target.value }))}
                maxLength={FIELD_LIMITS.subtitle}
                className={inputClass}
              />
              <CharCount value={globalMobility.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
              <ArInput label="Subtitle" kind="subtitle" value={globalMobility.ar?.subtitle} onChange={(v) => setGlobalMobility((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient (highlighted word)</label>
              <input
                value={globalMobility.headingGradient ?? ""}
                onChange={(e) => setGlobalMobility((p) => ({ ...p, headingGradient: e.target.value }))}
                maxLength={FIELD_LIMITS.label}
                className={inputClass}
                placeholder="Locations"
              />
              <CharCount value={globalMobility.headingGradient ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Heading Gradient" kind="label" value={globalMobility.ar?.headingGradient} onChange={(v) => setGlobalMobility((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Description (second line)</label>
              <textarea
                value={globalMobility.description ?? ""}
                onChange={(e) => setGlobalMobility((p) => ({ ...p, description: e.target.value }))}
                maxLength={FIELD_LIMITS.description}
                className={inputClass}
                rows={2}
              />
              <CharCount value={globalMobility.description ?? ""} max={FIELD_LIMITS.description} />
              <ArInput label="Description" kind="description" multiline value={globalMobility.ar?.description} onChange={(v) => setGlobalMobility((p) => ({ ...p, ar: { ...(p.ar ?? {}), description: v } }))} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Map Panel Title</label>
                <input
                  value={globalMobility.panelTitle ?? ""}
                  onChange={(e) => setGlobalMobility((p) => ({ ...p, panelTitle: e.target.value }))}
                  maxLength={FIELD_LIMITS.heading}
                  className={inputClass}
                  placeholder="United by Mobility."
                />
                <CharCount value={globalMobility.panelTitle ?? ""} max={FIELD_LIMITS.heading} />
                <ArInput label="Panel Title" kind="heading" value={globalMobility.ar?.panelTitle} onChange={(v) => setGlobalMobility((p) => ({ ...p, ar: { ...(p.ar ?? {}), panelTitle: v } }))} />
              </div>
              <div>
                <label className={labelClass}>Map Panel Title (line 2)</label>
                <input
                  value={globalMobility.panelTitleAccent ?? ""}
                  onChange={(e) => setGlobalMobility((p) => ({ ...p, panelTitleAccent: e.target.value }))}
                  maxLength={FIELD_LIMITS.heading}
                  className={inputClass}
                  placeholder="Connected Globally."
                />
                <CharCount value={globalMobility.panelTitleAccent ?? ""} max={FIELD_LIMITS.heading} />
                <ArInput label="Panel Title Accent" kind="heading" value={globalMobility.ar?.panelTitleAccent} onChange={(v) => setGlobalMobility((p) => ({ ...p, ar: { ...(p.ar ?? {}), panelTitleAccent: v } }))} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Map Panel Body</label>
              <textarea
                value={globalMobility.panelBody ?? ""}
                onChange={(e) => setGlobalMobility((p) => ({ ...p, panelBody: e.target.value }))}
                maxLength={FIELD_LIMITS.description}
                className={inputClass}
                rows={2}
              />
              <CharCount value={globalMobility.panelBody ?? ""} max={FIELD_LIMITS.description} />
              <ArInput label="Panel Body" kind="description" multiline value={globalMobility.ar?.panelBody} onChange={(v) => setGlobalMobility((p) => ({ ...p, ar: { ...(p.ar ?? {}), panelBody: v } }))} />
            </div>

            <div className="mt-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Capabilities ({(globalMobility.capabilities ?? []).length})</p>
              <button
                type="button"
                onClick={addCapability}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
              >
                <Plus className="h-3.5 w-3.5" /> Add Capability
              </button>
            </div>
            {(globalMobility.capabilities ?? []).map((cap, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Capability {i + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeCapability(i)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
                <div className="grid gap-2">
                  <input
                    value={cap.title ?? ""}
                    onChange={(e) => updateCapability(i, "title", e.target.value)}
                    maxLength={FIELD_LIMITS.heading}
                    className={inputClass}
                    placeholder="Title"
                  />
                  <CharCount value={cap.title ?? ""} max={FIELD_LIMITS.heading} />
                  <ArInput label="Title" kind="heading" value={cap.ar?.title} onChange={(v) => updateCapability(i, "ar", { ...(cap.ar ?? {}), title: v })} />
                  <textarea
                    value={cap.description ?? ""}
                    onChange={(e) => updateCapability(i, "description", e.target.value)}
                    maxLength={FIELD_LIMITS.description}
                    className={inputClass}
                    rows={2}
                    placeholder="Description"
                  />
                  <CharCount value={cap.description ?? ""} max={FIELD_LIMITS.description} />
                  <ArInput label="Description" kind="description" multiline value={cap.ar?.description} onChange={(v) => updateCapability(i, "ar", { ...(cap.ar ?? {}), description: v })} />
                  <MediaField
                    label="Icon Image (optional — overrides the built-in icon)"
                    value={cap.iconImage ?? ""}
                    accept="image/*"
                    resourceType="image"
                    uploading={uploadProgress[`gm-cap-${i}-icon`] !== undefined}
                    progress={uploadProgress[`gm-cap-${i}-icon`]}
                    onChange={(v) => updateCapability(i, "iconImage", v)}
                    onUpload={(file) => handleCapIconUpload(i, file)}
                  />
                </div>
              </div>
            ))}

            <div className="mt-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Impact Stats ({(globalMobility.impactStats ?? []).length})</p>
              <button
                type="button"
                onClick={addImpactStat}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
              >
                <Plus className="h-3.5 w-3.5" /> Add Stat
              </button>
            </div>
            {(globalMobility.impactStats ?? []).map((stat, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Stat {i + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeImpactStat(i)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
                <div className="grid gap-2">
                  <input
                    value={stat.value ?? ""}
                    onChange={(e) => updateImpactStat(i, "value", e.target.value)}
                    maxLength={FIELD_LIMITS.label}
                    className={inputClass}
                    placeholder="Value (e.g., 10K+)"
                  />
                  <CharCount value={stat.value ?? ""} max={FIELD_LIMITS.label} />
                  <input
                    value={stat.label ?? ""}
                    onChange={(e) => updateImpactStat(i, "label", e.target.value)}
                    maxLength={FIELD_LIMITS.label}
                    className={inputClass}
                    placeholder="Label"
                  />
                  <CharCount value={stat.label ?? ""} max={FIELD_LIMITS.label} />
                  <ArInput label="Label" kind="label" value={stat.ar?.label} onChange={(v) => updateImpactStat(i, "ar", { ...(stat.ar ?? {}), label: v })} />
                  <MediaField
                    label="Icon Image (optional — overrides the built-in icon)"
                    value={stat.iconImage ?? ""}
                    accept="image/*"
                    resourceType="image"
                    uploading={uploadProgress[`gm-stat-${i}-icon`] !== undefined}
                    progress={uploadProgress[`gm-stat-${i}-icon`]}
                    onChange={(v) => updateImpactStat(i, "iconImage", v)}
                    onUpload={(file) => handleStatIconUpload(i, file)}
                  />
                </div>
              </div>
            ))}

            <div className="mt-2 rounded-xl border border-slate-200 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Map Animation — Locations &amp; Connections</p>
              <p className="mt-1 mb-3 text-xs text-slate-500">
                Positions are % of the map area (x: 0 left → 100 right, y: 0 top → 100 bottom). Connections animate between locations.
              </p>

              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Locations ({(globalMobility.mapNodes ?? []).length})</p>
                <button
                  type="button"
                  onClick={addMapNode}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Location
                </button>
              </div>
              <div className="mt-2 grid gap-3">
                {(globalMobility.mapNodes ?? []).map((node, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Location {i + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeMapNode(i)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                    <div className="grid gap-2">
                      <div>
                        <label className={labelClass}>Label</label>
                        <input
                          value={node.label ?? ""}
                          onChange={(e) => updateMapNode(i, "label", e.target.value)}
                          maxLength={FIELD_LIMITS.label}
                          className={inputClass}
                          placeholder="Dubai"
                        />
                        <CharCount value={node.label ?? ""} max={FIELD_LIMITS.label} />
                        <ArInput label="Label" kind="label" value={node.ar?.label} onChange={(v) => updateMapNode(i, "ar", { ...(node.ar ?? {}), label: v })} />
                      </div>
                      <div>
                        <label className={labelClass}>ID (short unique slug)</label>
                        <input
                          value={node.id ?? ""}
                          onChange={(e) => updateMapNode(i, "id", e.target.value)}
                          maxLength={FIELD_LIMITS.label}
                          className={inputClass}
                          placeholder="dubai"
                        />
                        <p className="mt-1 text-[11px] text-slate-400">used by connections</p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>X (0–100)</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={node.x ?? ""}
                            onChange={(e) => updateMapNode(i, "x", e.target.value === "" ? "" : Number(e.target.value))}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Y (0–100)</label>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={node.y ?? ""}
                            onChange={(e) => updateMapNode(i, "y", e.target.value === "" ? "" : Number(e.target.value))}
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Connections ({(globalMobility.mapLinks ?? []).length})</p>
                <button
                  type="button"
                  onClick={addMapLink}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Connection
                </button>
              </div>
              <div className="mt-2 grid gap-3">
                {(globalMobility.mapLinks ?? []).map((link, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Connection {i + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeMapLink(i)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <div>
                        <label className={labelClass}>From</label>
                        <select
                          value={link.from ?? ""}
                          onChange={(e) => updateMapLink(i, "from", e.target.value)}
                          className={inputClass}
                        >
                          <option value="">— select location —</option>
                          {(globalMobility.mapNodes ?? []).map((n, j) => (
                            <option key={j} value={n.id}>{n.label || n.id}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>To</label>
                        <select
                          value={link.to ?? ""}
                          onChange={(e) => updateMapLink(i, "to", e.target.value)}
                          className={inputClass}
                        >
                          <option value="">— select location —</option>
                          {(globalMobility.mapNodes ?? []).map((n, j) => (
                            <option key={j} value={n.id}>{n.label || n.id}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Curve</label>
                        <input
                          type="number"
                          value={link.curve ?? ""}
                          onChange={(e) => updateMapLink(i, "curve", e.target.value === "" ? "" : Number(e.target.value))}
                          className={inputClass}
                        />
                        <p className="mt-1 text-[11px] text-slate-400">arc bend: negative = up, positive = down</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
                maxLength={FIELD_LIMITS.heading}
                className={inputClass}
              />
              <CharCount value={halaParkInAction.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={halaParkInAction.ar?.heading} onChange={(v) => setHalaParkInAction((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <input
                value={halaParkInAction.subtitle ?? ""}
                onChange={(e) => setHalaParkInAction((p) => ({ ...p, subtitle: e.target.value }))}
                maxLength={FIELD_LIMITS.subtitle}
                className={inputClass}
              />
              <CharCount value={halaParkInAction.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
              <ArInput label="Subtitle" kind="subtitle" value={halaParkInAction.ar?.subtitle} onChange={(v) => setHalaParkInAction((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
            </div>

            <div className="mt-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Store Links ({(halaParkInAction.storeLinks ?? []).length})</p>
              <button
                type="button"
                onClick={addStoreLink}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
              >
                <Plus className="h-3.5 w-3.5" /> Add Store
              </button>
            </div>
            {(halaParkInAction.storeLinks ?? []).map((link, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Store {i + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeStoreLink(i)}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
                <div className="grid gap-2">
                  <MediaField
                    label="Store Icon"
                    value={link.icon ?? ""}
                    accept="image/*"
                    resourceType="image"
                    uploading={uploadProgress[`storeLink-${i}-icon`] !== undefined}
                    progress={uploadProgress[`storeLink-${i}-icon`]}
                    onChange={(v) => updateStoreLink(i, "icon", v)}
                    onUpload={(file) => handleStoreIconUpload(i, file)}
                  />
                  <input
                    value={link.alt ?? ""}
                    onChange={(e) => updateStoreLink(i, "alt", e.target.value)}
                    maxLength={FIELD_LIMITS.label}
                    className={inputClass}
                    placeholder="Alt text"
                  />
                  <CharCount value={link.alt ?? ""} max={FIELD_LIMITS.label} />
                  <input
                    value={link.eyebrow ?? ""}
                    onChange={(e) => updateStoreLink(i, "eyebrow", e.target.value)}
                    maxLength={FIELD_LIMITS.label}
                    className={inputClass}
                    placeholder="Small text above name (e.g., Download Now On)"
                  />
                  <CharCount value={link.eyebrow ?? ""} max={FIELD_LIMITS.label} />
                  <ArInput label="Eyebrow" kind="label" value={link.ar?.eyebrow} onChange={(v) => updateStoreLink(i, "ar", { ...(link.ar ?? {}), eyebrow: v })} />
                  <input
                    value={link.label ?? ""}
                    onChange={(e) => updateStoreLink(i, "label", e.target.value)}
                    maxLength={FIELD_LIMITS.label}
                    className={inputClass}
                    placeholder="Store label (e.g., App Store)"
                  />
                  <CharCount value={link.label ?? ""} max={FIELD_LIMITS.label} />
                  <ArInput label="Label" kind="label" value={link.ar?.label} onChange={(v) => updateStoreLink(i, "ar", { ...(link.ar ?? {}), label: v })} />
                  <input
                    value={link.href ?? ""}
                    onChange={(e) => updateStoreLink(i, "href", e.target.value)}
                    maxLength={FIELD_LIMITS.link}
                    className={inputClass}
                    placeholder="Store page URL (https://…) — makes the badge clickable"
                  />
                  <CharCount value={link.href ?? ""} max={FIELD_LIMITS.link} />
                  <FieldError error={validateUrl(link.href ?? "")} />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Get In Touch / Contact Section">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Eyebrow</label>
              <input value={supportCta.eyebrow ?? ""} onChange={(e) => setSupportCta((p) => ({ ...p, eyebrow: e.target.value }))} className={inputClass} placeholder="Get In Touch" maxLength={FIELD_LIMITS.label} />
              <CharCount value={supportCta.eyebrow ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Eyebrow" kind="label" value={supportCta.ar?.eyebrow} onChange={(v) => setSupportCta((p) => ({ ...p, ar: { ...(p.ar ?? {}), eyebrow: v } }))} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Heading</label>
                <input value={supportCta.heading ?? ""} onChange={(e) => setSupportCta((p) => ({ ...p, heading: e.target.value }))} className={inputClass} placeholder="Ready to Transform Your" maxLength={FIELD_LIMITS.heading} />
                <CharCount value={supportCta.heading ?? ""} max={FIELD_LIMITS.heading} />
                <ArInput label="Heading" kind="heading" value={supportCta.ar?.heading} onChange={(v) => setSupportCta((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
              </div>
              <div>
                <label className={labelClass}>Heading Gradient (accent)</label>
                <input value={supportCta.headingAccent ?? ""} onChange={(e) => setSupportCta((p) => ({ ...p, headingAccent: e.target.value }))} className={inputClass} placeholder="Parking Operations?" maxLength={FIELD_LIMITS.heading} />
                <CharCount value={supportCta.headingAccent ?? ""} max={FIELD_LIMITS.heading} />
                <ArInput label="Heading Gradient" kind="heading" value={supportCta.ar?.headingAccent} onChange={(v) => setSupportCta((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingAccent: v } }))} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea value={supportCta.description ?? ""} onChange={(e) => setSupportCta((p) => ({ ...p, description: e.target.value }))} className={inputClass} rows={2} maxLength={FIELD_LIMITS.description} />
              <CharCount value={supportCta.description ?? ""} max={FIELD_LIMITS.description} />
              <ArInput label="Description" kind="description" multiline value={supportCta.ar?.description} onChange={(v) => setSupportCta((p) => ({ ...p, ar: { ...(p.ar ?? {}), description: v } }))} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Contact Button Label</label>
                <input value={supportCta.contactLabel ?? ""} onChange={(e) => setSupportCta((p) => ({ ...p, contactLabel: e.target.value }))} className={inputClass} placeholder="Contact Us" maxLength={FIELD_LIMITS.button} />
                <ArInput label="Contact Button" kind="button" value={supportCta.ar?.contactLabel} onChange={(v) => setSupportCta((p) => ({ ...p, ar: { ...(p.ar ?? {}), contactLabel: v } }))} />
              </div>
              <div>
                <label className={labelClass}>WhatsApp Button Label</label>
                <input value={supportCta.whatsappLabel ?? ""} onChange={(e) => setSupportCta((p) => ({ ...p, whatsappLabel: e.target.value }))} className={inputClass} placeholder="WhatsApp Us" maxLength={FIELD_LIMITS.button} />
                <ArInput label="WhatsApp Button" kind="button" value={supportCta.ar?.whatsappLabel} onChange={(v) => setSupportCta((p) => ({ ...p, ar: { ...(p.ar ?? {}), whatsappLabel: v } }))} />
              </div>
            </div>
            <div>
              <label className={labelClass}>WhatsApp Link</label>
              <input value={supportCta.whatsappHref ?? ""} onChange={(e) => setSupportCta((p) => ({ ...p, whatsappHref: e.target.value }))} className={inputClass} placeholder="https://wa.me/…" maxLength={FIELD_LIMITS.link} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Email</label>
                <input value={supportCta.email ?? ""} onChange={(e) => setSupportCta((p) => ({ ...p, email: e.target.value }))} className={inputClass} placeholder="info@halapark.com" maxLength={FIELD_LIMITS.link} />
                <FieldError error={supportCta.email ? validateEmail(supportCta.email) : ""} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input value={supportCta.phone ?? ""} onChange={(e) => setSupportCta((p) => ({ ...p, phone: e.target.value }))} className={inputClass} placeholder="+971 4 3782022" maxLength={FIELD_LIMITS.label} />
                <FieldError error={supportCta.phone ? validatePhone(supportCta.phone) : ""} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Support Panel Eyebrow</label>
                <input value={supportCta.supportEyebrow ?? ""} onChange={(e) => setSupportCta((p) => ({ ...p, supportEyebrow: e.target.value }))} className={inputClass} placeholder="Support" maxLength={FIELD_LIMITS.label} />
                <ArInput label="Support Eyebrow" kind="label" value={supportCta.ar?.supportEyebrow} onChange={(v) => setSupportCta((p) => ({ ...p, ar: { ...(p.ar ?? {}), supportEyebrow: v } }))} />
              </div>
              <div>
                <label className={labelClass}>Support Panel Title</label>
                <input value={supportCta.supportTitle ?? ""} onChange={(e) => setSupportCta((p) => ({ ...p, supportTitle: e.target.value }))} className={inputClass} placeholder="Talk to the team directly" maxLength={FIELD_LIMITS.heading} />
                <ArInput label="Support Title" kind="heading" value={supportCta.ar?.supportTitle} onChange={(v) => setSupportCta((p) => ({ ...p, ar: { ...(p.ar ?? {}), supportTitle: v } }))} />
              </div>
            </div>
            <MediaField
              label="Background Image"
              value={supportCta.image}
              accept="image/*"
              resourceType="image"
              uploading={uploadProgress["support-image"] !== undefined}
              progress={uploadProgress["support-image"]}
              onChange={(v) => setSupportCta((p) => ({ ...p, image: v }))}
              onUpload={(file) => handleSupportImageUpload(file)}
            />
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
