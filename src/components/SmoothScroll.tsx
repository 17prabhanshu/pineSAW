"use client";

import { ReactLenis } from "@studio-freight/react-lenis";

export function SmoothScroll({ children }: { children: any }) {
  return (
    <ReactLenis root options={{ lerp: 0.05, duration: 2.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
