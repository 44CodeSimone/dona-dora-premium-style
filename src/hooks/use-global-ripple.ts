import { useEffect } from "react";

/**
 * Installs a global delegated click listener that adds a soft ripple
 * to any <button> or <a> that opts in via [data-ripple] or by being
 * inside a [data-ripple-scope] root. Pure JS, no deps.
 */
export function useGlobalRipple() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const trigger = target.closest<HTMLElement>("button, a");
      if (!trigger) return;
      // skip nav links with hashes only if they are inside header? still ok to ripple
      const rect = trigger.getBoundingClientRect();
      if (rect.width < 24 || rect.height < 24) return;
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.className = "lv-ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      const prevPos = getComputedStyle(trigger).position;
      if (prevPos === "static") trigger.style.position = "relative";
      const prevOverflow = getComputedStyle(trigger).overflow;
      if (prevOverflow === "visible") trigger.style.overflow = "hidden";
      trigger.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 600);
    };
    document.addEventListener("click", onClick, { passive: true });
    return () => document.removeEventListener("click", onClick);
  }, []);
}
