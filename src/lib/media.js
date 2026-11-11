// Helpers for previewing uploaded media (Cloudinary links, site paths, YouTube).

// Relative paths like "/images/hero.png" live on the public website, not on
// the admin domain, so previews resolve them against the site.
const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://halapark.com").replace(/\/+$/, "");

export function resolveMediaUrl(url) {
  const v = String(url ?? "").trim();
  if (!v) return "";
  if (/^(https?:)?\/\//i.test(v) || /^(data|blob):/i.test(v)) return v;
  if (v.startsWith("/")) return `${SITE_URL}${v}`;
  return "";
}

export function youtubeThumb(url) {
  const m = String(url ?? "").match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)([\w-]{6,})/i,
  );
  return m ? `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` : "";
}

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg|bmp|ico|heic)(\?|#|$)/i;
const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv|ogg|mkv)(\?|#|$)/i;
const PDF_EXT = /\.pdf(\?|#|$)/i;

/** "image" | "video" | "youtube" | "pdf" | "file" | "" (empty / not a link) */
export function mediaKind(url, mimeType = "") {
  const v = String(url ?? "").trim();
  if (!v) return "";
  const mime = String(mimeType || "").toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "pdf";
  if (youtubeThumb(v)) return "youtube";
  if (PDF_EXT.test(v)) return "pdf";
  if (VIDEO_EXT.test(v) || /\/video\/upload\//i.test(v)) return "video";
  if (IMAGE_EXT.test(v) || /\/image\/upload\//i.test(v)) return "image";
  return "file";
}

// Cloudinary can render a still frame of a video as a JPG — much lighter than
// loading the video itself just for a thumbnail.
export function videoPoster(url) {
  const v = String(url ?? "");
  if (!/res\.cloudinary\.com\/.+\/video\/upload\//i.test(v)) return "";
  return v.replace(/\/video\/upload\//i, "/video/upload/so_1,w_320,c_limit/").replace(/\.[a-z0-9]+(\?.*)?$/i, ".jpg");
}
