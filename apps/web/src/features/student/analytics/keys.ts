import type { SubjectView } from "@/features/student/analytics/types";

export function buildSubjectStableKey(subject: SubjectView): string {
  const code = subject.code || "sin-codigo";
  const name = subject.name || "sin-nombre";
  const planYear = subject.planYear || "sin-plan-year";
  const planSemester = subject.planSemester || "sin-plan-sem";
  const year = subject.year || "sin-year";
  const semester = subject.semester || "sin-sem";

  return `${code}:${name}:${planYear}:${planSemester}:${year}:${semester}`;
}

export function buildSubjectRenderKey(subject: SubjectView, index: number, scope: string): string {
  const status = subject.status || "sin-estado";
  const base = buildSubjectStableKey(subject);

  return `${scope}:${base}:${status}:${index}`;
}

export function buildBlockingKey(subject: SubjectView, index: number): string {
  const base = buildSubjectStableKey(subject);

  return `blocking:${base}:${index}`;
}
