// Shared delete confirmation — EVERY destructive remove in the admin must go
// through this so nothing is deleted by an accidental click.
//
// Usage:  onClick={() => { if (!confirmDelete("this slide")) return; removeSlide(i); }}
export function confirmDelete(what = "this item") {
  return window.confirm(`Delete ${what}? This can't be undone after you save the page.`);
}
