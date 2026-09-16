// Tick box shown next to a button's link field. When ticked, the website
// button opens the site-wide "Become a Partner" popup instead of the link.
// eslint-disable-next-line react/prop-types
export default function PartnerFormToggle({ checked, onChange }) {
  const on = Boolean(checked);
  return (
    <label
      className={`mb-2 flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2 transition ${
        on ? "border-[#0088FF]/40 bg-[#EEF6FF]" : "border-slate-200 bg-white hover:border-[#0088FF]/30"
      }`}
    >
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[#0088FF]"
      />
      <span className="text-xs leading-5 text-slate-600">
        <span className="font-semibold text-[#050A13]">Open Partnership Form popup</span>
        {on
          ? " — this button opens the “Become a Partner” form. The link below is ignored."
          : " — tick to make this button open the “Become a Partner” form instead of the link below."}
      </span>
    </label>
  );
}
