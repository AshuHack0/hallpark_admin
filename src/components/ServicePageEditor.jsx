import { useEffect, useState } from "react";
import { ExternalLink, Plus, Trash2, Upload, Loader2, Save, ChevronDown } from "lucide-react";
import { api, uploadMediaToCloudinary } from "../lib/api";
import { validateUrl, validateImageFile, validateVideoFile } from "../lib/validators";
import { FIELD_LIMITS, CharCount, FieldError, ArInput } from "./CappedField";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500";

const DEFAULT_SERVICE_HERO = {
  title: "Smart Parking. Vehicle Care Partner.",
  subtitle: "Smart parking and vehicle care built for convenience, safety, and innovation.",
  ctaLabel: "Get a Quote",
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

const DEFAULT_SERVICE = {
  id: 1,
  slug: "",
  name: "",
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

function ArrayItemEditor({ label, items, onAdd, onRemove, onUpdate, renderItem }) {
  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>{label}</label>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
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
        onClick={onAdd}
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
  const [gridHeader, setGridHeader] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState({});

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
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await api.updatePage("services", {
        sections: { hero, services, partnersSection, trustSection, ctaSection, servicesGridHeader: gridHeader },
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

  function removeServiceIncluded(i, j) {
    setServices((prev) =>
      prev.map((srv, idx) =>
        idx === i ? { ...srv, whatsIncluded: srv.whatsIncluded.filter((_, jdx) => jdx !== j) } : srv
      )
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
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    const key = `service-${i}-image`;
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct }))
      );
      updateService(i, "mediaSrc", url);
      setSuccess("Image uploaded. Remember to Save.");
    } catch (err) {
      setError("Image upload failed");
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
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    const key = `partner-${i}-logo`;
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct }))
      );
      updatePartner(i, "logo", url);
      setSuccess("Logo uploaded. Remember to Save.");
    } catch (err) {
      setError("Logo upload failed");
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
            <ArInput kind="heading" value={hero.ar?.title} onChange={(v) => updateHero("ar", { ...(hero.ar ?? {}), title: v })} />
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
            <ArInput kind="subtitle" multiline value={hero.ar?.subtitle} onChange={(v) => updateHero("ar", { ...(hero.ar ?? {}), subtitle: v })} />
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
                  <label className={labelClass}>Service Name</label>
                  <input
                    value={service.name ?? ""}
                    onChange={(e) => updateService(i, "name", e.target.value)}
                    className={inputClass}
                    placeholder="Self-Parking"
                    maxLength={FIELD_LIMITS.heading}
                  />
                  <CharCount value={service.name ?? ""} max={FIELD_LIMITS.heading} />
                  <ArInput kind="heading" value={service.ar?.name} onChange={(v) => updateService(i, "ar", { ...(service.ar ?? {}), name: v })} />
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
                <label className={labelClass}>Full Description</label>
                <textarea
                  value={service.fullDesc ?? ""}
                  onChange={(e) => updateService(i, "fullDesc", e.target.value)}
                  className={inputClass}
                  rows={3}
                  placeholder="Service description..."
                  maxLength={FIELD_LIMITS.description}
                />
                <CharCount value={service.fullDesc ?? ""} max={FIELD_LIMITS.description} />
                <ArInput kind="description" multiline value={service.ar?.fullDesc} onChange={(v) => updateService(i, "ar", { ...(service.ar ?? {}), fullDesc: v })} />
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
                <ArInput kind="label" value={service.ar?.includedLabel} onChange={(v) => updateService(i, "ar", { ...(service.ar ?? {}), includedLabel: v })} />
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
                        <textarea
                          value={cat.description ?? ""}
                          onChange={(e) => updateServiceCategory(i, j, "description", e.target.value)}
                          className={inputClass}
                          rows={2}
                          placeholder="Category description..."
                          maxLength={FIELD_LIMITS.description}
                        />
                        <CharCount value={cat.description ?? ""} max={FIELD_LIMITS.description} />
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

      {/* SERVICES GRID HEADER */}
      <CollapsibleSection title="Services Grid Header" defaultOpen={false}>
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
            <ArInput kind="heading" value={gridHeader.ar?.heading} onChange={(v) => setGridHeader((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
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
            <ArInput kind="label" value={gridHeader.ar?.headingGradient} onChange={(v) => setGridHeader((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
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
            <ArInput kind="subtitle" value={gridHeader.ar?.subtitle} onChange={(v) => setGridHeader((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={gridHeader.description ?? ""}
              onChange={(e) => setGridHeader((p) => ({ ...p, description: e.target.value }))}
              className={inputClass}
              rows={2}
              placeholder="From self-parking to valet, EV charging to car storage…"
              maxLength={FIELD_LIMITS.description}
            />
            <CharCount value={gridHeader.description ?? ""} max={FIELD_LIMITS.description} />
            <ArInput kind="description" multiline value={gridHeader.ar?.description} onChange={(v) => setGridHeader((p) => ({ ...p, ar: { ...(p.ar ?? {}), description: v } }))} />
          </div>
        </div>
      </CollapsibleSection>

      {/* PARTNERS SECTION */}
      <CollapsibleSection title="Partners Section" defaultOpen={false}>
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
              <ArInput kind="heading" value={partnersSection.ar?.heading} onChange={(v) => setPartnersSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
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
              <ArInput kind="label" value={partnersSection.ar?.headingGradient} onChange={(v) => setPartnersSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
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
            <ArInput kind="subtitle" value={partnersSection.ar?.subtitle} onChange={(v) => setPartnersSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={partnersSection.description ?? ""}
              onChange={(e) => setPartnersSection((p) => ({ ...p, description: e.target.value }))}
              className={inputClass}
              rows={2}
              placeholder="HalaPark partners with global hotel chains..."
              maxLength={FIELD_LIMITS.description}
            />
            <CharCount value={partnersSection.description ?? ""} max={FIELD_LIMITS.description} />
            <ArInput kind="description" multiline value={partnersSection.ar?.description} onChange={(v) => setPartnersSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), description: v } }))} />
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
                            <ArInput kind="label" value={partner.ar?.name} onChange={(v) => updatePartner(i, "ar", { ...(partner.ar ?? {}), name: v })} />
                          </div>
                          <div>
                            <input
                              value={partner.industry ?? ""}
                              onChange={(e) => updatePartner(i, "industry", e.target.value)}
                              className={inputClass}
                              placeholder="Industry"
                              maxLength={FIELD_LIMITS.label}
                            />
                            <ArInput kind="label" value={partner.ar?.industry} onChange={(v) => updatePartner(i, "ar", { ...(partner.ar ?? {}), industry: v })} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* TRUST SECTION */}
      <CollapsibleSection title="Trust & Safety Section" defaultOpen={false}>
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
              <ArInput kind="heading" value={trustSection.ar?.heading} onChange={(v) => setTrustSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
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
              <ArInput kind="label" value={trustSection.ar?.headingGradient} onChange={(v) => setTrustSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
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
            <ArInput kind="subtitle" value={trustSection.ar?.subtitle} onChange={(v) => setTrustSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
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
            <p className="mb-2 text-[11px] text-slate-400">Icon options: Camera, Shield, BadgeCheck, CreditCard, Lock</p>
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
                      <ArInput kind="item" value={item.ar?.label} onChange={(v) => setTrustSection((p) => ({ ...p, items: (p.items ?? []).map((it, idx) => (idx === i ? { ...it, ar: { ...(it.ar ?? {}), label: v } } : it)) }))} />
                    </div>
                    <div>
                      <label className={labelClass}>Icon name</label>
                      <input
                        value={item.icon ?? ""}
                        onChange={(e) => setTrustSection((p) => ({ ...p, items: (p.items ?? []).map((it, idx) => (idx === i ? { ...it, icon: e.target.value } : it)) }))}
                        className={inputClass}
                        placeholder="Shield"
                        maxLength={FIELD_LIMITS.label}
                      />
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
              <ArInput kind="heading" value={ctaSection.ar?.heading} onChange={(v) => setCtaSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))} />
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
              <ArInput kind="label" value={ctaSection.ar?.headingGradient} onChange={(v) => setCtaSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), headingGradient: v } }))} />
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
            <ArInput kind="subtitle" multiline value={ctaSection.ar?.subtitle} onChange={(v) => setCtaSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), subtitle: v } }))} />
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
            <ArInput kind="button" value={ctaSection.ar?.ctaLabel} onChange={(v) => setCtaSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), ctaLabel: v } }))} />
          </div>
        </div>
      </CollapsibleSection>
      </div>
    </div>
  );
}
