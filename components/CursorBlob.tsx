"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

export default function CursorBlob() {
  const [isMobile, setIsMobile] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isOverHeroName, setIsOverHeroName] = useState(false);
  const [isOverMinimize, setIsOverMinimize] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSkillOpen, setIsSkillOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [windowWidth, setWindowWidth] = useState(1200);

  // Hovered project details for the morphing preview card
  const [hoveredProjectVideo, setHoveredProjectVideo] = useState<string | null>(null);
  const [hoveredProjectName, setHoveredProjectName] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null);

  const cursorX = useMotionValue(-300);
  const cursorY = useMotionValue(-300);

  // Moderate springy feel - not too laggy or extreme
  const springConfig = { damping: 28, stiffness: 220, mass: 0.6 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  // Separate springs for width, height, and border radius to support smooth morphing shapes
  const sizeWidthValue = useMotionValue(16);
  const sizeHeightValue = useMotionValue(16);
  const borderRadiusValue = useMotionValue(8);

  const sizeWidthSpring = useSpring(sizeWidthValue, { damping: 30, stiffness: 200, mass: 0.8 });
  const sizeHeightSpring = useSpring(sizeHeightValue, { damping: 30, stiffness: 200, mass: 0.8 });
  const borderRadiusSpring = useSpring(borderRadiusValue, { damping: 30, stiffness: 200 });

  // Handle device and window resize detection
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      const hasTouch = window.matchMedia("(pointer: coarse)").matches;
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(hasTouch || isSmallScreen);
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Monitor document.body class changes to detect if navbar menu or skill details bento is open
  useEffect(() => {
    if (isMobile) return;

    const checkBodyClasses = () => {
      setIsMenuOpen(document.body.classList.contains("menu-open"));
      setIsSkillOpen(document.body.classList.contains("skill-open"));
    };

    checkBodyClasses();

    const observer = new MutationObserver(checkBodyClasses);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [isMobile]);

  // Handle active section detection via scroll position
  useEffect(() => {
    if (isMobile) return;

    const sectionMap = [
      { id: "hero-section", name: "hero" },
      { id: "projects-section", name: "projects" },
      { id: "skills", name: "skills" },
      { id: "about-section", name: "about" },
      { id: "footer-section", name: "footer" },
    ];

    const updateActiveSection = () => {
      const viewportMid = window.innerHeight / 2;
      let active = document.getElementById("hero-section") ? "hero" : "footer";
      for (const section of sectionMap) {
        const el = document.getElementById(section.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (viewportMid >= rect.top && viewportMid < rect.bottom) {
          active = section.name;
          break;
        }
      }
      setActiveSection(active);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveSection);
  }, [isMobile]);

  // Reset video loading errors and aspect ratio when the active project changes
  useEffect(() => {
    setVideoError(false);
    setVideoAspectRatio(null);
  }, [hoveredProjectVideo]);

  // Handle cursor positioning, hover detection, and element context checks
  useEffect(() => {
    if (isMobile) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      
      const target = e.target as HTMLElement | null;
      if (target) {
        // Detect if hovering over hero name
        const isOverName = !!target.closest("[data-hero-name]");
        setIsOverHeroName(isOverName);

        // Detect if hovering over explicit minimization targets (e.g. View Work button)
        const isMinimizeTarget = !!target.closest("[data-cursor-minimize]");
        setIsOverMinimize(isMinimizeTarget);

        // Detect if hovering over a project element that exposes preview data attributes
        const projectRow = target.closest("[data-cursor-video]");
        if (projectRow) {
          const videoSrc = projectRow.getAttribute("data-cursor-video") || null;
          const projectName = projectRow.getAttribute("data-cursor-project") || null;
          setHoveredProjectVideo(videoSrc);
          setHoveredProjectName(projectName);
        } else {
          setHoveredProjectVideo(null);
          setHoveredProjectName(null);
        }

        // Detect if hovering over clickable element (for other sections or navbar)
        const isClickable = 
          target.tagName === "A" ||
          target.tagName === "BUTTON" ||
          !!target.closest("a") ||
          !!target.closest("button") ||
          target.getAttribute("role") === "button" ||
          target.style.cursor === "pointer";
          
        setIsHovered(!!isClickable);
      }

      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible, isMobile]);

  // Set the dynamic target dimensions and border-radius based on state context
  useEffect(() => {
    let width = 16;
    let height = 16;
    let radius = 8; // circle

    if (isMenuOpen || isSkillOpen) {
      width = 0; // shrink to nothing
      height = 0;
      radius = 0;
    } else if (hoveredProjectVideo) {
      // Check if the project layout needs a vertical orientation (e.g., Fitbyte)
      const isVertical = hoveredProjectName === "Fitbyte";

      if (videoAspectRatio) {
        // Respect loaded metadata aspect ratio, scaling relative to layout target widths
        const targetWidth = isVertical
          ? Math.min(windowWidth * 0.4, 250)
          : Math.min(windowWidth * 0.85, 600);
        let targetHeight = targetWidth / videoAspectRatio;

        const maxHeight = window.innerHeight * 0.7;
        if (targetHeight > maxHeight) {
          targetHeight = maxHeight;
          width = maxHeight * videoAspectRatio;
        } else {
          width = targetWidth;
        }
        height = targetHeight;
      } else {
        // Fallback target dimensions if video hasn't loaded metadata or is a placeholder
        if (isVertical) {
          const targetWidth = Math.min(windowWidth * 0.4, 250);
          width = targetWidth;
          height = targetWidth * (16 / 9); // Portrait ratio
        } else {
          const targetWidth = Math.min(windowWidth * 0.85, 600);
          width = targetWidth;
          height = targetWidth * (350 / 600); // Landscape ratio
        }
      }
      radius = 16; // rounded rectangle
    } else if (isOverMinimize) {
      width = 12;
      height = 12;
      radius = 6;
    } else if (activeSection === "hero") {
      if (isOverHeroName) {
        width = 12;
        height = 12;
        radius = 6;
      } else {
        width = 140;
        height = 140;
        radius = 70; // 140px circle
      }
    } else if (activeSection === "skills") {
      width = 140;
      height = 140;
      radius = 70; // 140px circle
    } else if (activeSection === "footer") {
      width = 0;
      height = 0;
      radius = 0;
    } else {
      // Default dot, grows slightly on hovers
      const size = isHovered ? 28 : 16;
      width = size;
      height = size;
      radius = size / 2;
    }



    sizeWidthValue.set(width);
    sizeHeightValue.set(height);
    borderRadiusValue.set(radius);
  }, [
    activeSection,
    isOverHeroName,
    isOverMinimize,
    isHovered,
    isMenuOpen,
    isSkillOpen,
    hoveredProjectVideo,
    hoveredProjectName,
    videoAspectRatio,
    windowWidth,
    sizeWidthValue,
    sizeHeightValue,
    borderRadiusValue,
  ]);

  if (isMobile || !isVisible) return null;

  // Compute visibility of text instruction states vs. project preview video states
  const showProjectPreview = !!hoveredProjectVideo;
  const showText = !isMenuOpen && !isSkillOpen && !isOverMinimize && !showProjectPreview && ((activeSection === "hero" && !isOverHeroName) || activeSection === "skills");
  const textContent = activeSection === "skills" ? "click\nor drag" : "hover\nmy name";

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[1001] transition-colors duration-500 ease-out flex items-center justify-center overflow-hidden"
      style={{
        width: sizeWidthSpring,
        height: sizeHeightSpring,
        borderRadius: borderRadiusSpring,
        x: cursorXSpring,
        y: cursorYSpring,
        translateX: "-50%",
        translateY: "-50%",
        backgroundColor: showProjectPreview ? "#000000" : "var(--foreground)",
        color: showProjectPreview ? "#ffffff" : "var(--background)",
        boxShadow: showProjectPreview 
          ? "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 255, 255, 0.05)"
          : "none",
      }}
    >
      {/* Dynamic Text Rendering */}
      <AnimatePresence>
        {showText && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            style={{
              fontSize: "11px",
              fontWeight: "bold",
              letterSpacing: "0.06em",
              lineHeight: "1.3",
              fontFamily: "var(--font-sf-text), monospace",
              whiteSpace: "pre-line",
            }}
            className="select-none text-center"
          >
            {textContent}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Dynamic Video / Title Preview Card Rendering */}
      <AnimatePresence>
        {showProjectPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`w-full h-full flex flex-col items-center justify-center text-center ${
              hoveredProjectVideo && hoveredProjectVideo !== "no-video" && !videoError ? "p-0" : "p-8"
            }`}
          >
            {hoveredProjectVideo && hoveredProjectVideo !== "no-video" && !videoError ? (
              <video
                src={hoveredProjectVideo}
                autoPlay
                loop
                muted
                playsInline
                onError={() => setVideoError(true)}
                onLoadedMetadata={(e) => {
                  const video = e.currentTarget;
                  if (video.videoWidth && video.videoHeight) {
                    setVideoAspectRatio(video.videoWidth / video.videoHeight);
                  }
                }}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-xl md:text-2xl font-bold select-none px-6 uppercase tracking-wide font-display text-center leading-snug">
                {hoveredProjectName}
                <span className="text-[10px] font-mono tracking-widest opacity-60 mt-3 block select-none">
                  [ PREVIEW ]
                </span>
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
