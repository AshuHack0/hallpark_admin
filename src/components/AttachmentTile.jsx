import { useState } from "react";
import { FileText, Play } from "lucide-react";
import { mediaKind, resolveMediaUrl, videoPoster } from "../lib/media";

// One uploaded file shown as a thumbnail card (image, video frame, or a file
// icon for PDFs/documents) with its name underneath. Opens in a new tab.
export default function AttachmentTile({ file, index = 0 }) {
  const url = resolveMediaUrl(file?.url) || file?.url || "";
  const kind = mediaKind(url, file?.type);
  const name = file?.name || `File ${index + 1}`;
  const [broken, setBroken] = useState(false);
  const thumb = kind === "image" ? url : kind === "video" ? videoPoster(url) : "";

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={name}
      className="group block w-[132px] overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-[#0088FF] hover:shadow-[0_4px_14px_rgba(0,136,255,0.18)]"
    >
      <div className="relative flex h-[92px] items-center justify-center bg-slate-50">
        {thumb && !broken ? (
          <img src={thumb} alt="" loading="lazy" onError={() => setBroken(true)} className="h-full w-full object-cover" />
        ) : kind === "video" && !broken ? (
          <video src={`${url}#t=0.5`} preload="metadata" muted playsInline onError={() => setBroken(true)} className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-slate-400">
            <FileText className="h-7 w-7" strokeWidth={1.6} />
            <span className="text-[10px] font-bold uppercase tracking-wide">{kind === "pdf" ? "PDF" : "File"}</span>
          </span>
        )}
        {kind === "video" ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white">
              <Play className="h-3.5 w-3.5 translate-x-px" fill="currentColor" />
            </span>
          </span>
        ) : null}
      </div>
      <p className="truncate px-2 py-1.5 text-[11px] font-medium text-slate-600 group-hover:text-[#0088FF]">{name}</p>
    </a>
  );
}
