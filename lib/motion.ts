export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** Animate a numeric value; skips tween when reduced motion is preferred. */
export function animateValue(
  from: number,
  to: number,
  durationMs: number,
  onUpdate: (value: number) => void,
  onDone?: () => void,
): () => void {
  if (prefersReducedMotion() || durationMs <= 0) {
    onUpdate(to);
    onDone?.();
    return () => undefined;
  }

  let raf = 0;
  const start = performance.now();

  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    onUpdate(from + (to - from) * easeOutCubic(t));
    if (t < 1) raf = requestAnimationFrame(tick);
    else onDone?.();
  };

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
