// Scrolls the just-added list row into view.
//
// Usage: mark the wrapper that contains BOTH the "Add" button and the rows with
// `data-item-list-root`, mark each row with `data-new-item-row`, then call
// `scrollToNewItem(e)` from the Add button's onClick (after appending the item).
// Waits two animation frames so React has rendered the new row first.
export function scrollToNewItem(e) {
  const root = e?.currentTarget?.closest("[data-item-list-root]") ?? document;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const rows = root.querySelectorAll("[data-new-item-row]");
      const last = rows[rows.length - 1];
      last?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
}
