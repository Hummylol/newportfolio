"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("up");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [theme, setTheme] = useState("dark");
  const [menuOpen, setMenuOpen] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Scroll listener for dynamic island squeeze
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

  return (
    <>
      <header
        className={`fixed left-1/2 -translate-x-1/2 z-50 flex items-center justify-between transition-all duration-700 ease-out backdrop-blur-md ${
          isPill
            ? "w-[90%] md:w-[55%] top-4 rounded-full px-8 py-4 bg-[var(--navbar-bg)] border border-zinc-200 dark:border-zinc-800 shadow-[0_10px_30px_var(--shadow-color)]"
            : "w-full top-0 rounded-none px-8 py-2 bg-[var(--navbar-bg)] border-b border-[var(--navbar-border)]"
        }`}
      >
        <div className="w-full flex justify-between items-center relative z-50">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="text-[10px] md:text-xs font-bold tracking-widest hover:opacity-80 transition-opacity uppercase font-display text-foreground select-none"
          >
            [ PORTFOLIO / 2026 ]
          </Link>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-foreground/75 hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-300 focus:outline-none cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>

            {/* Hamburger Trigger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-foreground/75 hover:text-foreground hover:scale-115 active:scale-90 transition-all duration-300 focus:outline-none cursor-pointer relative z-50"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Overlay Drawer Menu */}
      <div
        className={`fixed inset-0 z-40 bg-background/95 backdrop-blur-lg flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
          menuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <nav className="flex flex-col items-center gap-6 sm:gap-8 text-center select-none">
          {[
            { label: "Home", href: "/", num: "00" },
            { label: "About", href: "/about", num: "01" },
            { label: "Skills", href: "/skills", num: "02" },
            { label: "Projects", href: "/projects", num: "03" },
            { label: "Contact", href: "/about-contact", num: "04" }
          ].map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={idx}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="group flex flex-col sm:flex-row items-center gap-2 sm:gap-4"
              >
                <span className="text-[9px] md:text-[10px] font-bold font-body text-zinc-500 tracking-widest uppercase transition-colors duration-300">
                  [{item.num}]
                </span>
                <span className={`text-4xl sm:text-6xl font-extrabold tracking-tighter uppercase font-display text-outline group-hover:text-foreground ${isActive ? "text-foreground" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
