import { useEffect, useRef } from "react";

// Standalone helper — call this directly inside a click handler (a real
// user gesture) since browsers refuse requestFullscreen() calls that
// aren't triggered synchronously by user interaction.
export function requestFullscreen() {
  const el = document.documentElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
  if (req) req.call(el).catch(() => {});
}

// Best-effort exam lockdown. IMPORTANT: none of this can be made airtight
// from a webpage — dev tools and OS-level screenshots cannot be truly
// blocked by client-side JS. This raises friction and logs attempts;
// it is not a substitute for supervised/proctored testing.
export function useLockdown({ active, onViolation }) {
  const armed = useRef(false);

  const enterFullscreen = () => {
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (req) req.call(el).catch(() => {});
  };

  useEffect(() => {
    if (!active) return;
    document.body.classList.add("qp-lockdown");
    armed.current = true;

    const blockContextMenu = (e) => e.preventDefault();

    const blockKeys = (e) => {
      const k = e.key?.toLowerCase();
      const blockedCombo =
        k === "f12" ||
        (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(k)) ||
        (e.metaKey && e.altKey && ["i", "j", "c"].includes(k)) ||
        (e.ctrlKey && ["u", "s", "p"].includes(k)) ||
        (e.metaKey && ["u", "s", "p"].includes(k));
      if (blockedCombo) {
        e.preventDefault();
        onViolation?.("shortcut");
      }
    };

    const blockCopy = (e) => e.preventDefault();

    const handleVisibility = () => {
      if (document.hidden) onViolation?.("tab-switch");
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) onViolation?.("fullscreen-exit");
    };

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("keydown", blockKeys);
    document.addEventListener("copy", blockCopy);
    document.addEventListener("visibilitychange", handleVisibility);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.body.classList.remove("qp-lockdown");
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("visibilitychange", handleVisibility);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    };
  }, [active, onViolation]);

  return { enterFullscreen };
}
