import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Save,
  ExternalLink,
  Plus,
  Trash2,
  Pencil,
  Upload,
  Loader2,
  Building2,
  CalendarCheck2,
  CarFront,
  WalletCards,
  BadgePercent,
  Clock3,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
  LockKeyhole,
  Store,
  BellRing,
  Headset,
  ShieldAlert,
  PlugZap,
  MapPin,
  KeyRound,
  ScanLine,
  Settings2,
  Droplets,
  Truck,
} from "lucide-react";
import AboutPageEditor from "../components/AboutPageEditor.jsx";
import CareersPageEditor from "../components/CareersPageEditor.jsx";
import HomePageEditor from "../components/HomePageEditor.jsx";
import { FRONTEND_PAGES } from "../constants/pages.js";
import { api, uploadVideoToCloudinary } from "../lib/api";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15";

const FAQ_ICON_OPTIONS = [
  { value: "Building2", label: "Building" },
  { value: "CalendarCheck2", label: "Booking Calendar" },
  { value: "CarFront", label: "Car / Parking" },
  { value: "WalletCards", label: "Payments" },
  { value: "BadgePercent", label: "Offers / Refunds" },
  { value: "Clock3", label: "Time / Overstay" },
  { value: "ShieldCheck", label: "Rules / Verified" },
  { value: "Smartphone", label: "App / Mobile" },
  { value: "TriangleAlert", label: "Issues / Alerts" },
  { value: "LockKeyhole", label: "Security Lock" },
  { value: "Store", label: "Hosts / Owners" },
  { value: "BellRing", label: "Notifications" },
  { value: "Headset", label: "Support" },
  { value: "ShieldAlert", label: "Fraud / Security Alert" },
  { value: "PlugZap", label: "EV / Charging" },
  { value: "MapPin", label: "Location / City" },
  { value: "KeyRound", label: "Tenant / Access Key" },
  { value: "ScanLine", label: "Plate Scan / ANPR" },
  { value: "Settings2", label: "Technical / Operations" },
  { value: "Droplets", label: "Car Wash" },
  { value: "Truck", label: "Fleet / Business" },
];

const FAQ_ICON_COMPONENTS = {
  Building2,
  CalendarCheck2,
  CarFront,
  WalletCards,
  BadgePercent,
  Clock3,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
  LockKeyhole,
  Store,
  BellRing,
  Headset,
  ShieldAlert,
  PlugZap,
  MapPin,
  KeyRound,
  ScanLine,
  Settings2,
  Droplets,
  Truck,
};

function toSlug(value = "") {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Strip blank video slots and empty optional fields before persisting an item.
function normalizeFaqItem(item) {
  const videos = Array.isArray(item.videos)
    ? item.videos.map((v) => (typeof v === "string" ? v.trim() : "")).filter(Boolean)
    : [];
  const legacyVideoUrl = item.videoUrl?.trim();
  return {
    ...item,
    videos,
    videoUrl: undefined,
    videoFolderUrl: item.videoFolderUrl?.trim() ? item.videoFolderUrl.trim() : undefined,
    // Preserve any legacy single videoUrl by folding it into the array.
    ...(legacyVideoUrl && !videos.includes(legacyVideoUrl)
      ? { videos: [...videos, legacyVideoUrl] }
      : {}),
  };
}

export default function PageEditorPage() {
  const { slug } = useParams();

  if (slug === "home") {
    return <HomePageEditor />;
  }

  if (slug === "careers") {
    return <CareersPageEditor />;
  }

  if (slug === "about") {
    return <AboutPageEditor />;
  }

  const pageMeta = FRONTEND_PAGES.find((p) => p.slug === slug);
  const [page, setPage] = useState(null);
  const [sectionsJson, setSectionsJson] = useState("");
  const [sectionsObj, setSectionsObj] = useState({});
  const [faqCategories, setFaqCategories] = useState([]);
  const [published, setPublished] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [questionModalCategoryIndex, setQuestionModalCategoryIndex] = useState(null);
  const [editCategoryIndex, setEditCategoryIndex] = useState(null);
  const [editQuestionIndex, setEditQuestionIndex] = useState(null);
  const [newCategoryForm, setNewCategoryForm] = useState({
    title: "",
    icon: "Building2",
  });
  const [newQuestionForm, setNewQuestionForm] = useState({
    question: "",
    answer: "",
    videoUrl: "",
  });
  // Per-slot upload progress, keyed by `${categoryIndex}-${itemIndex}-${videoIndex}`.
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    document.title = `${pageMeta?.name ?? slug} — HalaPark Admin`;
    setLoading(true);
    setError("");
    api
      .getPage(slug)
      .then((data) => {
        setPage(data.page);
        const nextSections = data.page.sections ?? {};
        setSectionsObj(nextSections);
        setSectionsJson(JSON.stringify(nextSections, null, 2));
        setFaqCategories(Array.isArray(nextSections.faqCategories) ? nextSections.faqCategories : []);
        setPublished(data.page.published ?? true);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug, pageMeta?.name]);

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      let sections;
      if (isFaqs) {
        sections = {
          ...sectionsObj,
          faqCategories: faqCategories.map((category) => ({
            ...category,
            items: (category.items ?? []).map(normalizeFaqItem),
          })),
        };
      } else {
        sections = JSON.parse(sectionsJson);
      }
      const data = await api.updatePage(slug, { sections, published });
      setPage(data.page);
      setSectionsObj(sections);
      setSectionsJson(JSON.stringify(sections, null, 2));
      setSuccess("Page saved successfully.");
    } catch (err) {
      setError(err.message ?? "Failed to save page");
    } finally {
      setSaving(false);
    }
  }

  async function persistFaqCategories(nextCategories, successMessage = "FAQ changes saved.") {
    const sections = {
      ...sectionsObj,
      faqCategories: nextCategories.map((category) => ({
        ...category,
        items: (category.items ?? []).map(normalizeFaqItem),
      })),
    };

    try {
      setSaving(true);
      const data = await api.updatePage(slug, { sections, published });
      setPage(data.page);
      setSectionsObj(sections);
      setSectionsJson(JSON.stringify(sections, null, 2));
      setSuccess(successMessage);
    } catch (err) {
      setError(err.message ?? "Failed to save FAQ changes");
    } finally {
      setSaving(false);
    }
  }

  const isHome = slug === "home";
  const isFaqs = slug === "faqs";
  const faqCount = useMemo(
    () => faqCategories.reduce((acc, category) => acc + (category.items?.length ?? 0), 0),
    [faqCategories],
  );

  if (loading) {
    return <p className="text-slate-500">Loading page…</p>;
  }

  if (!page) {
    return <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error || "Page not found"}</div>;
  }

  function addCategory() {
    const title = newCategoryForm.title.trim() || "New Category";
    const icon = newCategoryForm.icon.trim() || "Building2";
    const id = toSlug(title) || `category-${Date.now()}`;
    setFaqCategories((prev) => {
      const next = editCategoryIndex === null
        ? [...prev, { id, title, icon, items: [] }]
        : prev.map((category, index) =>
        index === editCategoryIndex
          ? { ...category, title, icon }
          : category,
      );
      void persistFaqCategories(
        next,
        editCategoryIndex === null ? "Category added and saved." : "Category updated and saved.",
      );
      return next;
    });
    setNewCategoryForm({ title: "", icon: "Building2" });
    setEditCategoryIndex(null);
    setCategoryModalOpen(false);
  }

  function openAddCategoryModal() {
    setEditCategoryIndex(null);
    setNewCategoryForm({ title: "", icon: "Building2" });
    setCategoryModalOpen(true);
  }

  function closeCategoryModal() {
    setCategoryModalOpen(false);
    setEditCategoryIndex(null);
    setNewCategoryForm({ title: "", icon: "Building2" });
  }

  function removeCategory(categoryIndex) {
    setFaqCategories((prev) => {
      const next = prev.filter((_, index) => index !== categoryIndex);
      void persistFaqCategories(next, "Category removed and saved.");
      return next;
    });
  }

  function updateCategory(categoryIndex, key, value) {
    setFaqCategories((prev) =>
      prev.map((category, index) =>
        index === categoryIndex ? { ...category, [key]: value } : category,
      ),
    );
  }

  function addQuestion(categoryIndex) {
    const question = newQuestionForm.question.trim() || "New question";
    const answer = newQuestionForm.answer.trim() || "New answer";
    const videoUrl = newQuestionForm.videoUrl.trim();
    const id = toSlug(question) || `q-${Date.now()}`;
    setFaqCategories((prev) =>
      {
        const next = prev.map((category, index) =>
        index === categoryIndex
          ? {
              ...category,
              items:
                editQuestionIndex === null
                  ? [
                      ...(category.items ?? []),
                      { id, question, answer, videoUrl },
                    ]
                  : (category.items ?? []).map((item, i) =>
                      i === editQuestionIndex
                        ? { ...item, id: item.id || id, question, answer, videoUrl }
                        : item,
                    ),
            }
          : category,
      );
      void persistFaqCategories(
        next,
        editQuestionIndex === null ? "Question added and saved." : "Question updated and saved.",
      );
      return next;
    },
    );
    setNewQuestionForm({ question: "", answer: "", videoUrl: "" });
    setQuestionModalCategoryIndex(null);
    setEditQuestionIndex(null);
    setQuestionModalOpen(false);
  }

  function closeQuestionModal() {
    setQuestionModalOpen(false);
    setQuestionModalCategoryIndex(null);
    setEditQuestionIndex(null);
    setNewQuestionForm({ question: "", answer: "", videoUrl: "" });
  }

  function openEditCategoryModal(categoryIndex) {
    const category = faqCategories[categoryIndex];
    if (!category) return;
    setEditCategoryIndex(categoryIndex);
    setNewCategoryForm({
      title: category.title ?? "",
      icon: category.icon ?? "Building2",
    });
    setCategoryModalOpen(true);
  }

  function openAddQuestionModal(categoryIndex) {
    setQuestionModalCategoryIndex(categoryIndex);
    setEditQuestionIndex(null);
    setNewQuestionForm({ question: "", answer: "", videoUrl: "" });
    setQuestionModalOpen(true);
  }

  function openEditQuestionModal(categoryIndex, itemIndex) {
    const item = faqCategories[categoryIndex]?.items?.[itemIndex];
    if (!item) return;
    setQuestionModalCategoryIndex(categoryIndex);
    setEditQuestionIndex(itemIndex);
    setNewQuestionForm({
      question: item.question ?? "",
      answer: item.answer ?? "",
      videoUrl: item.videoUrl ?? "",
    });
    setQuestionModalOpen(true);
  }

  function removeQuestion(categoryIndex, itemIndex) {
    setFaqCategories((prev) => {
      const next = prev.map((category, index) =>
        index === categoryIndex
          ? {
              ...category,
              items: (category.items ?? []).filter((_, i) => i !== itemIndex),
            }
          : category,
      );
      void persistFaqCategories(next, "Question removed and saved.");
      return next;
    });
  }

  function updateQuestion(categoryIndex, itemIndex, key, value) {
    setFaqCategories((prev) =>
      prev.map((category, index) =>
        index === categoryIndex
          ? {
              ...category,
              items: (category.items ?? []).map((item, i) =>
                i === itemIndex ? { ...item, [key]: value } : item,
              ),
            }
          : category,
      ),
    );
  }

  // Apply a transform to one item's videos array and return the resulting
  // categories (so callers can also persist them, since the FAQ editor
  // auto-saves rather than relying on a Save button).
  function applyVideos(categories, categoryIndex, itemIndex, fn) {
    return categories.map((category, index) =>
      index === categoryIndex
        ? {
            ...category,
            items: (category.items ?? []).map((item, i) =>
              i === itemIndex
                ? { ...item, videos: fn(Array.isArray(item.videos) ? item.videos : []) }
                : item,
            ),
          }
        : category,
    );
  }

  const addVideoSlot = (categoryIndex, itemIndex) =>
    setFaqCategories((prev) => applyVideos(prev, categoryIndex, itemIndex, (v) => [...v, ""]));

  // Local-only edit while typing; persisted on blur via persistInlineEdits.
  const updateVideoSlot = (categoryIndex, itemIndex, videoIndex, value) =>
    setFaqCategories((prev) =>
      applyVideos(prev, categoryIndex, itemIndex, (videos) =>
        videos.map((v, vi) => (vi === videoIndex ? value : v)),
      ),
    );

  // Persist the current in-memory FAQ edits (used on input blur, since the
  // FAQ editor auto-saves instead of using a Save button).
  function persistInlineEdits() {
    setFaqCategories((prev) => {
      void persistFaqCategories(prev, "Changes saved.");
      return prev;
    });
  }

  function removeVideoSlot(categoryIndex, itemIndex, videoIndex) {
    setFaqCategories((prev) => {
      const next = applyVideos(prev, categoryIndex, itemIndex, (videos) =>
        videos.filter((_, vi) => vi !== videoIndex),
      );
      void persistFaqCategories(next, "Video removed and saved.");
      return next;
    });
  }

  async function handleVideoUpload(categoryIndex, itemIndex, videoIndex, file) {
    if (!file) return;
    const key = `${categoryIndex}-${itemIndex}-${videoIndex}`;
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadVideoToCloudinary(file, (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct })),
      );
      // Update state AND persist the new URL immediately (no Save button on FAQ).
      setFaqCategories((prev) => {
        const next = applyVideos(prev, categoryIndex, itemIndex, (videos) =>
          videos.map((v, vi) => (vi === videoIndex ? url : v)),
        );
        void persistFaqCategories(next, "Video uploaded and saved.");
        return next;
      });
    } catch (err) {
      setError(err.message ?? "Video upload failed");
    } finally {
      setUploadProgress((p) => {
        const next = { ...p };
        delete next[key];
        return next;
      });
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0088FF]">
            Website Page
          </p>
          <h2 className="text-2xl font-semibold text-[#050A13]">{page.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{page.path}</p>
        </div>
        {!isFaqs ? (
          <a
            href={`${import.meta.env.VITE_FRONTEND_URL ?? "http://localhost:3000"}${page.path}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-[#0088FF] hover:text-[#0088FF]"
          >
            Preview
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : null}
      </div>

      {isHome ? (
        <p className="mt-4 rounded-xl border border-[#C6DEFF] bg-[#EEF6FF] px-4 py-3 text-sm text-[#050A13]">
          Landing page hero uses <code className="text-xs">sections.hero.slides</code> — an array of slide objects (tag, title, subtitle, description, image, cardImg, video).
        </p>
      ) : isFaqs ? null : (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Other pages use <code className="text-xs">sections.hero</code> with eyebrow, title, subtitle, description, and image.
        </p>
      )}

      <form onSubmit={handleSave} className="mt-6 space-y-5">
        {!isFaqs ? (
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#0088FF]"
            />
            Published (visible on website)
          </label>
        ) : null}

        {isFaqs ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-sm font-medium text-slate-700">
                {faqCategories.length} categories · {faqCount} questions
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openAddCategoryModal}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Category
                </button>
              </div>
            </div>

            {faqCategories.map((category, categoryIndex) => (
              <div key={`${category.id}-${categoryIndex}`} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#050A13]">Category {categoryIndex + 1}</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditCategoryModal(categoryIndex)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#0088FF] hover:text-[#0088FF]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCategory(categoryIndex)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove Category
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    value={category.title ?? ""}
                    onChange={(e) => updateCategory(categoryIndex, "title", e.target.value)}
                    className={inputClass}
                    placeholder="Category Title"
                  />
                  <input
                    value={category.icon ?? ""}
                    onChange={(e) => updateCategory(categoryIndex, "icon", e.target.value)}
                    className={inputClass}
                    placeholder="Icon (e.g. Building2)"
                  />
                </div>

                <div className="mt-4 space-y-3">
                  {(category.items ?? []).map((item, itemIndex) => (
                    <div key={`${item.id}-${itemIndex}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                          Question {itemIndex + 1}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditQuestionModal(categoryIndex, itemIndex)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-[#0088FF] hover:text-[#0088FF]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeQuestion(categoryIndex, itemIndex)}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <input
                          value={item.question ?? ""}
                          onChange={(e) => updateQuestion(categoryIndex, itemIndex, "question", e.target.value)}
                          onBlur={persistInlineEdits}
                          className={inputClass}
                          placeholder="Question"
                        />
                        <textarea
                          value={item.answer ?? ""}
                          onChange={(e) => updateQuestion(categoryIndex, itemIndex, "answer", e.target.value)}
                          onBlur={persistInlineEdits}
                          className={inputClass}
                          rows={3}
                          placeholder="Answer"
                        />
                        <input
                          value={item.videoFolderUrl ?? ""}
                          onChange={(e) => updateQuestion(categoryIndex, itemIndex, "videoFolderUrl", e.target.value)}
                          onBlur={persistInlineEdits}
                          className={inputClass}
                          placeholder="Optional Drive folder URL (fallback link)"
                        />
                        <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                            Videos {Array.isArray(item.videos) && item.videos.length ? `(${item.videos.length})` : ""}
                          </p>
                          {(Array.isArray(item.videos) ? item.videos : []).map((video, videoIndex) => {
                            const uploadKey = `${categoryIndex}-${itemIndex}-${videoIndex}`;
                            const progress = uploadProgress[uploadKey];
                            const uploading = progress !== undefined;
                            return (
                            <div key={videoIndex} className="flex items-center gap-2">
                              <input
                                value={video ?? ""}
                                onChange={(e) => updateVideoSlot(categoryIndex, itemIndex, videoIndex, e.target.value)}
                                onBlur={persistInlineEdits}
                                className={inputClass}
                                placeholder={`Video ${videoIndex + 1} URL (Cloudinary .mp4 / YouTube / Vimeo / Drive file)`}
                              />
                              <label
                                className={`shrink-0 inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold ${
                                  uploading
                                    ? "cursor-not-allowed border-slate-200 text-slate-400"
                                    : "cursor-pointer border-[#0088FF]/30 bg-[#EEF6FF] text-[#0088FF] hover:bg-[#dcecff]"
                                }`}
                                title="Upload video to Cloudinary"
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
                                  accept="video/*"
                                  className="hidden"
                                  disabled={uploading}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    e.target.value = "";
                                    handleVideoUpload(categoryIndex, itemIndex, videoIndex, file);
                                  }}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => removeVideoSlot(categoryIndex, itemIndex, videoIndex)}
                                className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-400 hover:border-red-300 hover:text-red-500"
                                title="Remove video"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => addVideoSlot(categoryIndex, itemIndex)}
                            className="inline-flex w-fit items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-1.5 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff]"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Video
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => openAddQuestionModal(categoryIndex)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Question
                  </button>
                </div>
              </div>
            ))}

          </div>
      ) : (
          <div>
            <label htmlFor="sections" className="mb-2 block text-sm font-semibold text-[#050A13]">
              Page content (JSON)
            </label>
            <textarea
              id="sections"
              value={sectionsJson}
              onChange={(e) => setSectionsJson(e.target.value)}
              rows={22}
              className={`${inputClass} font-mono text-xs leading-6`}
              spellCheck={false}
            />
          </div>
        )}

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : null}
        {success ? (
          <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>
        ) : null}

        {!isFaqs ? (
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-[#0088FF] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save page"}
          </button>
        ) : null}
      </form>

      {categoryModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <h3 className="text-lg font-semibold text-[#050A13]">Add Category</h3>
            <div className="mt-4 grid gap-3">
              <input
                value={newCategoryForm.title}
                onChange={(e) =>
                  setNewCategoryForm((p) => {
                    const title = e.target.value;
                    return {
                      ...p,
                      title,
                    };
                  })
                }
                className={inputClass}
                placeholder="Category title"
              />
              <label className="grid gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  Icon
                </span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {FAQ_ICON_OPTIONS.map((option) => {
                    const Icon = FAQ_ICON_COMPONENTS[option.value] ?? Building2;
                    const active = newCategoryForm.icon === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setNewCategoryForm((p) => ({ ...p, icon: option.value }))
                        }
                        className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition ${
                          active
                            ? "border-[#0088FF] bg-[#EEF6FF] text-[#0088FF]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-[#0088FF]/40"
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="leading-tight">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={closeCategoryModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">
                Cancel
              </button>
              <button type="button" onClick={addCategory} className="rounded-lg bg-[#0088FF] px-4 py-2 text-sm font-semibold text-white">
                {editCategoryIndex === null ? "Add" : "Update"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {questionModalOpen && questionModalCategoryIndex !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
            <h3 className="text-lg font-semibold text-[#050A13]">Add Question</h3>
            <div className="mt-4 grid gap-3">
              <input
                value={newQuestionForm.question}
                onChange={(e) =>
                  setNewQuestionForm((p) => {
                    const question = e.target.value;
                    return {
                      ...p,
                      question,
                    };
                  })
                }
                className={inputClass}
                placeholder="Question"
              />
              <textarea
                value={newQuestionForm.answer}
                onChange={(e) => setNewQuestionForm((p) => ({ ...p, answer: e.target.value }))}
                className={inputClass}
                rows={3}
                placeholder="Answer"
              />
              <input
                value={newQuestionForm.videoUrl}
                onChange={(e) => setNewQuestionForm((p) => ({ ...p, videoUrl: e.target.value }))}
                className={inputClass}
                placeholder="Video URL (optional)"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={closeQuestionModal} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600">
                Cancel
              </button>
              <button type="button" onClick={() => addQuestion(questionModalCategoryIndex)} className="rounded-lg bg-[#0088FF] px-4 py-2 text-sm font-semibold text-white">
                {editQuestionIndex === null ? "Add" : "Update"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
