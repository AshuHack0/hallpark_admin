import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

// Floating "scroll to top" button — appears once the page is scrolled down a
// bit, and smooth-scrolls back to the top. Shown on every admin page (long
// editors especially).
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#0088FF] text-white shadow-[0_10px_28px_rgba(0,136,255,0.4)] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0088FF]/40 focus-visible:ring-offset-2"
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
