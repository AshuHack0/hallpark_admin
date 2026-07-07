/**
 * About page section skeletons.
 *
 * IMPORTANT: these defaults are STRUCTURAL ONLY — every string is empty and
 * every array is empty. They exist so the editor always has the right object
 * shape to render against. They must NEVER contain real copy: the merge below
 * spreads them under the DB values, so any default text here would "resurrect"
 * inside fields the admin has intentionally cleared, and then get re-saved.
 * The database is the single source of truth for content.
 */
export const DEFAULT_ABOUT_SECTIONS = {
  hero: {
    title: "",
    tagline: "",
    description: "",
    images: [],
    primaryCtaText: "",
    primaryCtaLink: "",
    secondaryCtaText: "",
    secondaryCtaLink: "",
    ar: {},
  },
  mission: {
    title: "",
    subtitle: "",
    paragraphs: [],
    image: "",
    ar: {},
  },
  vision: {
    title: "",
    subtitle: "",
    paragraphs: [],
    image: "",
    card: {
      badge: "",
      title: "",
      subtitle: "",
      highlights: [],
      ar: {},
    },
    ar: {},
  },
  story: {
    title: "",
    subtitle: "",
    paragraphs: [],
    image: "",
    ar: {},
  },
  whatWeDo: {
    title: "",
    subtitle: "",
    intro: "",
    image: "",
    ecosystemItems: [],
    ar: {},
  },
  technology: {
    title: "",
    subtitle: "",
    body: "",
    image: "",
    imageBadge: "",
    ar: {},
  },
  cta: {
    title: "",
    description: "",
    image: "",
    primaryCtaText: "",
    primaryCtaLink: "",
    secondaryCtaText: "",
    secondaryCtaLink: "",
    ar: {},
  },
};

/**
 * Structural merge: normalizes the shape of what the API returns (missing
 * keys become empty strings / empty arrays / empty ar objects) WITHOUT ever
 * injecting default text. Whatever content is in the DB round-trips unchanged
 * — including intentionally cleared (empty) fields and empty arrays. Section
 * flags such as `enabled` pass straight through via the spreads.
 */
export function mergeAboutSections(sections) {
  const base = structuredClone(DEFAULT_ABOUT_SECTIONS);
  if (!sections) return base;

  return {
    hero: {
      ...base.hero,
      ...(sections.hero || {}),
      images: Array.isArray(sections.hero?.images) ? sections.hero.images : [],
      ar: { ...(sections.hero?.ar || {}) },
    },
    mission: {
      ...base.mission,
      ...(sections.mission || {}),
      paragraphs: Array.isArray(sections.mission?.paragraphs)
        ? sections.mission.paragraphs
        : [],
      ar: { ...(sections.mission?.ar || {}) },
    },
    vision: {
      ...base.vision,
      ...(sections.vision || {}),
      paragraphs: Array.isArray(sections.vision?.paragraphs)
        ? sections.vision.paragraphs
        : [],
      card: {
        ...base.vision.card,
        ...(sections.vision?.card || {}),
        highlights: Array.isArray(sections.vision?.card?.highlights)
          ? sections.vision.card.highlights
          : [],
        ar: { ...(sections.vision?.card?.ar || {}) },
      },
      ar: { ...(sections.vision?.ar || {}) },
    },
    story: {
      ...base.story,
      ...(sections.story || {}),
      paragraphs: Array.isArray(sections.story?.paragraphs)
        ? sections.story.paragraphs
        : [],
      ar: { ...(sections.story?.ar || {}) },
    },
    whatWeDo: {
      ...base.whatWeDo,
      ...(sections.whatWeDo || {}),
      ecosystemItems: Array.isArray(sections.whatWeDo?.ecosystemItems)
        ? sections.whatWeDo.ecosystemItems
        : [],
      ar: { ...(sections.whatWeDo?.ar || {}) },
    },
    technology: {
      ...base.technology,
      ...(sections.technology || {}),
      ar: { ...(sections.technology?.ar || {}) },
    },
    cta: {
      ...base.cta,
      ...(sections.cta || {}),
      ar: { ...(sections.cta?.ar || {}) },
    },
  };
}
