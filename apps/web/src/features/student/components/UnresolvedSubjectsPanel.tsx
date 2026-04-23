"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { buildSubjectRenderKey } from "@/features/student/analytics/keys";
import type { SubjectView } from "@/features/student/analytics/types";

type UnresolvedSubjectsPanelProps = {
  pending: SubjectView[];
  failed: SubjectView[];
  observation: SubjectView[];
  focus?: "all" | "pending" | "failed" | "observation";
  onFocusChange?: (focus: "all" | "pending" | "failed" | "observation") => void;
  onOpenPlan?: (subject: SubjectView) => void;
};

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function searchFilter(subjects: SubjectView[], term: string): SubjectView[] {
  const query = normalize(term);
  if (!query) {
    return subjects;
  }

  return subjects.filter((subject) => {
    return (
      normalize(subject.code).includes(query) ||
      normalize(subject.name).includes(query) ||
      normalize(subject.prerequisites).includes(query)
    );
  });
}

function statusPanelClass(type: "pending" | "failed" | "observation"): string {
  if (type === "failed") {
    return "metric-card metric-card--danger";
  }
  if (type === "observation") {
    return "metric-card metric-card--warning";
  }
  return "metric-card metric-card--neutral";
}

function SubjectColumn({
  title,
  subjects,
  type,
  onOpenPlan,
}: {
  title: string;
  subjects: SubjectView[];
  type: "pending" | "failed" | "observation";
  onOpenPlan?: (subject: SubjectView) => void;
}) {
  return (
    <article className={`rounded-[1.5rem] border p-4 ${statusPanelClass(type)}`}>
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-base font-semibold text-primary">{title}</h4>
        <span className="count-badge rounded-full px-2.5 py-1 text-xs font-semibold">
          {subjects.length}
        </span>
      </div>

      {subjects.length === 0 ? (
        <p className="text-sm leading-7 text-foreground-soft">Sin materias para este filtro.</p>
      ) : (
        <div className="space-y-3">
          {subjects.map((subject, index) => (
            <div key={buildSubjectRenderKey(subject, index, `unresolved-${type}`)} className="surface-elevated rounded-[1.2rem] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-primary">{subject.code}</p>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground-muted">{subject.status || title}</span>
              </div>
              <p className="mt-2 text-sm leading-7 text-foreground-soft">{subject.name}</p>
              <p className="mt-2 text-xs leading-6 text-foreground-muted">Prerequisitos: {subject.prerequisites || "-"}</p>
              <p className="mt-1 text-xs leading-6 text-foreground-muted">
                Ano/Semestre: {subject.planYear || subject.year || "-"}/{subject.planSemester || subject.semester || "-"}
              </p>
              {type === "failed" ? (
                <p className="mt-1 text-xs leading-6 text-foreground-muted">Nota: {subject.gradeText || "-"}</p>
              ) : null}
              <button
                type="button"
                onClick={() => onOpenPlan?.(subject)}
                className="table-action mt-3 rounded-xl px-3 py-1.5 text-xs font-semibold"
              >
                Abrir en plan
              </button>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

export function UnresolvedSubjectsPanel({
  pending,
  failed,
  observation,
  focus = "all",
  onFocusChange,
  onOpenPlan,
}: UnresolvedSubjectsPanelProps) {
  const [search, setSearch] = useState("");

  const filteredPending = useMemo(() => searchFilter(pending, search), [pending, search]);
  const filteredFailed = useMemo(() => searchFilter(failed, search), [failed, search]);
  const filteredObservation = useMemo(() => searchFilter(observation, search), [observation, search]);

  const tabs: Array<{ key: "all" | "pending" | "failed" | "observation"; label: string }> = [
    { key: "all", label: "Todas" },
    { key: "pending", label: "Pendientes" },
    { key: "failed", label: "Reprobadas" },
    { key: "observation", label: "Observacion" },
  ];

  return (
    <section className="surface-panel rounded-[1.75rem] p-5 lg:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">Foco de materias no resueltas</h3>
          <p className="mt-2 text-sm leading-7 text-foreground-soft">Separacion clara entre pendientes, reprobadas y observacion.</p>
        </div>

        <div className="w-full max-w-sm">
          <label htmlFor="unresolved-search" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground-muted">
            Buscar en no resueltas
          </label>
          <Input
            id="unresolved-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Codigo, nombre o prerrequisito"
          />
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2.5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onFocusChange?.(tab.key)}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
              focus === tab.key ? "chip-button chip-button-active" : "chip-button"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {(focus === "all" || focus === "pending") ? (
          <SubjectColumn title="Pendientes" subjects={filteredPending} type="pending" onOpenPlan={onOpenPlan} />
        ) : null}
        {(focus === "all" || focus === "failed") ? (
          <SubjectColumn title="Reprobadas" subjects={filteredFailed} type="failed" onOpenPlan={onOpenPlan} />
        ) : null}
        {(focus === "all" || focus === "observation") ? (
          <SubjectColumn title="En observacion" subjects={filteredObservation} type="observation" onOpenPlan={onOpenPlan} />
        ) : null}
      </div>
    </section>
  );
}
