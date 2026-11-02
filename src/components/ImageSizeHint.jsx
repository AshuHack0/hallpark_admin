import { Ruler } from "lucide-react";

/**
 * Recommended upload size, shown under every image uploader so the admin
 * knows the right dimensions before uploading.
 *
 * Sizes are ~2× the largest box the image is shown in on the public site
 * (sharp on retina screens), measured at 1440px (desktop) and 390px (phone).
 *
 *   <ImageSizeHint w={2400} h={1080} />
 *   <ImageSizeHint w={2400} h={1080} mobileW={800} mobileH={1200} />
 *   <ImageSizeHint w={420} h={190} note="Logo trimmed to its edges, no empty margin" />
 */
export default function ImageSizeHint({ w, h, mobileW, mobileH, note, className = "" }) {
  if (!w || !h) return null;
  return (
    <p className={`mt-1 flex flex-wrap items-center gap-x-1.5 text-[11px] text-slate-500 ${className}`}>
      <Ruler className="h-3 w-3 shrink-0 text-[#0088FF]" aria-hidden />
      <span>
        Recommended size: <strong className="font-semibold text-slate-700">{w} × {h} px</strong>
        {mobileW && mobileH ? (
          <>
            {" "}· Mobile: <strong className="font-semibold text-slate-700">{mobileW} × {mobileH} px</strong>
          </>
        ) : null}
        {note ? <> · {note}</> : null}
      </span>
    </p>
  );
}
