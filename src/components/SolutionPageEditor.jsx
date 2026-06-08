import { useEffect, useState } from "react";
import { ExternalLink, Plus, Trash2, Save, ChevronDown, Loader2, Upload } from "lucide-react";
import { api, uploadMediaToCloudinary } from "../lib/api";

const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15";
const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500";

const DEFAULT_HERO = {
  title: "Intelligent Parking Infrastructure",
  subtitle: "HalaPark delivers an AI-powered smart parking solution for large-scale residential, commercial, and mixed-use developments across the UAE.",
  ctaLabel: "Get In Touch",
  videoUrl: "/Halapark Hero Page-Ai.mp4",
};

const DEFAULT_CHALLENGES = {
  heading: "Parking Challenges",
  headingGradient: "Challenges",
  subtitle: "Solving Parking Inefficiencies Through Smart Mobility",
  description: "Traditional parking systems are manual, fragmented, and lack real-time visibility, causing congestion, operational inefficiencies, and poor user experience. HalaPark transforms parking into a connected ecosystem powered by automation, AI, and real-time control.",
  items: [
    "Limited real-time parking visibility",
    "Manual vehicle entry and exit processes",
    "Inefficient space utilization",
    "Friction at access and payment points",
  ],
  ctaLabel: "View App Features",
};

const DEFAULT_SOLUTIONS = {
  heading: "Our Solutions",
  headingGradient: "Solutions",
  subtitle: "Intelligent parking systems built for efficiency, control, and scale",
};

const DEFAULT_INTEGRATION = {
  heading: "Solution Integration",
  headingGradient: "Integration",
  subtitle: "End-to-End Integrated Parking Solution",
};

const DEFAULT_TRUST = {
  heading: "Built for Smart Cities",
  headingGradient: "Smart Cities",
  subtitle: "HalaPark extends beyond parking into urban mobility infrastructure, supporting large-scale smart city development and city-wide optimization.",
};

const DEFAULT_FEATURES = {
  heading: "Built for High-Demand Environments",
  headingGradient: "Environments",
  subtitle: "From airports to smart cities, HalaPark scales across every high-traffic environment.",
};

const DEFAULT_WHY = {
  heading: "Why Leading Developments Choose Halapark?",
  headingGradient: "Choose Halapark?",
};

const DEFAULT_CTA = {
  heading: "Transform Parking Into a Fully Connected Mobility Infrastructure",
  headingGradient: "Mobility Infrastructure",
  subtitle: "Halapark replaces fragmented parking systems with one intelligent platform that connects access control, real-time operations, and data-driven intelligence. Built for scale, designed for modern developments, and engineered to upgrade existing infrastructure without disruption.",
  ctaLabel: "Request Demo",
  ctaSecondaryLabel: "Talk to Our Team",
};

function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 sm:px-5 hover:bg-slate-50 transition"
      >
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && <div className="border-t border-slate-200 px-4 py-4 sm:px-5">{children}</div>}
    </div>
  );
}

export default function SolutionPageEditor() {
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [challenges, setChallenges] = useState(DEFAULT_CHALLENGES);
  const [solutions, setSolutions] = useState(DEFAULT_SOLUTIONS);
  const [integration, setIntegration] = useState(DEFAULT_INTEGRATION);
  const [trust, setTrust] = useState(DEFAULT_TRUST);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [why, setWhy] = useState(DEFAULT_WHY);
  const [cta, setCtA] = useState(DEFAULT_CTA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await api.getPage("solutions");
      if (data?.page?.sections) {
        setHero(data.page.sections.hero || DEFAULT_HERO);
        setChallenges(data.page.sections.challenges || DEFAULT_CHALLENGES);
        setSolutions(data.page.sections.solutions || DEFAULT_SOLUTIONS);
        setIntegration(data.page.sections.integration || DEFAULT_INTEGRATION);
        setTrust(data.page.sections.trust || DEFAULT_TRUST);
        setFeatures(data.page.sections.features || DEFAULT_FEATURES);
        setWhy(data.page.sections.why || DEFAULT_WHY);
        setCtA(data.page.sections.cta || DEFAULT_CTA);
      }
    } catch (err) {
      setError("Failed to load page data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await api.updatePage("solutions", {
        sections: { hero, challenges, solutions, integration, trust, features, why, cta },
      });
      setSuccess("Solutions page saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save page");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleVideoUpload(file) {
    const key = "hero-video";
    setError("");
    setUploadProgress((p) => ({ ...p, [key]: 0 }));
    try {
      const url = await uploadMediaToCloudinary(file, "video", (pct) =>
        setUploadProgress((p) => ({ ...p, [key]: pct }))
      );
      setHero((p) => ({ ...p, videoUrl: url }));
      setSuccess("Video uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Video upload failed");
      console.error(err);
    } finally {
      setUploadProgress((p) => ({ ...p, [key]: undefined }));
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="w-full space-y-6 px-6 py-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#050A13]">Solutions Page Editor</h1>
          <p className="mt-2 text-sm text-slate-600">Manage all 8 solution page sections</p>
        </div>
      </div>

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

      {/* HERO SECTION */}
      <CollapsibleSection title="Hero Section" defaultOpen={true}>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Title</label>
            <input
              value={hero.title ?? ""}
              onChange={(e) => setHero((p) => ({ ...p, title: e.target.value }))}
              className={inputClass}
              placeholder="Intelligent Parking Infrastructure"
            />
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <textarea
              value={hero.subtitle ?? ""}
              onChange={(e) => setHero((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
              rows={2}
              placeholder="HalaPark delivers..."
            />
          </div>
          <div>
            <label className={labelClass}>CTA Label</label>
            <input
              value={hero.ctaLabel ?? ""}
              onChange={(e) => setHero((p) => ({ ...p, ctaLabel: e.target.value }))}
              className={inputClass}
              placeholder="Get In Touch"
            />
          </div>
          <div>
            <label className={labelClass}>Video URL</label>
            <div className="flex gap-2">
              <input
                value={hero.videoUrl ?? ""}
                onChange={(e) => setHero((p) => ({ ...p, videoUrl: e.target.value }))}
                className={inputClass}
                placeholder="/path/to/video.mp4"
              />
              <label className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-[#0088FF]/30 bg-[#EEF6FF] px-3 py-2 text-xs font-semibold text-[#0088FF] hover:bg-[#dcecff] cursor-pointer">
                <Upload className="h-3.5 w-3.5" />
                Upload
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleVideoUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* CHALLENGES SECTION */}
      <CollapsibleSection title="Challenges Section">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={challenges.heading ?? ""}
                onChange={(e) => setChallenges((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
                placeholder="Parking Challenges"
              />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient</label>
              <input
                value={challenges.headingGradient ?? ""}
                onChange={(e) => setChallenges((p) => ({ ...p, headingGradient: e.target.value }))}
                className={inputClass}
                placeholder="Challenges"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <input
              value={challenges.subtitle ?? ""}
              onChange={(e) => setChallenges((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
              placeholder="Solving Parking Inefficiencies..."
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={challenges.description ?? ""}
              onChange={(e) => setChallenges((p) => ({ ...p, description: e.target.value }))}
              className={inputClass}
              rows={3}
              placeholder="Traditional parking systems..."
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* SOLUTIONS SECTION */}
      <CollapsibleSection title="Solutions Section">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={solutions.heading ?? ""}
                onChange={(e) => setSolutions((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
                placeholder="Our Solutions"
              />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient</label>
              <input
                value={solutions.headingGradient ?? ""}
                onChange={(e) => setSolutions((p) => ({ ...p, headingGradient: e.target.value }))}
                className={inputClass}
                placeholder="Solutions"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <input
              value={solutions.subtitle ?? ""}
              onChange={(e) => setSolutions((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
              placeholder="Intelligent parking systems..."
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* INTEGRATION SECTION */}
      <CollapsibleSection title="Integration Section">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={integration.heading ?? ""}
                onChange={(e) => setIntegration((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
                placeholder="Solution Integration"
              />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient</label>
              <input
                value={integration.headingGradient ?? ""}
                onChange={(e) => setIntegration((p) => ({ ...p, headingGradient: e.target.value }))}
                className={inputClass}
                placeholder="Integration"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <input
              value={integration.subtitle ?? ""}
              onChange={(e) => setIntegration((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
              placeholder="End-to-End Integrated Parking Solution"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* TRUST SECTION */}
      <CollapsibleSection title="Trust Section (Smart Cities)">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={trust.heading ?? ""}
                onChange={(e) => setTrust((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
                placeholder="Built for Smart Cities"
              />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient</label>
              <input
                value={trust.headingGradient ?? ""}
                onChange={(e) => setTrust((p) => ({ ...p, headingGradient: e.target.value }))}
                className={inputClass}
                placeholder="Smart Cities"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <textarea
              value={trust.subtitle ?? ""}
              onChange={(e) => setTrust((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
              rows={2}
              placeholder="HalaPark extends beyond parking..."
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* FEATURES SECTION */}
      <CollapsibleSection title="Features Section (High-Demand)">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={features.heading ?? ""}
                onChange={(e) => setFeatures((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
                placeholder="Built for High-Demand Environments"
              />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient</label>
              <input
                value={features.headingGradient ?? ""}
                onChange={(e) => setFeatures((p) => ({ ...p, headingGradient: e.target.value }))}
                className={inputClass}
                placeholder="Environments"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <input
              value={features.subtitle ?? ""}
              onChange={(e) => setFeatures((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
              placeholder="From airports to smart cities..."
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* WHY SECTION */}
      <CollapsibleSection title="Why Section">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Heading</label>
              <input
                value={why.heading ?? ""}
                onChange={(e) => setWhy((p) => ({ ...p, heading: e.target.value }))}
                className={inputClass}
                placeholder="Why Leading Developments Choose Halapark?"
              />
            </div>
            <div>
              <label className={labelClass}>Heading Gradient</label>
              <input
                value={why.headingGradient ?? ""}
                onChange={(e) => setWhy((p) => ({ ...p, headingGradient: e.target.value }))}
                className={inputClass}
                placeholder="Choose Halapark?"
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* CTA SECTION */}
      <CollapsibleSection title="Final CTA Section">
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Heading</label>
            <input
              value={cta.heading ?? ""}
              onChange={(e) => setCtA((p) => ({ ...p, heading: e.target.value }))}
              className={inputClass}
              placeholder="Transform Parking Into a Fully Connected Mobility Infrastructure"
            />
          </div>
          <div>
            <label className={labelClass}>Heading Gradient</label>
            <input
              value={cta.headingGradient ?? ""}
              onChange={(e) => setCtA((p) => ({ ...p, headingGradient: e.target.value }))}
              className={inputClass}
              placeholder="Mobility Infrastructure"
            />
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <textarea
              value={cta.subtitle ?? ""}
              onChange={(e) => setCtA((p) => ({ ...p, subtitle: e.target.value }))}
              className={inputClass}
              rows={3}
              placeholder="Halapark replaces fragmented parking systems..."
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Primary CTA Label</label>
              <input
                value={cta.ctaLabel ?? ""}
                onChange={(e) => setCtA((p) => ({ ...p, ctaLabel: e.target.value }))}
                className={inputClass}
                placeholder="Request Demo"
              />
            </div>
            <div>
              <label className={labelClass}>Secondary CTA Label</label>
              <input
                value={cta.ctaSecondaryLabel ?? ""}
                onChange={(e) => setCtA((p) => ({ ...p, ctaSecondaryLabel: e.target.value }))}
                className={inputClass}
                placeholder="Talk to Our Team"
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>
      </div>
    </div>
  );
}
