"use client";

import { useEffect, useMemo, useState } from "react";
import Image, { type ImageLoaderProps } from "next/image";

import { apiFetch } from "@/lib/api/client";

type StudentPhotoProps = {
  name: string;
  size?: number;
  roundedClassName?: string;
};

function initialsFromName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "UP";
  }

  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? parts[1]?.[0] ?? "" : "";
  return `${first}${second}`.toUpperCase() || "UP";
}

export function StudentPhoto({
  name,
  size = 80,
  roundedClassName = "rounded-xl",
}: StudentPhotoProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const initials = useMemo(() => initialsFromName(name), [name]);

  useEffect(() => {
    let mounted = true;
    let objectUrl: string | null = null;

    async function loadPhoto() {
      try {
        const response = await apiFetch<Response>("/student/photo", {
          method: "GET",
          credentials: "include",
          parseAs: "response",
        });

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);

        if (!mounted) {
          return;
        }

        setPhotoUrl(objectUrl);
        setFailed(false);
      } catch {
        if (!mounted) {
          return;
        }

        setPhotoUrl(null);
        setFailed(true);
      }
    }

    void loadPhoto();

    return () => {
      mounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, []);

  const baseClass = `surface-elevated overflow-hidden ${roundedClassName}`;
  const px = `${size}px`;

  if (failed || !photoUrl) {
    return (
      <div className={baseClass} style={{ width: px, height: px }}>
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_24%_18%,var(--neon-gold),transparent_45%),linear-gradient(145deg,var(--surface-accent),var(--surface-muted))] text-base font-semibold text-primary">
          {initials}
        </div>
      </div>
    );
  }

  function passthroughLoader({ src }: ImageLoaderProps): string {
    return src;
  }

  return (
    <div className={baseClass} style={{ width: px, height: px }}>
      <Image
        loader={passthroughLoader}
        unoptimized
        src={photoUrl}
        alt={`Foto de ${name}`}
        width={size}
        height={size}
        className="h-full w-full object-cover"
        onError={() => {
          setFailed(true);
          setPhotoUrl(null);
        }}
      />
    </div>
  );
}
