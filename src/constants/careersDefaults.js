/**
 * Careers page section skeletons.
 *
 * IMPORTANT: these defaults are STRUCTURAL ONLY — every string is empty and
 * every array is empty. They exist so the editor always has the right object
 * shape to render against. They must NEVER contain real copy: the merge below
 * spreads them under the DB values, so any default text here would "resurrect"
 * inside fields the admin has intentionally cleared, and then get re-saved.
 * The database is the single source of truth for content.
 */
export const DEFAULT_CAREERS_SECTIONS = {
  hero: {
    title: "",
    description: "",
    image: "",
    images: [],
    primaryCta: "",
    secondaryCta: "",
    badges: {
      teamTag: "",
      hiringTitle: "",
      hiringSub: "",
      cultureTag: "",
      cultureTitle: "",
      cultureSub: "",
      ar: {},
    },
    ar: {},
  },
  building: {
    title: "",
    paragraphs: [],
    ar: {},
  },
  opportunities: [],
  opportunitiesHeader: {
    heading: "",
    ar: {},
  },
  openPositions: {
    title: "",
    subtitle: "",
    posts: [],
    ar: {},
  },
  whyJoin: {
    title: "",
    subtitle: "",
    bodyParagraph: "",
    reasons: [],
    ar: {},
  },
  cta: {
    title: "",
    subtitle: "",
    description: "",
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
 * — including intentionally cleared (empty) fields and empty arrays.
 */
export function mergeCareersSections(sections) {
  const base = structuredClone(DEFAULT_CAREERS_SECTIONS);
  if (!sections) return base;

  return {
    hero: {
      ...base.hero,
      ...(sections.hero || {}),
      images: Array.isArray(sections.hero?.images) ? sections.hero.images : [],
      badges: {
        ...base.hero.badges,
        ...(sections.hero?.badges || {}),
        ar: { ...(sections.hero?.badges?.ar || {}) },
      },
      ar: { ...(sections.hero?.ar || {}) },
    },
    building: {
      ...base.building,
      ...(sections.building || {}),
      paragraphs: Array.isArray(sections.building?.paragraphs)
        ? sections.building.paragraphs
        : [],
      ar: { ...(sections.building?.ar || {}) },
    },
    opportunities: Array.isArray(sections.opportunities) ? sections.opportunities : [],
    opportunitiesHeader: {
      ...base.opportunitiesHeader,
      ...(sections.opportunitiesHeader || {}),
      ar: { ...(sections.opportunitiesHeader?.ar || {}) },
    },
    openPositions: {
      ...base.openPositions,
      ...(sections.openPositions || {}),
      posts: Array.isArray(sections.openPositions?.posts)
        ? sections.openPositions.posts
        : [],
      ar: { ...(sections.openPositions?.ar || {}) },
    },
    whyJoin: {
      ...base.whyJoin,
      ...(sections.whyJoin || {}),
      reasons: Array.isArray(sections.whyJoin?.reasons) ? sections.whyJoin.reasons : [],
      ar: { ...(sections.whyJoin?.ar || {}) },
    },
    cta: {
      ...base.cta,
      ...(sections.cta || {}),
      ar: { ...(sections.cta?.ar || {}) },
    },
  };
}
