/**
 * Lightweight, non-blocking field validators for the CMS editors.
 *
 * Each `validateX` returns an error STRING when invalid, or "" when valid/empty.
 * Validation is "warn but allow" — the UI shows the message inline but never
 * blocks Save. Empty values pass here (use validateRequired separately for
 * required fields), so optional fields don't nag when left blank.
 */

/** Required: non-empty after trimming. */
export function validateRequired(value, label = "This field") {
  if (value == null || String(value).trim() === "") return `${label} is required.`;
  return "";
}

/**
 * URL / link / path. Accepts:
 *   • absolute URLs: http(s)://...
 *   • root-relative paths: /something
 *   • in-page anchors: #section
 * Empty passes (use validateRequired if it must be filled).
 */
export function validateUrl(value) {
  const v = (value ?? "").trim();
  if (v === "") return "";
  if (v.startsWith("/") || v.startsWith("#")) return "";
  if (/^https?:\/\/[^\s]+\.[^\s]+/i.test(v)) return "";
  if (/^(mailto:|tel:)/i.test(v)) return "";
  return "Enter a full URL (https://…) or a path starting with /.";
}

/** Email address. Empty passes. */
export function validateEmail(value) {
  const v = (value ?? "").trim();
  if (v === "") return "";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "";
  return "Enter a valid email address.";
}

/** Phone number — allows +, spaces, dashes, parens; 7–15 digits. Empty passes. */
export function validatePhone(value) {
  const v = (value ?? "").trim();
  if (v === "") return "";
  const digits = v.replace(/[^\d]/g, "");
  if (/^[+\d][\d\s()-]+$/.test(v) && digits.length >= 7 && digits.length <= 15) return "";
  return "Enter a valid phone number.";
}

// Accepted image types + max upload size (bytes).
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/svg+xml", "image/gif", "image/avif"];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Validate a File chosen for an IMAGE upload. Returns an error string or "".
 * Use BEFORE calling the upload so non-images / oversized files are rejected.
 */
export function validateImageFile(file) {
  if (!file) return "No file selected.";
  const isImage = file.type ? IMAGE_TYPES.includes(file.type) : /\.(png|jpe?g|webp|svg|gif|avif)$/i.test(file.name || "");
  if (!isImage) return "Please upload an image (PNG, JPG, WEBP, SVG, or GIF).";
  if (file.size > MAX_IMAGE_BYTES) return `Image is too large (max ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)} MB).`;
  return "";
}

/** Validate a File chosen for a VIDEO upload. Returns an error string or "". */
const MAX_VIDEO_BYTES = 64 * 1024 * 1024; // 64 MB
export function validateVideoFile(file) {
  if (!file) return "No file selected.";
  const isVideo = file.type ? file.type.startsWith("video/") : /\.(mp4|webm|mov|m4v)$/i.test(file.name || "");
  if (!isVideo) return "Please upload a video (MP4, WEBM, or MOV).";
  if (file.size > MAX_VIDEO_BYTES) return `Video is too large (max ${Math.round(MAX_VIDEO_BYTES / 1024 / 1024)} MB).`;
  return "";
}
