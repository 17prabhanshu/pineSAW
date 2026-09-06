"use client";

import { ReactLenis } from 'lenis/react';
import { ReactNode } from 'react';

export function ClientLenis({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.15, duration: 0.8, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
