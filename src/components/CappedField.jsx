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

/**
 * Inline validation message shown under a field. Pass `error` (a string from a
 * validator in @/lib/validators — "" when valid). Renders nothing when valid.
 * Non-blocking: it warns the editor but does not prevent saving.
 */
export function FieldError({ error }) {
  if (!error) return null;
  return (
    <p className="mt-1 flex items-start gap-1 text-[11px] font-medium text-amber-600">
      <span aria-hidden>⚠</span>
      <span>{error}</span>
    </p>
  );
}

/**
 * Arabic translation input, paired under an English field. The Arabic text is
 * stored in an `ar` sibling object on the section (Shape A): section.ar[arKey].
 *
 * Usage:
 *   <ArInput
 *     value={section.ar?.heading}
 *     onChange={(v) => setSection((p) => ({ ...p, ar: { ...(p.ar ?? {}), heading: v } }))}
 *     kind="heading"
 *   />
 *
 * Renders RTL, right-aligned, with the same cap/counter as the English field.
 * Leave blank to fall back to English on the site.
 */
export function ArInput({ kind = "subtitle", limit, value, onChange, rows, multiline = false, label }) {
  const max = resolveLimit(kind, limit);
  const arClass =
    "w-full rounded-xl border border-emerald-200 bg-emerald-50/40 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-300/30";
  // Heading shows the paired English field name when provided (e.g.
  // "Description (Arabic)"), so admin users aren't confused by an Arabic label.
  const heading = label ? `${label} (Arabic)` : "Arabic translation";
  return (
    <div className="mt-1.5">
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-600">
        {heading}
      </label>
      {multiline ? (
        <textarea
          dir="rtl"
          rows={rows ?? 2}
          value={value ?? ""}
          maxLength={max}
          onChange={(e) => onChange(e.target.value)}
          className={`${arClass} text-right`}
          placeholder="اتركه فارغًا لاستخدام النص الإنجليزي"
        />
      ) : (
        <input
          dir="rtl"
          value={value ?? ""}
          maxLength={max}
          onChange={(e) => onChange(e.target.value)}
          className={`${arClass} text-right`}
          placeholder="اتركه فارغًا لاستخدام النص الإنجليزي"
        />
      )}
      <CharCount value={value} max={max} />
    </div>
  );
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
