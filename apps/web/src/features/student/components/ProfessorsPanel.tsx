"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ProfessorRow } from "@/features/student/types";

type ProfessorsPanelProps = {
  professors: ProfessorRow[];
};

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function periodLabel(row: ProfessorRow): string {
  const label = asText(row.academicPeriodLabel);
  if (label) {
    return label;
  }

  const periodType = asText(row.periodType);
  const periodYear = asText(row.periodYear);

  if (periodType && periodYear) {
    return `${periodType} ${periodYear}`;
  }

  return "-";
}

export function ProfessorsPanel({ professors }: ProfessorsPanelProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function handleCopyEmail(key: string, email: string) {
    if (!email) {
      return;
    }

    try {
      await navigator.clipboard.writeText(email);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1200);
    } catch {
      setCopiedKey(null);
    }
  }

  return (
    <section className="surface-panel rounded-[1.75rem] p-5 lg:p-6">
      <div className="mb-5">
        <h3 className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">Profesores</h3>
        <p className="mt-2 text-sm leading-7 text-foreground-soft">Materias con profesor asignado, periodo academico y correo cuando aplica.</p>
      </div>

      {professors.length === 0 ? (
        <p className="empty-state rounded-[1.35rem] p-5 text-sm">
          No hay registros de profesores disponibles.
        </p>
      ) : (
        <div className="table-shell overflow-x-auto rounded-[1.25rem]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Codigo</TableHead>
                <TableHead>Materia</TableHead>
                <TableHead>Profesor</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Accion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professors.map((row, index) => {
                const code = asText(row.code) || "-";
                const name = asText(row.name) || "-";
                const professorName = asText(row.professorName);
                const email = asText(row.professorEmail);
                const period = periodLabel(row);
                const pending =
                  row.assignmentPending === true || professorName.toLowerCase() === "nombrar por" || !professorName;
                const rowKey = `professor:${code}:${name}:${period}:${index}`;

                return (
                  <TableRow key={rowKey}>
                    <TableCell className="font-semibold text-primary">{code}</TableCell>
                    <TableCell className="min-w-[220px]">{name}</TableCell>
                    <TableCell>
                      {pending ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-foreground-soft">Pendiente de asignacion</span>
                          <Badge variant="warning">Pendiente</Badge>
                        </div>
                      ) : (
                        <span className="font-medium text-primary">{professorName}</span>
                      )}
                    </TableCell>
                    <TableCell>{email || "-"}</TableCell>
                    <TableCell>{period}</TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => handleCopyEmail(rowKey, email)}
                        disabled={!email}
                        className="table-action rounded-xl px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {copiedKey === rowKey ? "Copiado" : "Copiar correo"}
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
