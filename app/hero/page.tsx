'use client';

import './hero.css';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import LineTextGL from './LineTextGL';

/* ── Magnetic hook ─────────────────────────────────────── */
function useMagnet(
  zoneRef: React.RefObject<HTMLElement | null>,
  targetRef: React.RefObject<HTMLElement | null>,
  strength = 0.4,
) {
  useEffect(() => {
    const zone = zoneRef.current;
    const target = targetRef.current;
    if (!zone || !target) return;

    const moveX = gsap.quickTo(target, 'x', { duration: 0.45, ease: 'power3' });
    const moveY = gsap.quickTo(target, 'y', { duration: 0.45, ease: 'power3' });

    const onMove = (e: MouseEvent) => {
      const r = zone.getBoundingClientRect();
      moveX((e.clientX - (r.left + r.width / 2)) * strength);
      moveY((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const onLeave = () => { moveX(0); moveY(0); };

    zone.addEventListener('mousemove', onMove);
    zone.addEventListener('mouseleave', onLeave);
    return () => {
      zone.removeEventListener('mousemove', onMove);
      zone.removeEventListener('mouseleave', onLeave);
    };
  }, [zoneRef, targetRef, strength]);
}

/* ── Component ─────────────────────────────────────────── */
export default function Hero() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const nameBlockRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const badgeZoneRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLAnchorElement>(null);
  const ctaZoneRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const introTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const introRanRef = useRef(false);
  const [showCounter, setShowCounter] = useState(true);

  /* ── FLIP-style intro animation ──────────────────────── */
  useLayoutEffect(() => {
    // Guard: only run once
    if (introRanRef.current) return;
    introRanRef.current = true;

    const nameEl = nameBlockRef.current;
    const eyebrowEl = eyebrowRef.current;
    const badgeEl = badgeRef.current;
    const ctaEl = ctaRef.current;
    if (!nameEl || !eyebrowEl || !badgeEl || !ctaEl) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const alreadyPlayed = sessionStorage.getItem('introPlayed');

    if (prefersReducedMotion || alreadyPlayed) {
      // Skip intro — show everything in final state
      gsap.set(nameEl, { autoAlpha: 1 });
      gsap.set([eyebrowEl, badgeEl, ctaEl], { opacity: 1, y: 0 });
      return;
    }

    // Phase 0: Hide supporting elements immediately (before paint)
    gsap.set(eyebrowEl, { opacity: 0, y: 12 });
    gsap.set(badgeEl, { opacity: 0, scale: 0.85 });
    gsap.set(ctaEl, { opacity: 0, y: 12 });
    // Name starts invisible — we'll reveal after positioning
    gsap.set(nameEl, { autoAlpha: 0 });


    // Wait for fonts, then measure and animate
    document.fonts.ready.then(() => {
      if (!nameEl) return;

      const mobile = window.innerWidth < 768;
      const scale = mobile ? 0.5 : 0.45;

      // Measure the name block's final resting rect (w-fit = tight around text)
      const rect = nameEl.getBoundingClientRect();

      const vpCenterX = window.innerWidth / 2;
      const vpCenterY = window.innerHeight / 2;
      const elCenterX = rect.left + rect.width / 2;
      const elCenterY = rect.top + rect.height / 2;

      // Offset needed to center the element on screen
      const startX = vpCenterX - elCenterX;
      const startY = vpCenterY - elCenterY;

      // Apply centered + scaled position, then reveal
      gsap.set(nameEl, {
        x: startX,
        y: startY,
        scale,
        transformOrigin: 'center center',
        autoAlpha: 1, // reveal now that transform is applied — no flash
      });

      // Lock scroll and disable hover interactions
      document.body.style.overflow = 'hidden';
      nameEl.style.pointerEvents = 'none';
      nameEl.style.willChange = 'transform';

      // ── 0→100 counter animation (runs during the 2.2s hold) ──
      const counterEl = counterRef.current;
      const counterObj = { val: 0 };
      let counterTween: gsap.core.Tween | null = null;
      if (counterEl) {
        gsap.set(counterEl, { autoAlpha: 1 });
        counterTween = gsap.to(counterObj, {
          val: 100,
          duration: 2.2,
          ease: 'power2.inOut',
          onUpdate: () => {
            counterEl.textContent = `${Math.round(counterObj.val)}`;
          },
        });
      }

      // Master timeline (starts after 2.2s hold)
      const tl = gsap.timeline({
        delay: 2.2,
        onComplete: () => {
          document.body.style.overflow = '';
          nameEl.style.pointerEvents = 'auto';
          nameEl.style.willChange = 'auto';
          setShowCounter(false);
          sessionStorage.setItem('introPlayed', '1');
        },
      });

      introTimelineRef.current = tl;

      // Phase 2: Fade out counter + name expands to final position
      if (counterEl) {
        tl.to(counterEl, {
          autoAlpha: 0,
          y: -10,
          duration: 0.4,
          ease: 'power2.in',
        }, 0);
      }
      tl.to(nameEl, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 1.1,
        ease: 'power4.inOut',
      }, 0)
        // Phase 3: Staggered reveal
        .to(badgeEl, {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: 'power2.out',
        }, '-=0.5')
        .to(eyebrowEl, {
          opacity: 0.45,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
        }, '-=0.35')
        .to(ctaEl, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
        }, '-=0.25');
    });

    return () => {
      if (introTimelineRef.current) {
        introTimelineRef.current.kill();
      }
    };
  }, []); // no dependencies — runs once on mount

  /* Magnetic effects */
  useMagnet(badgeZoneRef as React.RefObject<HTMLElement>, badgeRef as React.RefObject<HTMLElement>, 0.38);
  useMagnet(ctaZoneRef as React.RefObject<HTMLElement>, ctaRef as React.RefObject<HTMLElement>, 0.4);

  return (
    <section id="hero-section" className="relative h-screen w-full flex flex-col justify-end bg-background text-foreground overflow-hidden p-[clamp(24px,4vw,56px)]">

      {/* ── Loader counter — top-right ─────────────────── */}
      {showCounter && (
        <div
          ref={counterRef}
          className="fixed top-[15vh] left-1/2 -translate-x-1/2 right-auto md:top-[clamp(24px,4vw,56px)] md:right-[clamp(24px,4vw,56px)] md:left-auto md:translate-x-0 z-[2000] font-mono tabular-nums tracking-tighter text-foreground font-bold"
          style={{
            fontSize: 'clamp(32px, 2.5vw, 42px)',
            fontFamily: 'var(--font-sf-display), var(--font-sf-text), ui-monospace, monospace',
            visibility: 'hidden',
            lineHeight: 1,
          }}
        >
          0
        </div>
      )}

      {/* ── Rotating badge — top-right ─────────────────── */}
      <div
        ref={badgeZoneRef}
        className="absolute  z-10 flex items-center justify-center"
        style={{
          top: isMobile ? '80px' : 'clamp(20px, 3vw, 50px)',
          right: 'clamp(8px, 2vw, 40px)',
          width: 'clamp(100px, 12vw, 220px)',
          height: 'clamp(100px, 12vw, 220px)',
        }}
      >
        <a
          ref={badgeRef}
          className="relative flex items-center justify-center no-underline text-foreground will-change-transform"
          style={{
            width: 'clamp(85px, 10vw, 200px)',
            height: 'clamp(85px, 10vw, 200px)',
            opacity: 0,
            transform: 'scale(0.85)',
          }}
        >
          {/* Spinning text ring */}
          <svg
            viewBox="0 0 120 120"
            className="badge-ring absolute inset-0 w-full h-full "
            style={{ animation: 'spin 20s linear infinite' }}
            aria-hidden="true"
          >
            <defs>
              <path id="heroCircle" d="M 60,60 m -50,0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0" />
            </defs>
            <text
              fontSize="11"
              letterSpacing="3.8"
              fill="currentColor"
              fontFamily="var(--font-sf-text), system-ui, sans-serif"
            >
              <textPath href="#heroCircle">
                DESIGNER &amp; DEVELOPER • DESIGNER &amp; DEVELOPER •{' '}
              </textPath>
            </text>
          </svg>

          {/* Sharp 4-pointed star */}
          <svg
            viewBox="0 0 100 100"
            fill="currentColor"
            aria-hidden="true"
            className="relative z-10 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:rotate-45 hover:scale-110"
            style={{ width: 'clamp(20px, 2.5vw, 44px)', height: 'clamp(20px, 2.5vw, 44px)' }}
          >
            <path d="M50 0 C50 0 44 44 0 50 C0 50 44 56 50 100 C50 100 56 56 100 50 C100 50 56 44 50 0Z" />
          </svg>
        </a>
      </div>

      {/* ── Main content ───────────────────────────────── */}
      <div className={isMobile ? "flex flex-col relative z-10 w-full mb-[12vh]" : "flex flex-col absolute bottom-0"} style={{ gap: 'clamp(18px, 2.5vw, 32px)' }}>

        {/* Eyebrow */}
        <div
          ref={eyebrowRef}
          className="uppercase tracking-[0.12em] opacity-45"
          style={{
            fontFamily: 'var(--font-sf-text), system-ui, sans-serif',
            fontSize: 'clamp(11px, 1vw, 14px)',
            opacity: 0,
            transform: 'translateY(12px)',
          }}
        >
          Full-Stack Developer · Chennai, IN
        </div>

        {/* Outer layout container keeps w-screen for final layout */}
        <div className={isMobile ? "w-full" : "w-screen"}>
          {/* Inner w-fit wrapper — this is what gets animated (tight around text) */}
          <div ref={nameBlockRef} className="w-fit" style={{ visibility: 'hidden' }}>
            <div className="w-fit" data-hero-name>
              <LineTextGL
                ref={line1Ref}
                text="HUMAID"
                className=""
                style={{
                  fontFamily: 'var(--font-qin), "Arial Black", sans-serif',
                  fontSize: 'clamp(60px, 12vw, 180px)',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              />
            </div>
            <div
              className={isMobile ? "w-fit" : "w-fit -mt-10"}
              style={isMobile ? { marginTop: 'calc(-0.23 * clamp(60px, 12vw, 180px))' } : undefined}
              data-hero-name
            >
              <LineTextGL
                ref={line2Ref}
                text="SADATH"
                className=""
                style={{
                  fontFamily: 'var(--font-qin), "Arial Black", sans-serif',
                  fontSize: 'clamp(60px, 12vw, 180px)',
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── View Work CTA — bottom-right ───────────────── */}
      <div
        ref={ctaZoneRef}
        className="absolute flex items-center justify-center p-6"
        style={{
          bottom: 'clamp(16px, 3vw, 40px)',
          right: 'clamp(16px, 3vw, 40px)',
        }}
      >
        <a
          ref={ctaRef}
          href="#projects-section"
          data-cursor-minimize
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("projects-section")?.scrollIntoView({ behavior: "smooth" });
          }}
          className="group inline-flex items-center gap-[10px] uppercase tracking-[0.06em] no-underline text-foreground border border-border rounded-full px-[22px] py-[14px] will-change-transform transition-colors duration-300 hover:bg-foreground hover:text-background hover:border-foreground"
          style={{
            fontFamily: 'var(--font-sf-text), system-ui, sans-serif',
            fontSize: 'clamp(12px, 1vw, 14px)',
            opacity: 0,
            transform: 'translateY(12px)',
          }}
        >
          View Work
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="w-[14px] h-[14px] transition-transform duration-300 group-hover:translate-x-[3px] group-hover:-translate-y-[3px]"
            aria-hidden="true"
          >
            <path d="M7 17L17 7M17 7H9M17 7V15" />
          </svg>
        </a>
      </div>

    </section>
  );
}