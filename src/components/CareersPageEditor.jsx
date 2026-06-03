import { useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  Plus,
  Trash2,
  Pencil,
  ImageIcon,
  Megaphone,
  Sparkles,
  ListChecks,
  ClipboardList,
} from "lucide-react";
import { api } from "../lib/api";
import { DEFAULT_CAREERS_SECTIONS, mergeCareersSections } from "../constants/careersDefaults.js";

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
        aria-labelledby="careers-modal-title"
      >
        <h3 id="careers-modal-title" className="text-lg font-semibold text-[#050A13]">
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

export default function CareersPageEditor() {
  const slug = "careers";
  const [page, setPage] = useState(null);
  const [content, setContent] = useState(DEFAULT_CAREERS_SECTIONS);
  const [published, setPublished] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [buildingModalOpen, setBuildingModalOpen] = useState(false);
  const [paragraphModalOpen, setParagraphModalOpen] = useState(false);
  const [whyJoinModalOpen, setWhyJoinModalOpen] = useState(false);
  const [ctaModalOpen, setCtaModalOpen] = useState(false);
  const [openPositionsModalOpen, setOpenPositionsModalOpen] = useState(false);
  const [jobPostModalOpen, setJobPostModalOpen] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [editParagraphIndex, setEditParagraphIndex] = useState(null);
  const [editJobPostIndex, setEditJobPostIndex] = useState(null);
  const [editReasonIndex, setEditReasonIndex] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [heroForm, setHeroForm] = useState(DEFAULT_CAREERS_SECTIONS.hero);
  const [buildingForm, setBuildingForm] = useState(DEFAULT_CAREERS_SECTIONS.building);
  const [paragraphText, setParagraphText] = useState("");
  const [whyJoinForm, setWhyJoinForm] = useState(DEFAULT_CAREERS_SECTIONS.whyJoin);
  const [ctaForm, setCtaForm] = useState(DEFAULT_CAREERS_SECTIONS.cta);
  const [openPositionsForm, setOpenPositionsForm] = useState(DEFAULT_CAREERS_SECTIONS.openPositions);
  const [jobPostForm, setJobPostForm] = useState({
    title: "",
    department: "",
    location: "",
    employmentType: "",
    description: "",
    applyLabel: "Apply Now",
    applyMode: "form",
    applyLink: "/contact",
  });
  const [reasonText, setReasonText] = useState("");

  const jobPostCount = content.openPositions?.posts?.length ?? 0;
  const reasonCount = content.whyJoin.reasons.length;
  const paragraphCount = content.building.paragraphs.length;

  const buildingTitlePreview = useMemo(() => {
    const lines = (content.building.title ?? "").split("\n");
    return lines.join(" · ");
  }, [content.building.title]);

  useEffect(() => {
    document.title = "Careers — HalaPark Admin";
    setLoading(true);
    api
      .getPage(slug)
      .then((data) => {
        setPage(data.page);
        setContent(mergeCareersSections(data.page.sections));
        setPublished(data.page.published ?? true);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function persistSections(nextContent, successMessage = "Saved.") {
    const { eyebrow: _removed, ...hero } = nextContent.hero ?? {};
    const sections = {
      hero,
      building: nextContent.building,
      opportunities: nextContent.opportunities,
      openPositions: nextContent.openPositions,
      whyJoin: nextContent.whyJoin,
      cta: nextContent.cta,
    };

    try {
      setSaving(true);
      setError("");
      const data = await api.updatePage(slug, { sections, published });
      setPage(data.page);
      setContent(mergeCareersSections(data.page.sections));
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

    if (type === "paragraph" && paragraphCount > 1) {
      setContent((prev) => {
        const next = {
          ...prev,
          building: {
            ...prev.building,
            paragraphs: prev.building.paragraphs.filter((_, i) => i !== index),
          },
        };
        void persistSections(next, "Paragraph deleted.");
        return next;
      });
    } else if (type === "jobPost") {
      setContent((prev) => {
        const next = {
          ...prev,
          openPositions: {
            ...prev.openPositions,
            posts: prev.openPositions.posts.filter((_, i) => i !== index),
          },
        };
        void persistSections(next, "Job post deleted.");
        return next;
      });
    } else if (type === "reason") {
      setContent((prev) => {
        const next = {
          ...prev,
          whyJoin: {
            ...prev.whyJoin,
            reasons: prev.whyJoin.reasons.filter((_, i) => i !== index),
          },
        };
        void persistSections(next, "Reason deleted.");
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
    const hero = {
      title: heroForm.title,
      description: heroForm.description,
      image: heroForm.image,
    };
    const next = { ...content, hero };
    setContent(next);
    void persistSections(next, "Hero updated.");
    setHeroModalOpen(false);
  }

  function openBuildingModal() {
    setBuildingForm({ ...content.building });
    setBuildingModalOpen(true);
  }

  function saveBuilding() {
    const next = { ...content, building: { ...buildingForm } };
    setContent(next);
    void persistSections(next, "Section title updated.");
    setBuildingModalOpen(false);
  }

  function openAddParagraph() {
    setEditParagraphIndex(null);
    setParagraphText("");
    setParagraphModalOpen(true);
  }

  function openEditParagraph(index) {
    setEditParagraphIndex(index);
    setParagraphText(content.building.paragraphs[index] ?? "");
    setParagraphModalOpen(true);
  }

  function saveParagraph() {
    const text = paragraphText.trim();
    if (!text) return;

    setContent((prev) => {
      const paragraphs =
        editParagraphIndex === null
          ? [...prev.building.paragraphs, text]
          : prev.building.paragraphs.map((p, i) => (i === editParagraphIndex ? text : p));
      const next = { ...prev, building: { ...prev.building, paragraphs } };
      void persistSections(
        next,
        editParagraphIndex === null ? "Paragraph added." : "Paragraph updated.",
      );
      return next;
    });
    setParagraphModalOpen(false);
    setEditParagraphIndex(null);
  }

  function openOpenPositionsModal() {
    setOpenPositionsForm({
      title: content.openPositions?.title ?? "",
      subtitle: content.openPositions?.subtitle ?? "",
    });
    setOpenPositionsModalOpen(true);
  }

  function saveOpenPositionsSection() {
    const next = {
      ...content,
      openPositions: {
        ...content.openPositions,
        title: openPositionsForm.title.trim() || "Open Positions",
        subtitle: openPositionsForm.subtitle.trim(),
      },
    };
    setContent(next);
    void persistSections(next, "Open positions section updated.");
    setOpenPositionsModalOpen(false);
  }

  function openAddJobPost() {
    setEditJobPostIndex(null);
    setJobPostForm({
      title: "",
      department: "",
      location: "",
      employmentType: "",
      description: "",
      applyLabel: "Apply Now",
      applyMode: "form",
      applyLink: "/contact",
    });
    setJobPostModalOpen(true);
  }

  function openEditJobPost(index) {
    const item = content.openPositions?.posts?.[index];
    if (!item) return;
    setEditJobPostIndex(index);
    setJobPostForm({
      title: item.title ?? "",
      department: item.department ?? "",
      location: item.location ?? "",
      employmentType: item.employmentType ?? "",
      description: item.description ?? "",
      applyLabel: item.applyLabel ?? "Apply Now",
      applyMode: item.applyMode ?? "link",
      applyLink: item.applyLink ?? "/contact",
    });
    setJobPostModalOpen(true);
  }

  function saveJobPost() {
    const item = {
      title: jobPostForm.title.trim() || "New position",
      department: jobPostForm.department.trim(),
      location: jobPostForm.location.trim(),
      employmentType: jobPostForm.employmentType.trim(),
      description: jobPostForm.description.trim(),
      applyLabel: jobPostForm.applyLabel.trim() || "Apply Now",
      applyMode: jobPostForm.applyMode === "form" ? "form" : "link",
      applyLink: jobPostForm.applyLink.trim() || "/contact",
    };

    setContent((prev) => {
      const posts =
        editJobPostIndex === null
          ? [...(prev.openPositions?.posts ?? []), item]
          : (prev.openPositions?.posts ?? []).map((p, i) => (i === editJobPostIndex ? item : p));
      const next = {
        ...prev,
        openPositions: { ...prev.openPositions, posts },
      };
      void persistSections(
        next,
        editJobPostIndex === null ? "Job post added." : "Job post updated.",
      );
      return next;
    });
    setJobPostModalOpen(false);
    setEditJobPostIndex(null);
  }

  function openWhyJoinModal() {
    setWhyJoinForm({
      title: content.whyJoin.title,
      subtitle: content.whyJoin.subtitle,
      bodyParagraph: content.whyJoin.bodyParagraph,
      reasons: content.whyJoin.reasons,
    });
    setWhyJoinModalOpen(true);
  }

  function saveWhyJoinSection() {
    const next = {
      ...content,
      whyJoin: {
        ...content.whyJoin,
        title: whyJoinForm.title,
        subtitle: whyJoinForm.subtitle,
        bodyParagraph: whyJoinForm.bodyParagraph,
      },
    };
    setContent(next);
    void persistSections(next, "Why join section updated.");
    setWhyJoinModalOpen(false);
  }

  function openAddReason() {
    setEditReasonIndex(null);
    setReasonText("");
    setReasonModalOpen(true);
  }

  function openEditReason(index) {
    setEditReasonIndex(index);
    setReasonText(content.whyJoin.reasons[index] ?? "");
    setReasonModalOpen(true);
  }

  function saveReason() {
    const text = reasonText.trim();
    if (!text) return;

    setContent((prev) => {
      const reasons =
        editReasonIndex === null
          ? [...prev.whyJoin.reasons, text]
          : prev.whyJoin.reasons.map((r, i) => (i === editReasonIndex ? text : r));
      const next = { ...prev, whyJoin: { ...prev.whyJoin, reasons } };
      void persistSections(
        next,
        editReasonIndex === null ? "Reason added." : "Reason updated.",
      );
      return next;
    });
    setReasonModalOpen(false);
    setEditReasonIndex(null);
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

  if (loading) {
    return <p className="text-slate-500">Loading careers page…</p>;
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
          href={`http://localhost:3000${page.path}`}
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
          {jobPostCount} job posts · {paragraphCount} paragraphs · {reasonCount} reasons
          {saving ? <span className="ml-2 text-[#0088FF]">Saving…</span> : null}
        </p>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => {
              const next = e.target.checked;
              setPublished(next);
              void persistSections(content, next ? "Page published." : "Page unpublished.");
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
            <PreviewRow label="Headline" value={content.hero.title} />
            <div className="sm:col-span-2">
              <PreviewRow label="Description" value={content.hero.description} multiline />
            </div>
            <PreviewRow label="Background image" value={content.hero.image} />
          </div>
        </div>

        {/* Building */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF6FF]">
                <Sparkles className="h-4 w-4 text-[#0088FF]" />
              </div>
              <p className="text-sm font-semibold text-[#050A13]">Building smarter mobility</p>
            </div>
            <button type="button" onClick={openBuildingModal} className={btnOutline}>
              <Pencil className="h-3.5 w-3.5" />
              Edit title
            </button>
          </div>
          <p className="mb-4 text-sm text-slate-600">{buildingTitlePreview}</p>

          <div className="mb-3 flex items-center justify-between gap-2">
            <p className={labelClass}>Paragraphs</p>
            <button type="button" onClick={openAddParagraph} className={btnPrimary}>
              <Plus className="h-3.5 w-3.5" />
              Add paragraph
            </button>
          </div>
          <div className="space-y-3">
            {content.building.paragraphs.map((paragraph, index) => (
              <div
                key={`paragraph-${index}`}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                    Paragraph {index + 1}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditParagraph(index)}
                      className={btnOutline}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openDeleteConfirm(
                          "paragraph",
                          index,
                          `Paragraph ${index + 1}`,
                        )
                      }
                      disabled={paragraphCount <= 1}
                      className={btnDanger}
                      title={paragraphCount <= 1 ? "Keep at least one paragraph" : "Delete"}
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
        </div>

        {/* Open positions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF6FF]">
                <ClipboardList className="h-4 w-4 text-[#0088FF]" />
              </div>
              <p className="text-sm font-semibold text-[#050A13]">Open Positions</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={openOpenPositionsModal} className={btnOutline}>
                <Pencil className="h-3.5 w-3.5" />
                Edit section
              </button>
              <button type="button" onClick={openAddJobPost} className={btnPrimary}>
                <Plus className="h-3.5 w-3.5" />
                Add job post
              </button>
            </div>
          </div>
          <div className="mb-4 grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
            <PreviewRow label="Section title" value={content.openPositions?.title} />
            <PreviewRow label="Subtitle" value={content.openPositions?.subtitle} />
          </div>

          {jobPostCount === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              No job posts yet. Add one to show open positions on the careers page.
            </p>
          ) : (
            <div className="space-y-3">
              {content.openPositions.posts.map((post, index) => (
                <div
                  key={`job-${index}-${post.title}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4"
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                        Job {index + 1}
                      </p>
                      <p className="mt-1 font-semibold text-[#050A13]">{post.title}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {post.department ? (
                          <span className="rounded-full bg-[#EEF6FF] px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-[#0088FF]">
                            {post.department}
                          </span>
                        ) : null}
                        {post.employmentType ? (
                          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-slate-600">
                            {post.employmentType}
                          </span>
                        ) : null}
                      </div>
                      {post.location ? (
                        <p className="mt-2 text-xs text-slate-500">{post.location}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditJobPost(index)}
                        className={btnOutline}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteConfirm("jobPost", index, post.title)}
                        className={btnDanger}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                  {post.description ? (
                    <p className="mb-2 line-clamp-3 text-sm leading-relaxed text-slate-500">
                      {post.description}
                    </p>
                  ) : null}
                  <p className="text-xs text-slate-400">
                    {post.applyMode === "form"
                      ? `${post.applyLabel ?? "Apply Now"} → application form`
                      : `${post.applyLabel ?? "Apply Now"} → ${post.applyLink ?? "/contact"}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Why join */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF6FF]">
                <ListChecks className="h-4 w-4 text-[#0088FF]" />
              </div>
              <p className="text-sm font-semibold text-[#050A13]">Why join us</p>
            </div>
            <button type="button" onClick={openWhyJoinModal} className={btnOutline}>
              <Pencil className="h-3.5 w-3.5" />
              Edit section
            </button>
          </div>
          <div className="mb-4 grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <PreviewRow label="Title" value={content.whyJoin.title} />
            <PreviewRow label="Subtitle" value={content.whyJoin.subtitle} />
            <PreviewRow label="Team card text" value={content.whyJoin.bodyParagraph} multiline />
          </div>

          <div className="mb-3 flex items-center justify-between gap-2">
            <p className={labelClass}>Reasons</p>
            <button type="button" onClick={openAddReason} className={btnPrimary}>
              <Plus className="h-3.5 w-3.5" />
              Add reason
            </button>
          </div>
          <ul className="space-y-2">
            {content.whyJoin.reasons.map((reason, index) => (
              <li
                key={`reason-${index}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <span className="flex-1 text-sm font-medium text-[#050A13]">{reason}</span>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEditReason(index)}
                    className={btnOutline}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteConfirm("reason", index, reason)}
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
            <PreviewRow label="Subtitle" value={content.cta.subtitle} />
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
            <span className={labelClass}>Headline</span>
            <input
              value={heroForm.title}
              onChange={(e) => setHeroForm((p) => ({ ...p, title: e.target.value }))}
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
            <span className={labelClass}>Background image path</span>
            <input
              value={heroForm.image}
              onChange={(e) => setHeroForm((p) => ({ ...p, image: e.target.value }))}
              className={inputClass}
              placeholder="/your-image.png"
            />
          </label>
        </div>
      </Modal>

      {/* Building title modal */}
      <Modal
        open={buildingModalOpen}
        title="Edit section title"
        onClose={() => setBuildingModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setBuildingModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveBuilding}
              disabled={saving}
              className="rounded-lg bg-[#0088FF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              Update
            </button>
          </>
        }
      >
        <label className="grid gap-1">
          <span className={labelClass}>Title (press Enter for line break)</span>
          <textarea
            value={buildingForm.title}
            onChange={(e) => setBuildingForm((p) => ({ ...p, title: e.target.value }))}
            className={inputClass}
            rows={3}
          />
        </label>
      </Modal>

      {/* Paragraph modal */}
      <Modal
        open={paragraphModalOpen}
        title={editParagraphIndex === null ? "Add paragraph" : "Edit paragraph"}
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

      {/* Open positions section modal */}
      <Modal
        open={openPositionsModalOpen}
        title="Edit open positions section"
        onClose={() => setOpenPositionsModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpenPositionsModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveOpenPositionsSection}
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
            <span className={labelClass}>Section title</span>
            <input
              value={openPositionsForm.title}
              onChange={(e) => setOpenPositionsForm((p) => ({ ...p, title: e.target.value }))}
              className={inputClass}
              placeholder="Open Positions"
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Subtitle</span>
            <input
              value={openPositionsForm.subtitle}
              onChange={(e) => setOpenPositionsForm((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
              placeholder="Explore our current job openings"
            />
          </label>
        </div>
      </Modal>

      {/* Job post modal */}
      <Modal
        open={jobPostModalOpen}
        title={editJobPostIndex === null ? "Add job post" : "Edit job post"}
        onClose={() => setJobPostModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setJobPostModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveJobPost}
              disabled={saving || !jobPostForm.title.trim()}
              className="rounded-lg bg-[#0088FF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {editJobPostIndex === null ? "Add" : "Update"}
            </button>
          </>
        }
      >
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className={labelClass}>Job title</span>
            <input
              value={jobPostForm.title}
              onChange={(e) => setJobPostForm((p) => ({ ...p, title: e.target.value }))}
              className={inputClass}
              placeholder="e.g. Senior Valet Supervisor"
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Department</span>
            <input
              value={jobPostForm.department}
              onChange={(e) => setJobPostForm((p) => ({ ...p, department: e.target.value }))}
              className={inputClass}
              placeholder="e.g. Operations"
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Location</span>
            <input
              value={jobPostForm.location}
              onChange={(e) => setJobPostForm((p) => ({ ...p, location: e.target.value }))}
              className={inputClass}
              placeholder="e.g. Dubai, UAE"
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Employment type</span>
            <input
              value={jobPostForm.employmentType}
              onChange={(e) => setJobPostForm((p) => ({ ...p, employmentType: e.target.value }))}
              className={inputClass}
              placeholder="e.g. Full-Time"
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Description</span>
            <textarea
              value={jobPostForm.description}
              onChange={(e) => setJobPostForm((p) => ({ ...p, description: e.target.value }))}
              className={inputClass}
              rows={4}
              placeholder="Brief job description shown on the careers page"
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Apply button text</span>
            <input
              value={jobPostForm.applyLabel}
              onChange={(e) => setJobPostForm((p) => ({ ...p, applyLabel: e.target.value }))}
              className={inputClass}
              placeholder="Apply Now"
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Apply action</span>
            <select
              value={jobPostForm.applyMode}
              onChange={(e) => setJobPostForm((p) => ({ ...p, applyMode: e.target.value }))}
              className={inputClass}
            >
              <option value="form">Open application form (modal)</option>
              <option value="link">Link to URL</option>
            </select>
          </label>
          {jobPostForm.applyMode === "link" ? (
            <label className="grid gap-1">
              <span className={labelClass}>Apply link</span>
              <input
                value={jobPostForm.applyLink}
                onChange={(e) => setJobPostForm((p) => ({ ...p, applyLink: e.target.value }))}
                className={inputClass}
                placeholder="/contact or https://..."
              />
            </label>
          ) : null}
        </div>
      </Modal>

      {/* Why join section modal */}
      <Modal
        open={whyJoinModalOpen}
        title="Edit why join section"
        onClose={() => setWhyJoinModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setWhyJoinModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveWhyJoinSection}
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
              value={whyJoinForm.title}
              onChange={(e) => setWhyJoinForm((p) => ({ ...p, title: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Subtitle</span>
            <input
              value={whyJoinForm.subtitle}
              onChange={(e) => setWhyJoinForm((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Team card paragraph</span>
            <textarea
              value={whyJoinForm.bodyParagraph}
              onChange={(e) => setWhyJoinForm((p) => ({ ...p, bodyParagraph: e.target.value }))}
              className={inputClass}
              rows={4}
            />
          </label>
        </div>
      </Modal>

      {/* Reason modal */}
      <Modal
        open={reasonModalOpen}
        title={editReasonIndex === null ? "Add reason" : "Edit reason"}
        onClose={() => setReasonModalOpen(false)}
        footer={
          <>
            <button
              type="button"
              onClick={() => setReasonModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveReason}
              disabled={saving || !reasonText.trim()}
              className="rounded-lg bg-[#0088FF] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {editReasonIndex === null ? "Add" : "Update"}
            </button>
          </>
        }
      >
        <textarea
          value={reasonText}
          onChange={(e) => setReasonText(e.target.value)}
          className={inputClass}
          rows={4}
          placeholder="Why candidates should join"
        />
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
            <span className={labelClass}>Subtitle</span>
            <input
              value={ctaForm.subtitle}
              onChange={(e) => setCtaForm((p) => ({ ...p, subtitle: e.target.value }))}
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
              placeholder="#open-positions"
            />
          </label>
        </div>
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
              disabled={saving || (deleteTarget?.type === "paragraph" && paragraphCount <= 1)}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              Delete
            </button>
          </>
        }
      >
        <p className="text-sm text-slate-600">
          Remove <strong className="text-[#050A13]">{deleteTarget?.label}</strong>? This saves
          immediately and updates the live careers page.
        </p>
      </Modal>
    </div>
  );
}
