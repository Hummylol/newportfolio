"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { playSound } from "@/utils/audio";

const Github = ({ className, size = 16 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.18-.35 6.5-1.56 6.5-7.16 0-1.5-.5-2.8-1.4-3.7.14-.35.6-1.75-.14-3.65 0 0-1.15-.37-3.75 1.4a13 13 0 0 0-6.8 0c-2.6-1.77-3.75-1.4-3.75-1.4-.74 1.9-.28 3.3-.14 3.65-.9.9-1.4 2.2-1.4 3.7 0 5.56 3.32 6.8 6.5 7.15a4.8 4.8 0 0 0-1 3.03V22" />
    <path d="M9 20c-5 1.5-5-2.5-7-3" />
  </svg>
);

const Linkedin = ({ className, size = 16 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const cardVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95, 
    x: "5%", 
    y: "-5%",
    borderRadius: "24px",
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 35,
      staggerChildren: 0.03,
      staggerDirection: -1
    }
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    x: 0, 
    y: 0, 
    borderRadius: "24px",
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
      staggerChildren: 0.06,
      delayChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    x: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 250,
      damping: 20
    }
  }
};

const footerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      delay: 0.35, 
      duration: 0.3 
    } 
  }
};

export default function Navbar() {
  const pathname = usePathname();
  if (pathname === "/mainframe") return null;
  const [scrolled, setScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("up");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [theme, setTheme] = useState("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    playSound.menuOpen();
  }, [menuOpen]);

  const menuItems = [
    { label: "home", href: "/", sectionId: "hero-section", num: "00" },
    { label: "project", href: "/projects", sectionId: "projects-section", num: "01" },
    { label: "skills", href: "/skills", sectionId: "skills", num: "02" },
    { label: "about", href: "/about", sectionId: "about-section", num: "03" },
  ];

  const getNavbarText = () => {
    switch (activeSection) {
      case "hero":
        return "hey, welcome to my portfolio!!";
      case "projects":
        return "projects";
      case "skills":
        return "skills";
      case "about":
        return "about";
      default:
        return "hey, welcome to my portfolio!!";
    }
  };

  const navbarText = getNavbarText();


  useEffect(() => {
    if (pathname !== "/") {
      if (pathname === "/about") {
        setActiveSection("about");
      } else if (pathname === "/projects") {
        setActiveSection("projects");
      } else if (pathname === "/skills") {
        setActiveSection("skills");
      } else {
        setActiveSection("hero");
      }
      return;
    }

    // Use scroll-position approach instead of IntersectionObserver — more reliable with Lenis smooth scroll
    const sectionMap: { id: string; name: string }[] = [
      { id: "hero-section", name: "hero" },
      { id: "projects-section", name: "projects" },
      { id: "skills", name: "skills" },
      { id: "about-section", name: "about" },
    ];

    const updateActiveSection = () => {
      const viewportMid = window.innerHeight / 2;

      let active = "hero";
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

    // Run once immediately then on every scroll
    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
    };
  }, [pathname]);


  useEffect(() => {
    if (pathname === "/" && window.location.hash) {
      const hash = window.location.hash;
      const targetId = hash.replace("#", "");
      const target = document.getElementById(targetId);
      if (target) {
        const timeoutId = setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth" });
        }, 150);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [pathname]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    playSound.preloadAll();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    playSound.themeToggle();
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 60) {
        setScrolled(false);
        setScrollDirection("up");
      } else {
        setScrolled(true);
        if (currentScrollY > lastScrollY) {
          setScrollDirection("down");
        } else {
          setScrollDirection("up");
        }
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const isPill = scrolled && scrollDirection === "down";

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, sectionId?: string) => {
    if (pathname === "/" && sectionId) {
      e.preventDefault();
      const target = document.getElementById(sectionId);
      if (target) {
        if (sectionId === "about-section" && href === "/about") {
          window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth"
          });
        } else {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
      setMenuOpen(false);
    } else {
      setMenuOpen(false);
    }
  };

  return (
    <>
      {/* Wrapper container to align header and card relative to each other and handle shrink transitions */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 flex flex-col items-end transition-all duration-700 ease-out z-[1002] ${
          isPill
            ? "w-[90%] md:w-[55%] top-4"
            : "w-full top-0"
        }`}
      >
        <header
          className={`w-full flex items-center justify-between transition-all duration-700 ease-out ${
            menuOpen 
              ? "bg-transparent border-transparent shadow-none" 
              : "backdrop-blur-md"
          } ${
            isPill
              ? `rounded-full px-8 py-4 ${menuOpen ? "" : "bg-[var(--navbar-bg)] border border-zinc-200 dark:border-zinc-800 shadow-[0_10px_30px_var(--shadow-color)]"}`
              : `rounded-none px-8 py-2 ${menuOpen ? "" : "bg-[var(--navbar-bg)] border-b border-[var(--navbar-border)]"}`
          }`}
        >
          <div className="w-full flex justify-between items-center relative z-50">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="text-[10px] md:text-xs font-bold tracking-widest hover:opacity-80 transition-opacity uppercase font-display text-foreground select-none flex items-center"
            >
              <span className="opacity-60 mr-1.5">[</span>
              <span className="relative inline-flex items-center overflow-hidden h-4 py-0.5">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={navbarText}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="inline-block whitespace-nowrap"
                  >
                    {navbarText}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="opacity-60 ml-1.5">]</span>
            </Link>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-foreground/75 hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none cursor-pointer"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="5" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`p-2 transition-all duration-300 focus:outline-none cursor-pointer relative z-50 flex items-center justify-center rounded-full hover:scale-105 active:scale-95 shadow-md ${
                  menuOpen 
                    ? (theme === "light" ? "w-10 h-10 bg-black text-white" : "w-10 h-10 bg-white text-black")
                    : "w-10 h-10 bg-transparent text-foreground hover:bg-foreground/5 shadow-none"
                }`}
                aria-label="Toggle menu"
              >
                <div className="w-6 h-6 relative flex items-center justify-center">
                  <span 
                    className={`absolute w-5 h-[1.5px] rounded-full transition-all duration-355 ease-out ${
                      menuOpen ? "bg-current rotate-45 translate-y-0" : "bg-current -translate-y-[4px]"
                    }`} 
                  />
                  <span 
                    className={`absolute w-5 h-[1.5px] rounded-full transition-all duration-355 ease-out ${
                      menuOpen ? "bg-current -rotate-45 translate-y-0" : "bg-current translate-y-[4px]"
                    }`} 
                  />
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Floating Dropdown Card inside aligned parent wrapper (sibling to header to prevent parent backdrop-filter bugs) */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={cardVariants}
              style={{ transformOrigin: "top right" }}
              className="absolute top-full right-0 mt-4 w-[calc(100vw-2rem)] sm:w-[420px] rounded-3xl border border-background/10 bg-foreground text-background p-8 md:p-12 shadow-2xl flex flex-col justify-between select-none overflow-y-auto h-auto max-h-[calc(100vh-120px)] z-[1003]"
            >
              <div className="h-4 w-full" />

              <div className="flex-1 flex flex-col justify-center">
                <nav className="relative flex flex-col gap-2 py-2">
                  {menuItems.map((item, idx) => {
                    const isActive = 
                      (item.label === "home" && activeSection === "hero") ||
                      (item.label === "project" && activeSection === "projects") ||
                      (item.label === "skills" && activeSection === "skills") ||
                      (item.label === "about" && activeSection === "about");

                    return (
                      <motion.div
                        key={idx}
                        variants={itemVariants}
                        onMouseEnter={() => {
                          setHoveredIndex(idx);
                          playSound.menuHover();
                        }}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className="relative z-10"
                      >
                        <Link
                          href={item.href + (item.sectionId ? `#${item.sectionId}` : "")}
                          onClick={(e) => handleLinkClick(e, item.href, item.sectionId)}
                          className="group flex items-center gap-3 py-2 w-full text-left"
                        >
                          <span 
                            className={`text-2xl transition-all duration-300 ${
                              hoveredIndex === idx 
                                ? "opacity-100 translate-x-0 w-4" 
                                : "opacity-0 -translate-x-2 w-0 overflow-hidden"
                            }`}
                          >
                            •
                          </span>
                          <span 
                            className={`text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight font-display lowercase transition-all duration-300 ${
                              isActive 
                                ? "opacity-100" 
                                : "opacity-40 group-hover:opacity-100 group-hover:translate-x-1"
                            }`}
                          >
                            {item.label}
                          </span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>

              <motion.div 
                variants={footerVariants}
                className="flex justify-between items-end gap-4"
              >
                <a 
                  href="mailto:humaidsadath2004@gmail.com" 
                  className="text-xs font-mono font-medium tracking-tight opacity-70 hover:opacity-100 transition-opacity border-b border-background/20 pb-0.5"
                >
                  humaidsadath2004@gmail.com
                </a>

                <div className="flex gap-3">
                  <a 
                    href="https://github.com/Hummylol" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-background/20 hover:border-background text-background hover:bg-background hover:text-foreground flex items-center justify-center hover:scale-105 transition-all duration-300"
                    aria-label="GitHub"
                  >
                    <Github size={16} />
                  </a>
                  <a 
                    href="https://www.linkedin.com/in/humayd-sadath-8b2b2b2b2/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-background/20 hover:border-background text-background hover:bg-background hover:text-foreground flex items-center justify-center hover:scale-105 transition-all duration-300"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={16} />
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Backdrop to close menu when clicking outside - uses motion.div for animated fade out */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 z-[1000] bg-black/10 dark:bg-black/20"
          />
        )}
      </AnimatePresence>
    </>
  );
}
