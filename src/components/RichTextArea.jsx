import { useRef, useState } from "react";
import { Bold, Italic, Palette } from "lucide-react";
import { CharCount } from "./CappedField";

// A textarea with a lightweight formatting toolbar. It inserts a tiny, SAFE
// markup around the current selection — no HTML is stored:
//   **bold**   *italic*   [[#0088ff]]colored[[/]]
// The website renders this markup via the shared <RichText> component. Plain
// text still works exactly as before.

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15";

const btn =
  "inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-[#0088FF] hover:text-[#0088FF]";

export default function RichTextArea({
  value,
  onChange,
  rows = 4,
  maxLength,
  placeholder,
  showCount = true,
  dir = "ltr",
  variant = "default", // "default" | "arabic" (green RTL styling)
}) {
  const ref = useRef(null);
  const [color, setColor] = useState("#0088FF");

  const val = value ?? "";

  const areaClass =
    variant === "arabic"
      ? "w-full rounded-xl border border-emerald-200 bg-emerald-50/40 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-300/30"
      : inputClass;

  // Wrap the current selection (or caret) with a prefix/suffix, then re-select
  // the inner text so the user can keep typing/formatting.
  const wrap = (prefix, suffix) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart ?? val.length;
    const end = el.selectionEnd ?? val.length;
    const selected = val.slice(start, end) || "text";
    const next = val.slice(0, start) + prefix + selected + suffix + val.slice(end);
    onChange(next);
    // Restore focus + place the selection around the inserted inner text.
    requestAnimationFrame(() => {
      el.focus();
      const innerStart = start + prefix.length;
      el.setSelectionRange(innerStart, innerStart + selected.length);
    });
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <button type="button" className={btn} title="Bold" onClick={() => wrap("**", "**")}>
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" className={btn} title="Italic" onClick={() => wrap("*", "*")}>
          <Italic className="h-4 w-4" />
        </button>
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <button
          type="button"
          className={btn}
          title="Apply color to selection"
          onClick={() => wrap(`[[${color}]]`, "[[/]]")}
        >
          <Palette className="h-4 w-4" />
        </button>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          title="Pick color, then click the palette button"
          className="h-8 w-9 cursor-pointer rounded-md border border-slate-200"
        />
        <span className="ml-auto text-[10px] text-slate-400">Select text, then a button</span>
      </div>
      <textarea
        ref={ref}
        dir={dir}
        value={val}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`${areaClass} ${dir === "rtl" ? "text-right" : ""}`}
      />
      {showCount && typeof maxLength === "number" ? (
        <CharCount value={val} max={maxLength} />
      ) : null}
    </div>
  );
}
