export const DEFAULT_ABOUT_SECTIONS = {
  hero: {
    title: "Smart Parking Beyond Expectations",
    tagline: "Intelligent Parking. Smarter Cities. Seamless Movement.",
    description:
      "HalaPark is a smart parking technology company delivering innovative solutions that simplify parking, improve mobility, and support smarter urban environments.",
    image: "/hf_20260327_061900_db12a62e-2867-44b6-83f0-ea7f1a5442ef.png",
    primaryCtaText: "Partner With HalaPark",
    primaryCtaLink: "/contact",
    secondaryCtaText: "Speak With Our Experts",
    secondaryCtaLink: "/contact",
  },
  mission: {
    title: "Our Mission",
    subtitle: "Creating Smarter Movement for Modern Cities",
    paragraphs: [
      "Our mission is to redefine parking and urban mobility through intelligent technology, seamless automation, and digital platforms. We aim to simplify movement and improve everyday convenience for drivers, businesses, and cities.",
      "HalaPark focuses on enhancing operational performance through smarter and more connected systems. We support the growth of modern communities and future-ready cities with scalable mobility solutions.",
    ],
    image: "/hf_20260327_062407_6dca49c0-90dd-468a-96f9-b36bba13ea8b.png",
  },
  vision: {
    title: "Our Vision",
    subtitle: "A Future Where Parking Feels Invisible",
    paragraphs: [
      "HalaPark envisions a future where parking is fully invisible and seamlessly integrated into city life. Vehicles will move effortlessly through intelligent, automated environments.",
      "Access, payments, and operations will be fully frictionless and data-driven. Smart infrastructure will quietly support cities in the background.",
      "We are building the foundation for smarter cities, EV adoption, and next-generation mobility systems.",
    ],
    image: "/hf_20260327_064457_c75923ba-dc06-4c6e-9b63-fa181e94bcfa.png",
    card: {
      badge: "Our Vision",
      title: "A Future Where Parking Feels Invisible",
      subtitle: "Seamlessly integrated into the way cities move, operate, and evolve.",
      highlights: [
        { line1: "AI-Driven", line2: "Operations" },
        { line1: "Frictionless", line2: "Payments" },
        { line1: "Smart City", line2: "Ready" },
      ],
    },
  },
  story: {
    title: "Our Story",
    subtitle: "Built from a Vision to Simplify Urban Movement",
    paragraphs: [
      "HalaPark was founded to solve parking inefficiency in modern cities. Traditional systems created congestion, delays, and operational challenges.",
      "We saw the opportunity to transform parking through smart technology and automation. What started as a parking platform has grown into a complete mobility ecosystem.",
      "Today, we build intelligent solutions that improve urban movement and shape smarter cities.",
    ],
    image: "/hf_20260327_060926_cbb82448-441c-42ee-9589-785e7acd7565.png",
  },
  whatWeDo: {
    title: "What We Do",
    subtitle: "Smart Parking Solutions Designed for Modern Cities",
    intro:
      "HalaPark delivers intelligent parking and mobility solutions that seamlessly combine automation, AI technology, operations, infrastructure, and digital experiences into one unified platform.",
    image: "/hf_20260327_064316_9c7b1a28-dbfa-456e-b88a-0087cb567a61.png",
    ecosystemItems: [
      "AI-Powered Parking Management",
      "Free Flow & Ticketless Parking",
      "Mobile Parking Applications",
      "Digital Payments & Wallet Systems",
      "Residential & Community Access Control",
      "Public & On-Street Parking Solutions",
      "Parking Guidance Systems",
      "Space Sharing & Monetization",
      "Digital Permit Management",
      "Real-Time Parking Analytics",
      "Smart Mobility Integrations",
      "EV & Future Mobility Readiness",
    ],
  },
  technology: {
    title: "Technology & Innovation",
    subtitle: "Intelligent Technology for Smarter Parking",
    body: "HalaPark delivers a complete smart parking ecosystem powered by an Admin Portal, Driver App, digital payments, access control, and real-time analytics. We help operators and property owners automate operations, manage permits, and gain real-time insights through connected cloud technology. Built for modern cities, HalaPark provides smart, secure, and scalable parking solutions that ensure seamless experiences.",
    image: "/hf_20260327_064316_9c7b1a28-dbfa-456e-b88a-0087cb567a61.png",
    imageBadge: "AI-Powered Platform",
  },
  cta: {
    title: "Build the Future of Mobility With Us",
    description:
      "Partner with HalaPark to create smarter parking, seamless mobility, and future-ready cities.",
    image: "/hf_20260327_061900_db12a62e-2867-44b6-83f0-ea7f1a5442ef.png",
    primaryCtaText: "Partner With HalaPark",
    primaryCtaLink: "/contact",
    secondaryCtaText: "Speak With Our Experts",
    secondaryCtaLink: "/contact",
  },
};

export function mergeAboutSections(sections) {
  const base = structuredClone(DEFAULT_ABOUT_SECTIONS);
  if (!sections) return base;

  return {
    hero: { ...base.hero, ...(sections.hero || {}) },
    mission: {
      ...base.mission,
      ...(sections.mission || {}),
      paragraphs:
        Array.isArray(sections.mission?.paragraphs) && sections.mission.paragraphs.length
          ? sections.mission.paragraphs
          : base.mission.paragraphs,
    },
    vision: {
      ...base.vision,
      ...(sections.vision || {}),
      paragraphs:
        Array.isArray(sections.vision?.paragraphs) && sections.vision.paragraphs.length
          ? sections.vision.paragraphs
          : base.vision.paragraphs,
      card: {
        ...base.vision.card,
        ...(sections.vision?.card || {}),
        highlights:
          Array.isArray(sections.vision?.card?.highlights) &&
          sections.vision.card.highlights.length
            ? sections.vision.card.highlights
            : base.vision.card.highlights,
      },
    },
    story: {
      ...base.story,
      ...(sections.story || {}),
      paragraphs:
        Array.isArray(sections.story?.paragraphs) && sections.story.paragraphs.length
          ? sections.story.paragraphs
          : base.story.paragraphs,
    },
    whatWeDo: {
      ...base.whatWeDo,
      ...(sections.whatWeDo || {}),
      ecosystemItems:
        Array.isArray(sections.whatWeDo?.ecosystemItems) &&
        sections.whatWeDo.ecosystemItems.length
          ? sections.whatWeDo.ecosystemItems
          : base.whatWeDo.ecosystemItems,
    },
    technology: { ...base.technology, ...(sections.technology || {}) },
    cta: { ...base.cta, ...(sections.cta || {}) },
  };
}
