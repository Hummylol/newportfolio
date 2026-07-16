# Hero Intro Animation — Prompt for Coding Agent

Paste this directly to your coding agent (Claude Code, Cursor, etc.) working on the Next.js portfolio.

---

## Objective

Build a preloader-style intro animation for the hero section. The name **"HUMAID SADATH"** (two lines, stacked — HUMAID on top, SADATH below, exactly as it already appears in the hero) should:

1. Start **perfectly centered** in the viewport (horizontally and vertically), large scale, as a full-screen intro/splash state.
2. Hold for **~2–2.5 seconds**.
3. Animate smoothly into its **final resting position at the bottom-left of the hero** (the exact position/size it already occupies in the current hero design — do not change that final layout).
4. As it settles, the rest of the hero content (the "FULL-STACK DEVELOPER · CHENNAI, IN" label, the rotating badge top-right, the "VIEW WORK" button) should reveal with a light staggered fade/slide-in, so the whole hero feels like it "arrives" together rather than the name just relocating in isolation.

Reference for the *type* of motion (not the exact end position): lukebaffait.fr — name centered on load, then transitions out after a couple seconds. Ours ends bottom-left instead of wherever theirs lands, and ours stays as two stacked lines the whole time (never single line).

## Critical implementation constraint

**Use ONE single DOM element/text block for both states.** Do not render a separate "loader name" and a separate "hero name" — that causes a visible swap/flash. The same `<h1>` (or whatever holds "HUMAID / SADATH") should physically move from center-screen to its final bottom-left position. This is a FLIP-style transform, not a crossfade between two elements.

Recommended approach:
- Render the hero exactly as it already exists (final layout untouched).
- On mount, measure the name element's final `getBoundingClientRect()`.
- Compute the delta needed to place that same element dead-center of the viewport (accounting for its own width/height so it's truly centered, and probably scaled up ~1.4–1.8x for the "big splash" feel).
- Apply that offset instantly (no flash — do this before paint, e.g. via `useLayoutEffect` or GSAP `gsap.set()` on mount) so the name appears centered+scaled first.
- After the hold, animate `x`, `y`, and `scale` back to `0`/`1` (its natural final position) using GSAP.
- This way the "final position" source of truth is just your existing CSS layout — nothing hardcoded, fully responsive.

This is the GSAP **Flip plugin** pattern in spirit (using `gsap.Flip` if available, or manual `getBoundingClientRect` math if not). Either is fine — manual math is perfectly sufficient here since it's a single element.

## Animation sequence & timing

| Phase | Time | What happens |
|---|---|---|
| 0. Setup | on mount, before first paint | Name jumps (no animation) to centered+scaled position. Rest of hero content (badge, tagline, button) set to `opacity: 0`. Body scroll locked. |
| 1. Hold | 0s → ~2.2s | Name sits centered and scaled up. Optional: very subtle breathing/idle motion (e.g. tiny scale pulse or letter-spacing shift) so it doesn't feel static — keep it minimal. |
| 2. Transition | ~2.2s → ~3.3s (~1–1.2s duration) | Name animates via `x`, `y`, `scale` back to its natural bottom-left position. Use an eased curve, NOT linear — see easing note below. |
| 3. Reveal | overlapping the tail end of phase 2, starting ~2.8s | Tagline, badge, and CTA button fade/slide in with a small stagger (e.g. 0.08–0.12s apart). Scroll unlocks. Pointer events re-enabled on the name (see hover note). |

Use a single GSAP `timeline()` for phases 1–3 so everything is scrubbed off one clock — don't chain separate `setTimeout`s, it gets janky and hard to tune.

## Motion feel ("smooth, silky, sleek")

- **Easing**: use `power3.inOut` or `power4.inOut` for the main move — avoid `linear` and avoid bouncy/elastic eases here, this should feel controlled and premium, not playful.
- **Animate `transform` only** (`x`, `y`, `scale` via GSAP, which maps to CSS `translate`/`scale`) — never animate `top`/`left`/`width`/`font-size` directly, that forces layout recalculation every frame and will look choppy. Scaling the whole text block via `transform: scale()` (with `transform-origin` matched to how it should shrink toward its final anchor) is the performant way to fake a size change.
- Set `will-change: transform` on the name element during the animation only (remove it after, so the browser doesn't keep an idle layer around).
- If both lines (HUMAID / SADATH) are separate elements, animate them as one grouped unit (wrap in a container and transform the container) rather than animating each line with slightly different timing — keep them locked together as a single block during the move, per your "on top of each other" requirement.

## Interaction with the existing hover animation

You mentioned the name already has a hover effect once it's in its resting bottom-left position. Make sure:
- `pointer-events: none` on the name during phases 0–2 (so a stray mouse move mid-flight doesn't trigger hover state).
- Re-enable `pointer-events: auto` only once the timeline reaches phase 3 (e.g. via a GSAP `.add(() => {...})` callback at that point in the timeline), so the hover behavior is untouched and only becomes live once the name has actually arrived.

## Accessibility & edge cases

- Respect `prefers-reduced-motion`: if set, skip straight to the final state with no intro (just fade the whole hero in over ~0.3s), no centered hold.
- Only run the full intro once per session — gate it behind a `sessionStorage` flag (e.g. `introPlayed`) so refreshing or navigating back doesn't replay the 3-second intro every time. On repeat visits within the session, render straight into the final hero state.
- Make sure the centered/scaled starting state is computed responsively (recalculate on resize if the intro is still in progress — or simplest: just don't allow resize mid-intro since it's only ~3 seconds).
- Preload/ensure the blackletter custom font is loaded before starting the timeline (`document.fonts.ready`), otherwise the centered text will visibly reflow/jump if the font swaps in mid-animation.

## Suggested skeleton (adapt to your actual component structure)

```js
useLayoutEffect(() => {
  if (sessionStorage.getItem('introPlayed') || prefersReducedMotion) {
    return; // render final state as-is, skip animation entirely
  }

  document.fonts.ready.then(() => {
    const nameEl = nameRef.current;
    const rect = nameEl.getBoundingClientRect();

    const scale = 1.6; // tune to taste
    const targetCenterX = window.innerWidth / 2;
    const targetCenterY = window.innerHeight / 2;
    const currentCenterX = rect.left + rect.width / 2;
    const currentCenterY = rect.top + rect.height / 2;

    const startX = targetCenterX - currentCenterX;
    const startY = targetCenterY - currentCenterY;

    gsap.set(nameEl, { x: startX, y: startY, scale, transformOrigin: 'center center' });
    gsap.set([taglineRef.current, badgeRef.current, ctaRef.current], { opacity: 0, y: 12 });
    document.body.style.overflow = 'hidden';
    nameEl.style.pointerEvents = 'none';

    const tl = gsap.timeline({
      delay: 2.2,
      onComplete: () => {
        document.body.style.overflow = '';
        nameEl.style.pointerEvents = 'auto';
        nameEl.style.willChange = 'auto';
        sessionStorage.setItem('introPlayed', '1');
      },
    });

    nameEl.style.willChange = 'transform';

    tl.to(nameEl, { x: 0, y: 0, scale: 1, duration: 1.1, ease: 'power4.inOut' })
      .to([badgeRef.current], { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.5')
      .to([taglineRef.current], { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.35')
      .to([ctaRef.current], { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.25');
  });
}, []);
```

This is a starting skeleton, not final code — the agent should adapt ref names, the exact `scale` value, and stagger offsets (`-=0.5` etc.) to match the actual JSX structure and get the reveal timing feeling right by eye.

## Do / Don't summary

- ✅ Single element, moved via transform — not two elements crossfading
- ✅ One GSAP timeline driving the whole sequence
- ✅ `power3.inOut` / `power4.inOut` easing, ~1–1.2s for the main move
- ✅ Respect `prefers-reduced-motion` and only play once per session
- ❌ Don't animate `top`/`left`/`font-size` — transform only
- ❌ Don't hardcode the bottom-left pixel position — derive it from the existing final layout via `getBoundingClientRect`, so it stays responsive
- ❌ Don't let hover interactions fire before the name has fully landed
