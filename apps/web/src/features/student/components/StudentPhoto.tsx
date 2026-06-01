"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchStudentPhotoBlob } from "@/features/student/api";

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
  const initials = useMemo(() => initialsFromName(name), [name]);
  const photoQuery = useQuery({
    queryKey: ["student", "photo"],
    queryFn: fetchStudentPhotoBlob,
    retry: 0,
  });

  useEffect(() => {
    let objectUrl: string | null = null;

    if (photoQuery.data) {
      objectUrl = URL.createObjectURL(photoQuery.data);
      setPhotoUrl(objectUrl);
    } else {
      setPhotoUrl(null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [photoQuery.data]);

  const baseClass = `surface-elevated overflow-hidden ${roundedClassName}`;
  const px = `${size}px`;

  if (photoQuery.isError || !photoUrl) {
    return (
      <div className={baseClass} style={{ width: px, height: px }}>
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_24%_18%,var(--neon-gold),transparent_45%),linear-gradient(145deg,var(--surface-accent),var(--surface-muted))] text-base font-semibold text-primary">
          {initials}
        </div>
      </div>
    );
  }

  return (
    <div className={baseClass} style={{ width: px, height: px }}>
      <img
        src={photoUrl}
        alt={`Foto de ${name}`}
        width={size}
        height={size}
        className="h-full w-full object-cover"
        onError={() => {
          setPhotoUrl(null);
        }}
      />
    </div>
  );
}
