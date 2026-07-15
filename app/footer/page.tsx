"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Constants from sources [5, 6]
const CHAR_RAMP = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";
const CELL_SIZE = 6; // Smaller cells for sharper hands
const HOVER_RADIUS = 60;
const BACKGROUND_CHAR = " ";

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const revealerRef = useRef<HTMLDivElement>(null);
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const leftImgRef = useRef<HTMLImageElement>(null);
  const rightImgRef = useRef<HTMLImageElement>(null);

  // Motion Tracking [7]
  const pointer = useRef({ x: 0, y: 0 });
  const drift = useRef({ x: 0, y: 0 });
  const reveal = useRef({ offset: 100 }); // Starts fully off-screen (100%)
  const footerVisible = useRef(false); // IntersectionObserver gate

  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [isFooterActive, setIsFooterActive] = useState(false); // drives z-index
  const themeRef = useRef("dark");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkTheme(isDark);
      themeRef.current = isDark ? "dark" : "light";
      window.dispatchEvent(new Event("themechange"));
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;
    // Helper to sample image and create ASCII cells [4, 8]
    const setupHand = (canvas: HTMLCanvasElement, img: HTMLImageElement) => {
      if (!canvas || !img) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let cells: any[] = [];
      let rect = canvas.getBoundingClientRect();

      const runSetup = () => {
        const cols = Math.floor(canvas.width / CELL_SIZE);
        const rows = Math.floor(canvas.height / CELL_SIZE);

        const offscreen = document.createElement("canvas");
        offscreen.width = cols;
        offscreen.height = rows;
        const offCtx = offscreen.getContext("2d", { willReadFrequently: true });

        if (!offCtx) return;

        offCtx.drawImage(img, 0, 0, cols, rows);
        const pixelData = offCtx.getImageData(0, 0, cols, rows).data;

        cells = [];
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const idx = (y * cols + x) * 4;
            const r = pixelData[idx];
            const g = pixelData[idx + 1];
            const b = pixelData[idx + 2];
            const brightness = (r + g + b) / 3;

            if (brightness < 30) continue; // Skip background [4]

            // Reverse contrast mapping so bright pixels use dense characters
            const charIdx = Math.floor((1 - brightness / 255) * (CHAR_RAMP.length - 1));
            cells.push({ x, y, char: CHAR_RAMP[charIdx] });
          }
        }
        draw(-1000, -1000); // Initial offscreen draw
      };

      const draw = (mouseX: number, mouseY: number) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${CELL_SIZE}px monospace`;
        ctx.textBaseline = "top";

        const isDark = themeRef.current === "dark";
        const normalColor = isDark ? "#ffffff" : "#000000";
        const hoverColor = isDark ? "#ff5f00" : "#ff0000";

        const normalCells: typeof cells = [];
        const hoverCells: typeof cells = [];

        // Slow time drift — makes the amoeba shape subtly morph as you move the mouse
        const t = Date.now() * 0.0007;

        // Outer bound for quick rejection before doing any trig (max wobble is ~45% extra)
        const outerBoundSq = (HOVER_RADIUS * 1.5) * (HOVER_RADIUS * 1.5);

        cells.forEach((cell) => {
          const screenX = cell.x * CELL_SIZE;
          const screenY = cell.y * CELL_SIZE;

          const dx = screenX - mouseX;
          const dy = screenY - mouseY;
          const distSq = dx * dx + dy * dy;

          // Quick rejection — definitely outside even the max wobble zone
          if (distSq > outerBoundSq) {
            normalCells.push(cell);
            return;
          }

          // Amoeba boundary: angle-based sine distortion gives organic, non-circular shape
          // 3 harmonics at different frequencies and phase offsets create an irregular blob
          const angle = Math.atan2(dy, dx);
          const wobble = 1
            + 0.30 * Math.sin(angle * 3 + t)
            + 0.18 * Math.sin(angle * 5 - t * 0.6)
            + 0.10 * Math.sin(angle * 9 + t * 1.4);

          const effectiveR = HOVER_RADIUS * wobble;
          if (distSq < effectiveR * effectiveR) {
            hoverCells.push(cell);
          } else {
            normalCells.push(cell);
          }
        });

        // Batch draw normal cells (one fillStyle change for the whole batch)
        ctx.fillStyle = normalColor;
        normalCells.forEach((cell) => {
          ctx.fillText(cell.char, cell.x * CELL_SIZE, cell.y * CELL_SIZE);
        });

        // Batch draw hover cells
        if (hoverCells.length > 0) {
          ctx.fillStyle = hoverColor;
          hoverCells.forEach((cell) => {
            ctx.fillText(cell.char, cell.x * CELL_SIZE, cell.y * CELL_SIZE);
          });
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!footerVisible.current) return; // Skip drawing when footer is off-screen
        const mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
        const mouseY = ((e.clientY - rect.top) / rect.height) * canvas.height;
        draw(mouseX, mouseY);
      };

      const updateRect = () => {
        rect = canvas.getBoundingClientRect();
      };

      const handleThemeChange = () => {
        draw(-1000, -1000);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("resize", updateRect);
      window.addEventListener("themechange", handleThemeChange);

      if (img.complete) runSetup();
      else img.onload = runSetup;

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", updateRect);
        window.removeEventListener("themechange", handleThemeChange);
      };
    };

    const ctx = gsap.context(() => {
      // 1. Initial State
      gsap.set(".char", { y: "105%" });

      // 2. Main ScrollTrigger Timeline [11, 12]
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: revealerRef.current,
          start: "top center",
          end: "bottom center",
          toggleActions: "play reverse play reverse",
          markers: false,
        },
      });

      tl.to(reveal.current, { offset: 0, duration: 1.5, ease: "power4.out" }, 0)
        .to(".char", {
          y: "0%",
          duration: 1.2,
          stagger: { each: 0.05, from: "center" },
          ease: "power4.out",
        }, 0.2);

      // 3. Parallax Drift Render Loop [7, 13]
      // Only runs when footer is visible — gated by IntersectionObserver ref
      gsap.ticker.add(() => {
        if (!footerVisible.current) return;

        const normalizedX = (pointer.current.x / window.innerWidth - 0.5) * 100;
        drift.current.x += (normalizedX - drift.current.x) * 0.05;

        // Hands drift in opposite directions for 3D feel [13]
        const leftX = -reveal.current.offset - (drift.current.x * 0.1);
        const rightX = reveal.current.offset + (drift.current.x * 0.1);

        gsap.set(".hand-left", { xPercent: leftX });
        gsap.set(".hand-right", { xPercent: rightX });
      });
    });

    const cleanups: (() => void)[] = [];
    if (leftCanvasRef.current && leftImgRef.current) {
      const cleanup = setupHand(leftCanvasRef.current, leftImgRef.current);
      if (cleanup) cleanups.push(cleanup);
    }
    if (rightCanvasRef.current && rightImgRef.current) {
      const cleanup = setupHand(rightCanvasRef.current, rightImgRef.current);
      if (cleanup) cleanups.push(cleanup);
    }

    // IntersectionObserver: watch the scrolling revealer div (NOT the fixed footer)
    // The fixed footer is always in viewport; the revealer scrolls with the page
    // Also drives isFooterActive state for dynamic z-index (links need z:1 to be clickable)
    let observer: IntersectionObserver | null = null;
    if (revealerRef.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          footerVisible.current = entry.isIntersecting;
          setIsFooterActive(entry.isIntersecting);
        },
        { threshold: 0.01 }
      );
      observer.observe(revealerRef.current);
    }

    const handleMouseMoveGlobal = (e: MouseEvent) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMoveGlobal);
    return () => {
      ctx.revert();
      window.removeEventListener("mousemove", handleMouseMoveGlobal);
      cleanups.forEach((cb) => cb());
      if (observer) observer.disconnect();
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <>

      {/* Scroll Trigger Marker — pointer-events-none so it never blocks clicks */}
      <div id="footer-revealer" ref={revealerRef} className="h-screen w-full bg-transparent pointer-events-none" />

      <footer
        id="footer-section"
        ref={footerRef}
        className={`fixed top-0 left-0 w-full h-screen flex flex-col justify-between p-10 overflow-hidden transition-colors duration-500 ${isDarkTheme ? "bg-black text-white" : "bg-white text-black"}`}
        style={{ zIndex: isFooterActive ? 1 : -1 }} // Dynamic: 1 when visible (links clickable), -1 otherwise
      >

        <div className="absolute inset-0 flex justify-between items-center pointer-events-none px-4">
          <div className="hand-left w-[820px] h-[700px] flex items-center justify-center">
            <img ref={leftImgRef} src="/hand-left.png" className="hidden" alt="source" />
            <canvas ref={leftCanvasRef} width={820} height={700} className="w-full h-full object-contain" />
          </div>
          <div className="hand-right w-[820px] h-[700px] flex items-center justify-center">
            <img ref={rightImgRef} src="/hand-right.png" className="hidden" alt="source" />
            <canvas ref={rightCanvasRef} width={820} height={700} className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Top Bar: left = contact info, right = links [1] */}
        <div className="relative z-10 flex justify-between items-start">

          {/* Left: email + copyright */}
          <div className="flex flex-col gap-1">
            <a
              href="mailto:humaidsadath2004@gmail.com"
              className="footer-link uppercase text-xs tracking-widest opacity-80"
            >
              humaidsadath2004@gmail.com
            </a>
            <span className="uppercase text-xs tracking-widest opacity-50">&copy; 2026</span>
          </div>

          {/* Right: social links */}
          <div className="flex flex-col gap-2 items-end">
            {[
              { label: "GitHub",   href: "https://github.com/Hummylol" },
              { label: "LinkedIn", href: "https://www.linkedin.com/in/humaid-sadath-b0850841a" },
              { label: "Instagram",href: "https://www.instagram.com/humaidsadath" },
              { label: "LeetCode", href: "https://leetcode.com/u/Humaidlol/" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link uppercase text-xs tracking-widest opacity-80"
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Heading: HUMAID SADATH [3, 14] */}
        <div className="relative z-10 flex justify-between items-end w-full bottom-0">
          <h1 className="text-[13vw] font-bold leading-[0.95] tracking-tighter flex overflow-hidden pr-[0.05em]">
            {"HUMAID".split("").map((c, i) => (
              <span key={i} className="char block">{c}</span>
            ))}
          </h1>
          <h1 className="text-[13vw] font-bold leading-[0.95] tracking-tighter flex overflow-hidden pr-[0.05em]">
            {"SADATH".split("").map((c, i) => (
              <span key={i} className="char block">{c}</span>
            ))}
          </h1>
        </div>
      </footer>
    </>
  );
}