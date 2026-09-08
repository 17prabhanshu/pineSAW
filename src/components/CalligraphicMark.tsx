"use client";

import React from "react";

interface CalligraphicMarkProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export function CalligraphicMark({ className = "", size = 32, glow = true }: CalligraphicMarkProps) {
  return (
    <div
      className={`inline-flex items-center justify-center relative select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-[10px] opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle, #00f0ff 0%, transparent 70%)" }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="calligraphicC" x1="15" y1="15" x2="85" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#d4d4d8" />
            <stop offset="100%" stopColor="#00f0ff" />
          </linearGradient>
          <filter id="accentGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Flourished calligraphic copperplate cursive capital 'C' */}
        {/* Top flourishing terminal swirl */}
        <path
          d="M 68 28 C 62 18, 48 14, 38 18 C 26 23, 24 38, 34 42 C 40 44, 46 39, 44 33 C 42 27, 34 27, 32 32"
          stroke="url(#calligraphicC)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Main dramatic copperplate spine curve (thick-to-thin pressure) */}
        <path
          d="M 72 26 C 45 16, 20 30, 18 56 C 16 78, 35 90, 60 88 C 76 86, 86 74, 88 62 C 89 54, 81 50, 75 54 C 69 58, 73 68, 79 67 C 76 74, 68 80, 56 81 C 36 83, 24 71, 26 54 C 28 34, 46 22, 70 27 Z"
          fill="url(#calligraphicC)"
          filter="url(#accentGlow)"
        />

        {/* Interior flourish hairline accent line */}
        <path
          d="M 38 38 C 30 50, 31 66, 42 74 C 52 81, 66 78, 74 70"
          stroke="#00f0ff"
          strokeWidth="1.2"
          strokeDasharray="2 2"
          strokeOpacity="0.7"
          strokeLinecap="round"
        />

        {/* Small bottom terminal drop */}
        <circle cx="80" cy="65" r="1.5" fill="#00f0ff" />
      </svg>
    </div>
  );
}
