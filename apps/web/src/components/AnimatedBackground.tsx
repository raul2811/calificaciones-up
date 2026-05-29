"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

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
  colorGroup: number;
};

function seededValue(seed: number) {
  const x = Math.sin(seed * 999.91) * 10000;
  return x - Math.floor(x);
}

function createBubbles(count: number, isMobile: boolean): Bubble[] {
  const actualCount = isMobile ? Math.ceil(count / 2) : count;
  const baseSize = isMobile ? 64 : 96;
  const sizeMultiplier = isMobile ? 150 : 224;

  return Array.from({ length: actualCount }, (_, index) => {
    const seed = index + 1;
    return {
      id: index,
      size: baseSize + Math.round(seededValue(seed) * sizeMultiplier),
      left: Math.round(seededValue(seed + 11) * 100),
      top: Math.round(seededValue(seed + 23) * 100),
      opacity: 0.3 + seededValue(seed + 31) * 0.4,
      delay: -Math.round(seededValue(seed + 41) * 24),
      duration: 20 + Math.round(seededValue(seed + 53) * 25),
      driftX: Math.round((seededValue(seed + 61) - 0.5) * (isMobile ? 50 : 100)),
      driftY: Math.round((seededValue(seed + 73) - 0.5) * (isMobile ? 70 : 140)),
      colorGroup: (index % 3) + 1,
    };
  });
}

export default function AnimatedBackground({ count = 16 }: { count?: number }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const bubbles = useMemo(() => createBubbles(count, isMobile), [count, isMobile]);

  useEffect(() => {
    let mounted = true;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      
      // Control local inmediato del puntero para evitar fugas de tipo
      const container = containerRef.current;
      if (container) {
        container.style.setProperty("--cursor-opacity", "1");
      }
    }

    function render() {
      if (!mounted) return;

      // SOLUCIÓN CLAVE: Captura local estricta dentro del ciclo de animación.
      // Al asignarlo a una constante local y validarlo aquí, TypeScript garantiza 
      // que 'container' no puede ser null en las líneas siguientes.
      const container = containerRef.current;
      if (!container) {
        frameRef.current = window.requestAnimationFrame(render);
        return;
      }

      pointer.x += (pointer.targetX - pointer.x) * 0.08;
      pointer.y += (pointer.targetY - pointer.y) * 0.08;

      const centerX = window.innerWidth / 2 || 1;
      const centerY = window.innerHeight / 2 || 1;
      const normalizedX = (pointer.x - centerX) / centerX;
      const normalizedY = (pointer.y - centerY) / centerY;

      container.style.setProperty("--cursor-x", `${pointer.x}px`);
      container.style.setProperty("--cursor-y", `${pointer.y}px`);
      container.style.setProperty("--parallax-x", `${normalizedX * 25}px`);
      container.style.setProperty("--parallax-y", `${normalizedY * 30}px`);

      frameRef.current = window.requestAnimationFrame(render);
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    frameRef.current = window.requestAnimationFrame(render);

    return () => {
      mounted = false;
      window.removeEventListener("pointermove", onPointerMove);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --bg-ambient: #f8fafc;
          --cursor-aura: radial-gradient(circle, rgba(99,102,241,0.06) 0%, rgba(168,85,247,0.03) 45%, transparent 70%);
          --bubble-reflect: rgba(255, 255, 255, 0.6);
          
          --b1-glow: rgba(59, 130, 246, 0.15); --b1-mid: rgba(168, 85, 247, 0.08); --b1-end: rgba(34, 211, 238, 0.03);
          --b2-glow: rgba(14, 165, 233, 0.12); --b2-mid: rgba(59, 130, 246, 0.08); --b2-end: rgba(250, 204, 21, 0.03);
          --b3-glow: rgba(16, 185, 129, 0.12); --b3-mid: rgba(20, 184, 166, 0.08); --b3-end: rgba(6, 182, 212, 0.03);
        }

        .theme-dark {
          --bg-ambient: #020617;
          --cursor-aura: radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.08) 40%, transparent 70%);
          --bubble-reflect: rgba(255, 255, 255, 0.15);
          
          --b1-glow: rgba(34, 120, 255, 0.45); --b1-mid: rgba(168, 85, 247, 0.25); --b1-end: rgba(34, 211, 238, 0.12);
          --b2-glow: rgba(14, 165, 233, 0.40); --b2-mid: rgba(59, 130, 246, 0.25); --b2-end: rgba(255, 214, 102, 0.10);
          --b3-glow: rgba(52, 211, 153, 0.35); --b3-mid: rgba(20, 184, 166, 0.20); --b3-end: rgba(34, 211, 238, 0.10);
        }

        @keyframes float-drift {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1) rotate(0deg); }
          33% { transform: translate3d(var(--drift-x), var(--drift-y), 0) scale(1.05) rotate(5deg); }
          66% { transform: translate3d(calc(var(--drift-x) * -0.5), calc(var(--drift-y) * 1.2), 0) scale(0.95) rotate(-5deg); }
        }

        .bubble-anim {
          animation: float-drift infinite ease-in-out alternate;
          will-change: transform;
        }
      `}} />

      <div
        ref={containerRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[var(--bg-ambient)] transition-colors duration-700"
        style={{
          '--cursor-x': '-999px',
          '--cursor-y': '-999px',
          '--cursor-opacity': '0',
          '--parallax-x': '0px',
          '--parallax-y': '0px',
        } as CSSProperties}
      >
        <div 
          className="absolute rounded-full blur-[100px] transition-opacity duration-700 will-change-transform hidden md:block"
          style={{
            width: '500px', height: '500px',
            left: '-250px', top: '-250px',
            background: 'var(--cursor-aura)',
            opacity: 'var(--cursor-opacity)',
            transform: 'translate3d(var(--cursor-x), var(--cursor-y), 0)',
          }}
        />

        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="bubble-anim absolute rounded-full mix-blend-normal blur-[60px] md:blur-[80px]"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              top: `${bubble.top}%`,
              opacity: bubble.opacity,
              animationDelay: `${bubble.delay}s`,
              animationDuration: `${bubble.duration}s`,
              backgroundImage: `
                radial-gradient(circle at 30% 30%, var(--bubble-reflect), transparent 35%), 
                radial-gradient(circle, var(--b${bubble.colorGroup}-glow), var(--b${bubble.colorGroup}-mid) 48%, var(--b${bubble.colorGroup}-end) 74%, transparent 100%)
              `,
              "--drift-x": `${bubble.driftX}px`,
              "--drift-y": `${bubble.driftY}px`,
              transform: `translate3d(var(--parallax-x), var(--parallax-y), 0)`,
            } as CSSProperties}
          />
        ))}
      </div>
    </>
  );
}
