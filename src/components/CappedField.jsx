/**
 * Shared capped text fields for all CMS page editors.
 *
 * They enforce a maxLength so the client can't paste runaway blocks of text that
 * break the public site layout, and show a live "used / limit" counter.
 *
 * Limits are "generous" — roomy for normal copy, but a hard ceiling on abuse.
 * Pick a field's cap via the `kind` prop, or pass an explicit `limit`.
 */

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15";

// Generous caps by field role. Tweak here to change every editor at once.
export const FIELD_LIMITS = {
  label: 40,        // tiny labels, eyebrows, tags, badges
  button: 30,       // CTA button text
  link: 200,        // URLs / hrefs
  heading: 80,      // section headings / titles
  subtitle: 160,    // subtitles / taglines
  item: 120,        // list items, bullet points, capability labels
  summary: 280,     // card summaries / short blurbs
  description: 600, // body paragraphs / descriptions
  long: 1200,       // long-form rich text / full descriptions
};

function resolveLimit(kind, limit) {
  if (typeof limit === "number") return limit;
  return FIELD_LIMITS[kind] ?? FIELD_LIMITS.subtitle;
}

/**
 * Standalone live character counter. Drop directly under any input/textarea:
 *   <input value={x} maxLength={FIELD_LIMITS.heading} ... />
 *   <CharCount value={x} max={FIELD_LIMITS.heading} />
 */
export function CharCount({ value, max }) {
  const len = (value ?? "").length;
  const near = len > max * 0.9;
  return (
    <span
      className={`pointer-events-none mt-1 block text-right text-[10px] font-medium tabular-nums ${
        len >= max ? "text-red-500" : near ? "text-amber-500" : "text-slate-400"
      }`}
    >
      {len} / {max}
    </span>
  );
}

function Counter({ value, max }) {
  return <CharCount value={value} max={max} />;
}

/** Single-line capped input. */
export function CappedInput({ kind = "subtitle", limit, value, onChange, className, showCount = true, ...rest }) {
  const max = resolveLimit(kind, limit);
  return (
    <div>
      <input
        {...rest}
        value={value ?? ""}
        maxLength={max}
        onChange={onChange}
        className={className || inputClass}
      />
      {showCount ? <Counter value={value} max={max} /> : null}
    </div>
  );
}

/** Multi-line capped textarea. */
export function CappedTextarea({ kind = "description", limit, value, onChange, className, showCount = true, rows = 3, ...rest }) {
  const max = resolveLimit(kind, limit);
  return (
    <div>
      <textarea
        {...rest}
        rows={rows}
        value={value ?? ""}
        maxLength={max}
        onChange={onChange}
        className={className || inputClass}
      />
      {showCount ? <Counter value={value} max={max} /> : null}
    </div>
  );
}
