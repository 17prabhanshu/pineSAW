"use client";

import { useState, useEffect } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";

export function CyberText({ text, className, duration = 800 }: { text: string, className?: string, duration?: number }) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let startTime = Date.now();
    let frameId: number;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress < 1) {
        const revealedLength = Math.floor(text.length * progress);
        const revealed = text.substring(0, revealedLength);
        const randomLength = text.length - revealedLength;
        let randomChars = "";
        for (let i = 0; i < randomLength; i++) {
          randomChars += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        setDisplayText(revealed + randomChars);
        frameId = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [text, duration]);

  return <span className={className}>{displayText}</span>;
}
