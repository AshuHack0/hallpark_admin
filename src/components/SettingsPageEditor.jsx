import { useEffect, useState } from "react";
import { Save, Loader2, Upload, Plus, Trash2 } from "lucide-react";
import { api, uploadMediaToCloudinary } from "../lib/api";
import { FIELD_LIMITS, CharCount, FieldError, ArInput } from "./CappedField";
import { validateUrl, validateEmail, validatePhone, validateImageFile } from "../lib/validators";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15";
const labelClass = "block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 mb-2";
const cardClass = "mt-6 rounded-xl border border-slate-200 bg-white p-6";
const rowCardClass = "rounded-lg border border-slate-200 bg-slate-50 p-3";
const addBtnClass =
  "inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110";
const deleteBtnClass =
  "inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50";

const SOCIAL_PLATFORMS = [
  { key: "linkedin", name: "LinkedIn" },
  { key: "instagram", name: "Instagram" },
  { key: "facebook", name: "Facebook" },
  { key: "tiktok", name: "TikTok" },
  { key: "snapchat", name: "Snapchat" },
];

const DEFAULT_FOOTER = {
  tagline: "",
  email: "",
  phone: "",
  socials: [],
  quickLinksHeading: "",
  quickLinks: [],
  appHeading: "",
  appText: "",
  appDownloadUrl: "",
  rights: "",
  dataSafe: "",
  uaeProud: "",
  ar: { tagline: "", quickLinksHeading: "", appHeading: "", appText: "", rights: "", dataSafe: "", uaeProud: "" },
};

const DEFAULT_SETTINGS = {
  logo: { image: "", alt: "HalaPark" },
  footer: DEFAULT_FOOTER,
  // Floating action buttons (site-wide, bottom-right). All CMS-driven; a button
  // shows only when its link is set. Stores render one icon each.
  floatingApp: {
    whatsapp: "",
    payHref: "",
    stores: [], // [{ key: "appstore"|"playstore"|"appgallery", label, href }]
  },
};

// Store keys the floating button knows how to draw an icon for.
const FLOATING_STORE_KEYS = [
  { value: "appstore", label: "App Store (Apple)" },
  { value: "playstore", label: "Play Store (Google)" },
  { value: "appgallery", label: "App Gallery (Huawei)" },
];

export default function SettingsPageEditor() {
  const slug = "settings";
  const [page, setPage] = useState(null);
  const [sections, setSections] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploadPct, setUploadPct] = useState(undefined);
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
    document.title = "Site Settings — HalaPark Admin";
    setLoading(true);
    api
      .getPage(slug)
      .then((data) => {
        setPage(data.page);
        if (data.page?.sections) {
          const f = data.page.sections.footer ?? {};
          const fa = data.page.sections.floatingApp ?? {};
          setSections((prev) => ({
            ...prev,
            ...data.page.sections,
            logo: { ...prev.logo, ...(data.page.sections.logo ?? {}) },
            floatingApp: {
              ...DEFAULT_SETTINGS.floatingApp,
              ...fa,
              stores: Array.isArray(fa.stores) ? fa.stores : [],
            },
            footer: {
              ...DEFAULT_FOOTER,
              ...f,
              socials: Array.isArray(f.socials) ? f.socials : [],
              quickLinks: Array.isArray(f.quickLinks) ? f.quickLinks : [],
              ar: { ...DEFAULT_FOOTER.ar, ...(f.ar ?? {}) },
            },
          }));
        }
      })
      .catch((err) => setError(err.message || "Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogoUpload(file) {
    const key = "logo";
    const err = validateImageFile(file);
    if (err) { setUploadError(key, err); return; }
    clearUploadError(key);
    setUploadPct(0);
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) => setUploadPct(pct));
      setSections((prev) => ({ ...prev, logo: { ...prev.logo, image: url } }));
      setSuccess("Logo uploaded.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setUploadError(key, err.message ?? "Upload failed");
    } finally {
      setUploadPct(undefined);
    }
  }

  // Per-store icon upload for the floating buttons (keyed by store index).
  const [storeIconPct, setStoreIconPct] = useState({});
  async function handleStoreIconUpload(index, file) {
    const key = `store-icon-${index}`;
    const err = validateImageFile(file);
    if (err) { setUploadError(key, err); return; }
    clearUploadError(key);
    setStoreIconPct((p) => ({ ...p, [index]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) => setStoreIconPct((p) => ({ ...p, [index]: pct })));
      setSections((prev) => ({
        ...prev,
        floatingApp: {
          ...(prev.floatingApp ?? {}),
          stores: (prev.floatingApp?.stores ?? []).map((s, idx) => (idx === index ? { ...s, iconImage: url } : s)),
        },
      }));
      setSuccess("Icon uploaded.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setUploadError(key, err.message ?? "Upload failed");
    } finally {
      setStoreIconPct((p) => ({ ...p, [index]: undefined }));
    }
  }

  // --- Footer state helpers. Every update spreads prev.footer so `ar` (and any
  // --- other keys) are always carried along, never rebuilt.
  function setFooter(patch) {
    setSections((prev) => ({ ...prev, footer: { ...prev.footer, ...patch } }));
  }
  function setFooterAr(key, value) {
    setSections((prev) => ({
      ...prev,
      footer: { ...prev.footer, ar: { ...(prev.footer?.ar ?? {}), [key]: value } },
    }));
  }
  function updateSocial(index, patch) {
    setSections((prev) => {
      const socials = [...(prev.footer?.socials ?? [])];
      socials[index] = { ...socials[index], ...patch };
      return { ...prev, footer: { ...prev.footer, socials } };
    });
  }
  function addSocial() {
    setSections((prev) => ({
      ...prev,
      footer: { ...prev.footer, socials: [...(prev.footer?.socials ?? []), { key: "linkedin", href: "" }] },
    }));
  }
  function removeSocial(index) {
    setSections((prev) => ({
      ...prev,
      footer: { ...prev.footer, socials: (prev.footer?.socials ?? []).filter((_, i) => i !== index) },
    }));
  }
  function updateQuickLink(index, patch) {
    setSections((prev) => {
      const quickLinks = [...(prev.footer?.quickLinks ?? [])];
      quickLinks[index] = { ...quickLinks[index], ...patch };
      return { ...prev, footer: { ...prev.footer, quickLinks } };
    });
  }
  function updateQuickLinkAr(index, value) {
    setSections((prev) => {
      const quickLinks = [...(prev.footer?.quickLinks ?? [])];
      quickLinks[index] = { ...quickLinks[index], ar: { ...(quickLinks[index]?.ar ?? {}), label: value } };
      return { ...prev, footer: { ...prev.footer, quickLinks } };
    });
  }
  function addQuickLink() {
    setSections((prev) => ({
      ...prev,
      footer: { ...prev.footer, quickLinks: [...(prev.footer?.quickLinks ?? []), { label: "", href: "", ar: { label: "" } }] },
    }));
  }
  function removeQuickLink(index) {
    setSections((prev) => ({
      ...prev,
      footer: { ...prev.footer, quickLinks: (prev.footer?.quickLinks ?? []).filter((_, i) => i !== index) },
    }));
  }

  async function handleSave() {
    if (!page) return;
    // Validation: a logo image is required.
    if (!sections.logo?.image?.trim()) {
      setError("Please upload or enter a logo image before saving.");
      return;
    }
    // Footer validation: every quick link that has content must have a label.
    const quickLinks = sections.footer?.quickLinks ?? [];
    for (let i = 0; i < quickLinks.length; i++) {
      const link = quickLinks[i];
      const hasLabel = (link.label ?? "").trim() !== "";
      const hasContent = (link.href ?? "").trim() !== "" || (link.ar?.label ?? "").trim() !== "";
      if (!hasLabel && hasContent) {
        setError(`Quick Link ${i + 1} has a link but no label. Add a label or delete the row.`);
        return;
      }
    }
    // Silently drop fully empty quick link rows (no label, href, or Arabic label).
    const sectionsToSave = {
      ...sections,
      footer: {
        ...sections.footer,
        quickLinks: quickLinks.filter((link) => (link.label ?? "").trim() !== ""),
      },
    };
    setSaving(true);
    setError("");
    try {
      await api.updatePage(slug, { sections: sectionsToSave, published: true });
      setSections(sectionsToSave);
      setSuccess("Settings saved.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-sm text-slate-500">Loading settings…</div>;
  }

  const logoImage = sections.logo?.image ?? "";
  const footer = sections.footer ?? DEFAULT_FOOTER;
  const socials = Array.isArray(footer.socials) ? footer.socials : [];
  const quickLinks = Array.isArray(footer.quickLinks) ? footer.quickLinks : [];

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#050A13]">Site Settings</h1>
          <p className="text-sm text-slate-500">Global assets shown across the site (navbar &amp; footer).</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0088FF] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </button>
      </div>

      {error ? <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div> : null}
      {success ? <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700">{success}</div> : null}

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-[#050A13]">Logo</h2>

        {/* Preview */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-16 w-40 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-2">
            {logoImage ? (
              <img src={logoImage} alt={sections.logo?.alt || "Logo preview"} className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-[11px] text-slate-400">No logo</span>
            )}
          </div>
          <p className="text-xs text-slate-500">Shown in the navbar and footer. PNG or SVG, transparent background recommended.</p>
        </div>

        {/* Image URL + upload */}
        <label className="block">
          <span className={labelClass}>Logo Image</span>
          <div className="flex gap-2">
            <input
              value={logoImage}
              onChange={(e) => setSections((prev) => ({ ...prev, logo: { ...prev.logo, image: e.target.value } }))}
              className={inputClass}
              placeholder="/logo.svg or https://…"
              maxLength={FIELD_LIMITS.link}
            />
            <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
              {uploadPct !== undefined ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadPct}%</>
              ) : (
                <><Upload className="h-3.5 w-3.5" />Upload</>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadPct !== undefined}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoUpload(file);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          {uploadErrors["logo"] ? (
            <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors["logo"]}</p>
          ) : null}
          <FieldError error={validateUrl(logoImage)} />
        </label>

        {/* Alt text */}
        <label className="mt-4 block">
          <span className={labelClass}>Logo Alt Text</span>
          <input
            value={sections.logo?.alt ?? ""}
            onChange={(e) => setSections((prev) => ({ ...prev, logo: { ...prev.logo, alt: e.target.value } }))}
            className={inputClass}
            placeholder="HalaPark"
            maxLength={FIELD_LIMITS.label}
          />
          <CharCount value={sections.logo?.alt ?? ""} max={FIELD_LIMITS.label} />
        </label>
      </div>

      {/* ---------------- Floating App Buttons (bottom-right) ---------------- */}
      <div className={cardClass}>
        <h2 className="mb-1 text-lg font-semibold text-[#050A13]">Floating Buttons (bottom-right)</h2>
        <p className="mb-4 text-xs text-slate-500">The floating action buttons shown on every page. Each shows only when its link is set — leave blank to hide.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>WhatsApp Link</span>
            <input
              value={sections.floatingApp?.whatsapp ?? ""}
              onChange={(e) => setSections((p) => ({ ...p, floatingApp: { ...(p.floatingApp ?? {}), whatsapp: e.target.value } }))}
              className={inputClass}
              placeholder="https://wa.me/97143782022"
              maxLength={FIELD_LIMITS.link}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Pay Button Link</span>
            <input
              value={sections.floatingApp?.payHref ?? ""}
              onChange={(e) => setSections((p) => ({ ...p, floatingApp: { ...(p.floatingApp ?? {}), payHref: e.target.value } }))}
              className={inputClass}
              placeholder="/pay"
              maxLength={FIELD_LIMITS.link}
            />
          </label>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <span className={labelClass} style={{ margin: 0 }}>App Store Buttons</span>
          <button
            type="button"
            onClick={() => setSections((p) => ({ ...p, floatingApp: { ...(p.floatingApp ?? {}), stores: [...(p.floatingApp?.stores ?? []), { key: "appstore", label: "", href: "" }] } }))}
            className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
          >
            <Plus className="h-3.5 w-3.5" /> Add Store
          </button>
        </div>
        <p className="mb-2 mt-1 text-xs text-slate-500">Each store shows its own icon + redirects to its link. Add App Store, Play Store, and App Gallery.</p>
        <div className="space-y-2">
          {(sections.floatingApp?.stores ?? []).map((store, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="grid grid-cols-[150px_1fr_auto] items-center gap-2">
                <select
                  value={store.key ?? "appstore"}
                  onChange={(e) => setSections((p) => ({ ...p, floatingApp: { ...(p.floatingApp ?? {}), stores: p.floatingApp.stores.map((s, idx) => idx === i ? { ...s, key: e.target.value } : s) } }))}
                  className={inputClass}
                >
                  {FLOATING_STORE_KEYS.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
                </select>
                <input
                  value={store.href ?? ""}
                  onChange={(e) => setSections((p) => ({ ...p, floatingApp: { ...(p.floatingApp ?? {}), stores: p.floatingApp.stores.map((s, idx) => idx === i ? { ...s, href: e.target.value } : s) } }))}
                  className={inputClass}
                  placeholder="https://apps.apple.com/…"
                  maxLength={FIELD_LIMITS.link}
                />
                <button
                  type="button"
                  onClick={() => setSections((p) => ({ ...p, floatingApp: { ...(p.floatingApp ?? {}), stores: p.floatingApp.stores.filter((_, idx) => idx !== i) } }))}
                  className="rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Custom icon (optional — overrides the built-in store glyph) */}
              <div className="mt-2 flex items-center gap-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                  {store.iconImage ? (
                    <img src={store.iconImage} alt="" className="h-full w-full object-contain p-1" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[9px] font-semibold text-slate-300">ICON</div>
                  )}
                </div>
                <input
                  value={store.iconImage ?? ""}
                  onChange={(e) => setSections((p) => ({ ...p, floatingApp: { ...(p.floatingApp ?? {}), stores: p.floatingApp.stores.map((s, idx) => idx === i ? { ...s, iconImage: e.target.value } : s) } }))}
                  className={inputClass}
                  placeholder="Custom icon URL (optional — overrides the default icon)"
                  maxLength={FIELD_LIMITS.link}
                />
                <label className="shrink-0 inline-flex cursor-pointer items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff]">
                  {storeIconPct[i] !== undefined ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin" />{storeIconPct[i]}%</>
                  ) : (
                    <><Upload className="h-3.5 w-3.5" />Upload</>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={storeIconPct[i] !== undefined}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleStoreIconUpload(i, f); e.target.value = ""; }}
                  />
                </label>
                {store.iconImage ? (
                  <button
                    type="button"
                    onClick={() => setSections((p) => ({ ...p, floatingApp: { ...(p.floatingApp ?? {}), stores: p.floatingApp.stores.map((s, idx) => idx === i ? { ...s, iconImage: "" } : s) } }))}
                    className="shrink-0 rounded-md border border-slate-300 px-2 py-2 text-[11px] text-slate-500 hover:bg-slate-100"
                    title="Use default icon"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
              {uploadErrors[`store-icon-${i}`] ? (
                <p className="mt-1 text-xs font-medium text-red-600" role="alert">{uploadErrors[`store-icon-${i}`]}</p>
              ) : null}
            </div>
          ))}
          {(sections.floatingApp?.stores ?? []).length === 0 ? (
            <p className="text-xs text-slate-400">No store buttons yet.</p>
          ) : null}
        </div>
      </div>

      {/* ---------------- Footer: Tagline & Contact ---------------- */}
      <div className={cardClass}>
        <h2 className="mb-1 text-lg font-semibold text-[#050A13]">Footer — Tagline &amp; Contact</h2>
        <p className="mb-4 text-xs text-slate-500">Empty fields are hidden on the site.</p>

        <label className="block">
          <span className={labelClass}>Tagline</span>
          <textarea
            rows={2}
            value={footer.tagline ?? ""}
            onChange={(e) => setFooter({ tagline: e.target.value })}
            className={inputClass}
            placeholder="Smart parking for a smarter city."
            maxLength={FIELD_LIMITS.description}
          />
          <CharCount value={footer.tagline ?? ""} max={FIELD_LIMITS.description} />
        </label>
        <ArInput
          label="Tagline"
          kind="description"
          multiline
          value={footer.ar?.tagline}
          onChange={(v) => setFooterAr("tagline", v)}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelClass}>Contact Email</span>
            <input
              type="email"
              value={footer.email ?? ""}
              onChange={(e) => setFooter({ email: e.target.value })}
              className={inputClass}
              placeholder="hello@halapark.ae"
              maxLength={FIELD_LIMITS.item}
            />
            <FieldError error={validateEmail(footer.email)} />
          </label>
          <label className="block">
            <span className={labelClass}>Contact Phone</span>
            <input
              type="tel"
              value={footer.phone ?? ""}
              onChange={(e) => setFooter({ phone: e.target.value })}
              className={inputClass}
              placeholder="+971 4 123 4567"
              maxLength={FIELD_LIMITS.label}
            />
            <FieldError error={validatePhone(footer.phone)} />
          </label>
        </div>
      </div>

      {/* ---------------- Footer: Social Links ---------------- */}
      <div className={cardClass}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#050A13]">Footer — Social Links</h2>
          <button onClick={addSocial} className={addBtnClass}>
            <Plus className="h-3.5 w-3.5" />
            Add Social Link
          </button>
        </div>

        {socials.length === 0 ? (
          <p className="text-xs text-slate-400">No social links yet. Add one to show icons in the footer.</p>
        ) : null}

        <div className="space-y-3">
          {socials.map((social, index) => (
            <div key={index} className={rowCardClass}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <label className="block shrink-0 sm:w-48">
                  <span className={labelClass}>Platform — controls the icon</span>
                  <select
                    value={social.key ?? "linkedin"}
                    onChange={(e) => updateSocial(index, { key: e.target.value })}
                    className={inputClass}
                  >
                    {SOCIAL_PLATFORMS.map((p) => (
                      <option key={p.key} value={p.key}>{p.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block flex-1">
                  <span className={labelClass}>Link URL</span>
                  <div className="flex gap-2">
                    <input
                      value={social.href ?? ""}
                      onChange={(e) => updateSocial(index, { href: e.target.value })}
                      className={inputClass}
                      placeholder="https://…"
                      maxLength={FIELD_LIMITS.link}
                    />
                    <button
                      onClick={() => removeSocial(index)}
                      className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-400 hover:border-red-300 hover:text-red-500"
                      title="Delete social link"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <FieldError error={validateUrl(social.href)} />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- Footer: Quick Links ---------------- */}
      <div className={cardClass}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#050A13]">Footer — Quick Links</h2>
          <button onClick={addQuickLink} className={addBtnClass}>
            <Plus className="h-3.5 w-3.5" />
            Add Link
          </button>
        </div>

        <label className="block">
          <span className={labelClass}>Heading</span>
          <input
            value={footer.quickLinksHeading ?? ""}
            onChange={(e) => setFooter({ quickLinksHeading: e.target.value })}
            className={inputClass}
            placeholder="Quick Links"
            maxLength={FIELD_LIMITS.heading}
          />
          <CharCount value={footer.quickLinksHeading ?? ""} max={FIELD_LIMITS.heading} />
        </label>
        <ArInput
          label="Heading"
          kind="heading"
          value={footer.ar?.quickLinksHeading}
          onChange={(v) => setFooterAr("quickLinksHeading", v)}
        />

        {quickLinks.length === 0 ? (
          <p className="mt-4 text-xs text-slate-400">No quick links yet.</p>
        ) : null}

        <div className="mt-4 space-y-3">
          {quickLinks.map((link, index) => (
            <div key={index} className={rowCardClass}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-600">Link {index + 1}</p>
                <button onClick={() => removeQuickLink(index)} className={deleteBtnClass}>
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
              <label className="block">
                <span className={labelClass}>Label</span>
                <input
                  value={link.label ?? ""}
                  onChange={(e) => updateQuickLink(index, { label: e.target.value })}
                  className={inputClass}
                  placeholder="About Us"
                  maxLength={FIELD_LIMITS.label}
                />
                <CharCount value={link.label ?? ""} max={FIELD_LIMITS.label} />
              </label>
              <ArInput
                label="Label"
                kind="label"
                value={link.ar?.label}
                onChange={(v) => updateQuickLinkAr(index, v)}
              />
              <label className="mt-3 block">
                <span className={labelClass}>Link URL</span>
                <input
                  value={link.href ?? ""}
                  onChange={(e) => updateQuickLink(index, { href: e.target.value })}
                  className={inputClass}
                  placeholder="/about or https://…"
                  maxLength={FIELD_LIMITS.link}
                />
                <FieldError error={validateUrl(link.href)} />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- Footer: App Block ---------------- */}
      <div className={cardClass}>
        <h2 className="mb-4 text-lg font-semibold text-[#050A13]">Footer — App Block</h2>

        <label className="block">
          <span className={labelClass}>App Heading</span>
          <input
            value={footer.appHeading ?? ""}
            onChange={(e) => setFooter({ appHeading: e.target.value })}
            className={inputClass}
            placeholder="Get the App"
            maxLength={FIELD_LIMITS.label}
          />
          <CharCount value={footer.appHeading ?? ""} max={FIELD_LIMITS.label} />
        </label>
        <ArInput
          label="App Heading"
          kind="label"
          value={footer.ar?.appHeading}
          onChange={(v) => setFooterAr("appHeading", v)}
        />

        <label className="mt-4 block">
          <span className={labelClass}>App Text</span>
          <input
            value={footer.appText ?? ""}
            onChange={(e) => setFooter({ appText: e.target.value })}
            className={inputClass}
            placeholder="Scan the QR code to download the HalaPark app."
            maxLength={FIELD_LIMITS.subtitle}
          />
          <CharCount value={footer.appText ?? ""} max={FIELD_LIMITS.subtitle} />
        </label>
        <ArInput
          label="App Text"
          kind="subtitle"
          value={footer.ar?.appText}
          onChange={(v) => setFooterAr("appText", v)}
        />

        <label className="mt-4 block">
          <span className={labelClass}>App Download URL</span>
          <input
            value={footer.appDownloadUrl ?? ""}
            onChange={(e) => setFooter({ appDownloadUrl: e.target.value })}
            className={inputClass}
            placeholder="https://…"
            maxLength={FIELD_LIMITS.link}
          />
          <FieldError error={validateUrl(footer.appDownloadUrl)} />
          <p className="mt-1 text-[11px] text-slate-500">
            Drives the QR code and store links. Leave empty to hide the app column.
          </p>
        </label>
      </div>

      {/* ---------------- Footer: Bottom Bar ---------------- */}
      <div className={cardClass}>
        <h2 className="mb-4 text-lg font-semibold text-[#050A13]">Footer — Bottom Bar</h2>

        <label className="block">
          <span className={labelClass}>Rights Text</span>
          <input
            value={footer.rights ?? ""}
            onChange={(e) => setFooter({ rights: e.target.value })}
            className={inputClass}
            placeholder="© HalaPark. All rights reserved."
            maxLength={FIELD_LIMITS.label}
          />
          <CharCount value={footer.rights ?? ""} max={FIELD_LIMITS.label} />
        </label>
        <ArInput
          label="Rights Text"
          kind="label"
          value={footer.ar?.rights}
          onChange={(v) => setFooterAr("rights", v)}
        />

        <label className="mt-4 block">
          <span className={labelClass}>Data Safe Badge</span>
          <input
            value={footer.dataSafe ?? ""}
            onChange={(e) => setFooter({ dataSafe: e.target.value })}
            className={inputClass}
            placeholder="Your data is safe"
            maxLength={FIELD_LIMITS.label}
          />
          <CharCount value={footer.dataSafe ?? ""} max={FIELD_LIMITS.label} />
        </label>
        <ArInput
          label="Data Safe Badge"
          kind="label"
          value={footer.ar?.dataSafe}
          onChange={(v) => setFooterAr("dataSafe", v)}
        />

        <label className="mt-4 block">
          <span className={labelClass}>UAE Proud Badge</span>
          <input
            value={footer.uaeProud ?? ""}
            onChange={(e) => setFooter({ uaeProud: e.target.value })}
            className={inputClass}
            placeholder="Proudly made in the UAE"
            maxLength={FIELD_LIMITS.label}
          />
          <CharCount value={footer.uaeProud ?? ""} max={FIELD_LIMITS.label} />
        </label>
        <ArInput
          label="UAE Proud Badge"
          kind="label"
          value={footer.ar?.uaeProud}
          onChange={(v) => setFooterAr("uaeProud", v)}
        />
      </div>
    </div>
  );
}
