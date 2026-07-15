"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const About = () => {
  const topRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const leftDrawerRef = useRef<HTMLDivElement>(null)
  const rightDrawerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const bioRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement[]>([])
  const statsRef = useRef<HTMLDivElement[]>([])

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Shutter splitting animation - bound to scroll (scrub)
      const shutterTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })

      shutterTl
        .to(topRef.current, { yPercent: -101, ease: "none" })
        .to(bottomRef.current, { yPercent: 101, ease: "none" }, "<")
        .to(leftDrawerRef.current, { xPercent: -101, ease: "power2.out" }, "0.2")
        .to(rightDrawerRef.current, { xPercent: 101, ease: "power2.out" }, "<")

      // Content reveal animation - triggered on entry once
      const contentTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top+=15% top",
          toggleActions: "play reverse play reverse",
        },
      })

      // Initial states
      gsap.set(contentRef.current, { opacity: 0 })
      gsap.set(headingRef.current, { y: 40, opacity: 0 })
      gsap.set(bioRef.current, { y: 30, opacity: 0 })
      gsap.set(cardsRef.current, { y: 30, opacity: 0, scale: 0.98 })
      gsap.set(statsRef.current, { y: 20, opacity: 0 })

      contentTl
        .to(contentRef.current, { opacity: 1, duration: 0.5 })
        .to(headingRef.current, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }, "0.05")
        .to(bioRef.current, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }, "0.1")
        .to(
          cardsRef.current,
          { y: 0, opacity: 1, scale: 1, duration: 0.25, stagger: 0.08, ease: "power3.out" },
          "0.3"
        )
        .to(
          statsRef.current,
          { y: 0, opacity: 1, duration: 0.25, stagger: 0.06, ease: "power2.out" },
          "0.5"
        )
    }, containerRef)

    return () => ctx.revert()
  }, [isMobile])

  const addCardRef = (el: HTMLDivElement | null, index: number) => {
    if (el) cardsRef.current[index] = el
  }

  const addStatRef = (el: HTMLDivElement | null, index: number) => {
    if (el) statsRef.current[index] = el
  }

  return (
    <div
      id="about-section"
      ref={containerRef}
      className="h-[130vh] w-full relative bg-transparent"
    >
      <div
        ref={stickyRef}
        className="h-screen w-full sticky top-0 overflow-hidden text-foreground bg-background transition-colors duration-500"
      >
        {/* ── Shutter overlays ── */}
        <div
          ref={topRef}
          className="h-1/2 w-screen absolute z-40 flex justify-center items-end bg-background"
        >
          <div className="h-[15vw] md:h-[25vw] overflow-hidden">
            <div className="text-[12vw] md:text-[20vw] text-foreground leading-none translate-y-[68%] font-[Qinferly] transition-colors duration-500">
              ABOUT
            </div>
          </div>
        </div>

        <div
          ref={bottomRef}
          className="h-1/2 w-screen absolute bottom-0 z-40 flex justify-center items-start bg-background"
        >
          <div className="h-[15vw] md:h-[25vw] overflow-hidden">
            <div className="text-[12vw] md:text-[20vw] text-foreground leading-none translate-y-[-56.7%] font-[Qinferly] transition-colors duration-500">
              ABOUT
            </div>
          </div>
          {/* Editorial Shutter-split Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-50 select-none">
            <span className="text-[10px] font-body tracking-[0.3em] text-foreground/45 uppercase">
              scroll to split
            </span>
            <div className="text-[9px] font-mono text-foreground/35 flex items-center gap-1">
              <span>[</span>
              <span className="inline-block animate-arrow-slide">↓</span>
              <span>]</span>
            </div>
          </div>
        </div>

        {/* ── Horizontal drawers ── */}
        <div className="h-full w-full absolute flex justify-center items-center overflow-hidden z-0 bg-background">
          <div ref={leftDrawerRef} className="absolute inset-y-0 left-0 w-1/2 bg-foreground z-30" />
          <div ref={rightDrawerRef} className="absolute inset-y-0 right-0 w-1/2 bg-foreground z-30" />

          {/* ── Main content ── */}
          <div ref={contentRef} className="relative w-full h-full flex flex-col justify-start md:justify-center pt-24 md:pt-28 pb-8 md:pb-12 opacity-0 p-6 md:p-12 lg:p-16 overflow-y-auto md:overflow-hidden">
            <div className="w-full max-w-6xl mx-auto">
              {/* Top section: Heading + Bio */}
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 lg:gap-16 mb-8 md:mb-12">
                {/* Left: Heading */}
                <div ref={headingRef} className="lg:max-w-md">
                  <div className="text-xs md:text-sm font-body tracking-[0.3em] text-foreground/55 uppercase mb-3 font-bold">
                    [ 00 — Who I Am ]
                  </div>
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-[Qinferly] font-bold tracking-tight text-foreground leading-[0.95]">
                    Creative
                    <br />
                    Developer
                  </h2>
                </div>

                {/* Right: Bio text */}
                <div ref={bioRef} className="lg:max-w-lg lg:border-l lg:border-foreground/10 lg:pl-10">
                  <p className="text-base md:text-lg lg:text-xl leading-relaxed text-foreground/90 font-body font-medium">
                    I&apos;m Humaid Sadath — a frontend developer and designer passionate about building 
                    digital experiences that feel alive. I blend clean engineering with bold, expressive 
                    design to craft interfaces that captivate and perform.
                  </p>
                  <p className="text-sm md:text-base leading-relaxed text-foreground/60 font-body mt-4">
                    Currently pursuing Information Technology at Jerusalem College of Engineering, 
                    specializing in React ecosystems, motion design, and creative development.
                  </p>
                </div>
              </div>

              {/* Bento grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-8 md:mb-10">
                {[
                  {
                    num: "04",
                    label: "YEARS\nSTUDYING",
                    sublabel: "B.Tech IT",
                  },
                  {
                    num: "01",
                    label: "INTERNSHIP\nCOMPLETED",
                    sublabel: "Visual Tech",
                  },
                  {
                    num: "15+",
                    label: "PROJECTS\nBUILT",
                    sublabel: "Web & Design",
                  },
                  {
                    num: "∞",
                    label: "CURIOSITY\nLEVEL",
                    sublabel: "Always Learning",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    ref={(el) => addCardRef(el, index)}
                    className="bg-foreground/[0.02] border border-foreground/10 rounded-2xl p-6 md:p-7 hover:bg-foreground/[0.04] backdrop-blur-sm relative overflow-hidden transition-all duration-300"
                  >
                    <div className="relative z-10">
                      <div className="text-4xl md:text-5xl font-[Qinferly] font-bold text-foreground leading-none mb-3">
                        {item.num}
                      </div>
                      <div className="text-xs md:text-sm tracking-[0.2em] text-foreground/75 font-body uppercase leading-normal font-bold">
                        {item.label}
                      </div>
                      <div className="text-[10px] md:text-xs text-foreground/50 font-body tracking-wider mt-1.5">
                        {item.sublabel}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom bar: Stats + Contact links */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-0">
                {/* Left: quick stats */}
                <div className="flex items-center gap-6 md:gap-12">
                  {[
                    { label: "Stack", value: "React · Next · TS" },
                    { label: "Tools", value: "Figma · Blender · GSAP" },
                    { label: "Focus", value: "UI/UX & Motion" },
                  ].map((stat, index) => (
                    <div key={index} ref={(el) => addStatRef(el, index)} className="flex flex-col">
                      <span className="text-[10px] tracking-[0.25em] text-foreground/50 font-body uppercase font-bold">
                        {stat.label}
                      </span>
                      <span className="text-xs md:text-sm font-medium text-foreground/90 font-body mt-1">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Right: Social links */}
                <div className="flex items-center gap-3">
                  {[
                    { label: "Email", href: "mailto:humaidsadath2004@gmail.com" },
                    { label: "LinkedIn", href: "https://www.linkedin.com/in/humayd-sadath-8b2b2b2b2/" },
                    { label: "GitHub", href: "https://github.com/Hummylol" },
                  ].map((link, index) => (
                    <a
                      key={index}
                      ref={(el) => addStatRef(el as unknown as HTMLDivElement, index + 3)}
                      href={link.href}
                      target={link.href.startsWith("mailto") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="text-xs md:text-sm tracking-[0.15em] px-5 py-2.5 border border-foreground/15 rounded-full hover:bg-foreground hover:text-background font-body uppercase font-bold transition-all duration-300"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About