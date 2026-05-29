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
    <section className="relative overflow-hidden surface-hero rounded-[2rem] p-8 lg:p-10 border border-[var(--border-strong)] shadow-2xl animate-fade-in-up">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,_var(--accent-glow)_0%,_transparent_70%)] opacity-60 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,_var(--accent-glow)_0%,_transparent_70%)] opacity-40 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] rounded-[1.8rem] blur opacity-40 group-hover:opacity-75 transition duration-500" />
            <StudentPhoto name={name} size={100} roundedClassName="rounded-[1.6rem] relative z-10 border-2 border-white/10" />
          </div>
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 section-kicker text-[10px] font-bold uppercase tracking-[0.24em] bg-[var(--surface-elevated)] px-3 py-1.5 rounded-full border border-[var(--border-soft)] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              Expediente Académico
            </p>
            <h1 className="truncate text-3xl font-black tracking-tight text-[var(--foreground)] lg:text-4xl">
              {name}
            </h1>
            <p className="mt-2 text-[15px] font-medium leading-7 text-[var(--foreground-soft)] max-w-md truncate">{career}</p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-4 xl:grid-cols-4 lg:ml-auto">
          {[
            ["Plan", plan],
            ["Índice", currentIndex],
            ["Año Actual", currentYear],
            ["Semestre", currentSemester],
          ].map(([label, value]) => (
            <article key={label} className="surface-elevated rounded-[1.4rem] p-5 border border-[var(--border-soft)] shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[var(--accent)] group">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--foreground-muted)] group-hover:text-[var(--accent)] transition-colors">{label}</p>
              <p className="mt-3 text-2xl font-black text-[var(--foreground)]">{value}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
