/** Screen-space core outlet and existing timeline share one measured X.
 * Pure geometry makes forward/reverse scrolling identical, including while
 * the camera hands the fixed composition back to document flow. */
export function signalSegment(
  railX: number,
  railY: number,
  scrollY: number,
  coreY: number,
  coreHeight: number,
  viewportHeight: number,
  release: number,
) {
  const start = scrollY + coreY + (coreHeight * 1.4) / 3.2;
  const progress = Math.min(1, Math.max(0, release));
  const end = Math.max(
    start,
    Math.min(
      railY,
      start + Math.max(0, scrollY + viewportHeight * 0.88 - start) * progress,
    ),
  );
  return { x: railX, start, end, length: end - start };
}

/** Continuous pose controls, evaluated on every scrolling animation frame.
 * Anticipation separates approach from contact; pressure follows full closure. */
export function captureProgress(scene: number) {
  const beat = (start: number, end: number) => {
    const t = Math.max(0, Math.min(1, (scene - start) / (end - start)));
    return t * t * (3 - 2 * t);
  };
  return {
    hand: beat(0.06, 0.32),
    grip: beat(0.4, 0.68),
    crush: beat(0.7, 0.84),
    release: beat(0.82, 0.98),
  };
}
