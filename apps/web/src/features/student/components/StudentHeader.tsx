"use client";

import { StudentPhoto } from "@/features/student/components/StudentPhoto";
import type { StudentSummary } from "@/features/student/types";

type StudentHeaderProps = {
  student: StudentSummary;
};

function normalizeText(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim();
  return normalized || fallback;
}

export function StudentHeader({ student }: StudentHeaderProps) {
  const name = normalizeText(student.name, "Estudiante");
  const career = normalizeText(student.career, "-");
  const plan = normalizeText(student.plan, "-");
  const currentYear = normalizeText(student.currentYear, "-");
  const currentSemester = normalizeText(student.currentSemester, "-");
  const currentIndex = normalizeText(student.currentIndex, "-");

  return (
    <section className="surface-hero rounded-xl p-6 lg:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-6">
          <StudentPhoto name={name} size={88} roundedClassName="rounded-xl" />
          <div className="min-w-0">
            <p className="section-kicker">Expediente académico</p>
            <h1 className="mt-2 truncate text-3xl font-semibold tracking-tight text-[var(--foreground)] lg:text-4xl">
              {name}
            </h1>
            <p className="mt-2 max-w-md truncate text-[15px] font-medium leading-7 text-[var(--foreground-soft)]">{career}</p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-3 xl:grid-cols-4 lg:ml-auto">
          {[
            ["Plan", plan],
            ["Índice", currentIndex],
            ["Año Actual", currentYear],
            ["Semestre", currentSemester],
          ].map(([label, value]) => (
            <article key={label} className="surface-elevated rounded-lg p-4">
              <p className="text-xs text-[var(--foreground-muted)]">{label}</p>
              <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">{value}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
