import { useEffect, useState } from "react";
import { ExternalLink, Plus, Trash2, Upload, Loader2, Save } from "lucide-react";
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

const WHY_ICONS = ["Gauge", "ScanLine", "CircleDollarSign", "Clock3", "BarChart3", "Zap"];
const DEFAULT_WHY = {
  heading: "Why Halapark",
  subtitle: "Next-generation platform for intelligent parking solutions",
  items: [],
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

export default function HomePageEditor() {
  const slug = "home";
  const [page, setPage] = useState(null);
  const [slides, setSlides] = useState([]);
  const [whoWeAre, setWhoWeAre] = useState(DEFAULT_WHO_WE_ARE);
  const [whyHalapark, setWhyHalapark] = useState(DEFAULT_WHY);
  const [sectionsObj, setSectionsObj] = useState({});
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // keyed by `${slideIndex}-${field}`
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
        setPublished(data.page.published ?? true);
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

  // Upload an image for a Why item; keyed separately from slide uploads.
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
      };
      const data = await api.updatePage(slug, { sections, published });
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
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0088FF]">Website Page</p>
          <h2 className="text-2xl font-semibold text-[#050A13]">Home</h2>
          <p className="mt-1 text-sm text-slate-500">/ (landing hero slides)</p>
        </div>
        <a
          href={import.meta.env.VITE_FRONTEND_URL ?? "http://localhost:3000"}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-[#0088FF] hover:text-[#0088FF]"
        >
          Preview <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <p className="mt-4 rounded-xl border border-[#C6DEFF] bg-[#EEF6FF] px-4 py-3 text-sm text-[#050A13]">
        The landing hero is a carousel of slides. The first 3 slides are shown. Slide 1 may include a
        background video. Upload images/videos to Cloudinary or paste a URL / public path.
      </p>

      <form onSubmit={handleSave} className="mt-6 space-y-5">
        <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#0088FF]"
          />
          Published (visible on website)
        </label>

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
                  <label className={labelClass}>Tag (eyebrow / headline)</label>
                  <input value={slide.tag ?? ""} onChange={(e) => updateSlide(index, "tag", e.target.value)} className={inputClass} placeholder="Tag" />
                </div>
                <div>
                  <label className={labelClass}>Title</label>
                  <textarea value={slide.title ?? ""} onChange={(e) => updateSlide(index, "title", e.target.value)} className={inputClass} rows={2} placeholder="Title" />
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

        {/* ── Who We Are section ───────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(6,6,22,0.04)]">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.1em] text-slate-500">
            Who We Are Section
          </h3>
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
        </div>

        {/* ── Why Halapark section ─────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_12px_rgba(6,6,22,0.04)]">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.1em] text-slate-500">
            Why Halapark Section
          </h3>
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
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p> : null}
        {success ? <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-[#0088FF] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save page"}
        </button>
      </form>
    </div>
  );
}
