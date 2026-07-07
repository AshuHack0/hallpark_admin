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
};

export default function SettingsPageEditor() {
  const slug = "settings";
  const [page, setPage] = useState(null);
  const [sections, setSections] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploadPct, setUploadPct] = useState(undefined);

  useEffect(() => {
    document.title = "Site Settings — HalaPark Admin";
    setLoading(true);
    api
      .getPage(slug)
      .then((data) => {
        setPage(data.page);
        if (data.page?.sections) {
          const f = data.page.sections.footer ?? {};
          setSections((prev) => ({
            ...prev,
            ...data.page.sections,
            logo: { ...prev.logo, ...(data.page.sections.logo ?? {}) },
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
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    setError("");
    setUploadPct(0);
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) => setUploadPct(pct));
      setSections((prev) => ({ ...prev, logo: { ...prev.logo, image: url } }));
      setSuccess("Logo uploaded.");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Logo upload failed");
    } finally {
      setUploadPct(undefined);
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
