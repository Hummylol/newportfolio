"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { ReactNode, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface LenisProviderProps {
  children: ReactNode;
}

function ScrollTriggerBridge() {
  useLenis(() => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    ScrollTrigger.defaults({ scroller: document.documentElement });
    ScrollTrigger.refresh();
  }, []);

  return null;
}

export default function LenisProvider({ children }: LenisProviderProps) {
  return (
    <ReactLenis root options={{ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true }}>
      <ScrollTriggerBridge />
      {children}
    </ReactLenis>
  );
}
