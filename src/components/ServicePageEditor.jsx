import { useEffect, useState } from "react";
import { ExternalLink, Plus, Trash2, Upload, Loader2, Save, ChevronDown } from "lucide-react";
import { api, uploadMediaToCloudinary } from "../lib/api";
import { validateUrl, validateImageFile, validateVideoFile } from "../lib/validators";
import { scrollToNewItem } from "../lib/scrollToNewItem";
import { FIELD_LIMITS, CharCount, FieldError, ArInput } from "./CappedField";
import RichTextArea from "./RichTextArea.jsx";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500";

// Structural default only — no hardcoded copy. Everything is CMS-driven; empty
// fields render blank / hidden on the site (the DB is the single source of truth).
const DEFAULT_SERVICE_HERO = {
  title: "",
  subtitle: "",
  chips: [],
  chipsMore: "",
  ctaPrimary: "",
  ctaPrimaryLink: "",
  ctaSecondary: "",
  slides: [],
  floatCardTop: { title: "", subtitle: "" },
  floatCardBottom: { title: "", value: "", caption: "", badge: "", percent: "" },
  ar: {},
};

const DEFAULT_PARTNERS_SECTION = {
  heading: "Clients & Partners",
  headingGradient: "Partners",
  subtitle: "Trusted by the UAE's leading brands.",
  description: "HalaPark partners with global hotel chains, residential towers, retail destinations, and enterprises across the UAE.",
  ctaText: "Want to become a partner?",
  ctaLink: "/contact",
};

const DEFAULT_TRUST_SECTION = {
  heading: "Trust & Safety",
  headingGradient: "Safety",
  subtitle: "Your safety is our priority.",
  items: [
    { label: "24/7 Surveillance", icon: "Camera" },
    { label: "Insurance / Vehicle Safety Assurance", icon: "Shield" },
    { label: "Verified Valet Staff", icon: "BadgeCheck" },
    { label: "Secure Payment System", icon: "CreditCard" },
    { label: "Controlled Access Zones", icon: "Lock" },
  ],
};

const DEFAULT_CTA_SECTION = {
  heading: "Looking for Long-Term Parking?",
  headingGradient: "Parking?",
  subtitle: "Secure, flexible, and smart parking solutions for businesses, residents, airports, and yearly vehicle storage.",
  ctaLabel: "Get a Quote",
};

// The "Get a Quote" popup (opened by Get In Touch / CTA buttons). Structural
// default only — empty strings, so the DB is the single source of truth and the
// site falls back to its built-in copy only when a field is left blank.
const DEFAULT_QUOTE_FORM = {
  eyebrow: "",
  heading: "",
  intro: "",
  successTitle: "",
  successMessage: "",
  ar: { eyebrow: "", heading: "", intro: "", successTitle: "", successMessage: "" },
};

// Icons available for Trust & Safety items. These map 1:1 to the icon set the
// public site supports (TRUST_ICONS in ServicesListPage). To add a new icon,
// add it here AND to that map on the frontend.
const TRUST_ICON_OPTIONS = [
  { value: "Shield", label: "Shield (Safety)" },
  { value: "Camera", label: "Camera (Surveillance)" },
  { value: "BadgeCheck", label: "Badge Check (Verified)" },
  { value: "CreditCard", label: "Credit Card (Payments)" },
  { value: "Lock", label: "Lock (Secure Access)" },
];

// Tab-bar categories for the public Services page. The website builds the tab
// bar dynamically from the categories actually used by the services.
const CATEGORY_OPTIONS = [
  { value: "parking", label: "Parking" },
  { value: "valet", label: "Valet & Access" },
  { value: "care", label: "Vehicle Care" },
];

const DEFAULT_SERVICE = {
  id: 1,
  slug: "",
  name: "",
  category: "parking",
  mediaType: "image",
  mediaSrc: "",
  fullDesc: "",
  whatsIncluded: [],
  includedLabel: "What's Included",
  subCategoriesLabel: "",
  subCategories: [],
};

function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 sm:px-5 hover:bg-slate-50 transition"
      >
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && <div className="border-t border-slate-200 px-4 py-4 sm:px-5">{children}</div>}
    </div>
  );
}

// "Show this section on the website" toggle. Writes `enabled` on the section
// object; the website hides a section only when enabled === false.
/* eslint-disable-next-line react/prop-types */
function EnabledToggle({ section, setSection }) {
  // eslint-disable-next-line react/prop-types
  const enabled = section?.enabled !== false;
  return (
    <label className="mb-4 flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => setSection((p) => ({ ...p, enabled: e.target.checked }))}
        className="h-4 w-4 rounded border-slate-300 accent-[#0088FF]"
      />
      Show this section on the website
    </label>
  );
}

function ArrayItemEditor({ label, items, onAdd, onRemove, onUpdate, renderItem }) {
  return (
    <div className="space-y-3" data-item-list-root>
      <div>
        <label className={labelClass}>{label}</label>
      </div>
      {items.map((item, i) => (
        <div key={i} data-new-item-row className="flex gap-2">
          <div className="flex-1">
            {renderItem(item, i, onUpdate)}
          </div>
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={(e) => {
          onAdd();
          scrollToNewItem(e);
        }}
        className="inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff]"
      >
        <Plus className="h-3.5 w-3.5" />
        Add {label}
      </button>
    </div>
  );
}

export default function ServicePageEditor() {
  const [hero, setHero] = useState(DEFAULT_SERVICE_HERO);
  const [services, setServices] = useState([]);
  const [partnersSection, setPartnersSection] = useState(DEFAULT_PARTNERS_SECTION);
  const [trustSection, setTrustSection] = useState(DEFAULT_TRUST_SECTION);
  const [ctaSection, setCtaSection] = useState(DEFAULT_CTA_SECTION);
  const [quoteForm, setQuoteForm] = useState(DEFAULT_QUOTE_FORM);
  const [gridHeader, setGridHeader] = useState({});
  // Raw text drafts for the comma-separated chips inputs — lets the admin type
  // spaces freely; the parsed arrays update alongside, display after blur.
  const [chipsDraft, setChipsDraft] = useState(null);
  const [chipsArDraft, setChipsArDraft] = useState(null);
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

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await api.getPage("services");
      console.log("Loaded services page data:", data);
      if (data?.page?.sections) {
        setHero(data.page.sections.hero || DEFAULT_SERVICE_HERO);
        const loadedServices = data.page.sections.services || [];
        console.log(`Loaded ${loadedServices.length} services`);
        setServices(loadedServices);
        setPartnersSection(data.page.sections.partnersSection || DEFAULT_PARTNERS_SECTION);
        setTrustSection(data.page.sections.trustSection || DEFAULT_TRUST_SECTION);
        setCtaSection(data.page.sections.ctaSection || DEFAULT_CTA_SECTION);
        setQuoteForm({
          ...DEFAULT_QUOTE_FORM,
          ...(data.page.sections.quoteForm ?? {}),
          ar: { ...DEFAULT_QUOTE_FORM.ar, ...(data.page.sections.quoteForm?.ar ?? {}) },
        });
        setGridHeader(data.page.sections.servicesGridHeader || {});
      }
    } catch (err) {
      setError("Failed to load page data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    // Validation: a service card must have at least a Name — otherwise it saves
    // as an empty/blank card that renders as a nameless tile on the website.
    const emptyIdx = services.findIndex((s) => !(s?.name ?? "").trim());
    if (emptyIdx !== -1) {
      setSuccess("");
      setError(`Service #${emptyIdx + 1} has no Name. Enter a name or delete the card before saving.`);
      // Scroll the error into view.
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await api.updatePage("services", {
        sections: { hero, services, partnersSection, trustSection, ctaSection, quoteForm, servicesGridHeader: gridHeader },
      });
      setSuccess("Service page saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save page");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  function updateHero(field, value) {
    setHero((p) => ({ ...p, [field]: value }));
  }

  // ── Hero right-side slides (hero.slides = [{ img, name, tag, ar }]) ──────────
  function updateHeroSlide(i, patch) {
    setHero((prev) => ({
      ...prev,
      slides: (prev.slides ?? []).map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    }));
  }
  function addHeroSlide() {
    setHero((prev) => ({ ...prev, slides: [...(prev.slides ?? []), { img: "", name: "", tag: "", ar: {} }] }));
  }
  function removeHeroSlide(i) {
    setHero((prev) => ({ ...prev, slides: (prev.slides ?? []).filter((_, idx) => idx !== i) }));
  }
  async function handleHeroSlideUpload(i, file) {
    const key = `hero-slide-${i}`;
    const err = validateImageFile(file);
    if (err) { setUploadError(key, err); return; }
    clearUploadError(key);
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct }))
      );
      updateHeroSlide(i, { img: url });
      setSuccess("Image uploaded. Remember to Save.");
    } catch (e) {
      setUploadError(key, e.message ?? "Upload failed");
      console.error(e);
    } finally {
      setUploadProgress((p) => ({ ...p, [key]: undefined }));
    }
  }

  // ── Hero floating cards (hero.floatCardTop / hero.floatCardBottom) ───────────
  function updateFloatTop(patch) {
    setHero((prev) => ({ ...prev, floatCardTop: { ...(prev.floatCardTop ?? {}), ...patch } }));
  }
  function updateFloatTopAr(patch) {
    setHero((prev) => ({ ...prev, floatCardTop: { ...(prev.floatCardTop ?? {}), ar: { ...(prev.floatCardTop?.ar ?? {}), ...patch } } }));
  }
  function updateFloatBottom(patch) {
    setHero((prev) => ({ ...prev, floatCardBottom: { ...(prev.floatCardBottom ?? {}), ...patch } }));
  }
  function updateFloatBottomAr(patch) {
    setHero((prev) => ({ ...prev, floatCardBottom: { ...(prev.floatCardBottom ?? {}), ar: { ...(prev.floatCardBottom?.ar ?? {}), ...patch } } }));
  }

  function updateService(i, field, value) {
    setServices((prev) =>
      prev.map((srv, idx) => (idx === i ? { ...srv, [field]: value } : srv))
    );
  }

  function addService() {
    setServices((prev) => [...prev, { ...DEFAULT_SERVICE, id: Math.max(...prev.map(s => s.id), 0) + 1 }]);
  }

  function removeService(i) {
    setServices((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateServiceIncluded(i, j, value) {
    setServices((prev) =>
      prev.map((srv, idx) =>
        idx === i
          ? { ...srv, whatsIncluded: srv.whatsIncluded.map((item, jdx) => (jdx === j ? value : item)) }
          : srv
      )
    );
  }

  // Arabic for a "What's Included" item lives in a parallel array on
  // `service.ar.whatsIncluded` (Shape A). Blank AR falls back to nothing on the
  // site (strict Arabic), never the English item.
  function updateServiceIncludedAr(i, j, value) {
    setServices((prev) =>
      prev.map((srv, idx) => {
        if (idx !== i) return srv;
        const arList = Array.isArray(srv.ar?.whatsIncluded) ? [...srv.ar.whatsIncluded] : [];
        while (arList.length <= j) arList.push("");
        arList[j] = value;
        return { ...srv, ar: { ...(srv.ar ?? {}), whatsIncluded: arList } };
      })
    );
  }

  function removeServiceIncluded(i, j) {
    setServices((prev) =>
      prev.map((srv, idx) => {
        if (idx !== i) return srv;
        const arList = Array.isArray(srv.ar?.whatsIncluded) ? srv.ar.whatsIncluded.filter((_, jdx) => jdx !== j) : [];
        return {
          ...srv,
          whatsIncluded: srv.whatsIncluded.filter((_, jdx) => jdx !== j),
          ar: { ...(srv.ar ?? {}), whatsIncluded: arList },
        };
      })
    );
  }

  function addServiceIncluded(i) {
    setServices((prev) =>
      prev.map((srv, idx) =>
        idx === i ? { ...srv, whatsIncluded: [...(srv.whatsIncluded || []), ""] } : srv
      )
    );
  }

  function updateServiceCategory(i, j, field, value) {
    setServices((prev) =>
      prev.map((srv, idx) =>
        idx === i
          ? {
              ...srv,
              subCategories: srv.subCategories.map((cat, jdx) =>
                jdx === j ? { ...cat, [field]: value } : cat
              ),
            }
          : srv
      )
    );
  }

  function removeServiceCategory(i, j) {
    setServices((prev) =>
      prev.map((srv, idx) =>
        idx === i
          ? { ...srv, subCategories: srv.subCategories.filter((_, jdx) => jdx !== j) }
          : srv
      )
    );
  }

  function addServiceCategory(i) {
    setServices((prev) =>
      prev.map((srv, idx) =>
        idx === i
          ? { ...srv, subCategories: [...(srv.subCategories || []), { title: "", description: "" }] }
          : srv
      )
    );
  }

  async function handleServiceImageUpload(i, file) {
    const key = `service-${i}-image`;
    const err = validateImageFile(file);
    if (err) { setUploadError(key, err); return; }
    clearUploadError(key);
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct }))
      );
      updateService(i, "mediaSrc", url);
      setSuccess("Image uploaded. Remember to Save.");
    } catch (err) {
      setUploadError(key, err.message ?? "Upload failed");
      console.error(err);
    } finally {
      setUploadProgress((p) => ({ ...p, [key]: undefined }));
    }
  }

  // ── Partner logos (partnersSection.partners) ──────────────────────────────
  function updatePartner(i, field, value) {
    setPartnersSection((prev) => ({
      ...prev,
      partners: (prev.partners ?? []).map((p, idx) => (idx === i ? { ...p, [field]: value } : p)),
    }));
  }
  function addPartner() {
    setPartnersSection((prev) => ({
      ...prev,
      partners: [...(prev.partners ?? []), { name: "", industry: "", logo: "", initials: "", color: "#0088FF" }],
    }));
  }
  function removePartner(i) {
    setPartnersSection((prev) => ({
      ...prev,
      partners: (prev.partners ?? []).filter((_, idx) => idx !== i),
    }));
  }
  async function handlePartnerLogoUpload(i, file) {
    const key = `partner-${i}-logo`;
    const err = validateImageFile(file);
    if (err) { setUploadError(key, err); return; }
    clearUploadError(key);
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct }))
      );
      updatePartner(i, "logo", url);
      setSuccess("Logo uploaded. Remember to Save.");
    } catch (err) {
      setUploadError(key, err.message ?? "Upload failed");
      console.error(err);
    } finally {
      setUploadProgress((p) => ({ ...p, [key]: undefined }));
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="w-full space-y-6 px-6 py-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#050A13]">Services Page Editor</h1>
          <p className="mt-2 text-sm text-slate-600">Manage all service page sections</p>
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

      {/* HERO SECTION */}
      <CollapsibleSection title="Hero Section" defaultOpen={true}>
        <EnabledToggle section={hero} setSection={setHero} />
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Title</label>
            <input
              value={hero.title ?? ""}
              onChange={(e) => updateHero("title", e.target.value)}
              className={inputClass}
              placeholder="Smart Parking. Vehicle Care Partner."
              maxLength={FIELD_LIMITS.heading}
            />
            <CharCount value={hero.title ?? ""} max={FIELD_LIMITS.heading} />
            <ArInput label="Title" kind="heading" value={hero.ar?.title} onChange={(v) => updateHero("ar", { ...(hero.ar ?? {}), title: v })} />
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <textarea
              value={hero.subtitle ?? ""}
              onChange={(e) => updateHero("subtitle", e.target.value)}
              className={inputClass}
              rows={2}
              placeholder="Smart parking and vehicle care built for convenience, safety, and innovation."
              maxLength={FIELD_LIMITS.subtitle}
            />
            <CharCount value={hero.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
            <ArInput label="Subtitle" kind="subtitle" multiline value={hero.ar?.subtitle} onChange={(v) => updateHero("ar", { ...(hero.ar ?? {}), subtitle: v })} />
          </div>
          <div>
            <label className={labelClass}>Service Chips (comma-separated)</label>
            <input
              value={chipsDraft ?? (Array.isArray(hero.chips) ? hero.chips.join(", ") : "")}
              onChange={(e) => {
                setChipsDraft(e.target.value);
                updateHero("chips", e.target.value.split(",").map((s) => s.trim()));
              }}
              onBlur={() => setChipsDraft(null)}
              className={inputClass}
              placeholder="Self-Parking, Valet Service, EV Charging, Car Storage, Airport Parking"
              maxLength={FIELD_LIMITS.long}
            />
            <label className={labelClass} style={{ marginTop: 6 }}>Service Chips — Arabic (comma-separated, same order)</label>
            <input
              dir="rtl"
              value={chipsArDraft ?? (Array.isArray(hero.ar?.chips) ? hero.ar.chips.join("، ") : "")}
              onChange={(e) => {
                setChipsArDraft(e.target.value);
                updateHero("ar", { ...(hero.ar ?? {}), chips: e.target.value.split(/،|,/).map((s) => s.trim()) });
              }}
              onBlur={() => setChipsArDraft(null)}
              className={inputClass}
              style={{ borderColor: "#16a34a" }}
              maxLength={FIELD_LIMITS.long}
              placeholder="ركن ذاتي، خدمة صف السيارات، شحن المركبات الكهربائية…"
            />
          </div>
          <div>
            <label className={labelClass}>&quot;+N More&quot; Pill</label>
            <input
              value={hero.chipsMore ?? ""}
              onChange={(e) => updateHero("chipsMore", e.target.value)}
              className={inputClass}
              placeholder="+13 More"
              maxLength={FIELD_LIMITS.label}
            />
            <CharCount value={hero.chipsMore ?? ""} max={FIELD_LIMITS.label} />
            <ArInput label="Chips More" kind="label" value={hero.ar?.chipsMore} onChange={(v) => updateHero("ar", { ...(hero.ar ?? {}), chipsMore: v })} />
          </div>

          {/* CTA buttons — each shows only when it has a label */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Primary Button Label</label>
              <input
                value={hero.ctaPrimary ?? ""}
                onChange={(e) => updateHero("ctaPrimary", e.target.value)}
                className={inputClass}
                placeholder="Get in Touch"
                maxLength={FIELD_LIMITS.label}
              />
              <ArInput label="Primary Button" kind="label" value={hero.ar?.ctaPrimary} onChange={(v) => updateHero("ar", { ...(hero.ar ?? {}), ctaPrimary: v })} />
            </div>
            <div>
              <label className={labelClass}>Primary Button Link</label>
              <input
                value={hero.ctaPrimaryLink ?? ""}
                onChange={(e) => updateHero("ctaPrimaryLink", e.target.value)}
                className={inputClass}
                placeholder="/contact"
                maxLength={FIELD_LIMITS.link}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Secondary Button Label (opens the Quote form)</label>
            <input
              value={hero.ctaSecondary ?? ""}
              onChange={(e) => updateHero("ctaSecondary", e.target.value)}
              className={inputClass}
              placeholder="Get a Quote"
              maxLength={FIELD_LIMITS.label}
            />
            <ArInput label="Secondary Button" kind="label" value={hero.ar?.ctaSecondary} onChange={(v) => updateHero("ar", { ...(hero.ar ?? {}), ctaSecondary: v })} />
            <p className="mt-1 text-[11px] text-slate-400">Leave a label empty to hide that button.</p>
          </div>

          {/* Right-side rotating slides */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex items-center justify-between">
              <label className={labelClass} style={{ margin: 0 }}>Right-side Image Slides</label>
              <button type="button" onClick={addHeroSlide} className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-slate-700">
                <Plus className="h-3 w-3" /> Add Slide
              </button>
            </div>
            <p className="mb-2 mt-1 text-[11px] text-slate-400">The rotating cards on the right of the hero. Each needs an image; name &amp; tag are the caption. No slides = the right visual is hidden.</p>
            <div className="space-y-3">
              {(Array.isArray(hero.slides) ? hero.slides : []).map((s, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">Slide {i + 1}</span>
                    <button type="button" onClick={() => removeHeroSlide(i)} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] text-slate-500 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                  <label className={labelClass}>Image</label>
                  <div className="flex gap-2">
                    <input
                      value={s.img ?? ""}
                      onChange={(e) => updateHeroSlide(i, { img: e.target.value })}
                      className={inputClass}
                      placeholder="https://… or upload"
                      maxLength={FIELD_LIMITS.link}
                    />
                    <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                      {uploadProgress[`hero-slide-${i}`] !== undefined ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress[`hero-slide-${i}`]}%</>
                      ) : (
                        <><Upload className="h-3.5 w-3.5" />Upload</>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleHeroSlideUpload(i, f); e.target.value = ""; }} />
                    </label>
                  </div>
                  {uploadErrors[`hero-slide-${i}`] ? (
                    <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors[`hero-slide-${i}`]}</p>
                  ) : null}
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Name (caption)</label>
                      <input value={s.name ?? ""} onChange={(e) => updateHeroSlide(i, { name: e.target.value })} className={inputClass} placeholder="Valet Service" maxLength={FIELD_LIMITS.label} />
                      <ArInput label="Name" kind="label" value={s.ar?.name} onChange={(v) => updateHeroSlide(i, { ar: { ...(s.ar ?? {}), name: v } })} />
                    </div>
                    <div>
                      <label className={labelClass}>Tag (small pill)</label>
                      <input value={s.tag ?? ""} onChange={(e) => updateHeroSlide(i, { tag: e.target.value })} className={inputClass} placeholder="Parking" maxLength={FIELD_LIMITS.label} />
                      <ArInput label="Tag" kind="label" value={s.ar?.tag} onChange={(v) => updateHeroSlide(i, { ar: { ...(s.ar ?? {}), tag: v } })} />
                    </div>
                  </div>
                </div>
              ))}
              {(Array.isArray(hero.slides) ? hero.slides : []).length === 0 ? (
                <p className="text-[11px] text-slate-400">No slides yet — the right-side visual is hidden.</p>
              ) : null}
            </div>
          </div>

          {/* Floating card — top-left (hides when empty) */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
            <label className={labelClass}>Floating Card — Top Left (leave empty to hide)</label>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <input value={hero.floatCardTop?.title ?? ""} onChange={(e) => updateFloatTop({ title: e.target.value })} className={inputClass} placeholder="Title, e.g. Service Booked" maxLength={FIELD_LIMITS.label} />
                <ArInput label="Title" kind="label" value={hero.floatCardTop?.ar?.title} onChange={(v) => updateFloatTopAr({ title: v })} />
              </div>
              <div>
                <input value={hero.floatCardTop?.subtitle ?? ""} onChange={(e) => updateFloatTop({ subtitle: e.target.value })} className={inputClass} placeholder="Subtitle, e.g. Valet, Dubai Mall" maxLength={FIELD_LIMITS.label} />
                <ArInput label="Subtitle" kind="label" value={hero.floatCardTop?.ar?.subtitle} onChange={(v) => updateFloatTopAr({ subtitle: v })} />
              </div>
            </div>
          </div>

          {/* Floating card — bottom-right (stat, hides when empty) */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
            <label className={labelClass}>Floating Card — Bottom Right (stat, leave empty to hide)</label>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Title</label>
                <input value={hero.floatCardBottom?.title ?? ""} onChange={(e) => updateFloatBottom({ title: e.target.value })} className={inputClass} placeholder="EV Charging" maxLength={FIELD_LIMITS.label} />
                <ArInput label="Title" kind="label" value={hero.floatCardBottom?.ar?.title} onChange={(v) => updateFloatBottomAr({ title: v })} />
              </div>
              <div>
                <label className={labelClass}>Badge (small pill)</label>
                <input value={hero.floatCardBottom?.badge ?? ""} onChange={(e) => updateFloatBottom({ badge: e.target.value })} className={inputClass} placeholder="Live" maxLength={FIELD_LIMITS.label} />
                <ArInput label="Badge" kind="label" value={hero.floatCardBottom?.ar?.badge} onChange={(v) => updateFloatBottomAr({ badge: v })} />
              </div>
              <div>
                <label className={labelClass}>Progress % (0–100, optional)</label>
                <input type="number" min="0" max="100" value={hero.floatCardBottom?.percent ?? ""} onChange={(e) => updateFloatBottom({ percent: e.target.value })} className={inputClass} placeholder="68" />
              </div>
              <div>
                <label className={labelClass}>Value (bottom-left text)</label>
                <input value={hero.floatCardBottom?.value ?? ""} onChange={(e) => updateFloatBottom({ value: e.target.value })} className={inputClass} placeholder="68% charged" maxLength={FIELD_LIMITS.label} />
                <ArInput label="Value" kind="label" value={hero.floatCardBottom?.ar?.value} onChange={(v) => updateFloatBottomAr({ value: v })} />
              </div>
              <div>
                <label className={labelClass}>Caption (bottom-right text)</label>
                <input value={hero.floatCardBottom?.caption ?? ""} onChange={(e) => updateFloatBottom({ caption: e.target.value })} className={inputClass} placeholder="~22 min" maxLength={FIELD_LIMITS.label} />
                <ArInput label="Caption" kind="label" value={hero.floatCardBottom?.ar?.caption} onChange={(v) => updateFloatBottomAr({ caption: v })} />
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* SERVICES GRID HEADER */}
      <CollapsibleSection title="Services Grid Header" defaultOpen={false}>
        <EnabledToggle section={gridHeader} setSection={setGridHeader} />
        <div className="grid gap-3">
          <div>
            <label className={labelClass}>Heading (first part)</label>
            <input
              value={gridHeader.heading ?? ""}
              onChange={(e) => setGridHeader((p) => ({ ...p, heading: e.target.value }))}
              className={inputClass}
              placeholder="Explore Our"
              maxLength={FIELD_LIMITS.heading}
            />
            <CharCount value={gridHeader.heading ?? ""} max={FIELD_LIMITS.heading} />
            <ArInput label="Heading" kind="heading" value={gridHeader.ar?.heading} onChange={(v) => setGridHeader((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
          </div>
          <div>
            <label className={labelClass}>Heading Gradient (highlighted word)</label>
            <input
              value={gridHeader.headingGradient ?? ""}
              onChange={(e) => setGridHeader((p) => ({ ...p, headingGradient: e.target.value }))}
              className={inputClass}
              placeholder="Services"
              maxLength={FIELD_LIMITS.label}
            />
            <CharCount value={gridHeader.headingGradient ?? ""} max={FIELD_LIMITS.label} />
            <ArInput label="Heading Gradient" kind="label" value={gridHeader.ar?.headingGradient} onChange={(v) => setGridHeader((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <input
              value={gridHeader.subtitle ?? ""}
              onChange={(e) => setGridHeader((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
              placeholder="Everything you need, one platform."
              maxLength={FIELD_LIMITS.subtitle}
            />
            <CharCount value={gridHeader.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
            <ArInput label="Subtitle" kind="subtitle" value={gridHeader.ar?.subtitle} onChange={(v) => setGridHeader((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <RichTextArea
              value={gridHeader.description ?? ""}
              onChange={(v) => setGridHeader((p) => ({ ...p, description: v }))}
              maxLength={FIELD_LIMITS.description}
              rows={2}
            />
            <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
            <RichTextArea
              value={gridHeader.ar?.description ?? ""}
              onChange={(v) => setGridHeader((p) => ({ ...p, ar: { ...(p.ar ?? {}), description: v } }))}
              maxLength={FIELD_LIMITS.description}
              rows={2}
              dir="rtl"
              variant="arabic"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* SERVICES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Services ({services.length})</h2>
          <button
            type="button"
            onClick={addService}
            className="inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Service
          </button>
        </div>

        {services.map((service, i) => (
          <CollapsibleSection key={i} title={`Service: ${service.name || `#${i + 1}`}`}>
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Service Name <span className="text-red-500">*</span></label>
                  <input
                    value={service.name ?? ""}
                    onChange={(e) => updateService(i, "name", e.target.value)}
                    className={`${inputClass} ${!(service.name ?? "").trim() ? "border-red-300 focus:border-red-400 focus:ring-red-200" : ""}`}
                    placeholder="Self-Parking"
                    maxLength={FIELD_LIMITS.heading}
                  />
                  <CharCount value={service.name ?? ""} max={FIELD_LIMITS.heading} />
                  {!(service.name ?? "").trim() ? (
                    <p className="mt-1 text-[11px] font-semibold text-red-500">Required — a service must have a name to be saved.</p>
                  ) : null}
                  <ArInput label="Name" kind="heading" value={service.ar?.name} onChange={(v) => updateService(i, "ar", { ...(service.ar ?? {}), name: v })} />
                </div>
                <div>
                  <label className={labelClass}>Slug</label>
                  <input
                    value={service.slug ?? ""}
                    onChange={(e) => updateService(i, "slug", e.target.value)}
                    className={inputClass}
                    placeholder="self-parking"
                    maxLength={FIELD_LIMITS.label}
                  />
                  <CharCount value={service.slug ?? ""} max={FIELD_LIMITS.label} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Tab Bar Category</label>
                <select
                  value={service.category ?? "parking"}
                  onChange={(e) => updateService(i, "category", e.target.value)}
                  className={inputClass}
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-[10px] text-slate-400">
                  Which tab this service appears under on the website. Tabs show only when they have services.
                </p>
              </div>

              <div>
                <label className={labelClass}>Full Description</label>
                <RichTextArea
                  value={service.fullDesc ?? ""}
                  onChange={(v) => updateService(i, "fullDesc", v)}
                  maxLength={FIELD_LIMITS.description}
                  rows={3}
                />
                <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
                <RichTextArea
                  value={service.ar?.fullDesc ?? ""}
                  onChange={(v) => updateService(i, "ar", { ...(service.ar ?? {}), fullDesc: v })}
                  maxLength={FIELD_LIMITS.description}
                  rows={3}
                  dir="rtl"
                  variant="arabic"
                />
              </div>

              <div>
                <label className={labelClass}>Media Type</label>
                <select
                  value={service.mediaType ?? "image"}
                  onChange={(e) => updateService(i, "mediaType", e.target.value)}
                  className={inputClass}
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className={labelClass}>Media URL / Path</label>
                  <input
                    value={service.mediaSrc ?? ""}
                    onChange={(e) => updateService(i, "mediaSrc", e.target.value)}
                    className={inputClass}
                    placeholder="/image.jpg or /path/to/video.mp4"
                    maxLength={FIELD_LIMITS.link}
                  />
                  <CharCount value={service.mediaSrc ?? ""} max={FIELD_LIMITS.link} />
                  <FieldError error={validateUrl(service.mediaSrc)} />
                </div>
                <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleServiceImageUpload(i, file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              {uploadErrors[`service-${i}-image`] ? (
                <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors[`service-${i}-image`]}</p>
              ) : null}

              <div>
                <label className={labelClass}>Included Label</label>
                <input
                  value={service.includedLabel ?? ""}
                  onChange={(e) => updateService(i, "includedLabel", e.target.value)}
                  className={inputClass}
                  placeholder="What's Included"
                  maxLength={FIELD_LIMITS.label}
                />
                <CharCount value={service.includedLabel ?? ""} max={FIELD_LIMITS.label} />
                <ArInput label="Included Label" kind="label" value={service.ar?.includedLabel} onChange={(v) => updateService(i, "ar", { ...(service.ar ?? {}), includedLabel: v })} />
              </div>

              <ArrayItemEditor
                label="What's Included Items"
                items={service.whatsIncluded || []}
                onAdd={() => addServiceIncluded(i)}
                onRemove={(j) => removeServiceIncluded(i, j)}
                onUpdate={(j, val) => updateServiceIncluded(i, j, val)}
                renderItem={(item, j) => (
                  <>
                    <textarea
                      value={item ?? ""}
                      onChange={(e) => updateServiceIncluded(i, j, e.target.value)}
                      className={inputClass}
                      rows={2}
                      placeholder="Feature item..."
                      maxLength={FIELD_LIMITS.item}
                    />
                    <CharCount value={item ?? ""} max={FIELD_LIMITS.item} />
                    <ArInput
                      label="Included Item"
                      kind="item"
                      multiline
                      value={service.ar?.whatsIncluded?.[j]}
                      onChange={(v) => updateServiceIncludedAr(i, j, v)}
                    />
                  </>
                )}
              />

              {(service.subCategories?.length ?? 0) > 0 && (
                <>
                  <div>
                    <label className={labelClass}>Sub Categories Label</label>
                    <input
                      value={service.subCategoriesLabel ?? ""}
                      onChange={(e) => updateService(i, "subCategoriesLabel", e.target.value)}
                      className={inputClass}
                      placeholder="Service Categories"
                      maxLength={FIELD_LIMITS.label}
                    />
                    <CharCount value={service.subCategoriesLabel ?? ""} max={FIELD_LIMITS.label} />
                  </div>

                  <div className="space-y-3">
                    <label className={labelClass}>Sub Categories</label>
                    {service.subCategories.map((cat, j) => (
                      <div key={j} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-2">
                        <div className="flex gap-2">
                          <input
                            value={cat.title ?? ""}
                            onChange={(e) => updateServiceCategory(i, j, "title", e.target.value)}
                            className={inputClass}
                            placeholder="Category title..."
                            maxLength={FIELD_LIMITS.heading}
                          />
                          <button
                            type="button"
                            onClick={() => removeServiceCategory(i, j)}
                            className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <RichTextArea
                          value={cat.description ?? ""}
                          onChange={(v) => updateServiceCategory(i, j, "description", v)}
                          maxLength={FIELD_LIMITS.description}
                          rows={2}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addServiceCategory(i)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff]"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Sub Category
                    </button>
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={() => removeService(i)}
                className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove Service
              </button>
            </div>
          </CollapsibleSection>
        ))}
      </div>

      {/* PARTNERS SECTION */}
      <CollapsibleSection title="Partners Section" defaultOpen={false}>
        <EnabledToggle section={partnersSection} setSection={setPartnersSection} />
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={partnersSection.heading ?? ""}
                onChange={(e) => setPartnersSection((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
                placeholder="Clients & Partners"
                maxLength={FIELD_LIMITS.heading}
              />
              <CharCount value={partnersSection.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={partnersSection.ar?.heading} onChange={(v) => setPartnersSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient Word</label>
              <input
                value={partnersSection.headingGradient ?? ""}
                onChange={(e) => setPartnersSection((p) => ({ ...p, headingGradient: e.target.value }))}
                className={inputClass}
                placeholder="Partners"
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={partnersSection.headingGradient ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Heading Gradient" kind="label" value={partnersSection.ar?.headingGradient} onChange={(v) => setPartnersSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <input
              value={partnersSection.subtitle ?? ""}
              onChange={(e) => setPartnersSection((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
              placeholder="Trusted by the UAE's leading brands."
              maxLength={FIELD_LIMITS.subtitle}
            />
            <CharCount value={partnersSection.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
            <ArInput label="Subtitle" kind="subtitle" value={partnersSection.ar?.subtitle} onChange={(v) => setPartnersSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <RichTextArea
              value={partnersSection.description ?? ""}
              onChange={(v) => setPartnersSection((p) => ({ ...p, description: v }))}
              maxLength={FIELD_LIMITS.description}
              rows={2}
            />
            <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
            <RichTextArea
              value={partnersSection.ar?.description ?? ""}
              onChange={(v) => setPartnersSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), description: v } }))}
              maxLength={FIELD_LIMITS.description}
              rows={2}
              dir="rtl"
              variant="arabic"
            />
          </div>

          {/* Partner logos */}
          <div className="mt-2 border-t border-slate-200 pt-3">
            <div className="mb-2 flex items-center justify-between">
              <label className={labelClass}>Partner Logos ({(partnersSection.partners ?? []).length})</label>
              <button
                type="button"
                onClick={addPartner}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
              >
                <Plus className="h-3.5 w-3.5" /> Add Partner
              </button>
            </div>
            <p className="mb-3 text-[11px] text-slate-400">
              Upload a logo for each partner (transparent PNG/SVG works best). If no logo is uploaded, the partner&apos;s colored initials are shown instead.
            </p>
            {(partnersSection.partners ?? []).length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-400">
                No partners yet — the default brand list is shown on the site. Click &quot;Add Partner&quot; to manage your own.
              </p>
            ) : (
              <div className="space-y-3">
                {(partnersSection.partners ?? []).map((partner, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Partner {i + 1}</p>
                      <button
                        type="button"
                        onClick={() => removePartner(i)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                        {partner.logo ? (
                          <img src={partner.logo} alt={partner.name || ""} className="max-h-10 max-w-[44px] object-contain" />
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400">{partner.initials || "—"}</span>
                        )}
                      </div>
                      <div className="grid flex-1 gap-2">
                        <div className="flex gap-2">
                          <input
                            value={partner.logo ?? ""}
                            onChange={(e) => updatePartner(i, "logo", e.target.value)}
                            className={inputClass}
                            placeholder="Logo image URL"
                            maxLength={FIELD_LIMITS.link}
                          />
                          <label className="shrink-0 inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff]">
                            {uploadProgress[`partner-${i}-logo`] !== undefined ? (
                              <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadProgress[`partner-${i}-logo`]}%</>
                            ) : (
                              <><Upload className="h-3.5 w-3.5" />Upload</>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handlePartnerLogoUpload(i, file);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        </div>
                        {uploadErrors[`partner-${i}-logo`] ? (
                          <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors[`partner-${i}-logo`]}</p>
                        ) : null}
                        <FieldError error={validateUrl(partner.logo)} />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <input
                              value={partner.name ?? ""}
                              onChange={(e) => updatePartner(i, "name", e.target.value)}
                              className={inputClass}
                              placeholder="Partner name"
                              maxLength={FIELD_LIMITS.label}
                            />
                            <ArInput label="Name" kind="label" value={partner.ar?.name} onChange={(v) => updatePartner(i, "ar", { ...(partner.ar ?? {}), name: v })} />
                          </div>
                          <div>
                            <input
                              value={partner.industry ?? ""}
                              onChange={(e) => updatePartner(i, "industry", e.target.value)}
                              className={inputClass}
                              placeholder="Industry"
                              maxLength={FIELD_LIMITS.label}
                            />
                            <ArInput label="Industry" kind="label" value={partner.ar?.industry} onChange={(v) => updatePartner(i, "ar", { ...(partner.ar ?? {}), industry: v })} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom "Get in touch" line under the logos */}
          <div className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Bottom &ldquo;Get in Touch&rdquo; Line</p>
            <div>
              <label className={labelClass}>Text</label>
              <input
                value={partnersSection.ctaText ?? ""}
                onChange={(e) => setPartnersSection((p) => ({ ...p, ctaText: e.target.value }))}
                className={inputClass}
                placeholder="Want to become a partner?"
                maxLength={FIELD_LIMITS.subtitle}
              />
              <CharCount value={partnersSection.ctaText ?? ""} max={FIELD_LIMITS.subtitle} />
              <ArInput label="Text" kind="subtitle" value={partnersSection.ar?.ctaText} onChange={(v) => setPartnersSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), ctaText: v } }))} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Link Label</label>
                <input
                  value={partnersSection.ctaLabel ?? ""}
                  onChange={(e) => setPartnersSection((p) => ({ ...p, ctaLabel: e.target.value }))}
                  className={inputClass}
                  placeholder="Get in touch"
                  maxLength={FIELD_LIMITS.button}
                />
                <CharCount value={partnersSection.ctaLabel ?? ""} max={FIELD_LIMITS.button} />
                <ArInput label="Link Label" kind="button" value={partnersSection.ar?.ctaLabel} onChange={(v) => setPartnersSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), ctaLabel: v } }))} />
              </div>
              <div>
                <label className={labelClass}>Link URL</label>
                <input
                  value={partnersSection.ctaLink ?? ""}
                  onChange={(e) => setPartnersSection((p) => ({ ...p, ctaLink: e.target.value }))}
                  className={inputClass}
                  placeholder="/contact"
                  maxLength={FIELD_LIMITS.link}
                />
                <FieldError error={validateUrl(partnersSection.ctaLink ?? "")} />
              </div>
            </div>
            <p className="text-[11px] text-slate-400">Leave the fields empty to hide the line. The link opens the Contact page by default — the Contact page itself is editable under its own tab.</p>
          </div>
        </div>
      </CollapsibleSection>

      {/* TRUST SECTION */}
      <CollapsibleSection title="Trust & Safety Section" defaultOpen={false}>
        <EnabledToggle section={trustSection} setSection={setTrustSection} />
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={trustSection.heading ?? ""}
                onChange={(e) => setTrustSection((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
                placeholder="Trust & Safety"
                maxLength={FIELD_LIMITS.heading}
              />
              <CharCount value={trustSection.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={trustSection.ar?.heading} onChange={(v) => setTrustSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient Word</label>
              <input
                value={trustSection.headingGradient ?? ""}
                onChange={(e) => setTrustSection((p) => ({ ...p, headingGradient: e.target.value }))}
                className={inputClass}
                placeholder="Safety"
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={trustSection.headingGradient ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Heading Gradient" kind="label" value={trustSection.ar?.headingGradient} onChange={(v) => setTrustSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <input
              value={trustSection.subtitle ?? ""}
              onChange={(e) => setTrustSection((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
              placeholder="Your safety is our priority."
              maxLength={FIELD_LIMITS.subtitle}
            />
            <CharCount value={trustSection.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
            <ArInput label="Subtitle" kind="subtitle" value={trustSection.ar?.subtitle} onChange={(v) => setTrustSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
          </div>

          {/* Trust items */}
          <div className="mt-2 border-t border-slate-200 pt-3">
            <div className="mb-2 flex items-center justify-between">
              <label className={labelClass}>Trust Items ({(trustSection.items ?? []).length})</label>
              <button
                type="button"
                onClick={() => setTrustSection((p) => ({ ...p, items: [...(p.items ?? []), { label: "", icon: "Shield" }] }))}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
              >
                <Plus className="h-3.5 w-3.5" /> Add Item
              </button>
            </div>
            <div className="space-y-3">
              {(trustSection.items ?? []).map((item, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Item {i + 1}</p>
                    <button
                      type="button"
                      onClick={() => setTrustSection((p) => ({ ...p, items: (p.items ?? []).filter((_, idx) => idx !== i) }))}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                  <div className="grid gap-2">
                    <div>
                      <label className={labelClass}>Label</label>
                      <input
                        value={item.label ?? ""}
                        onChange={(e) => setTrustSection((p) => ({ ...p, items: (p.items ?? []).map((it, idx) => (idx === i ? { ...it, label: e.target.value } : it)) }))}
                        className={inputClass}
                        placeholder="24/7 Surveillance"
                        maxLength={FIELD_LIMITS.item}
                      />
                      <CharCount value={item.label ?? ""} max={FIELD_LIMITS.item} />
                      <ArInput label="Label" kind="item" value={item.ar?.label} onChange={(v) => setTrustSection((p) => ({ ...p, items: (p.items ?? []).map((it, idx) => (idx === i ? { ...it, ar: { ...(it.ar ?? {}), label: v } } : it)) }))} />
                    </div>
                    <div>
                      <label className={labelClass}>Icon</label>
                      <select
                        value={item.icon ?? "Shield"}
                        onChange={(e) => setTrustSection((p) => ({ ...p, items: (p.items ?? []).map((it, idx) => (idx === i ? { ...it, icon: e.target.value } : it)) }))}
                        className={inputClass}
                      >
                        {TRUST_ICON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* CTA SECTION */}
      <CollapsibleSection title="Long-Term CTA Section" defaultOpen={false}>
        <EnabledToggle section={ctaSection} setSection={setCtaSection} />
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={ctaSection.heading ?? ""}
                onChange={(e) => setCtaSection((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
                placeholder="Looking for Long-Term Parking?"
                maxLength={FIELD_LIMITS.heading}
              />
              <CharCount value={ctaSection.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={ctaSection.ar?.heading} onChange={(v) => setCtaSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient Word</label>
              <input
                value={ctaSection.headingGradient ?? ""}
                onChange={(e) => setCtaSection((p) => ({ ...p, headingGradient: e.target.value }))}
                className={inputClass}
                placeholder="Parking?"
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={ctaSection.headingGradient ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Heading Gradient" kind="label" value={ctaSection.ar?.headingGradient} onChange={(v) => setCtaSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <textarea
              value={ctaSection.subtitle ?? ""}
              onChange={(e) => setCtaSection((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
              rows={2}
              placeholder="Secure, flexible, and smart parking solutions..."
              maxLength={FIELD_LIMITS.subtitle}
            />
            <CharCount value={ctaSection.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
            <ArInput label="Subtitle" kind="subtitle" multiline value={ctaSection.ar?.subtitle} onChange={(v) => setCtaSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
          </div>
          <div>
            <label className={labelClass}>CTA Label</label>
            <input
              value={ctaSection.ctaLabel ?? ""}
              onChange={(e) => setCtaSection((p) => ({ ...p, ctaLabel: e.target.value }))}
              className={inputClass}
              placeholder="Get a Quote"
              maxLength={FIELD_LIMITS.button}
            />
            <CharCount value={ctaSection.ctaLabel ?? ""} max={FIELD_LIMITS.button} />
            <ArInput label="CTA Label" kind="button" value={ctaSection.ar?.ctaLabel} onChange={(v) => setCtaSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), ctaLabel: v } }))} />
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Get a Quote Popup (form + confirmation)" defaultOpen={false}>
        <p className="mb-4 text-xs text-slate-400">
          The pop-up opened by the &quot;Get In Touch&quot; / &quot;Get a Quote&quot; buttons. Leave a field blank to use the
          built-in default text on the website.
        </p>
        <div className="grid gap-4">
          <div>
            <label className={labelClass}>Eyebrow (small label above heading)</label>
            <input
              value={quoteForm.eyebrow ?? ""}
              onChange={(e) => setQuoteForm((p) => ({ ...p, eyebrow: e.target.value }))}
              className={inputClass}
              placeholder="Long-Term Parking"
              maxLength={FIELD_LIMITS.label}
            />
            <CharCount value={quoteForm.eyebrow ?? ""} max={FIELD_LIMITS.label} />
            <ArInput label="Eyebrow" kind="label" value={quoteForm.ar?.eyebrow} onChange={(v) => setQuoteForm((p) => ({ ...p, ar: { ...(p.ar ?? {}), eyebrow: v } }))} />
          </div>
          <div>
            <label className={labelClass}>Heading</label>
            <input
              value={quoteForm.heading ?? ""}
              onChange={(e) => setQuoteForm((p) => ({ ...p, heading: e.target.value }))}
              className={inputClass}
              placeholder="Get a Quote"
              maxLength={FIELD_LIMITS.heading}
            />
            <CharCount value={quoteForm.heading ?? ""} max={FIELD_LIMITS.heading} />
            <ArInput label="Heading" kind="heading" value={quoteForm.ar?.heading} onChange={(v) => setQuoteForm((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
          </div>
          <div>
            <label className={labelClass}>Intro line</label>
            <textarea
              value={quoteForm.intro ?? ""}
              onChange={(e) => setQuoteForm((p) => ({ ...p, intro: e.target.value }))}
              className={inputClass}
              rows={2}
              placeholder="Fill in the details and our team will be in touch."
              maxLength={FIELD_LIMITS.subtitle}
            />
            <CharCount value={quoteForm.intro ?? ""} max={FIELD_LIMITS.subtitle} />
            <ArInput label="Intro" kind="subtitle" multiline value={quoteForm.ar?.intro} onChange={(v) => setQuoteForm((p) => ({ ...p, ar: { ...(p.ar ?? {}), intro: v } }))} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Confirmation message (after submit)</p>
            <div className="grid gap-4">
              <div>
                <label className={labelClass}>Success Title</label>
                <input
                  value={quoteForm.successTitle ?? ""}
                  onChange={(e) => setQuoteForm((p) => ({ ...p, successTitle: e.target.value }))}
                  className={inputClass}
                  placeholder="Request Received!"
                  maxLength={FIELD_LIMITS.heading}
                />
                <CharCount value={quoteForm.successTitle ?? ""} max={FIELD_LIMITS.heading} />
                <ArInput label="Success Title" kind="heading" value={quoteForm.ar?.successTitle} onChange={(v) => setQuoteForm((p) => ({ ...p, ar: { ...(p.ar ?? {}), successTitle: v } }))} />
              </div>
              <div>
                <label className={labelClass}>Success Message</label>
                <RichTextArea
                  value={quoteForm.successMessage ?? ""}
                  onChange={(v) => setQuoteForm((p) => ({ ...p, successMessage: v }))}
                  maxLength={FIELD_LIMITS.description}
                  rows={3}
                />
                <label className="mb-1 mt-1.5 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">Description (Arabic)</label>
                <RichTextArea
                  value={quoteForm.ar?.successMessage ?? ""}
                  onChange={(v) => setQuoteForm((p) => ({ ...p, ar: { ...(p.ar ?? {}), successMessage: v } }))}
                  maxLength={FIELD_LIMITS.description}
                  rows={3}
                  dir="rtl"
                  variant="arabic"
                />
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>
      </div>
    </div>
  );
}
