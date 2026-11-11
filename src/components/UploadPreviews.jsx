import { useEffect } from "react";
import { mediaKind, resolveMediaUrl, videoPoster, youtubeThumb } from "../lib/media";

// Thumbnails for every upload field in the page editors.
//
// All editors build their upload fields the same way: a URL text box next to
// an "Upload" button (a <label> holding an <input type="file">). Rather than
// touching ~180 fields one by one, this watches the editor area and puts a
// small preview right under each such row — image, video frame, YouTube
// thumbnail or a file chip — kept in sync as the link changes or an upload
// finishes. Clicking a preview opens the file in a new tab.
//
// The preview nodes are plain DOM siblings that React never renders or
// touches; they're removed together with their field.

const HOLDER_ATTR = "data-upload-preview";

function findRows(root) {
  const rows = [];
  root.querySelectorAll('input[type="file"]').forEach((file) => {
    const button = file.closest("label");
    const row = button?.parentElement;
    if (!row || row.closest(`[${HOLDER_ATTR}]`)) return;
    const text = row.querySelector(
      'input:not([type="file"]):not([type="checkbox"]):not([type="radio"]):not([type="hidden"]):not([type="number"])',
    );
    if (text) rows.push({ row, text });
  });
  return rows;
}

// The field already shows its own preview of this file (some editors do)?
function hasOwnPreview(row, src) {
  const scope = row.parentElement;
  if (!scope || !src) return false;
  return [...scope.querySelectorAll("img, video")].some(
    (el) => !el.closest(`[${HOLDER_ATTR}]`) && (el.currentSrc === src || el.getAttribute("src") === src),
  );
}

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === "className") node.className = v;
    else if (k === "text") node.textContent = v;
    else node.setAttribute(k, v);
  });
  children.forEach((c) => c && node.appendChild(c));
  return node;
}

function fileName(url) {
  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop() || url);
  } catch {
    return url;
  }
}

function render(holder, raw) {
  const value = String(raw ?? "").trim();
  if (holder.dataset.value === value) return;
  holder.dataset.value = value;
  holder.replaceChildren();
  holder.hidden = true;

  const kind = mediaKind(value);
  const href = kind === "youtube" ? value : resolveMediaUrl(value);
  if (!kind || !href) return;
  const row = holder.previousElementSibling;
  if (row && hasOwnPreview(row, href)) return;

  const link = el("a", {
    href,
    target: "_blank",
    rel: "noopener noreferrer",
    title: "Open in a new tab",
    className: "upl-thumb",
  });

  const failed = () => {
    link.replaceChildren(el("span", { className: "upl-thumb-fail", text: "Preview not available — click to open" }));
  };

  if (kind === "image" || kind === "youtube") {
    const img = el("img", { src: kind === "youtube" ? youtubeThumb(value) : href, alt: "", loading: "lazy" });
    img.addEventListener("error", failed, { once: true });
    link.appendChild(img);
  } else if (kind === "video") {
    const poster = videoPoster(href);
    if (poster) {
      const img = el("img", { src: poster, alt: "", loading: "lazy" });
      img.addEventListener("error", failed, { once: true });
      link.appendChild(img);
    } else {
      const video = el("video", { src: `${href}#t=0.5`, preload: "metadata", muted: "", playsinline: "" });
      video.muted = true;
      video.addEventListener("error", failed, { once: true });
      link.appendChild(video);
    }
    link.appendChild(el("span", { className: "upl-thumb-play", "aria-hidden": "true", text: "▶" }));
  } else {
    link.classList.add("upl-thumb-file");
    link.appendChild(el("span", { className: "upl-thumb-ext", text: kind === "pdf" ? "PDF" : "FILE" }));
    link.appendChild(el("span", { className: "upl-thumb-name", text: fileName(href) }));
  }
  holder.appendChild(link);
  holder.hidden = false;
}

function sync(root) {
  findRows(root).forEach(({ row, text }) => {
    let holder = row.nextElementSibling;
    if (!holder || !holder.hasAttribute(HOLDER_ATTR)) {
      holder = el("div", { [HOLDER_ATTR]: "", className: "upl-holder" });
      holder.hidden = true;
      row.parentNode.insertBefore(holder, row.nextSibling);
    }
    render(holder, text.value);
  });
}

const STYLES = `
.upl-holder{margin-top:8px}
.upl-thumb{position:relative;display:inline-flex;align-items:center;justify-content:center;overflow:hidden;
  height:88px;max-width:180px;min-width:88px;border-radius:10px;border:1px solid #E2E8F0;background:#F8FAFC;
  transition:border-color .15s, box-shadow .15s}
.upl-thumb:hover{border-color:#0088FF;box-shadow:0 4px 14px rgba(0,136,255,.18)}
.upl-thumb img,.upl-thumb video{height:100%;width:auto;max-width:180px;object-fit:cover;display:block}
.upl-thumb-play{position:absolute;inset:auto;display:flex;align-items:center;justify-content:center;height:30px;width:30px;
  border-radius:999px;background:rgba(5,10,19,.65);color:#fff;font-size:12px;padding-left:2px}
.upl-thumb-file{gap:8px;padding:0 12px;height:44px;max-width:260px;justify-content:flex-start}
.upl-thumb-ext{flex-shrink:0;border-radius:6px;background:#0088FF;color:#fff;font:700 10px/1 system-ui;padding:5px 6px}
.upl-thumb-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:500 12px system-ui;color:#334155}
.upl-thumb-fail{padding:0 10px;font:500 11px system-ui;color:#94A3B8;text-align:center}
`;

export default function UploadPreviews() {
  useEffect(() => {
    const root = document.getElementById("root") || document.body;
    const style = el("style", { "data-upload-preview-styles": "" });
    style.textContent = STYLES;
    document.head.appendChild(style);

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync(root);
      });
    };
    // New fields appear (sections open, items added) and React updates the
    // input's value attribute when an upload finishes → re-sync.
    const observer = new MutationObserver((records) => {
      if (records.every((r) => r.target instanceof Element && r.target.closest(`[${HOLDER_ATTR}]`))) return;
      schedule();
    });
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["value"] });
    // Typing / pasting a link.
    root.addEventListener("input", schedule, true);
    schedule();

    return () => {
      observer.disconnect();
      root.removeEventListener("input", schedule, true);
      if (frame) cancelAnimationFrame(frame);
      style.remove();
      root.querySelectorAll(`[${HOLDER_ATTR}]`).forEach((n) => n.remove());
    };
  }, []);

  return null;
}
