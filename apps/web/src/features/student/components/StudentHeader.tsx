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
    <section className="surface-hero rounded-[1.85rem] p-6 lg:p-7">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex items-center gap-4">
          <StudentPhoto name={name} size={88} roundedClassName="rounded-[1.4rem]" />
          <div className="min-w-0">
            <p className="section-kicker text-[11px] font-semibold uppercase tracking-[0.22em]">Expediente academico</p>
            <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight text-primary lg:text-3xl">
              {name}
            </h1>
            <p className="mt-2 text-sm leading-7 text-foreground-soft">{career}</p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Plan", plan],
            ["Indice actual", currentIndex],
            ["Ano actual", currentYear],
            ["Semestre actual", currentSemester],
          ].map(([label, value]) => (
            <article key={label} className="surface-elevated rounded-[1.35rem] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground-muted">{label}</p>
              <p className="mt-3 text-lg font-semibold text-primary">{value}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
