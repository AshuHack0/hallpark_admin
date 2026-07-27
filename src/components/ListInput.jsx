import { useState } from "react";

// Shared inputs for fields that EDIT AN ARRAY through a single text box
// (comma-separated chips/subjects, one-per-line points).
//
// The core problem they solve: parsing the text on every keystroke (split →
// trim → filter) eats the admin's spaces / Enter presses, because the parsed
// array is re-serialized straight back into the input. These components keep
// the RAW text in local state while the field is focused (typing feels
// normal), push the parsed array up on every change (so Save always works,
// even mid-edit), and re-serialize the display only on blur.

/** Comma-separated input → array of strings.
 *  `arabic` switches to the Arabic comma (،) for splitting/joining + RTL.
 *  `keepEmpty` skips the filter(Boolean) so empty entries survive — needed
 *  where EN and AR lists must stay index-aligned. */
export function CsvInput({ value, onChange, arabic = false, keepEmpty = false, className, style, placeholder, maxLength }) {
  const [draft, setDraft] = useState(null);
  const list = Array.isArray(value) ? value : [];
  const joiner = arabic ? "، " : ", ";
  const splitter = arabic ? /،|,/ : ",";
  return (
    <input
      type="text"
      dir={arabic ? "rtl" : undefined}
      value={draft ?? list.join(joiner)}
      onChange={(e) => {
        const parsed = e.target.value.split(splitter).map((s) => s.trim());
        setDraft(e.target.value);
        onChange(keepEmpty ? parsed : parsed.filter(Boolean));
      }}
      onBlur={() => setDraft(null)}
      className={className}
      style={style}
      placeholder={placeholder}
      maxLength={maxLength}
    />
  );
}

/** One-item-per-line textarea → array of strings. */
export function LinesTextarea({ value, onChange, rows = 3, dir, className, style, placeholder, maxLength }) {
  const [draft, setDraft] = useState(null);
  const list = Array.isArray(value) ? value : [];
  return (
    <textarea
      dir={dir}
      value={draft ?? list.join("\n")}
      onChange={(e) => {
        setDraft(e.target.value);
        onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean));
      }}
      onBlur={() => setDraft(null)}
      rows={rows}
      className={className}
      style={style}
      placeholder={placeholder}
      maxLength={maxLength}
    />
  );
}
