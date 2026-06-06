import { useEffect, useState } from "react";
import {
  ExternalLink,
  Plus,
  Trash2,
  Pencil,
  ImageIcon,
  Target,
  Eye,
  BookOpen,
  Layers,
  Cpu,
  Megaphone,
} from "lucide-react";
import { api } from "../lib/api";
import { DEFAULT_ABOUT_SECTIONS, mergeAboutSections } from "../constants/aboutDefaults.js";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15";

const labelClass = "text-xs font-semibold uppercase tracking-[0.08em] text-slate-500";

const btnPrimary =
  "inline-flex items-center gap-1 rounded-lg bg-[#0088FF] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110 disabled:opacity-60";

const btnOutline =
  "inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#0088FF] hover:text-[#0088FF]";

const btnDanger =
  "inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50";

function Modal({ open, title, children, onClose, footer }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
      >
        <h3 id="about-modal-title" className="text-lg font-semibold text-[#050A13]">
          {title}
        </h3>
        <div className="mt-4">{children}</div>
        {footer ? <div className="mt-5 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );
}

function PreviewRow({ label, value, multiline }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <p
        className={`mt-1 text-sm text-[#050A13] ${multiline ? "whitespace-pre-wrap leading-relaxed" : ""}`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

const emptyHighlight = { line1: "", line2: "" };

export default function AboutPageEditor() {
  const slug = "about";
  const [page, setPage] = useState(null);
  const [content, setContent] = useState(DEFAULT_ABOUT_SECTIONS);
  const [published, setPublished] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [missionSectionModalOpen, setMissionSectionModalOpen] = useState(false);
  const [visionSectionModalOpen, setVisionSectionModalOpen] = useState(false);
  const [visionCardModalOpen, setVisionCardModalOpen] = useState(false);
  const [storySectionModalOpen, setStorySectionModalOpen] = useState(false);
  const [whatWeDoSectionModalOpen, setWhatWeDoSectionModalOpen] = useState(false);
  const [technologyModalOpen, setTechnologyModalOpen] = useState(false);
  const [ctaModalOpen, setCtaModalOpen] = useState(false);
  const [paragraphModalOpen, setParagraphModalOpen] = useState(false);
  const [highlightModalOpen, setHighlightModalOpen] = useState(false);
  const [ecosystemModalOpen, setEcosystemModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [paragraphSection, setParagraphSection] = useState(null);
  const [editParagraphIndex, setEditParagraphIndex] = useState(null);
  const [editHighlightIndex, setEditHighlightIndex] = useState(null);
  const [editEcosystemIndex, setEditEcosystemIndex] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [heroForm, setHeroForm] = useState(DEFAULT_ABOUT_SECTIONS.hero);
  const [missionSectionForm, setMissionSectionForm] = useState({
    title: "",
    subtitle: "",
    image: "",
  });
  const [visionSectionForm, setVisionSectionForm] = useState({
    title: "",
    subtitle: "",
    image: "",
  });
  const [visionCardForm, setVisionCardForm] = useState(DEFAULT_ABOUT_SECTIONS.vision.card);
  const [storySectionForm, setStorySectionForm] = useState({
    title: "",
    subtitle: "",
    image: "",
  });
  const [whatWeDoSectionForm, setWhatWeDoSectionForm] = useState({
    title: "",
    subtitle: "",
    intro: "",
    image: "",
  });
  const [technologyForm, setTechnologyForm] = useState(DEFAULT_ABOUT_SECTIONS.technology);
  const [ctaForm, setCtaForm] = useState(DEFAULT_ABOUT_SECTIONS.cta);
  const [paragraphText, setParagraphText] = useState("");
  const [highlightForm, setHighlightForm] = useState(emptyHighlight);
  const [ecosystemText, setEcosystemText] = useState("");

  const missionParagraphCount = content.mission.paragraphs.length;
  const visionParagraphCount = content.vision.paragraphs.length;
  const storyParagraphCount = content.story.paragraphs.length;
  const highlightCount = content.vision.card.highlights.length;
  const ecosystemCount = content.whatWeDo.ecosystemItems.length;

  useEffect(() => {
    document.title = "About Us — HalaPark Admin";
    setLoading(true);
    api
      .getPage(slug)
      .then((data) => {
        setPage(data.page);
        setContent(mergeAboutSections(data.page.sections));
        setPublished(data.page.published ?? true);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function persistSections(nextContent, successMessage = "Saved.", publishedOverride) {
    const sections = {
      hero: nextContent.hero,
      mission: nextContent.mission,
      vision: nextContent.vision,
      story: nextContent.story,
      whatWeDo: nextContent.whatWeDo,
      technology: nextContent.technology,
      cta: nextContent.cta,
    };

    // Use publishedOverride when provided (e.g. from the toggle) so we don't
    // read the stale React state value before it has been committed.
    const publishedValue = publishedOverride !== undefined ? publishedOverride : published;

    try {
      setSaving(true);
      setError("");
      const data = await api.updatePage(slug, { sections, published: publishedValue });
      setPage(data.page);
      setContent(mergeAboutSections(data.page.sections));
      setSuccess(successMessage);
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      setError(err.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function openDeleteConfirm(type, index, label) {
    setDeleteTarget({ type, index, label });
    setDeleteModalOpen(true);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const { type, index } = deleteTarget;

    if (type === "missionParagraph" && missionParagraphCount > 1) {
      setContent((prev) => {
        const next = {
          ...prev,
          mission: {
            ...prev.mission,
            paragraphs: prev.mission.paragraphs.filter((_, i) => i !== index),
          },
        };
        void persistSections(next, "Mission paragraph deleted.");
        return next;
      });
    } else if (type === "visionParagraph" && visionParagraphCount > 1) {
      setContent((prev) => {
        const next = {
          ...prev,
          vision: {
            ...prev.vision,
            paragraphs: prev.vision.paragraphs.filter((_, i) => i !== index),
          },
        };
        void persistSections(next, "Vision paragraph deleted.");
        return next;
      });
    } else if (type === "storyParagraph" && storyParagraphCount > 1) {
      setContent((prev) => {
        const next = {
          ...prev,
          story: {
            ...prev.story,
            paragraphs: prev.story.paragraphs.filter((_, i) => i !== index),
          },
        };
        void persistSections(next, "Story paragraph deleted.");
        return next;
      });
    } else if (type === "highlight") {
      setContent((prev) => {
        const next = {
          ...prev,
          vision: {
            ...prev.vision,
            card: {
              ...prev.vision.card,
              highlights: prev.vision.card.highlights.filter((_, i) => i !== index),
            },
          },
        };
        void persistSections(next, "Highlight deleted.");
        return next;
      });
    } else if (type === "ecosystemItem") {
      setContent((prev) => {
        const next = {
          ...prev,
          whatWeDo: {
            ...prev.whatWeDo,
            ecosystemItems: prev.whatWeDo.ecosystemItems.filter((_, i) => i !== index),
          },
        };
        void persistSections(next, "Ecosystem item deleted.");
        return next;
      });
    }

    setDeleteModalOpen(false);
    setDeleteTarget(null);
  }

  function openHeroModal() {
    setHeroForm({ ...content.hero });
    setHeroModalOpen(true);
  }

  function saveHero() {
    const next = { ...content, hero: { ...heroForm } };
    setContent(next);
    void persistSections(next, "Hero updated.");
    setHeroModalOpen(false);
  }

  function openMissionSectionModal() {
    setMissionSectionForm({
      title: content.mission.title,
      subtitle: content.mission.subtitle,
      image: content.mission.image,
    });
    setMissionSectionModalOpen(true);
  }

  function saveMissionSection() {
    const next = {
      ...content,
      mission: { ...content.mission, ...missionSectionForm },
    };
    setContent(next);
    void persistSections(next, "Mission section updated.");
    setMissionSectionModalOpen(false);
  }

  function openAddParagraph(section) {
    setParagraphSection(section);
    setEditParagraphIndex(null);
    setParagraphText("");
    setParagraphModalOpen(true);
  }

  function openEditParagraph(section, index) {
    setParagraphSection(section);
    setEditParagraphIndex(index);
    const paragraphs =
      section === "mission"
        ? content.mission.paragraphs
        : section === "vision"
          ? content.vision.paragraphs
          : content.story.paragraphs;
    setParagraphText(paragraphs[index] ?? "");
    setParagraphModalOpen(true);
  }

  function saveParagraph() {
    const text = paragraphText.trim();
    if (!text || !paragraphSection) return;

    setContent((prev) => {
      const sectionKey =
        paragraphSection === "mission"
          ? "mission"
          : paragraphSection === "vision"
            ? "vision"
            : "story";
      const paragraphs =
        editParagraphIndex === null
          ? [...prev[sectionKey].paragraphs, text]
          : prev[sectionKey].paragraphs.map((p, i) =>
              i === editParagraphIndex ? text : p,
            );
      const next = {
        ...prev,
        [sectionKey]: { ...prev[sectionKey], paragraphs },
      };
      const label =
        paragraphSection === "mission"
          ? "Mission"
          : paragraphSection === "vision"
            ? "Vision"
            : "Story";
      void persistSections(
        next,
        editParagraphIndex === null
          ? `${label} paragraph added.`
          : `${label} paragraph updated.`,
      );
      return next;
    });
    setParagraphModalOpen(false);
    setEditParagraphIndex(null);
    setParagraphSection(null);
  }

  function openVisionSectionModal() {
    setVisionSectionForm({
      title: content.vision.title,
      subtitle: content.vision.subtitle,
      image: content.vision.image,
    });
    setVisionSectionModalOpen(true);
  }

  function saveVisionSection() {
    const next = {
      ...content,
      vision: { ...content.vision, ...visionSectionForm },
    };
    setContent(next);
    void persistSections(next, "Vision section updated.");
    setVisionSectionModalOpen(false);
  }

  function openVisionCardModal() {
    setVisionCardForm({ ...content.vision.card });
    setVisionCardModalOpen(true);
  }

  function saveVisionCard() {
    const next = {
      ...content,
      vision: {
        ...content.vision,
        card: { ...visionCardForm },
      },
    };
    setContent(next);
    void persistSections(next, "Vision card updated.");
    setVisionCardModalOpen(false);
  }

  function openAddHighlight() {
    setEditHighlightIndex(null);
    setHighlightForm({ ...emptyHighlight });
    setHighlightModalOpen(true);
  }

  function openEditHighlight(index) {
    const item = content.vision.card.highlights[index];
    if (!item) return;
    setEditHighlightIndex(index);
    setHighlightForm({ line1: item.line1 ?? "", line2: item.line2 ?? "" });
    setHighlightModalOpen(true);
  }

  function saveHighlight() {
    const item = {
      line1: highlightForm.line1.trim() || "Line 1",
      line2: highlightForm.line2.trim(),
    };

    setContent((prev) => {
      const highlights =
        editHighlightIndex === null
          ? [...prev.vision.card.highlights, item]
          : prev.vision.card.highlights.map((h, i) =>
              i === editHighlightIndex ? item : h,
            );
      const next = {
        ...prev,
        vision: {
          ...prev.vision,
          card: { ...prev.vision.card, highlights },
        },
      };
      void persistSections(
        next,
        editHighlightIndex === null ? "Highlight added." : "Highlight updated.",
      );
      return next;
    });
    setHighlightModalOpen(false);
    setEditHighlightIndex(null);
  }

  function openStorySectionModal() {
    setStorySectionForm({
      title: content.story.title,
      subtitle: content.story.subtitle,
      image: content.story.image,
    });
    setStorySectionModalOpen(true);
  }

  function saveStorySection() {
    const next = {
      ...content,
      story: { ...content.story, ...storySectionForm },
    };
    setContent(next);
    void persistSections(next, "Story section updated.");
    setStorySectionModalOpen(false);
  }

  function openWhatWeDoSectionModal() {
    setWhatWeDoSectionForm({
      title: content.whatWeDo.title,
      subtitle: content.whatWeDo.subtitle,
      intro: content.whatWeDo.intro,
      image: content.whatWeDo.image,
    });
    setWhatWeDoSectionModalOpen(true);
  }

  function saveWhatWeDoSection() {
    const next = {
      ...content,
      whatWeDo: { ...content.whatWeDo, ...whatWeDoSectionForm },
    };
    setContent(next);
    void persistSections(next, "What we do section updated.");
    setWhatWeDoSectionModalOpen(false);
  }

  function openAddEcosystemItem() {
    setEditEcosystemIndex(null);
    setEcosystemText("");
    setEcosystemModalOpen(true);
  }

  function openEditEcosystemItem(index) {
    setEditEcosystemIndex(index);
    setEcosystemText(content.whatWeDo.ecosystemItems[index] ?? "");
    setEcosystemModalOpen(true);
  }

  function saveEcosystemItem() {
    const text = ecosystemText.trim();
    if (!text) return;

    setContent((prev) => {
      const ecosystemItems =
        editEcosystemIndex === null
          ? [...prev.whatWeDo.ecosystemItems, text]
          : prev.whatWeDo.ecosystemItems.map((item, i) =>
              i === editEcosystemIndex ? text : item,
            );
      const next = {
        ...prev,
        whatWeDo: { ...prev.whatWeDo, ecosystemItems },
      };
      void persistSections(
        next,
        editEcosystemIndex === null ? "Ecosystem item added." : "Ecosystem item updated.",
      );
      return next;
    });
    setEcosystemModalOpen(false);
    setEditEcosystemIndex(null);
  }

  function openTechnologyModal() {
    setTechnologyForm({ ...content.technology });
    setTechnologyModalOpen(true);
  }

  function saveTechnology() {
    const next = { ...content, technology: { ...technologyForm } };
    setContent(next);
    void persistSections(next, "Technology section updated.");
    setTechnologyModalOpen(false);
  }

  function openCtaModal() {
    setCtaForm({ ...content.cta });
    setCtaModalOpen(true);
  }

  function saveCta() {
    const next = { ...content, cta: { ...ctaForm } };
    setContent(next);
    void persistSections(next, "Call to action updated.");
    setCtaModalOpen(false);
  }

  function renderParagraphList(section, paragraphs, deleteType, minCount) {
    const sectionLabel =
      section === "mission" ? "Mission" : section === "vision" ? "Vision" : "Story";

    return (
      <>
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className={labelClass}>Paragraphs</p>
          <button type="button" onClick={() => openAddParagraph(section)} className={btnPrimary}>
            <Plus className="h-3.5 w-3.5" />
            Add paragraph
          </button>
        </div>
        <div className="space-y-3">
          {paragraphs.map((paragraph, index) => (
            <div
              key={`${section}-paragraph-${index}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                  {sectionLabel} paragraph {index + 1}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditParagraph(section, index)}
                    className={btnOutline}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      openDeleteConfirm(
                        deleteType,
                        index,
                        `${sectionLabel} paragraph ${index + 1}`,
                      )
                    }
                    disabled={paragraphs.length <= minCount}
                    className={btnDanger}
                    title={
                      paragraphs.length <= minCount ? "Keep at least one paragraph" : "Delete"
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
              <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{paragraph}</p>
            </div>
          ))}
        </div>
      </>
    );
  }

  const paragraphSectionLabel =
    paragraphSection === "mission"
      ? "Mission"
      : paragraphSection === "vision"
        ? "Vision"
        : paragraphSection === "story"
          ? "Story"
          : "";

  const deleteParagraphMinCount =
    deleteTarget?.type === "missionParagraph"
      ? missionParagraphCount
      : deleteTarget?.type === "visionParagraph"
        ? visionParagraphCount
        : deleteTarget?.type === "storyParagraph"
          ? storyParagraphCount
          : 0;

  if (loading) {
    return <p className="text-slate-500">Loading about page…</p>;
  }

  if (!page) {
    return (
      <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
        {error || "Page not found"}
      </div>
    );
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
        <a
          href={`${import.meta.env.VITE_FRONTEND_URL ?? "http://localhost:3000"}${page.path}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-[#0088FF] hover:text-[#0088FF]"
        >
          Preview
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <p className="text-sm font-medium text-slate-700">
          {missionParagraphCount} mission · {visionParagraphCount} vision · {storyParagraphCount}{" "}
          story paragraphs · {highlightCount} highlights · {ecosystemCount} ecosystem items
          {saving ? <span className="ml-2 text-[#0088FF]">Saving…</span> : null}
        </p>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => {
              const next = e.target.checked;
              setPublished(next);
              void persistSections(content, next ? "Page published." : "Page unpublished.", next);
            }}
            className="h-4 w-4 rounded border-slate-300 text-[#0088FF]"
          />
          Published
        </label>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      ) : null}
      {success ? (
        <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>
      ) : null}

      <div className="mt-6 space-y-4">
        {/* Hero */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF6FF]">
                <ImageIcon className="h-4 w-4 text-[#0088FF]" />
              </div>
              <p className="text-sm font-semibold text-[#050A13]">Hero banner</p>
            </div>
            <button type="button" onClick={openHeroModal} className={btnOutline}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>
          <div className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
            <PreviewRow label="Title" value={content.hero.title} />
            <PreviewRow label="Tagline" value={content.hero.tagline} />
            <div className="sm:col-span-2">
              <PreviewRow label="Description" value={content.hero.description} multiline />
            </div>
            <PreviewRow label="Image" value={content.hero.image} />
            <PreviewRow
              label="Primary button"
              value={`${content.hero.primaryCtaText} → ${content.hero.primaryCtaLink}`}
            />
            <PreviewRow
              label="Secondary button"
              value={`${content.hero.secondaryCtaText} → ${content.hero.secondaryCtaLink}`}
            />
          </div>
        </div>

        {/* Mission */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF6FF]">
                <Target className="h-4 w-4 text-[#0088FF]" />
              </div>
              <p className="text-sm font-semibold text-[#050A13]">Our mission</p>
            </div>
            <button type="button" onClick={openMissionSectionModal} className={btnOutline}>
              <Pencil className="h-3.5 w-3.5" />
              Edit section
            </button>
          </div>
          <div className="mb-4 grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
            <PreviewRow label="Title" value={content.mission.title} />
            <PreviewRow label="Subtitle" value={content.mission.subtitle} />
            <PreviewRow label="Image" value={content.mission.image} />
          </div>
          {renderParagraphList(
            "mission",
            content.mission.paragraphs,
            "missionParagraph",
            1,
          )}
        </div>

        {/* Vision */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF6FF]">
                <Eye className="h-4 w-4 text-[#0088FF]" />
              </div>
              <p className="text-sm font-semibold text-[#050A13]">Our vision</p>
            </div>
            <button type="button" onClick={openVisionSectionModal} className={btnOutline}>
              <Pencil className="h-3.5 w-3.5" />
              Edit section
            </button>
          </div>
          <div className="mb-4 grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
            <PreviewRow label="Title" value={content.vision.title} />
            <PreviewRow label="Subtitle" value={content.vision.subtitle} />
            <PreviewRow label="Image" value={content.vision.image} />
          </div>
          {renderParagraphList("vision", content.vision.paragraphs, "visionParagraph", 1)}

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#050A13]">Vision card</p>
              <button type="button" onClick={openVisionCardModal} className={btnOutline}>
                <Pencil className="h-3.5 w-3.5" />
                Edit card
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <PreviewRow label="Badge" value={content.vision.card.badge} />
              <PreviewRow label="Card title" value={content.vision.card.title} />
              <div className="sm:col-span-2">
                <PreviewRow label="Card subtitle" value={content.vision.card.subtitle} multiline />
              </div>
            </div>

            <div className="mt-4 mb-3 flex items-center justify-between gap-2">
              <p className={labelClass}>Highlights</p>
              <button type="button" onClick={openAddHighlight} className={btnPrimary}>
                <Plus className="h-3.5 w-3.5" />
                Add highlight
              </button>
            </div>
            <ul className="space-y-2">
              {content.vision.card.highlights.map((highlight, index) => (
                <li
                  key={`highlight-${index}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <span className="flex-1 text-sm font-medium text-[#050A13]">
                    {highlight.line1}
                    {highlight.line2 ? ` · ${highlight.line2}` : ""}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditHighlight(index)}
                      className={btnOutline}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openDeleteConfirm(
                          "highlight",
                          index,
                          `${highlight.line1} ${highlight.line2}`.trim(),
                        )
                      }
                      className={btnDanger}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Story */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF6FF]">
                <BookOpen className="h-4 w-4 text-[#0088FF]" />
              </div>
              <p className="text-sm font-semibold text-[#050A13]">Our story</p>
            </div>
            <button type="button" onClick={openStorySectionModal} className={btnOutline}>
              <Pencil className="h-3.5 w-3.5" />
              Edit section
            </button>
          </div>
          <div className="mb-4 grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
            <PreviewRow label="Title" value={content.story.title} />
            <PreviewRow label="Subtitle" value={content.story.subtitle} />
            <PreviewRow label="Image" value={content.story.image} />
          </div>
          {renderParagraphList("story", content.story.paragraphs, "storyParagraph", 1)}
        </div>

        {/* What we do */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF6FF]">
                <Layers className="h-4 w-4 text-[#0088FF]" />
              </div>
              <p className="text-sm font-semibold text-[#050A13]">What we do</p>
            </div>
            <button type="button" onClick={openWhatWeDoSectionModal} className={btnOutline}>
              <Pencil className="h-3.5 w-3.5" />
              Edit section
            </button>
          </div>
          <div className="mb-4 grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
            <PreviewRow label="Title" value={content.whatWeDo.title} />
            <PreviewRow label="Subtitle" value={content.whatWeDo.subtitle} />
            <div className="sm:col-span-2">
              <PreviewRow label="Intro" value={content.whatWeDo.intro} multiline />
            </div>
            <PreviewRow label="Image" value={content.whatWeDo.image} />
          </div>

          <div className="mb-3 flex items-center justify-between gap-2">
            <p className={labelClass}>Ecosystem items</p>
            <button type="button" onClick={openAddEcosystemItem} className={btnPrimary}>
              <Plus className="h-3.5 w-3.5" />
              Add item
            </button>
          </div>
          <ul className="space-y-2">
            {content.whatWeDo.ecosystemItems.map((item, index) => (
              <li
                key={`ecosystem-${index}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <span className="flex-1 text-sm font-medium text-[#050A13]">{item}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditEcosystemItem(index)}
                    className={btnOutline}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteConfirm("ecosystemItem", index, item)}
                    className={btnDanger}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Technology */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF6FF]">
                <Cpu className="h-4 w-4 text-[#0088FF]" />
              </div>
              <p className="text-sm font-semibold text-[#050A13]">Technology & innovation</p>
            </div>
            <button type="button" onClick={openTechnologyModal} className={btnOutline}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>
          <div className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
            <PreviewRow label="Title" value={content.technology.title} />
            <PreviewRow label="Subtitle" value={content.technology.subtitle} />
            <div className="sm:col-span-2">
              <PreviewRow label="Body" value={content.technology.body} multiline />
            </div>
            <PreviewRow label="Image" value={content.technology.image} />
            <PreviewRow label="Image badge" value={content.technology.imageBadge} />
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF6FF]">
                <Megaphone className="h-4 w-4 text-[#0088FF]" />
              </div>
              <p className="text-sm font-semibold text-[#050A13]">Bottom call to action</p>
            </div>
            <button type="button" onClick={openCtaModal} className={btnOutline}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
          </div>
          <div className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
            <PreviewRow label="Title" value={content.cta.title} />
            <PreviewRow label="Image" value={content.cta.image} />
            <div className="sm:col-span-2">
              <PreviewRow label="Description" value={content.cta.description} multiline />
            </div>
            <PreviewRow
              label="Primary button"
              value={`${content.cta.primaryCtaText} → ${content.cta.primaryCtaLink}`}
            />
            <PreviewRow
              label="Secondary button"
              value={`${content.cta.secondaryCtaText} → ${content.cta.secondaryCtaLink}`}
            />
          </div>
        </div>
      </div>

      {/* Hero modal */}
      <Modal
        open={heroModalOpen}
        title="Edit hero banner"
        onClose={() => setHeroModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setHeroModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveHero}
              disabled={saving}
              className="rounded-lg bg-[#0088FF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Update
            </button>
          </>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className={labelClass}>Title</span>
            <input
              value={heroForm.title}
              onChange={(e) => setHeroForm((p) => ({ ...p, title: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Tagline</span>
            <input
              value={heroForm.tagline}
              onChange={(e) => setHeroForm((p) => ({ ...p, tagline: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Description</span>
            <textarea
              value={heroForm.description}
              onChange={(e) => setHeroForm((p) => ({ ...p, description: e.target.value }))}
              className={inputClass}
              rows={5}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Image path</span>
            <input
              value={heroForm.image}
              onChange={(e) => setHeroForm((p) => ({ ...p, image: e.target.value }))}
              className={inputClass}
              placeholder="/your-image.png"
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Primary button text</span>
            <input
              value={heroForm.primaryCtaText}
              onChange={(e) => setHeroForm((p) => ({ ...p, primaryCtaText: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Primary button link</span>
            <input
              value={heroForm.primaryCtaLink}
              onChange={(e) => setHeroForm((p) => ({ ...p, primaryCtaLink: e.target.value }))}
              className={inputClass}
              placeholder="/contact"
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Secondary button text</span>
            <input
              value={heroForm.secondaryCtaText}
              onChange={(e) => setHeroForm((p) => ({ ...p, secondaryCtaText: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Secondary button link</span>
            <input
              value={heroForm.secondaryCtaLink}
              onChange={(e) => setHeroForm((p) => ({ ...p, secondaryCtaLink: e.target.value }))}
              className={inputClass}
              placeholder="/contact"
            />
          </label>
        </div>
      </Modal>

      {/* Mission section modal */}
      <Modal
        open={missionSectionModalOpen}
        title="Edit mission section"
        onClose={() => setMissionSectionModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setMissionSectionModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveMissionSection}
              disabled={saving}
              className="rounded-lg bg-[#0088FF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Update
            </button>
          </>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className={labelClass}>Title</span>
            <input
              value={missionSectionForm.title}
              onChange={(e) => setMissionSectionForm((p) => ({ ...p, title: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Subtitle</span>
            <input
              value={missionSectionForm.subtitle}
              onChange={(e) => setMissionSectionForm((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Image path</span>
            <input
              value={missionSectionForm.image}
              onChange={(e) => setMissionSectionForm((p) => ({ ...p, image: e.target.value }))}
              className={inputClass}
              placeholder="/your-image.png"
            />
          </label>
        </div>
      </Modal>

      {/* Vision section modal */}
      <Modal
        open={visionSectionModalOpen}
        title="Edit vision section"
        onClose={() => setVisionSectionModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setVisionSectionModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveVisionSection}
              disabled={saving}
              className="rounded-lg bg-[#0088FF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Update
            </button>
          </>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className={labelClass}>Title</span>
            <input
              value={visionSectionForm.title}
              onChange={(e) => setVisionSectionForm((p) => ({ ...p, title: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Subtitle</span>
            <input
              value={visionSectionForm.subtitle}
              onChange={(e) => setVisionSectionForm((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Image path</span>
            <input
              value={visionSectionForm.image}
              onChange={(e) => setVisionSectionForm((p) => ({ ...p, image: e.target.value }))}
              className={inputClass}
              placeholder="/your-image.png"
            />
          </label>
        </div>
      </Modal>

      {/* Vision card modal */}
      <Modal
        open={visionCardModalOpen}
        title="Edit vision card"
        onClose={() => setVisionCardModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setVisionCardModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveVisionCard}
              disabled={saving}
              className="rounded-lg bg-[#0088FF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Update
            </button>
          </>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className={labelClass}>Badge</span>
            <input
              value={visionCardForm.badge}
              onChange={(e) => setVisionCardForm((p) => ({ ...p, badge: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Card title</span>
            <input
              value={visionCardForm.title}
              onChange={(e) => setVisionCardForm((p) => ({ ...p, title: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Card subtitle</span>
            <textarea
              value={visionCardForm.subtitle}
              onChange={(e) => setVisionCardForm((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
              rows={3}
            />
          </label>
        </div>
      </Modal>

      {/* Story section modal */}
      <Modal
        open={storySectionModalOpen}
        title="Edit story section"
        onClose={() => setStorySectionModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setStorySectionModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveStorySection}
              disabled={saving}
              className="rounded-lg bg-[#0088FF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Update
            </button>
          </>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className={labelClass}>Title</span>
            <input
              value={storySectionForm.title}
              onChange={(e) => setStorySectionForm((p) => ({ ...p, title: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Subtitle</span>
            <input
              value={storySectionForm.subtitle}
              onChange={(e) => setStorySectionForm((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Image path</span>
            <input
              value={storySectionForm.image}
              onChange={(e) => setStorySectionForm((p) => ({ ...p, image: e.target.value }))}
              className={inputClass}
              placeholder="/your-image.png"
            />
          </label>
        </div>
      </Modal>

      {/* What we do section modal */}
      <Modal
        open={whatWeDoSectionModalOpen}
        title="Edit what we do section"
        onClose={() => setWhatWeDoSectionModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setWhatWeDoSectionModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveWhatWeDoSection}
              disabled={saving}
              className="rounded-lg bg-[#0088FF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Update
            </button>
          </>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className={labelClass}>Title</span>
            <input
              value={whatWeDoSectionForm.title}
              onChange={(e) => setWhatWeDoSectionForm((p) => ({ ...p, title: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Subtitle</span>
            <input
              value={whatWeDoSectionForm.subtitle}
              onChange={(e) =>
                setWhatWeDoSectionForm((p) => ({ ...p, subtitle: e.target.value }))
              }
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Intro</span>
            <textarea
              value={whatWeDoSectionForm.intro}
              onChange={(e) => setWhatWeDoSectionForm((p) => ({ ...p, intro: e.target.value }))}
              className={inputClass}
              rows={4}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Image path</span>
            <input
              value={whatWeDoSectionForm.image}
              onChange={(e) => setWhatWeDoSectionForm((p) => ({ ...p, image: e.target.value }))}
              className={inputClass}
              placeholder="/your-image.png"
            />
          </label>
        </div>
      </Modal>

      {/* Technology modal */}
      <Modal
        open={technologyModalOpen}
        title="Edit technology section"
        onClose={() => setTechnologyModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setTechnologyModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveTechnology}
              disabled={saving}
              className="rounded-lg bg-[#0088FF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Update
            </button>
          </>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className={labelClass}>Title</span>
            <input
              value={technologyForm.title}
              onChange={(e) => setTechnologyForm((p) => ({ ...p, title: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Subtitle</span>
            <input
              value={technologyForm.subtitle}
              onChange={(e) => setTechnologyForm((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Body</span>
            <textarea
              value={technologyForm.body}
              onChange={(e) => setTechnologyForm((p) => ({ ...p, body: e.target.value }))}
              className={inputClass}
              rows={6}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Image path</span>
            <input
              value={technologyForm.image}
              onChange={(e) => setTechnologyForm((p) => ({ ...p, image: e.target.value }))}
              className={inputClass}
              placeholder="/your-image.png"
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Image badge</span>
            <input
              value={technologyForm.imageBadge}
              onChange={(e) => setTechnologyForm((p) => ({ ...p, imageBadge: e.target.value }))}
              className={inputClass}
              placeholder="AI-Powered Platform"
            />
          </label>
        </div>
      </Modal>

      {/* CTA modal */}
      <Modal
        open={ctaModalOpen}
        title="Edit call to action"
        onClose={() => setCtaModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setCtaModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveCta}
              disabled={saving}
              className="rounded-lg bg-[#0088FF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Update
            </button>
          </>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className={labelClass}>Title</span>
            <input
              value={ctaForm.title}
              onChange={(e) => setCtaForm((p) => ({ ...p, title: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Description</span>
            <textarea
              value={ctaForm.description}
              onChange={(e) => setCtaForm((p) => ({ ...p, description: e.target.value }))}
              className={inputClass}
              rows={3}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Image path</span>
            <input
              value={ctaForm.image}
              onChange={(e) => setCtaForm((p) => ({ ...p, image: e.target.value }))}
              className={inputClass}
              placeholder="/your-image.png"
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Primary button text</span>
            <input
              value={ctaForm.primaryCtaText}
              onChange={(e) => setCtaForm((p) => ({ ...p, primaryCtaText: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Primary button link</span>
            <input
              value={ctaForm.primaryCtaLink}
              onChange={(e) => setCtaForm((p) => ({ ...p, primaryCtaLink: e.target.value }))}
              className={inputClass}
              placeholder="/contact"
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Secondary button text</span>
            <input
              value={ctaForm.secondaryCtaText}
              onChange={(e) => setCtaForm((p) => ({ ...p, secondaryCtaText: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Secondary button link</span>
            <input
              value={ctaForm.secondaryCtaLink}
              onChange={(e) => setCtaForm((p) => ({ ...p, secondaryCtaLink: e.target.value }))}
              className={inputClass}
              placeholder="/contact"
            />
          </label>
        </div>
      </Modal>

      {/* Paragraph modal */}
      <Modal
        open={paragraphModalOpen}
        title={
          editParagraphIndex === null
            ? `Add ${paragraphSectionLabel} paragraph`
            : `Edit ${paragraphSectionLabel} paragraph`
        }
        onClose={() => setParagraphModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setParagraphModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveParagraph}
              disabled={saving || !paragraphText.trim()}
              className="rounded-lg bg-[#0088FF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {editParagraphIndex === null ? "Add" : "Update"}
            </button>
          </>
        }
      >
        <textarea
          value={paragraphText}
          onChange={(e) => setParagraphText(e.target.value)}
          className={inputClass}
          rows={5}
          placeholder="Paragraph text"
        />
      </Modal>

      {/* Highlight modal */}
      <Modal
        open={highlightModalOpen}
        title={editHighlightIndex === null ? "Add highlight" : "Edit highlight"}
        onClose={() => setHighlightModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setHighlightModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveHighlight}
              disabled={saving}
              className="rounded-lg bg-[#0088FF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {editHighlightIndex === null ? "Add" : "Update"}
            </button>
          </>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className={labelClass}>Line 1</span>
            <input
              value={highlightForm.line1}
              onChange={(e) => setHighlightForm((p) => ({ ...p, line1: e.target.value }))}
              className={inputClass}
              placeholder="AI-Driven"
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Line 2</span>
            <input
              value={highlightForm.line2}
              onChange={(e) => setHighlightForm((p) => ({ ...p, line2: e.target.value }))}
              className={inputClass}
              placeholder="Operations"
            />
          </label>
        </div>
      </Modal>

      {/* Ecosystem item modal */}
      <Modal
        open={ecosystemModalOpen}
        title={editEcosystemIndex === null ? "Add ecosystem item" : "Edit ecosystem item"}
        onClose={() => setEcosystemModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEcosystemModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveEcosystemItem}
              disabled={saving || !ecosystemText.trim()}
              className="rounded-lg bg-[#0088FF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {editEcosystemIndex === null ? "Add" : "Update"}
            </button>
          </>
        }
      >
        <input
          value={ecosystemText}
          onChange={(e) => setEcosystemText(e.target.value)}
          className={inputClass}
          placeholder="Ecosystem item label"
        />
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={deleteModalOpen}
        title="Delete item?"
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteTarget(null);
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={
                saving ||
                (deleteTarget?.type?.endsWith("Paragraph") && deleteParagraphMinCount <= 1)
              }
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Remove <strong className="text-[#050A13]">{deleteTarget?.label}</strong>? This saves
          immediately and updates the live about page.
        </p>
      </Modal>
    </div>
  );
}
