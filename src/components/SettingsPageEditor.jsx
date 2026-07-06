import { useEffect, useState } from "react";
import { Save, Loader2, Upload } from "lucide-react";
import { api, uploadMediaToCloudinary } from "../lib/api";
import { FIELD_LIMITS, CharCount, FieldError } from "./CappedField";
import { validateUrl, validateImageFile } from "../lib/validators";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15";
const labelClass = "block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 mb-2";

const DEFAULT_SETTINGS = {
  logo: { image: "", alt: "HalaPark" },
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
          setSections((prev) => ({ ...prev, ...data.page.sections, logo: { ...prev.logo, ...(data.page.sections.logo ?? {}) } }));
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

  async function handleSave() {
    if (!page) return;
    // Validation: a logo image is required.
    if (!sections.logo?.image?.trim()) {
      setError("Please upload or enter a logo image before saving.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.updatePage(slug, { sections, published: true });
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
              // eslint-disable-next-line @next/next/no-img-element
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
    </div>
  );
}
