"use client";

import { useState } from "react";
import Hero from "@/app/hero/page";
import Skills from "@/app/skills/page";
import Projects from "@/app/projects/page";
import About from "@/app/about/page";

export default function Home() {
  const [activeDesign, setActiveDesign] = useState(1);

  const themes = [
    { id: 1, name: "Blueprint" },
    { id: 2, name: "Editorial" },
    { id: 3, name: "Brutalist" },
    { id: 4, name: "Aero Glass" },
    { id: 5, name: "Retro CRT" },
    { id: 6, name: "Split Typo" },
    { id: 7, name: "Planetary Orbit" },
    { id: 8, name: "Marquee Repeater" },
    { id: 9, name: "Vector Mesh" },
    { id: 10, name: "ASCII Density" },
  ];

  return (
    <>
      <Hero />
      <div id="next-sections" className="relative z-10">
        <Projects />
        <Skills />
        <About />
      </div>
    </>
  );
}