"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef } from "react";

type Bubble = {
  id: number;
  size: number;
  left: number;
  top: number;
  opacity: number;
  delay: number;
  duration: number;
  driftX: number;
  driftY: number;
  color: string;
};

const bubbleGradients = [
  "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.28), transparent 28%), radial-gradient(circle, rgba(34,120,255,0.48), rgba(168,85,247,0.28) 48%, rgba(34,211,238,0.16) 72%, transparent 100%)",
  "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.24), transparent 28%), radial-gradient(circle, rgba(14,165,233,0.42), rgba(59,130,246,0.26) 48%, rgba(255,214,102,0.13) 74%, transparent 100%)",
  "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.22), transparent 28%), radial-gradient(circle, rgba(52,211,153,0.34), rgba(20,184,166,0.22) 48%, rgba(34,211,238,0.14) 74%, transparent 100%)",
];

function seededValue(seed: number) {
  const x = Math.sin(seed * 999.91) * 10000;
  return x - Math.floor(x);
}

function createBubbles(count: number): Bubble[] {
  return Array.from({ length: count }, (_, index) => {
    const seed = index + 1;

    return {
      id: index,
      size: 96 + Math.round(seededValue(seed) * 224),
      left: Math.round(seededValue(seed + 11) * 100),
      top: Math.round(seededValue(seed + 23) * 100),
      opacity: 0.22 + seededValue(seed + 31) * 0.26,
      delay: -Math.round(seededValue(seed + 41) * 24),
      duration: 18 + Math.round(seededValue(seed + 53) * 20),
      driftX: Math.round((seededValue(seed + 61) - 0.5) * 90),
      driftY: Math.round((seededValue(seed + 73) - 0.5) * 120),
      color: bubbleGradients[index % bubbleGradients.length],
    };
  });
}

export default function AnimatedBackground({ count = 16 }: { count?: number }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);

  const bubbles = useMemo(() => createBubbles(count), [count]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    if (prefersReducedMotion || !finePointer) return;

    const pointer = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      targetX: window.innerWidth / 2,
      targetY: window.innerHeight / 2,
    };

    function onPointerMove(event: PointerEvent) {
      pointer.targetX = event.clientX;
      pointer.targetY = event.clientY;
    }

    function render() {
      pointer.x += (pointer.targetX - pointer.x) * 0.09;
      pointer.y += (pointer.targetY - pointer.y) * 0.09;

      const centerX = window.innerWidth / 2 || 1;
      const centerY = window.innerHeight / 2 || 1;
      const normalizedX = (pointer.x - centerX) / centerX;
      const normalizedY = (pointer.y - centerY) / centerY;

      container.style.setProperty("--cursor-x", `${pointer.x}px`);
      container.style.setProperty("--cursor-y", `${pointer.y}px`);
      container.style.setProperty("--parallax-x", `${normalizedX * 28}px`);
      container.style.setProperty("--parallax-y", `${normalizedY * 34}px`);
      container.style.setProperty("--cursor-opacity", "1");

      frameRef.current = window.requestAnimationFrame(render);
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    frameRef.current = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="animated-background pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="animated-background__mesh" />
      <div className="animated-background__cursor" />
      {bubbles.map((bubble) => (
        <span
          key={bubble.id}
          className="animated-background__bubble"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            top: `${bubble.top}%`,
            opacity: bubble.opacity,
            animationDelay: `${bubble.delay}s`,
            animationDuration: `${bubble.duration}s`,
            backgroundImage: bubble.color,
            "--drift-x": `${bubble.driftX}px`,
            "--drift-y": `${bubble.driftY}px`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
