const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=';

/**
 * Animates `el`'s text content from scrambled characters into `finalText`.
 * Respects prefers-reduced-motion by snapping straight to the final text.
 */
export function scrambleText(el: HTMLElement | null, finalText: string, duration = 700) {
  if (!el) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    el.textContent = finalText;
    return;
  }

  const start = performance.now();
  const len = finalText.length;

  function frame(now: number) {
    const progress = Math.min((now - start) / duration, 1);
    let out = '';
    for (let i = 0; i < len; i++) {
      if (finalText[i] === ' ') {
        out += ' ';
        continue;
      }
      const charProgress = progress * len - i;
      if (charProgress > 1) out += finalText[i];
      else if (charProgress > 0) out += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }
    if (el) el.textContent = out;
    if (progress < 1) requestAnimationFrame(frame);
    else if (el) el.textContent = finalText;
  }

  requestAnimationFrame(frame);
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
