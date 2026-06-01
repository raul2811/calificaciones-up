"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

export type LiveBackgroundVariant = "subtle-gradient" | "particles" | "grid" | "none";

type LiveBackgroundProps = {
  variant: LiveBackgroundVariant;
  className?: string;
};

type BlobConfig = {
  className: string;
  duration: number;
  x: [number, number, number];
  y: [number, number, number];
  scale: [number, number, number];
  opacity: [number, number, number];
};

const SUBTLE_BLOBS: BlobConfig[] = [
  {
    className: "left-[-8rem] top-[-7rem] h-[22rem] w-[22rem] bg-[radial-gradient(circle,_var(--theme-glow-1)_0%,_transparent_72%)]",
    duration: 18,
    x: [0, 20, 0],
    y: [0, 28, 0],
    scale: [1, 1.08, 1],
    opacity: [0.6, 0.85, 0.6],
  },
  {
    className: "right-[-6rem] top-[16%] h-[18rem] w-[18rem] bg-[radial-gradient(circle,_var(--theme-glow-2)_0%,_transparent_74%)]",
    duration: 22,
    x: [0, -18, 0],
    y: [0, 20, 0],
    scale: [1, 1.06, 1],
    opacity: [0.52, 0.72, 0.52],
  },
  {
    className: "bottom-[-9rem] left-[28%] h-[20rem] w-[20rem] bg-[radial-gradient(circle,_var(--theme-glow-3)_0%,_transparent_74%)]",
    duration: 26,
    x: [0, 14, 0],
    y: [0, -18, 0],
    scale: [1, 1.04, 1],
    opacity: [0.36, 0.58, 0.36],
  },
];

function GradientBackground({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--background-subtle)_76%,transparent),transparent_22%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_30%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_28%)]" />
      {SUBTLE_BLOBS.map((blob, index) =>
        reducedMotion ? (
          <div
            key={index}
            className={cn("absolute rounded-full blur-3xl", blob.className)}
            style={{ opacity: blob.opacity[0] }}
          />
        ) : (
          <motion.div
            key={index}
            className={cn("absolute rounded-full blur-3xl", blob.className)}
            style={{ opacity: blob.opacity[0] }}
            animate={{
              x: blob.x,
              y: blob.y,
              scale: blob.scale,
            }}
            transition={{
              duration: blob.duration,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        ),
      )}
    </>
  );
}

function GridBackground({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--background-subtle)_60%,transparent),transparent_18%)]" />
      <div
        className="absolute inset-[-10%] opacity-70"
        style={{
          backgroundImage:
            "linear-gradient(var(--theme-grid) 1px, transparent 1px), linear-gradient(90deg, var(--theme-grid) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(circle at center, black 42%, transparent 88%)",
        }}
      />
      <motion.div
        className="absolute inset-x-0 top-[16%] h-40 bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--theme-glow-2)_35%,transparent),transparent)] blur-3xl"
        style={{ opacity: 0.35 }}
        animate={reducedMotion ? undefined : { x: ["-4%", "6%", "-4%"] }}
        transition={
          reducedMotion
            ? undefined
            : {
                duration: 20,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }
        }
      />
    </>
  );
}

function ParticleFallback({ reducedMotion }: { reducedMotion: boolean }) {
  const dots = Array.from({ length: 18 }, (_, index) => ({
    key: index,
    left: `${8 + ((index * 13) % 84)}%`,
    top: `${10 + ((index * 17) % 76)}%`,
    delay: index * 0.2,
  }));

  return (
    <>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--background-subtle)_54%,transparent),transparent_18%)]" />
      {dots.map((dot) =>
        reducedMotion ? (
          <span
            key={dot.key}
            className="absolute h-1.5 w-1.5 rounded-full bg-[var(--theme-glow-2)] opacity-60 blur-[1px]"
            style={{ left: dot.left, top: dot.top }}
          />
        ) : (
          <motion.span
            key={dot.key}
            className="absolute h-1.5 w-1.5 rounded-full bg-[var(--theme-glow-2)] opacity-60 blur-[1px]"
            style={{ left: dot.left, top: dot.top, opacity: 0.18 }}
            animate={{ scale: [1, 1.8, 1] }}
            transition={{
              duration: 4.2,
              delay: dot.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        ),
      )}
    </>
  );
}

export function LiveBackground({ variant, className }: LiveBackgroundProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (variant === "none") {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none fixed inset-0 z-0 overflow-hidden", className)}
    >
      <div className="absolute inset-0 bg-[var(--background)]" />
      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage: "radial-gradient(var(--theme-noise) 0.7px, transparent 0.7px)",
          backgroundSize: "24px 24px",
        }}
      />

      {variant === "subtle-gradient" ? <GradientBackground reducedMotion={!mounted || reducedMotion} /> : null}
      {variant === "grid" ? <GridBackground reducedMotion={!mounted || reducedMotion} /> : null}
      {variant === "particles" ? <ParticleFallback reducedMotion={!mounted || reducedMotion} /> : null}
    </div>
  );
}
