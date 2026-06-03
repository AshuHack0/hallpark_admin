export const DEFAULT_CAREERS_SECTIONS = {
  hero: {
    title: "Park Your Career in the Right Place",
    description:
      "At HalaPark, we're transforming the way people park, move, and experience mobility across the UAE. What started as a smarter approach to valet and parking services is growing into a technology-driven mobility ecosystem powered by innovation, AI, and exceptional customer experiences. If you're ambitious, passionate, and ready to be part of something exciting, we'd love to meet you. Whether you're welcoming customers, managing operations, building technology, or supporting our business behind the scenes, every role at HalaPark helps drive the future forward.",
    image: "/hf_20260327_061900_db12a62e-2867-44b6-83f0-ea7f1a5442ef.png",
  },
  building: {
    title: "We're Not Just Parking Cars.\nWe're Building Smarter Mobility.",
    paragraphs: [
      "At HalaPark, we're transforming the parking experience through technology, automation, and innovation. From AI-powered vehicle location to seamless digital parking solutions, we're creating smarter ways for people to move.",
      "Join a team that's challenging traditional parking, embracing new ideas, and building technology-driven solutions that make a real impact across the UAE. Build your career. Shape the future of mobility.",
    ],
  },
  opportunities: [
    {
      icon: "Briefcase",
      title: "Full-Time Valet Roles",
      description:
        "Join our professional valet team and work in premium locations across the UAE, delivering high-quality parking and vehicle handling services.",
      badge: "Full-Time",
    },
    {
      icon: "Headset",
      title: "CRM & Operations Support",
      description:
        "Join our Customer Relationship Management (CRM) and operations team to help manage bookings, support customers, and ensure smooth daily operations across all platforms.",
      badge: "Operations",
    },
    {
      icon: "Building2",
      title: "Office Team (Corporate & Professional Roles)",
      description:
        "Be part of our office team supporting a wide range of business functions including HR, recruitment, finance, marketing, business development, coordination, and other corporate roles that drive company growth and efficiency.",
      badge: "Corporate",
    },
  ],
  whyJoin: {
    title: "Why Join Us?",
    subtitle: "Because Great Careers Need More Than Just a Job",
    bodyParagraph:
      "At HalaPark, we celebrate achievements, support each other's growth, and believe great ideas can come from anyone. We're building a workplace where people are empowered to learn, contribute, and succeed together. And we're just getting started.",
    reasons: [
      "Work with one of the UAE's growing mobility and technology companies",
      "Learn from industry professionals and experienced leaders",
      "Flexible opportunities for both full-time and freelance professionals",
      "Career development and growth opportunities",
      "Supportive and collaborative work culture",
      "Be part of exciting technology and innovation projects",
      "Make a real impact every single day",
    ],
  },
  cta: {
    title: "Ready to Take the Next Step?",
    subtitle: "Come Build It With Us.",
    description:
      "Whether you're looking for your first opportunity, your next challenge, or a place where your ideas can make a difference, HalaPark could be the perfect fit.",
    primaryCtaText: "Join Our Team",
    primaryCtaLink: "/contact",
    secondaryCtaText: "View Open Positions",
    secondaryCtaLink: "#open-positions",
  },
};

export function mergeCareersSections(sections) {
  const base = structuredClone(DEFAULT_CAREERS_SECTIONS);
  if (!sections) return base;

  return {
    hero: { ...base.hero, ...(sections.hero || {}) },
    building: {
      ...base.building,
      ...(sections.building || {}),
      paragraphs:
        Array.isArray(sections.building?.paragraphs) && sections.building.paragraphs.length
          ? sections.building.paragraphs
          : base.building.paragraphs,
    },
    opportunities:
      Array.isArray(sections.opportunities) && sections.opportunities.length
        ? sections.opportunities
        : base.opportunities,
    whyJoin: {
      ...base.whyJoin,
      ...(sections.whyJoin || {}),
      reasons:
        Array.isArray(sections.whyJoin?.reasons) && sections.whyJoin.reasons.length
          ? sections.whyJoin.reasons
          : base.whyJoin.reasons,
    },
    cta: { ...base.cta, ...(sections.cta || {}) },
  };
}
