import { useState, useEffect, useMemo } from "react";
import { Save, Loader2, Plus, Trash2, Pencil, ChevronDown, Upload } from "lucide-react";
import {
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
import { api, uploadMediaToCloudinary, uploadVideoToCloudinary } from "../lib/api";
import { FIELD_LIMITS, CharCount, FieldError, ArInput } from "./CappedField";
import { validateUrl, validateImageFile, validateVideoFile } from "../lib/validators";

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15";
const labelClass = "block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 mb-2";

const DEFAULT_HERO = {
  title: "Got Questions? We've Got Answers.",
  description: "Find helpful information about HalaPark's smart parking solutions, system features, payments, access, and operations — all organized into easy-to-browse categories for a faster and smoother experience.",
  image: "/hf_20260327_061900_db12a62e-2867-44b6-83f0-ea7f1a5442ef.png",
};

const DEFAULT_SEARCH_HEADER = {
  heading: "",
  headingAccent: "",
  subtitle: "",
  searchPlaceholder: "",
  ar: {},
};

const DEFAULT_BOTTOM_CTA = {
  heading: "",
  description: "",
  contactLabel: "",
  contactHref: "",
  whatsappLabel: "",
  whatsappHref: "",
  ar: {},
};

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

export default function FAQPageEditor() {
  const [page, setPage] = useState(null);
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [searchHeader, setSearchHeader] = useState(DEFAULT_SEARCH_HEADER);
  const [bottomCta, setBottomCta] = useState(DEFAULT_BOTTOM_CTA);
  const [faqCategories, setFaqCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState({});
  const [openSections, setOpenSections] = useState({ hero: true, faqs: true, searchHeader: true, bottomCta: true });
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editCategoryIndex, setEditCategoryIndex] = useState(null);
  const [editQuestionIndex, setEditQuestionIndex] = useState(null);
  const [questionModalCategoryIndex, setQuestionModalCategoryIndex] = useState(null);
  const [newCategoryForm, setNewCategoryForm] = useState({ title: "", icon: "Building2", iconImage: "" });
  const [categoryError, setCategoryError] = useState("");
  const [newQuestionForm, setNewQuestionForm] = useState({ question: "", answer: "", videoUrl: "", videos: [] });

  const faqCount = useMemo(
    () => faqCategories.reduce((acc, category) => acc + (category.items?.length ?? 0), 0),
    [faqCategories],
  );

  useEffect(() => {
    document.title = "FAQs — HalaPark Admin";
    setLoading(true);
    api
      .getPage("faqs")
      .then((data) => {
        setPage(data);
        if (data.page?.sections?.hero) {
          setHero(data.page.sections.hero);
        }
        if (data.page?.sections?.searchHeader) {
          setSearchHeader(data.page.sections.searchHeader);
        }
        if (data.page?.sections?.bottomCta) {
          setBottomCta(data.page.sections.bottomCta);
        }
        if (data.page?.sections?.faqCategories) {
          setFaqCategories(data.page.sections.faqCategories);
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
      await api.updatePage("faqs", {
        sections: {
          hero,
          faqCategories,
          searchHeader,
          bottomCta,
        },
      });
      setSuccess("FAQ page saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Save failed:", err);
      setError("Failed to save FAQ page");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(field, file) {
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    const key = `hero-${field}`;
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct }))
      );
      setHero((prev) => ({ ...prev, [field]: url }));
      setSuccess("Image uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Image upload failed");
      console.error(err);
    } finally {
      setUploadProgress((p) => ({ ...p, [key]: undefined }));
    }
  }

  // Uploads a video for the question modal and writes the URL into the modal's
  // OWN form state (newQuestionForm.videos) — never directly into faqCategories.
  // The change only lands on the real question when the user hits Save, and is
  // fully discarded on Cancel.
  async function handleModalVideoUpload(videoIndex, file) {
    if (!file) return;
    const err = validateVideoFile(file);
    if (err) { setError(err); return; }
    const key = `modal-video-${videoIndex}`;
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadVideoToCloudinary(file, (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct }))
      );
      setNewQuestionForm((prev) => ({
        ...prev,
        videos: (Array.isArray(prev.videos) ? prev.videos : []).map((v, vIndex) =>
          vIndex === videoIndex ? url : v
        ),
      }));
      setSuccess("Video uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Video upload failed");
      console.error(err);
    } finally {
      setUploadProgress((p) => ({ ...p, [key]: undefined }));
    }
  }

  // Uploads an optional icon image for the category modal into the modal's form
  // state. Persisted onto the category (as `iconImage`) only on Save.
  async function handleCategoryIconUpload(file) {
    if (!file) return;
    const err = validateImageFile(file);
    if (err) { setCategoryError(err); return; }
    const key = "cat-icon";
    setCategoryError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "image", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct }))
      );
      setNewCategoryForm((prev) => ({ ...prev, iconImage: url }));
    } catch (err) {
      setCategoryError("Icon image upload failed");
      console.error(err);
    } finally {
      setUploadProgress((p) => ({ ...p, [key]: undefined }));
    }
  }

  const toggleSection = (sectionName) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const toSlug = (value = "") => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const addCategory = () => {
    const title = newCategoryForm.title.trim() || "New Category";
    const icon = newCategoryForm.icon.trim() || "Building2";
    const iconImage = (newCategoryForm.iconImage ?? "").trim();
    // Master-data guard: category titles are unique (case-insensitive). Blocks
    // both creating a duplicate and renaming a category onto an existing one
    // (the category being edited is excluded from the check).
    const isDuplicate = faqCategories.some(
      (category, index) =>
        index !== editCategoryIndex &&
        (category.title ?? "").trim().toLowerCase() === title.toLowerCase(),
    );
    if (isDuplicate) {
      setCategoryError(`A category named "${title}" already exists — questions should be added under it instead.`);
      return;
    }
    const id = toSlug(title) || `category-${Date.now()}`;
    setFaqCategories((prev) => {
      const next = editCategoryIndex === null
        ? [...prev, { id, title, icon, iconImage, items: [] }]
        : prev.map((category, index) =>
            index === editCategoryIndex
              ? { ...category, title, icon, iconImage }
              : category,
          );
      return next;
    });
    setNewCategoryForm({ title: "", icon: "Building2", iconImage: "" });
    setCategoryError("");
    setEditCategoryIndex(null);
    setCategoryModalOpen(false);
  };

  const removeCategory = (categoryIndex) => {
    setFaqCategories((prev) => prev.filter((_, index) => index !== categoryIndex));
  };

  const updateCategory = (categoryIndex, key, value) => {
    setFaqCategories((prev) =>
      prev.map((category, index) =>
        index === categoryIndex ? { ...category, [key]: value } : category,
      ),
    );
  };

  const addQuestion = (categoryIndex) => {
    const question = newQuestionForm.question.trim() || "New question";
    const answer = newQuestionForm.answer.trim() || "New answer";
    // Persist the modal's own video list; drop rows the user left blank.
    const videos = (Array.isArray(newQuestionForm.videos) ? newQuestionForm.videos : [])
      .map((v) => (v ?? "").trim())
      .filter(Boolean);
    const ar = newQuestionForm.ar; // Arabic translations ride along with the item.
    const id = toSlug(question) || `q-${Date.now()}`;
    setFaqCategories((prev) =>
      prev.map((category, index) =>
        index === categoryIndex
          ? {
              ...category,
              items:
                editQuestionIndex === null
                  ? [...(category.items ?? []), { id, question, answer, videos, ar }]
                  : (category.items ?? []).map((item, i) =>
                      i === editQuestionIndex
                        ? { ...item, id: item.id || id, question, answer, videos, ar }
                        : item,
                    ),
            }
          : category,
      ),
    );
    setNewQuestionForm({ question: "", answer: "", videoUrl: "", videos: [] });
    setQuestionModalCategoryIndex(null);
    setEditQuestionIndex(null);
    setQuestionModalOpen(false);
  };

  const removeQuestion = (categoryIndex, itemIndex) => {
    setFaqCategories((prev) =>
      prev.map((category, index) =>
        index === categoryIndex
          ? {
              ...category,
              items: (category.items ?? []).filter((_, i) => i !== itemIndex),
            }
          : category,
      ),
    );
  };

  const updateQuestion = (categoryIndex, itemIndex, key, value) => {
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
  };

  const openEditCategoryModal = (categoryIndex) => {
    const category = faqCategories[categoryIndex];
    if (!category) return;
    setEditCategoryIndex(categoryIndex);
    setNewCategoryForm({
      title: category.title ?? "",
      icon: category.icon ?? "Building2",
      iconImage: category.iconImage ?? "",
    });
    setCategoryError("");
    setCategoryModalOpen(true);
  };

  const openAddQuestionModal = (categoryIndex) => {
    setQuestionModalCategoryIndex(categoryIndex);
    setEditQuestionIndex(null);
    setNewQuestionForm({ question: "", answer: "", videoUrl: "", videos: [] });
    setQuestionModalOpen(true);
  };

  const openEditQuestionModal = (categoryIndex, itemIndex) => {
    const item = faqCategories[categoryIndex]?.items?.[itemIndex];
    if (!item) return;
    setQuestionModalCategoryIndex(categoryIndex);
    setEditQuestionIndex(itemIndex);
    setNewQuestionForm({
      question: item.question ?? "",
      answer: item.answer ?? "",
      ar: item.ar ?? {},
      videoUrl: "",
      videos: Array.isArray(item.videos) ? item.videos : [],
    });
    setQuestionModalOpen(true);
  };

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
          <h1 className="text-3xl font-bold text-[#050A13]">FAQ Page Editor</h1>
          <p className="mt-2 text-sm text-slate-600">Manage hero section and FAQ categories</p>
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
        {/* Hero Section */}
        <CollapsibleSection
          title="1. Hero Section"
          isOpen={openSections.hero}
          onToggle={() => toggleSection("hero")}
        >
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Title</label>
              <input
                type="text"
                value={hero.title}
                onChange={(e) => setHero({ ...hero, title: e.target.value })}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
              />
              <CharCount value={hero.title} max={FIELD_LIMITS.heading} />
              <ArInput label="Title" kind="heading" value={hero.ar?.title} onChange={(v) => setHero({ ...hero, ar: { ...(hero.ar ?? {}), title: v } })} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={hero.description}
                onChange={(e) => setHero({ ...hero, description: e.target.value })}
                className={inputClass}
                rows={3}
                maxLength={FIELD_LIMITS.description}
              />
              <CharCount value={hero.description} max={FIELD_LIMITS.description} />
              <ArInput label="Description" kind="description" multiline value={hero.ar?.description} onChange={(v) => setHero({ ...hero, ar: { ...(hero.ar ?? {}), description: v } })} />
            </div>
            <div>
              <label className={labelClass}>Background Image URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hero.image}
                  onChange={(e) => setHero({ ...hero, image: e.target.value })}
                  className={inputClass}
                  placeholder="e.g., /image.png or https://..."
                  maxLength={FIELD_LIMITS.link}
                />
                <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload("image", file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <FieldError error={validateUrl(hero.image)} />
            </div>
          </div>
        </CollapsibleSection>

        {/* FAQ Categories Section */}
        <CollapsibleSection
          title="2. FAQ Categories"
          isOpen={openSections.faqs}
          onToggle={() => toggleSection("faqs")}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-sm font-medium text-slate-700">
                {faqCategories.length} categories · {faqCount} questions
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditCategoryIndex(null);
                  setNewCategoryForm({ title: "", icon: "Building2", iconImage: "" });
                  setCategoryError("");
                  setCategoryModalOpen(true);
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Category
              </button>
            </div>

            {faqCategories.map((category, categoryIndex) => (
              <div key={`${category.id}-${categoryIndex}`} className="rounded-xl border border-slate-200 bg-white p-4">
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
                      Remove
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <input
                    value={category.title ?? ""}
                    onChange={(e) => updateCategory(categoryIndex, "title", e.target.value)}
                    className={inputClass}
                    placeholder="Category Title"
                    maxLength={FIELD_LIMITS.heading}
                  />
                  <CharCount value={category.title ?? ""} max={FIELD_LIMITS.heading} />
                  <ArInput label="Title" kind="heading" value={category.ar?.title} onChange={(v) => updateCategory(categoryIndex, "ar", { ...(category.ar ?? {}), title: v })} />
                  <select
                    value={category.icon ?? "Building2"}
                    onChange={(e) => updateCategory(categoryIndex, "icon", e.target.value)}
                    className={inputClass}
                  >
                    {FAQ_ICON_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Questions */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-600">
                      {(category.items ?? []).length} questions
                    </p>
                    <button
                      type="button"
                      onClick={() => openAddQuestionModal(categoryIndex)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Question
                    </button>
                  </div>

                  {(category.items ?? []).map((item, itemIndex) => (
                    <div key={`${item.id}-${itemIndex}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-600">Q{itemIndex + 1}</p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditQuestionModal(categoryIndex, itemIndex)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:border-[#0088FF] hover:text-[#0088FF]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeQuestion(categoryIndex, itemIndex)}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-700">{item.question}</p>
                        <p className="text-xs text-slate-500 line-clamp-2">{item.answer}</p>
                        {Array.isArray(item.videos) && item.videos.length > 0 && (
                          <p className="text-xs text-[#0088FF]">{item.videos.length} video(s)</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* Search Header Section */}
        <CollapsibleSection
          title="3. Search Header (What would you like to know?)"
          isOpen={openSections.searchHeader}
          onToggle={() => toggleSection("searchHeader")}
        >
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Heading</label>
              <input
                type="text"
                value={searchHeader.heading ?? ""}
                onChange={(e) => setSearchHeader({ ...searchHeader, heading: e.target.value })}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
              />
              <CharCount value={searchHeader.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={searchHeader.ar?.heading} onChange={(v) => setSearchHeader({ ...searchHeader, ar: { ...(searchHeader.ar ?? {}), heading: v } })} />
            </div>
            <div>
              <label className={labelClass}>Heading Accent (highlighted part)</label>
              <input
                type="text"
                value={searchHeader.headingAccent ?? ""}
                onChange={(e) => setSearchHeader({ ...searchHeader, headingAccent: e.target.value })}
                className={inputClass}
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={searchHeader.headingAccent ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Heading Accent" kind="label" value={searchHeader.ar?.headingAccent} onChange={(v) => setSearchHeader({ ...searchHeader, ar: { ...(searchHeader.ar ?? {}), headingAccent: v } })} />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <input
                type="text"
                value={searchHeader.subtitle ?? ""}
                onChange={(e) => setSearchHeader({ ...searchHeader, subtitle: e.target.value })}
                className={inputClass}
                maxLength={FIELD_LIMITS.subtitle}
              />
              <CharCount value={searchHeader.subtitle ?? ""} max={FIELD_LIMITS.subtitle} />
              <ArInput label="Subtitle" kind="subtitle" value={searchHeader.ar?.subtitle} onChange={(v) => setSearchHeader({ ...searchHeader, ar: { ...(searchHeader.ar ?? {}), subtitle: v } })} />
            </div>
            <div>
              <label className={labelClass}>Search Placeholder</label>
              <input
                type="text"
                value={searchHeader.searchPlaceholder ?? ""}
                onChange={(e) => setSearchHeader({ ...searchHeader, searchPlaceholder: e.target.value })}
                className={inputClass}
                maxLength={FIELD_LIMITS.label}
              />
              <CharCount value={searchHeader.searchPlaceholder ?? ""} max={FIELD_LIMITS.label} />
              <ArInput label="Search Placeholder" kind="label" value={searchHeader.ar?.searchPlaceholder} onChange={(v) => setSearchHeader({ ...searchHeader, ar: { ...(searchHeader.ar ?? {}), searchPlaceholder: v } })} />
            </div>
          </div>
        </CollapsibleSection>

        {/* Bottom CTA Section */}
        <CollapsibleSection
          title="4. Still Have Questions? (Bottom CTA)"
          isOpen={openSections.bottomCta}
          onToggle={() => toggleSection("bottomCta")}
        >
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Heading</label>
              <input
                type="text"
                value={bottomCta.heading ?? ""}
                onChange={(e) => setBottomCta({ ...bottomCta, heading: e.target.value })}
                className={inputClass}
                maxLength={FIELD_LIMITS.heading}
              />
              <CharCount value={bottomCta.heading ?? ""} max={FIELD_LIMITS.heading} />
              <ArInput label="Heading" kind="heading" value={bottomCta.ar?.heading} onChange={(v) => setBottomCta({ ...bottomCta, ar: { ...(bottomCta.ar ?? {}), heading: v } })} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={bottomCta.description ?? ""}
                onChange={(e) => setBottomCta({ ...bottomCta, description: e.target.value })}
                className={inputClass}
                rows={3}
                maxLength={FIELD_LIMITS.description}
              />
              <CharCount value={bottomCta.description ?? ""} max={FIELD_LIMITS.description} />
              <ArInput label="Description" kind="description" multiline value={bottomCta.ar?.description} onChange={(v) => setBottomCta({ ...bottomCta, ar: { ...(bottomCta.ar ?? {}), description: v } })} />
            </div>
            <div>
              <label className={labelClass}>Contact Button Label</label>
              <input
                type="text"
                value={bottomCta.contactLabel ?? ""}
                onChange={(e) => setBottomCta({ ...bottomCta, contactLabel: e.target.value })}
                className={inputClass}
                maxLength={FIELD_LIMITS.button}
              />
              <CharCount value={bottomCta.contactLabel ?? ""} max={FIELD_LIMITS.button} />
              <ArInput label="Contact Button Label" kind="button" value={bottomCta.ar?.contactLabel} onChange={(v) => setBottomCta({ ...bottomCta, ar: { ...(bottomCta.ar ?? {}), contactLabel: v } })} />
            </div>
            <div>
              <label className={labelClass}>Contact Link</label>
              <input
                type="text"
                value={bottomCta.contactHref ?? ""}
                onChange={(e) => setBottomCta({ ...bottomCta, contactHref: e.target.value })}
                className={inputClass}
                placeholder="e.g., /contact or https://..."
                maxLength={FIELD_LIMITS.link}
              />
              <FieldError error={validateUrl(bottomCta.contactHref)} />
            </div>
            <div>
              <label className={labelClass}>WhatsApp Button Label</label>
              <input
                type="text"
                value={bottomCta.whatsappLabel ?? ""}
                onChange={(e) => setBottomCta({ ...bottomCta, whatsappLabel: e.target.value })}
                className={inputClass}
                maxLength={FIELD_LIMITS.button}
              />
              <CharCount value={bottomCta.whatsappLabel ?? ""} max={FIELD_LIMITS.button} />
              <ArInput label="WhatsApp Button Label" kind="button" value={bottomCta.ar?.whatsappLabel} onChange={(v) => setBottomCta({ ...bottomCta, ar: { ...(bottomCta.ar ?? {}), whatsappLabel: v } })} />
            </div>
            <div>
              <label className={labelClass}>WhatsApp Link</label>
              <input
                type="text"
                value={bottomCta.whatsappHref ?? ""}
                onChange={(e) => setBottomCta({ ...bottomCta, whatsappHref: e.target.value })}
                className={inputClass}
                placeholder="e.g. https://wa.me/9714..."
                maxLength={FIELD_LIMITS.link}
              />
              <p className="mt-1 text-[11px] text-slate-400">e.g. https://wa.me/9714...</p>
              <FieldError error={validateUrl(bottomCta.whatsappHref)} />
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-[#050A13] mb-4">
              {editCategoryIndex === null ? "Add Category" : "Edit Category"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Title</label>
                <input
                  type="text"
                  value={newCategoryForm.title}
                  onChange={(e) => {
                    setNewCategoryForm({ ...newCategoryForm, title: e.target.value });
                    if (categoryError) setCategoryError("");
                  }}
                  className={inputClass}
                  placeholder="Category title"
                  maxLength={FIELD_LIMITS.heading}
                />
                <CharCount value={newCategoryForm.title} max={FIELD_LIMITS.heading} />
              </div>
              <div>
                <label className={labelClass}>Icon</label>
                <select
                  value={newCategoryForm.icon}
                  onChange={(e) => setNewCategoryForm({ ...newCategoryForm, icon: e.target.value })}
                  className={inputClass}
                >
                  {FAQ_ICON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Icon Image (optional — overrides the built-in icon)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryForm.iconImage ?? ""}
                    onChange={(e) => setNewCategoryForm({ ...newCategoryForm, iconImage: e.target.value })}
                    className={inputClass}
                    placeholder="e.g., /icon.png or https://..."
                    maxLength={FIELD_LIMITS.link}
                  />
                  <label className={`shrink-0 inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold ${
                    uploadProgress["cat-icon"] !== undefined
                      ? "cursor-not-allowed border-slate-200 text-slate-400"
                      : "cursor-pointer border-[#0088FF]/30 bg-[#EEF6FF] text-[#0088FF] hover:bg-[#dcecff]"
                  }`}>
                    {uploadProgress["cat-icon"] !== undefined ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {uploadProgress["cat-icon"]}%
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
                      disabled={uploadProgress["cat-icon"] !== undefined}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (file) handleCategoryIconUpload(file);
                      }}
                    />
                  </label>
                </div>
                <FieldError error={validateUrl(newCategoryForm.iconImage)} />
                {(newCategoryForm.iconImage ?? "").trim() !== "" && (
                  <img
                    src={newCategoryForm.iconImage}
                    alt="Category icon preview"
                    className="mt-2 h-10 w-10 rounded-lg border border-slate-200 object-cover"
                  />
                )}
              </div>
              {categoryError && (
                <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-medium text-red-700">
                  {categoryError}
                </p>
              )}
              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => {
                    setCategoryModalOpen(false);
                    setEditCategoryIndex(null);
                    setNewCategoryForm({ title: "", icon: "Building2", iconImage: "" });
                    setCategoryError("");
                  }}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addCategory}
                  className="flex-1 px-4 py-2 bg-[#0088FF] rounded-lg text-sm font-semibold text-white hover:brightness-110"
                >
                  {editCategoryIndex === null ? "Add" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {questionModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-[#050A13] mb-4">
              {editQuestionIndex === null ? "Add Question" : "Edit Question"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Question</label>
                <input
                  type="text"
                  value={newQuestionForm.question}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, question: e.target.value })}
                  className={inputClass}
                  placeholder="Enter question"
                  maxLength={FIELD_LIMITS.subtitle}
                />
                <CharCount value={newQuestionForm.question} max={FIELD_LIMITS.subtitle} />
                <ArInput label="Question" kind="subtitle" multiline value={newQuestionForm.ar?.question} onChange={(v) => setNewQuestionForm({ ...newQuestionForm, ar: { ...(newQuestionForm.ar ?? {}), question: v } })} />
              </div>
              <div>
                <label className={labelClass}>Answer</label>
                <textarea
                  value={newQuestionForm.answer}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, answer: e.target.value })}
                  className={inputClass}
                  rows={4}
                  placeholder="Enter answer"
                  maxLength={FIELD_LIMITS.description}
                />
                <CharCount value={newQuestionForm.answer} max={FIELD_LIMITS.description} />
                <ArInput label="Answer" kind="description" multiline value={newQuestionForm.ar?.answer} onChange={(v) => setNewQuestionForm({ ...newQuestionForm, ar: { ...(newQuestionForm.ar ?? {}), answer: v } })} />
              </div>
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase text-slate-600">Videos</p>
                  <button
                    type="button"
                    onClick={() =>
                      setNewQuestionForm((prev) => ({
                        ...prev,
                        videos: [...(Array.isArray(prev.videos) ? prev.videos : []), ""],
                      }))
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-2.5 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Video
                  </button>
                </div>
                <div className="space-y-2">
                  {(Array.isArray(newQuestionForm.videos) ? newQuestionForm.videos : []).map((video, videoIndex) => {
                    const uploadKey = `modal-video-${videoIndex}`;
                    const progress = uploadProgress[uploadKey];
                    const uploading = progress !== undefined;
                    return (
                      <div key={videoIndex}>
                      <div className="flex gap-2">
                        <input
                          value={video ?? ""}
                          onChange={(e) =>
                            setNewQuestionForm({
                              ...newQuestionForm,
                              videos: newQuestionForm.videos.map((v, vi) =>
                                vi === videoIndex ? e.target.value : v
                              ),
                            })
                          }
                          className={inputClass}
                          placeholder="YouTube/Vimeo/Cloudinary URL"
                          maxLength={FIELD_LIMITS.link}
                        />
                        <label className={`shrink-0 inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold ${
                          uploading
                            ? "cursor-not-allowed border-slate-200 text-slate-400"
                            : "cursor-pointer border-[#0088FF]/30 bg-[#EEF6FF] text-[#0088FF] hover:bg-[#dcecff]"
                        }`}>
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
                              if (file) handleModalVideoUpload(videoIndex, file);
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setNewQuestionForm({
                              ...newQuestionForm,
                              videos: newQuestionForm.videos.filter((_, vi) => vi !== videoIndex),
                            });
                          }}
                          className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-400 hover:border-red-300 hover:text-red-500"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <FieldError error={validateUrl(video)} />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setQuestionModalOpen(false);
                    setQuestionModalCategoryIndex(null);
                    setEditQuestionIndex(null);
                    setNewQuestionForm({ question: "", answer: "", videoUrl: "", videos: [] });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => addQuestion(questionModalCategoryIndex)}
                  className="flex-1 px-4 py-2 bg-[#0088FF] rounded-lg text-sm font-semibold text-white hover:brightness-110"
                >
                  {editQuestionIndex === null ? "Add" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
