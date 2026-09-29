import { useState } from "react";
import { FRONTEND_PAGES } from "../constants/pages.js";
import { FIELD_LIMITS, FieldError } from "./CappedField";
import { validateUrl } from "../lib/validators";

const baseInputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-[#0088FF] focus:bg-white focus:ring-2 focus:ring-[#0088FF]/15";

// Every destination on the website, ready to pick — so nobody has to remember
// paths like /terms-conditions. "Site Settings" is not a page, so it's skipped.
export const LINK_OPTIONS = [
  ...FRONTEND_PAGES.filter((p) => p.slug !== "settings").map((p) => ({
    value: p.path,
    label: `${p.name} (${p.path})`,
  })),
  { value: "#partner-form", label: "Partnership Form (opens popup)" },
];

const KNOWN_VALUES = LINK_OPTIONS.map((o) => o.value);

/**
 * Dropdown of all site pages with an "Other…" escape hatch for external or
 * custom URLs (existing custom values stay editable).
 */
// eslint-disable-next-line react/prop-types
export default function PageLinkSelect({ value, onChange, inputClass = baseInputClass, placeholder = "/custom-path or https://…" }) {
  const val = value ?? "";
  const [custom, setCustom] = useState(!(val === "" || KNOWN_VALUES.includes(val)));

  const handleSelect = (e) => {
    const next = e.target.value;
    if (next === "__other__") {
      setCustom(true);
      return;
    }
    setCustom(false);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <select value={custom ? "__other__" : val} onChange={handleSelect} className={inputClass}>
        <option value="">— Select a page —</option>
        {LINK_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
        <option value="__other__">Other… (custom or external URL)</option>
      </select>
      {custom ? (
        <>
          <input
            value={val}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
            placeholder={placeholder}
            maxLength={FIELD_LIMITS.link}
          />
          <FieldError error={validateUrl(val)} />
        </>
      ) : null}
    </div>
  );
}
