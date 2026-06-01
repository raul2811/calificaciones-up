"use client";

import { Fragment } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildSubjectRenderKey, buildSubjectStableKey } from "@/features/student/analytics/keys";
import type { SubjectView } from "@/features/student/analytics/types";

export type PlanSortKey =
  | "planYear"
  | "planSemester"
  | "code"
  | "name"
  | "credits"
  | "grade"
  | "status"
  | "year"
  | "semester";

export type PlanSortDirection = "asc" | "desc";

type PlanTableProps = {
  subjects: SubjectView[];
  sortBy?: PlanSortKey;
  sortDirection?: PlanSortDirection;
  expandedRowKey?: string | null;
  onSortChange?: (key: PlanSortKey) => void;
  onToggleRow?: (rowKey: string) => void;
  onStatusClick?: (status: string) => void;
};

function toBadgeVariant(status: string): "success" | "warning" | "danger" | "secondary" {
  const normalized = status.toLowerCase();

  if (normalized.includes("aprob") || normalized.includes("ganad")) {
    return "success";
  }

  if (normalized.includes("observ")) {
    return "warning";
  }

  if (normalized.includes("reprob") || normalized.includes("no apro")) {
    return "danger";
  }

  return "secondary";
}

function csvEscape(value: string): string {
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

function sortLabel(current: PlanSortKey | undefined, key: PlanSortKey, direction: PlanSortDirection | undefined): string {
  if (current !== key) {
    return "";
  }
  return direction === "desc" ? " ↓" : " ↑";
}

export function PlanTable({
  subjects,
  sortBy,
  sortDirection,
  expandedRowKey,
  onSortChange,
  onToggleRow,
  onStatusClick,
}: PlanTableProps) {
  function handleExportCsv() {
    const header = [
      "Ano Plan",
      "Semestre Plan",
      "Codigo",
      "Nombre",
      "Creditos",
      "Nota",
      "Estado",
      "Observacion",
      "Ano Cursado",
      "Semestre Cursado",
    ];

    const rows = subjects.map((subject) => [
      subject.planYear,
      subject.planSemester,
      subject.code,
      subject.name,
      subject.creditsText || String(subject.credits),
      subject.gradeText || (subject.grade === null ? "-" : String(subject.grade)),
      subject.status,
      subject.observation,
      subject.year,
      subject.semester,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((value) => csvEscape(value || "-")).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "plan-academico.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <section className="surface-panel overflow-hidden rounded-xl p-5 lg:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="section-kicker">Plan general</h3>
          <p className="mt-2 text-base font-semibold text-primary">Tabla principal del expediente académico</p>
          <p className="mt-1 text-sm leading-7 text-foreground-soft">Ordena, filtra y expande materias para revisar mejor el historial.</p>
        </div>
        <Button type="button" variant="outline" onClick={handleExportCsv}>
          Exportar CSV
        </Button>
      </div>

      {subjects.length === 0 ? (
        <EmptyState
          title="No hay materias para mostrar"
          description="Ajusta búsqueda, estado o criterio de ordenamiento."
        />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {subjects.map((subject, index) => {
              const rowKey = buildSubjectStableKey(subject);
              const expanded = expandedRowKey === rowKey;
              return (
                <article key={buildSubjectRenderKey(subject, index, "plan-cards")} className="surface-elevated rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-primary">{subject.name || "-"}</p>
                      <p className="mt-1 text-sm text-foreground-soft">{subject.code || "-"}</p>
                    </div>
                    <Badge variant={toBadgeVariant(subject.status)}>{subject.status || "-"}</Badge>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-foreground-muted">Plan</dt>
                      <dd className="mt-1 text-foreground-soft">{subject.planYear || "-"} / {subject.planSemester || "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-foreground-muted">Créditos</dt>
                      <dd className="mt-1 text-foreground-soft">{subject.creditsText || subject.credits.toFixed(1)}</dd>
                    </div>
                    <div>
                      <dt className="text-foreground-muted">Nota</dt>
                      <dd className="mt-1 text-foreground-soft">{subject.gradeText || (subject.grade === null ? "-" : String(subject.grade))}</dd>
                    </div>
                    <div>
                      <dt className="text-foreground-muted">Cursado</dt>
                      <dd className="mt-1 text-foreground-soft">{subject.year || "-"} / {subject.semester || "-"}</dd>
                    </div>
                  </dl>
                  {subject.observation ? (
                    <p className="mt-4 text-sm leading-6 text-foreground-soft">{subject.observation}</p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => onToggleRow?.(rowKey)}
                    className="table-action mt-4 rounded-md px-3 py-2 text-sm font-medium"
                  >
                    {expanded ? "Ocultar detalle" : "Ver detalle"}
                  </button>
                  {expanded ? (
                    <div className="mt-4 grid gap-3">
                      {[
                        ["Prerequisitos", subject.prerequisites || "-"],
                        ["Intentos", subject.attempts || "-"],
                        ["Recuperación", subject.recoveryType || "-"],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--card)] p-3">
                          <p className="text-xs text-foreground-muted">{label}</p>
                          <p className="mt-1 text-sm text-foreground-soft">{value}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          <div className="table-shell hidden overflow-x-auto rounded-lg md:block">
            <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Detalle</TableHead>
                <TableHead>
                  <button type="button" className="transition hover:text-primary" onClick={() => onSortChange?.("planYear")}>
                    Ano plan{sortLabel(sortBy, "planYear", sortDirection)}
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" className="transition hover:text-primary" onClick={() => onSortChange?.("planSemester")}>
                    Semestre plan{sortLabel(sortBy, "planSemester", sortDirection)}
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" className="transition hover:text-primary" onClick={() => onSortChange?.("code")}>
                    Codigo{sortLabel(sortBy, "code", sortDirection)}
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" className="transition hover:text-primary" onClick={() => onSortChange?.("name")}>
                    Nombre{sortLabel(sortBy, "name", sortDirection)}
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" className="transition hover:text-primary" onClick={() => onSortChange?.("credits")}>
                    Creditos{sortLabel(sortBy, "credits", sortDirection)}
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" className="transition hover:text-primary" onClick={() => onSortChange?.("grade")}>
                    Nota{sortLabel(sortBy, "grade", sortDirection)}
                  </button>
                </TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Observacion</TableHead>
                <TableHead>
                  <button type="button" className="transition hover:text-primary" onClick={() => onSortChange?.("year")}>
                    Ano cursado{sortLabel(sortBy, "year", sortDirection)}
                  </button>
                </TableHead>
                <TableHead>
                  <button type="button" className="transition hover:text-primary" onClick={() => onSortChange?.("semester")}>
                    Semestre cursado{sortLabel(sortBy, "semester", sortDirection)}
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject, index) => {
                const rowKey = buildSubjectStableKey(subject);

                return (
                  <Fragment key={buildSubjectRenderKey(subject, index, "plan-table-group")}>
                    <TableRow>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => onToggleRow?.(rowKey)}
                          className="table-action rounded-md px-3 py-1.5 text-xs font-semibold"
                          title="Ver mas detalle"
                        >
                          {expandedRowKey === rowKey ? "Ocultar" : "Ver"}
                        </button>
                      </TableCell>
                      <TableCell>{subject.planYear || "-"}</TableCell>
                      <TableCell>{subject.planSemester || "-"}</TableCell>
                      <TableCell className="font-semibold text-primary">{subject.code || "-"}</TableCell>
                      <TableCell className="min-w-[260px]">{subject.name || "-"}</TableCell>
                      <TableCell>{subject.creditsText || subject.credits.toFixed(1)}</TableCell>
                      <TableCell className="font-semibold text-primary">
                        {subject.gradeText || (subject.grade === null ? "-" : String(subject.grade))}
                      </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => onStatusClick?.(subject.status)}
                            title={`Filtrar por ${subject.status}`}
                        >
                          <Badge variant={toBadgeVariant(subject.status)}>{subject.status || "-"}</Badge>
                        </button>
                      </TableCell>
                      <TableCell className="max-w-[360px] text-sm leading-6">{subject.observation || "-"}</TableCell>
                      <TableCell>{subject.year || "-"}</TableCell>
                      <TableCell>{subject.semester || "-"}</TableCell>
                    </TableRow>

                    {expandedRowKey === rowKey ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={11}>
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            {[
                              ["Prerequisitos", subject.prerequisites || "-"],
                              ["Intentos", subject.attempts || "-"],
                              ["Recuperacion", subject.recoveryType || "-"],
                            ].map(([label, value]) => (
                              <div key={label} className="surface-elevated rounded-lg p-4">
                                <p className="text-xs text-foreground-muted">{label}</p>
                                <p className="mt-2 text-sm leading-7 text-foreground-soft">{value}</p>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </Fragment>
                );
              })}
            </TableBody>
            </Table>
          </div>
        </>
      )}
    </section>
  );
}
