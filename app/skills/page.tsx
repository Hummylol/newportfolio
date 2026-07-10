"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createSwapy } from "swapy";

interface SkillItem {
  id: string;
  category: string;
  title: string;
  desc: string;
  visualType: string;
}

const skillsData: Record<string, SkillItem> = {
  "item-frontend": {
    id: "item-frontend",
    category: "[ FRONT-END ENG ]",
    title: "Front-end Development",
    desc: "Crafting high-fidelity, interactive, and responsive user interfaces with pixel-perfect attention to detail and smooth motion guidelines.",
    visualType: "frontend",
  },
  "item-mern": {
    id: "item-mern",
    category: "[ FULLSTACK MERN ]",
    title: "MERN Stack",
    desc: "Robust full-stack architecture integrating MongoDB, Express, React, and Node.js for modern web applications.",
    visualType: "mern",
  },
  "item-graphic": {
    id: "item-graphic",
    category: "[ VISUAL BRANDING ]",
    title: "Graphic Design",
    desc: "Typography systems, brand guides, and custom logotype developments.",
    visualType: "graphic",
  },
  "item-3d": {
    id: "item-3d",
    category: "[ SPATIAL GRAPHICS ]",
    title: "3D Modeling",
    desc: "Blender design pipelines & spatial spline assets.",
    visualType: "3d",
  },
  "item-ai": {
    id: "item-ai",
    category: "[ AI ENGINEERING ]",
    title: "AI Prompts",
    desc: "AI orchestration, prompt designs, & LLM scripting.",
    visualType: "ai",
  },
  "item-uiux": {
    id: "item-uiux",
    category: "[ INTERFACE SCHEMAS ]",
    title: "UI/UX Design",
    desc: "Figma blueprints, wireframing, & design specs.",
    visualType: "uiux",
  },
  "item-backend": {
    id: "item-backend",
    category: "[ BACKEND SYSTEMS ]",
    title: "Back-end Development",
    desc: "Scalable APIs & database structures (PostgreSQL, GraphQL, MongoDB).",
    visualType: "backend",
  },
  "item-devops": {
    id: "item-devops",
    category: "[ SYSTEM PIPELINES ]",
    title: "DevOps & Systems",
    desc: "Continuous integration pipelines, containers, and deployment orchestrations. Docker containers, AWS clouds, Vercel deployments, & Actions automations.",
    visualType: "devops",
  },
};

export default function Skills() {
  const containerRef = useRef<HTMLDivElement>(null);
  const swapyRef = useRef<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isFullyOpen, setIsFullyOpen] = useState(false);
  const lastActiveSkillId = useRef<string | null>(null);
  if (activeSkillId) {
    lastActiveSkillId.current = activeSkillId;
  }

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (activeSkillId) {
      timeoutId = setTimeout(() => {
        setIsFullyOpen(true);
      }, 500);
    } else {
      setIsFullyOpen(false);
    }
    return () => clearTimeout(timeoutId);
  }, [activeSkillId]);

  // Click Separator coordinate state
  const [mouseDownPos, setMouseDownPos] = useState({ x: 0, y: 0 });
  const [drawerOffset, setDrawerOffset] = useState(0);
  const dragStartY = useRef(0);
  const isDraggingDrawer = useRef(false);

  useEffect(() => {
    setMounted(true);
    if (containerRef.current) {
      swapyRef.current = createSwapy(containerRef.current, {
        animation: "dynamic",
        autoScrollOnDrag: false,
      });

      swapyRef.current.onSwapStart(() => {
        setIsDragging(true);
      });

      swapyRef.current.onSwapEnd(() => {
        setIsDragging(false);
      });
    }

    return () => {
      if (swapyRef.current) {
        swapyRef.current.destroy();
      }
    };
  }, []);

  // Click Separator tracking logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseDownPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e: React.MouseEvent, itemId: string) => {
    const dist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);
    if (dist < 6) {
      setActiveSkillId(itemId);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setMouseDownPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent, itemId: string) => {
    const touch = e.changedTouches[0];
    const dist = Math.hypot(touch.clientX - mouseDownPos.x, touch.clientY - mouseDownPos.y);
    if (dist < 6) {
      setActiveSkillId(itemId);
    }
  };

  // Pointer drag closed sheet logic
  const handleDrawerDragStart = (e: React.PointerEvent) => {
    isDraggingDrawer.current = true;
    dragStartY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleDrawerDragMove = (e: React.PointerEvent) => {
    if (!isDraggingDrawer.current) return;
    const deltaY = e.clientY - dragStartY.current;
    if (deltaY > 0) {
      setDrawerOffset(deltaY);
    }
  };

  const handleDrawerDragEnd = (e: React.PointerEvent) => {
    if (!isDraggingDrawer.current) return;
    isDraggingDrawer.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (drawerOffset > 100) {
      setActiveSkillId(null);
    }
    setDrawerOffset(0);
  };

  const displaySkillId = activeSkillId || lastActiveSkillId.current;
  const activeSkill = displaySkillId ? skillsData[displaySkillId] : null;

  // Visual Renderer inside the Drawer
  const renderDrawerVisual = (type: string) => {
    switch (type) {
      case "frontend":
        return (
          <div className="flex flex-col h-full w-full justify-between">
            <div className="flex flex-col rounded-xl border border-zinc-300/40 dark:border-zinc-800 bg-zinc-950 font-mono text-[10px] text-zinc-400 p-4 select-none relative overflow-hidden shadow-inner h-[220px]">
              <div className="flex gap-1.5 mb-2 pb-1.5 border-b border-zinc-900">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400/80" />
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/80" />
                <div className="w-1.5 h-1.5 rounded-full bg-green-400/80" />
                <span className="ml-1 text-[8px] tracking-wide text-zinc-550 uppercase">InteractiveUX.tsx</span>
              </div>
              <div className="text-zinc-450 space-y-1.5 leading-normal">
                <div><span className="text-purple-400 font-semibold">const</span> <span className="text-blue-400 font-semibold">SkillsBento</span> = () =&gt; &#123;</div>
                <div className="pl-4"><span className="text-purple-400">const</span> [swapped, setSwapped] = <span className="text-blue-400">useState</span>(<span className="text-red-450">true</span>);</div>
                <div className="pl-4"><span className="text-purple-450 font-semibold">return</span> ( &lt;<span className="text-red-400/90">SwapyGrid</span> score=<span className="text-amber-500">9.8</span> /&gt; );</div>
                <div>&#125;;</div>
                <div className="pt-2 text-zinc-600">// Active drag elements are accelerated via GPU translation</div>
              </div>
            </div>
          </div>
        );
      case "mern":
        return (
          <div className="flex flex-col items-center justify-center p-6 border border-border bg-white dark:bg-zinc-900/50 rounded-2xl h-[220px] shadow-sm">
            <div className="flex items-center gap-3">
              {["M", "E", "R", "N"].map((char, idx) => (
                <div 
                  key={idx} 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base border border-border bg-card shadow-md text-foreground hover:scale-110 transition-all duration-300"
                >
                  {char}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-center text-[9px] font-mono text-zinc-550">
              <span className="px-2 py-0.5 border border-border rounded-full bg-card">MongoDB</span>
              <span className="px-2 py-0.5 border border-border rounded-full bg-card">Express</span>
              <span className="px-2 py-0.5 border border-border rounded-full bg-card">React.js</span>
              <span className="px-2 py-0.5 border border-border rounded-full bg-card">Node.js</span>
            </div>
          </div>
        );
      case "graphic":
        return (
          <div className="flex flex-col items-center justify-center p-6 border border-border bg-white dark:bg-zinc-900/50 rounded-2xl h-[220px] shadow-sm relative overflow-hidden">
            <div className="font-serif italic text-6xl font-light text-zinc-350 dark:text-zinc-700 tracking-wider">
              Aa Bb Cc
            </div>
            <span className="text-[9px] uppercase tracking-widest text-zinc-400 mt-4">Brand guidelines & typography spec</span>
          </div>
        );
      case "3d":
        return (
          <div className="flex flex-col items-center justify-center p-6 border border-border bg-white dark:bg-zinc-900/50 rounded-2xl h-[220px] shadow-sm">
            <svg 
              width="44" 
              height="44" 
              viewBox="0 0 40 40" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg" 
              className="animate-spin text-zinc-400 dark:text-zinc-555" 
              style={{ animationDuration: "16s" }}
            >
              <path d="M20 2L35 10V28L20 38L5 28V10L20 2Z" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              <path d="M20 2V20M20 20L35 10M20 20L5 10M20 20V38M20 20L35 28M20 20L5 28" stroke="currentColor" strokeWidth="0.8" className="opacity-40" />
            </svg>
            <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-400 mt-4">Spatial cube wireframe</span>
          </div>
        );
      case "ai":
        return (
          <div className="flex flex-col items-center justify-center p-5 border border-border bg-white dark:bg-zinc-900/50 rounded-2xl h-[220px] shadow-sm gap-2">
            <div className="bg-foreground text-background px-3 py-1.5 rounded-xl rounded-tr-none text-[9px] font-body max-w-[80%] self-end">
              Act as an agentic automation sub-orchestration prompt...
            </div>
            <div className="border border-border bg-card px-3 py-1.5 rounded-xl rounded-tl-none text-foreground flex items-center gap-1.5 max-w-[80%] self-start shadow-sm text-[9px] font-body">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Synthesizing context vectors and constraints...
            </div>
          </div>
        );
      case "uiux":
        return (
          <div className="flex flex-col items-center justify-center p-6 border border-border bg-white dark:bg-zinc-900/50 rounded-2xl h-[220px] shadow-sm">
            <div className="relative border border-dashed border-border h-16 w-full rounded-xl flex items-center justify-center text-[10px] font-mono text-zinc-450 select-none bg-card max-w-[200px]">
              <div className="absolute top-1 left-1 border-r border-b border-border w-2 h-2" />
              <div className="absolute bottom-1 right-1 border-l border-t border-border w-2 h-2" />
              <span>frame: #DRAWER_VIEW</span>
            </div>
            <span className="text-[8px] uppercase tracking-widest text-zinc-400 mt-4">Responsive structural grid schemas</span>
          </div>
        );
      case "backend":
        return (
          <div className="flex flex-col rounded-xl border border-zinc-900 bg-zinc-950 text-zinc-400 font-mono text-[9px] p-4 select-none relative overflow-hidden shadow-inner h-[220px]">
            <div className="flex justify-between text-zinc-550 border-b border-zinc-900 pb-1 mb-1.5 uppercase text-[8px]">
              <span>ENDPOINT</span>
              <span>STATUS</span>
              <span>TIME</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-emerald-500">
                <span>GET /v1/skills</span>
                <span>200 OK</span>
                <span>12ms</span>
              </div>
              <div className="flex justify-between text-blue-400">
                <span>POST /auth/login</span>
                <span>201 CREATED</span>
                <span>45ms</span>
              </div>
              <div className="flex justify-between text-yellow-500">
                <span>PATCH /v1/user/reset</span>
                <span>403 FORBIDDEN</span>
                <span>112ms</span>
              </div>
            </div>
          </div>
        );
      case "devops":
        return (
          <div className="flex flex-col justify-center gap-3 p-5 border border-border bg-white dark:bg-zinc-900/50 rounded-2xl h-[220px] shadow-sm">
            {[
              { step: "Checkout", status: "git pull OK" },
              { step: "Build bundle", status: "compiled asset" },
              { step: "Live deploy", status: "vercel edge" }
            ].map((item, idx) => (
              <div key={idx} className="border border-border bg-card rounded-lg p-1.5 flex justify-between items-center text-[9px] shadow-sm">
                <span className="font-semibold text-foreground">{item.step}</span>
                <span className="text-zinc-500 text-[8px]">{item.status}</span>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section id="skills" className="h-screen w-full flex items-center justify-center bg-background relative overflow-hidden transition-colors duration-500 select-none py-12 px-6">
      {/* Ambient background glow */}

      <div className="max-w-6xl mx-auto w-full relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-border transition-colors duration-500">
          <div className="max-w-xl">
            <span className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest font-body mb-2 block transition-colors duration-500">
              [ CAPABILITIES ]
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase font-display text-foreground">
              TECHNICAL STACK
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 mt-4 md:mt-0">
            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-body max-w-xs leading-relaxed text-left md:text-right">
              A dynamic bento grid. Click on a tile to explore additional details. Drag tiles to swap positions.
            </p>
          </div>
        </div>

        {/* Bento Grid Swapy Container */}
        <div 
          ref={containerRef}
          className={`grid grid-cols-12 gap-4 w-full ${
            isDragging ? "is-dragging" : ""
          }`}
        >
          {/* ──────────────────────────────────────────────────────── */}
          {/* ROW 1                                                    */}
          {/* ──────────────────────────────────────────────────────── */}

          {/* Slot 1: Frontend Development (span 8) */}
          <div 
            className="col-span-12 lg:col-span-8 h-[220px]"
            data-swapy-slot="slot-frontend"
          >
            <div 
              data-swapy-item="item-frontend"
              onMouseDown={handleMouseDown}
              onMouseUp={(e) => handleMouseUp(e, "item-frontend")}
              onTouchStart={handleTouchStart}
              onTouchEnd={(e) => handleTouchEnd(e, "item-frontend")}
              className="relative h-full w-full rounded-[24px] border border-border bg-card p-6 flex items-center justify-center text-center shadow-sm hover:shadow-md transition-[background-color,border-color,box-shadow] duration-200 cursor-grab active:cursor-grabbing group"
            >
              <h3 className="text-base md:text-lg font-bold uppercase font-display tracking-tight text-foreground">
                {skillsData["item-frontend"].title}
              </h3>
            </div>
          </div>

          {/* Right Column Grid Stack: MERN Stack & Graphic Design stacked vertically (span 4) */}
          <div className="col-span-12 lg:col-span-4 grid grid-rows-2 gap-4 h-[220px]">
            {/* Slot 2: MERN Stack */}
            <div 
              className="h-full w-full"
              data-swapy-slot="slot-mern"
            >
              <div 
                data-swapy-item="item-mern"
                onMouseDown={handleMouseDown}
                onMouseUp={(e) => handleMouseUp(e, "item-mern")}
                onTouchStart={handleTouchStart}
                onTouchEnd={(e) => handleTouchEnd(e, "item-mern")}
                className="relative h-full w-full rounded-[24px] border border-border bg-card p-5 flex items-center justify-center text-center shadow-sm hover:shadow-md transition-[background-color,border-color,box-shadow] duration-200 cursor-grab active:cursor-grabbing group"
              >
                <h3 className="text-sm md:text-base font-bold uppercase font-display tracking-tight text-foreground">
                  {skillsData["item-mern"].title}
                </h3>
              </div>
            </div>

            {/* Slot 3: Graphic Design */}
            <div 
              className="h-full w-full"
              data-swapy-slot="slot-graphic"
            >
              <div 
                data-swapy-item="item-graphic"
                onMouseDown={handleMouseDown}
                onMouseUp={(e) => handleMouseUp(e, "item-graphic")}
                onTouchStart={handleTouchStart}
                onTouchEnd={(e) => handleTouchEnd(e, "item-graphic")}
                className="relative h-full w-full rounded-[24px] border border-border bg-card p-5 flex items-center justify-center text-center shadow-sm hover:shadow-md transition-[background-color,border-color,box-shadow] duration-200 cursor-grab active:cursor-grabbing group"
              >
                <h3 className="text-sm md:text-base font-bold uppercase font-display tracking-tight text-foreground">
                  {skillsData["item-graphic"].title}
                </h3>
              </div>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* ROW 2                                                    */}
          {/* ──────────────────────────────────────────────────────── */}

          {/* Slot 4: 3D Modeling (span 5) */}
          <div 
            className="col-span-12 md:col-span-5 h-[130px]"
            data-swapy-slot="slot-3d"
          >
            <div 
              data-swapy-item="item-3d"
              onMouseDown={handleMouseDown}
              onMouseUp={(e) => handleMouseUp(e, "item-3d")}
              onTouchStart={handleTouchStart}
              onTouchEnd={(e) => handleTouchEnd(e, "item-3d")}
              className="relative h-full w-full rounded-[24px] border border-border bg-card p-5 flex items-center justify-center text-center shadow-sm hover:shadow-md transition-[background-color,border-color,box-shadow] duration-200 cursor-grab active:cursor-grabbing group"
            >
              <h3 className="text-sm md:text-base font-bold uppercase font-display tracking-tight text-foreground">
                {skillsData["item-3d"].title}
              </h3>
            </div>
          </div>

          {/* Slot 5: AI Prompts (span 4) */}
          <div 
            className="col-span-12 md:col-span-4 h-[130px]"
            data-swapy-slot="slot-ai"
          >
            <div 
              data-swapy-item="item-ai"
              onMouseDown={handleMouseDown}
              onMouseUp={(e) => handleMouseUp(e, "item-ai")}
              onTouchStart={handleTouchStart}
              onTouchEnd={(e) => handleTouchEnd(e, "item-ai")}
              className="relative h-full w-full rounded-[24px] border border-border bg-card p-5 flex items-center justify-center text-center shadow-sm hover:shadow-md transition-[background-color,border-color,box-shadow] duration-200 cursor-grab active:cursor-grabbing group"
            >
              <h3 className="text-sm md:text-base font-bold uppercase font-display tracking-tight text-foreground">
                {skillsData["item-ai"].title}
              </h3>
            </div>
          </div>

          {/* Slot 6: UI/UX Design (span 3) */}
          <div 
            className="col-span-12 md:col-span-3 h-[130px]"
            data-swapy-slot="slot-uiux"
          >
            <div 
              data-swapy-item="item-uiux"
              onMouseDown={handleMouseDown}
              onMouseUp={(e) => handleMouseUp(e, "item-uiux")}
              onTouchStart={handleTouchStart}
              onTouchEnd={(e) => handleTouchEnd(e, "item-uiux")}
              className="relative h-full w-full rounded-[24px] border border-border bg-card p-5 flex items-center justify-center text-center shadow-sm hover:shadow-md transition-[background-color,border-color,box-shadow] duration-200 cursor-grab active:cursor-grabbing group"
            >
              <h3 className="text-sm md:text-base font-bold uppercase font-display tracking-tight text-foreground">
                {skillsData["item-uiux"].title}
              </h3>
            </div>
          </div>

          {/* ──────────────────────────────────────────────────────── */}
          {/* ROW 3                                                    */}
          {/* ──────────────────────────────────────────────────────── */}

          {/* Slot 7: Backend Development (span 4) */}
          <div 
            className="col-span-12 md:col-span-4 h-[170px]"
            data-swapy-slot="slot-backend"
          >
            <div 
              data-swapy-item="item-backend"
              onMouseDown={handleMouseDown}
              onMouseUp={(e) => handleMouseUp(e, "item-backend")}
              onTouchStart={handleTouchStart}
              onTouchEnd={(e) => handleTouchEnd(e, "item-backend")}
              className="relative h-full w-full rounded-[24px] border border-border bg-card p-5 flex items-center justify-center text-center shadow-sm hover:shadow-md transition-[background-color,border-color,box-shadow] duration-200 cursor-grab active:cursor-grabbing group"
            >
              <h3 className="text-sm md:text-base font-bold uppercase font-display tracking-tight text-foreground">
                {skillsData["item-backend"].title}
              </h3>
            </div>
          </div>

          {/* Slot 8: DevOps & Infrastructure (span 8) */}
          <div 
            className="col-span-12 md:col-span-8 h-[170px]"
            data-swapy-slot="slot-devops"
          >
            <div 
              data-swapy-item="item-devops"
              onMouseDown={handleMouseDown}
              onMouseUp={(e) => handleMouseUp(e, "item-devops")}
              onTouchStart={handleTouchStart}
              onTouchEnd={(e) => handleTouchEnd(e, "item-devops")}
              className="relative h-full w-full rounded-[24px] border border-border bg-card p-5 flex items-center justify-center text-center shadow-sm hover:shadow-md transition-[background-color,border-color,box-shadow] duration-200 cursor-grab active:cursor-grabbing group"
            >
              <h3 className="text-sm md:text-base font-bold uppercase font-display tracking-tight text-foreground">
                {skillsData["item-devops"].title}
              </h3>
            </div>
          </div>

        </div>
      </div>

      {/* ── HIGHLY ANIMATED BOTTOM DRAWER ─────────────────────── */}
      {mounted && createPortal(
        <>
          {/* Backdrop overlay */}
          <div 
            onClick={() => setActiveSkillId(null)}
            className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-all ${
              activeSkillId ? "opacity-100 pointer-events-auto duration-0" : "opacity-0 pointer-events-none duration-[1200ms]"
            }`}
          />

          {/* Drawer Body container */}
          <div 
            style={{
              transform: activeSkillId 
                ? `translateY(${drawerOffset}px)` 
                : "translateY(100%)",
              transition: isDraggingDrawer.current 
                ? "none" 
                : activeSkillId
                  ? "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease" 
                  : "transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1)"
            }}
            className={`fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-[32px] shadow-2xl p-6 md:p-8 max-h-[85vh] md:max-h-[500px] overflow-hidden ${
              activeSkillId ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Pointer drag-close gesture bar */}
            <div 
              onPointerDown={handleDrawerDragStart}
              onPointerMove={handleDrawerDragMove}
              onPointerUp={handleDrawerDragEnd}
              onPointerCancel={handleDrawerDragEnd}
              className="w-full py-2 mb-2 flex justify-center cursor-grab active:cursor-grabbing select-none touch-none"
            >
              <div className="w-12 h-1 bg-zinc-350 dark:bg-zinc-700 rounded-full" />
            </div>

            {activeSkill && (
              <div className="h-full flex flex-col justify-between max-w-5xl mx-auto pb-6">
                {/* Drawer Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-body mb-1 block">
                      {activeSkill.category}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold uppercase font-display tracking-tight text-foreground">
                      {activeSkill.title}
                    </h2>
                  </div>

                  {/* Close button on the top right of the entire drawer */}
                  <button 
                    onClick={() => setActiveSkillId(null)}
                    className="group relative w-9 h-9 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 active:scale-95 transition-all duration-300 flex-shrink-0"
                  >
                    <div className="relative w-4 h-4 flex items-center justify-center">
                      <span className={`absolute w-[2px] h-4 bg-zinc-800 dark:bg-zinc-200 transition-transform duration-300 transform ${isFullyOpen ? "rotate-45" : "rotate-0"}`} />
                      <span className={`absolute w-[2px] h-4 bg-zinc-800 dark:bg-zinc-200 transition-transform duration-300 transform ${isFullyOpen ? "-rotate-45" : "rotate-0"}`} />
                    </div>
                  </button>
                </div>

                {/* Split layout inside Drawer: Text on Left, Detailed Mockups/Visuals on Right */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start overflow-y-auto pr-1">
                  {/* Left Column: Descriptions */}
                  <div className="md:col-span-6 flex flex-col justify-center">
                    <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-body">
                      {activeSkill.desc}
                    </p>
                    <div className="mt-6 border-t border-border pt-4 text-xs text-zinc-450 dark:text-zinc-555 font-mono">
                      <span>CATEGORY IDENTIFIER: </span>
                      <span className="text-foreground font-semibold">{activeSkill.id}</span>
                    </div>
                  </div>

                  {/* Right Column: Visual Mockup */}
                  <div className="md:col-span-6">
                    {renderDrawerVisual(activeSkill.visualType)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
        , document.body
      )}
    </section>
  );
}
