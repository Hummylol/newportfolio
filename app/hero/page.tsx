'use client';

import './hero.css';
import { useEffect, useRef } from 'react';
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
  const line1Ref    = useRef<HTMLDivElement>(null);
  const line2Ref    = useRef<HTMLDivElement>(null);
  const eyebrowRef  = useRef<HTMLDivElement>(null);
  const badgeZoneRef = useRef<HTMLDivElement>(null);
  const badgeRef    = useRef<HTMLAnchorElement>(null);
  const ctaZoneRef  = useRef<HTMLDivElement>(null);
  const ctaRef      = useRef<HTMLAnchorElement>(null);

  /* Entrance animation */
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from(eyebrowRef.current,  { opacity: 0, y: 10,       duration: 0.6 })
      .from(line1Ref.current,    { yPercent: 110,            duration: 0.9 }, '-=0.3')
      .from(line2Ref.current,    { yPercent: 110,            duration: 0.9 }, '-=0.75')
      .from(badgeRef.current,    { opacity: 0, scale: 0.85, duration: 0.7 }, '-=0.5')
      .from(ctaRef.current,      { opacity: 0, y: 12,        duration: 0.6 }, '-=0.4');
    return () => { tl.kill(); };
  }, []);

  /* Magnetic effects */
  useMagnet(badgeZoneRef as React.RefObject<HTMLElement>, badgeRef as React.RefObject<HTMLElement>, 0.38);
  useMagnet(ctaZoneRef   as React.RefObject<HTMLElement>, ctaRef   as React.RefObject<HTMLElement>, 0.4);

  return (
    <section className="relative h-screen w-full flex flex-col justify-end bg-background text-foreground overflow-hidden p-[clamp(24px,4vw,56px)]">

      {/* ── Rotating badge — top-right ─────────────────── */}
      {/* Zone is larger than badge for a generous magnetic field */}
      <div
        ref={badgeZoneRef}
        className="absolute z-10 flex items-center justify-center"
        style={{
          top:    'clamp(22px, 3vw, 42px)',   /* ~6px lower than before */
          right:  'clamp(10px, 3vw, 40px)',
          width:  'clamp(180px, 17vw, 220px)',
          height: 'clamp(180px, 17vw, 220px)',
        }}
      >
        <a
          ref={badgeRef}
          href="#work"
          className="relative flex items-center justify-center no-underline text-foreground will-change-transform"
          style={{
            width:  'clamp(160px, 16vw, 200px)',
            height: 'clamp(160px, 16vw, 200px)',
          }}
        >
          {/* Spinning text ring */}
          <svg
            viewBox="0 0 120 120"
            className="badge-ring absolute inset-0 w-full h-full"
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

          {/* Sharp 4-pointed star — matches pasted image */}
          <svg
            viewBox="0 0 100 100"
            fill="currentColor"
            aria-hidden="true"
            className="relative z-10 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:rotate-45 hover:scale-110"
            style={{ width: 'clamp(32px, 3.5vw, 44px)', height: 'clamp(32px, 3.5vw, 44px)' }}
          >
            <path d="M50 0 C50 0 44 44 0 50 C0 50 44 56 50 100 C50 100 56 56 100 50 C100 50 56 44 50 0Z" />
          </svg>
        </a>
      </div>

      {/* ── Main content ───────────────────────────────── */}
      <div className="flex flex-col" style={{ gap: 'clamp(18px, 2.5vw, 32px)' }}>

        {/* Eyebrow */}
        <div
          ref={eyebrowRef}
          className="uppercase tracking-[0.12em] opacity-45"
          style={{ fontFamily: 'var(--font-sf-text), system-ui, sans-serif', fontSize: 'clamp(11px, 1vw, 14px)' }}
        >
          Full-Stack Developer · Chennai, IN
        </div>

        <div className="w-screen">
          <div className="w-fit">
            <LineTextGL
              ref={line1Ref}
              text="HUMAID"
              className="text-foreground"
              style={{
                fontFamily:   'var(--font-qin), "Arial Black", sans-serif',
                fontSize:     'clamp(80px, 18vw, 230px)',
                lineHeight:   1,
                letterSpacing: '-0.02em',
              }}
            />
          </div>
          <div className=" w-fit">
            <LineTextGL
              ref={line2Ref}
              text="SADATH"
              className="text-foreground"
              style={{
                fontFamily:   'var(--font-qin), "Arial Black", sans-serif',
                fontSize:     'clamp(80px, 18vw, 230px)',
                lineHeight:   1,
                letterSpacing: '-0.02em',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── View Work CTA — bottom-right ───────────────── */}
      <div
        ref={ctaZoneRef}
        className="absolute flex items-center justify-center p-6"
        style={{
          bottom: 'clamp(16px, 3vw, 40px)',
          right:  'clamp(16px, 3vw, 40px)',
        }}
      >
        <a
          ref={ctaRef}
          href="#work"
          className="group inline-flex items-center gap-[10px] uppercase tracking-[0.06em] no-underline text-foreground border border-border rounded-full px-[22px] py-[14px] will-change-transform transition-colors duration-300 hover:bg-foreground hover:text-background hover:border-foreground"
          style={{ fontFamily: 'var(--font-sf-text), system-ui, sans-serif', fontSize: 'clamp(12px, 1vw, 14px)' }}
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