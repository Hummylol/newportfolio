"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, X, ExternalLink } from "lucide-react";

const Github = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
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

const projects = [
  { name: "Chat App", github: "https://github.com/Hummylol/oneonone", external: "https://humaidchat.vercel.app/", video: "chat-app-preview.mp4" },
  { name: "MindCare", github: "https://github.com/Hummylol/mindcare", external: "https://mindcarejce.vercel.app/", video: "mental-health-preview.mp4" },
  { name: "Devsistant", github: "https://github.com/Hummylol/devsistant", external: "https://devsistant.vercel.app/", video: "devsistant-preview.mp4" },
  { name: "Code Share", github: "https://github.com/Hummylol/code-share", external: "https://analanbu.vercel.app", video: "code-share-preview.mp4" },
  { name: "Fitbyte", github: "https://github.com/Hummylol/fitbyte", external: "https://fitbyte.vercel.app/", video: "fitbyte-preview.mp4" },
  { name: "LLM", github: "https://github.com/Hummylol/llm", video: "llm-preview.mp4" },
  { name: "Portfolio", github: "https://github.com/Hummylol/portfolionext" },
];

const CustomCursor = ({
  hoveredProject,
  hoverType, 
  position,
}: {
  hoveredProject: string | null;
  hoverType: "name" | "link" | null;
  position: { x: number; y: number };
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile) return null; // Disable cursor on mobile

  const showPreview = hoveredProject !== null;

  return (
    <AnimatePresence>
      {showPreview && (
        <motion.div
          key={hoveredProject + (hoverType ?? "")}
          initial={{
            opacity: 0,
            scale: 0.8,
            borderRadius: "50%",
            x: position.x,
            y: position.y,
            translateX: "-50%",
            translateY: "-50%",
          }}
          animate={{
            opacity: 1,
            scale: 1,
            borderRadius: "16px",
            x: position.x,
            y: position.y,
            translateX: "-50%",
            translateY: "-50%",
          }}
          exit={{ opacity: 0, scale: 0.8, borderRadius: "50%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: 9999,
            width: 600,
            height: 350,
            backgroundColor: "black",
            boxShadow:
              "0 15px 40px rgba(0,0,0,0.7), 0 0 15px rgba(255,255,255,0.15)",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          className="w-[90vw] h-[40vh] sm:w-[600px] sm:h-[350px]"
        >
          {(hoverType === "name" && projects.find(p => p.name === hoveredProject)?.video) ? (
            <video
              src={projects.find(p => p.name === hoveredProject)?.video}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-white text-lg font-semibold select-none px-6">
              {hoveredProject} Preview
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Projects = () => {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [hoverType, setHoverType] = useState<"name" | "link" | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [modalProject, setModalProject] = useState<string | null>(null);

  const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMouseEnter = (
    projectName: string,
    type: "name" | "link",
    e: React.MouseEvent
  ) => {
    if (isMobile) return; // Disable hover on mobile

    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
    }
    enterTimeoutRef.current = setTimeout(() => {
      if (type === "link") {
        setHoveredProject(null);
        setHoverType(null);
      } else {
        setHoveredProject(projectName);
        setHoverType(type);
      }
      setPosition({ x: e.clientX, y: e.clientY });
    }, 150);
  };

  const handleMouseLeave = () => {
    if (isMobile) return; // Disable hover on mobile

    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
      enterTimeoutRef.current = null;
    }
    if (!leaveTimeoutRef.current) {
      leaveTimeoutRef.current = setTimeout(() => {
        setHoveredProject(null);
        setHoverType(null);
        leaveTimeoutRef.current = null;
      }, 150);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return; // Disable hover on mobile
    setPosition({ x: e.clientX, y: e.clientY });
  };

  // Mobile tap handler to open modal
  const handleMobileTap = (projectName: string) => {
    if (!isMobile) return;
    setModalProject(projectName);
  };

  const closeModal = () => {
    setModalProject(null);
  };

  return (
    <>
      <div
        id="projects-section"
        className="h-screen w-full flex flex-col justify-center items-center bg-background text-foreground pt-20 overflow-hidden"
      >
        <section className="h-fit w-[90%] flex flex-col relative">
          <div className="flex flex-col gap-4 relative">
            {projects.map((project) => (
              <div
                key={project.name}
                className="text-4xl md:text-8xl border-b border-foreground transition-all duration-300 flex justify-between items-center"
              >
                <div
                  onMouseEnter={(e) => handleMouseEnter(project.name, "name", e)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleMobileTap(project.name)}
                  className={`w-fit cursor-pointer transition duration-300 font-qin ${
                    hoveredProject && hoveredProject !== project.name
                      ? "opacity-15"
                      : "blur-none opacity-100"
                  }`}
                >
                  {project.name}
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer p-1 hover:text-blue-500 transition-colors"
                      aria-label={`GitHub repository for ${project.name}`}
                      onMouseEnter={(e) => handleMouseEnter(project.name, "link", e)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      <Github className="w-4 h-4 md:w-6 md:h-6" />
                    </a>
                  )}
                  {project.external && (
                    <a
                      href={project.external}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer p-1 hover:text-blue-500 transition-colors"
                      aria-label={`Live demo for ${project.name}`}
                      onMouseEnter={(e) => handleMouseEnter(project.name, "link", e)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      <ExternalLink className="w-4 h-4 md:w-6 md:h-6" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <CustomCursor
          hoveredProject={hoveredProject}
          hoverType={hoverType}
          position={position}
        />
      </div>

      {/* Mobile Modal */}
      <AnimatePresence>
        {modalProject && (
          <motion.div
            key="mobile-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black bg-opacity-90 p-4"
            style={{ pointerEvents: "auto" }} // Ensure pointer events enabled
          >
            <div className="relative w-full max-w-lg rounded-lg overflow-hidden bg-black shadow-lg">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
                aria-label="Close preview"
                type="button"
              >
                <X size={24} />
              </button>
              {modalProject && projects.find(p => p.name === modalProject)?.video ? (
                <video
                  src={projects.find(p => p.name === modalProject)?.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="p-6 text-white text-center text-xl font-semibold">
                  {modalProject} Preview
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Projects;
