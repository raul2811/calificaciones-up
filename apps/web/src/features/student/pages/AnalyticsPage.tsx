"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SubjectView } from "@/features/student/analytics/types";
import { DistributionCharts } from "@/features/student/components/DistributionCharts";
import {
  StudentPageErrorState,
  StudentPageLoadingState,
} from "@/features/student/components/StudentPageState";
import { useStudentData } from "@/features/student/context/StudentDataContext";

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function inGradeRange(subject: SubjectView, range: string): boolean {
  const grade = subject.grade;
  if (grade === null) {
    return false;
  }

  switch (range) {
    case "< 61":
      return grade < 61;
    case "61 - 70":
      return grade >= 61 && grade <= 70.99;
    case "71 - 80":
      return grade >= 71 && grade <= 80.99;
    case "81 - 90":
      return grade >= 81 && grade <= 90.99;
    case "91 - 100":
      return grade >= 91;
    default:
      return true;
  }
}

export function AnalyticsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, analytics } = useStudentData();

  const initialGradeRange = searchParams.get("gradeRange");
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [activeGradeRange, setActiveGradeRange] = useState<string | null>(initialGradeRange);
  const [activeYear, setActiveYear] = useState<string | null>(null);
  const [activeSemester, setActiveSemester] = useState<string | null>(null);

  const exploredSubjects = useMemo(() => {
    return analytics.subjects.filter((subject) => {
      if (activeStatus && normalize(subject.status) !== normalize(activeStatus)) {
        return false;
      }

      if (activeGradeRange && !inGradeRange(subject, activeGradeRange)) {
        return false;
      }

      if (activeYear && subject.year !== activeYear) {
        return false;
      }

      if (activeSemester && subject.planSemester !== activeSemester && subject.semester !== activeSemester) {
        return false;
      }

      return true;
    });
  }, [activeGradeRange, activeSemester, activeStatus, activeYear, analytics.subjects]);

  if (state.status === "loading") {
    return (
      <StudentPageLoadingState
        title="Cargando analiticas"
        description="Preparando distribuciones y graficas academicas."
      />
    );
  }

  if (state.status === "error") {
    return (
      <StudentPageErrorState
        title="No se pudieron cargar las analiticas"
        description={state.error}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="surface-hero rounded-[1.75rem] p-5 lg:p-6">
        <p className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">Analytics academico</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-primary">Explora distribuciones y tendencias del expediente</h2>
        <p className="mt-3 text-sm leading-7 text-foreground-soft">
          Haz click en las graficas para explorar y cruzar datos del expediente.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setActiveStatus(null);
              setActiveGradeRange(null);
              setActiveYear(null);
              setActiveSemester(null);
            }}
            className="btn-secondary rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]"
          >
            Limpiar filtros
          </button>
          <button
            type="button"
            onClick={() => router.push(`/plan${activeStatus ? `?status=${encodeURIComponent(activeStatus)}` : ""}`)}
            className="btn-primary rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]"
          >
            Abrir en plan
          </button>
        </div>
      </section>
      <DistributionCharts
        analytics={analytics}
        activeStatus={activeStatus}
        activeGradeRange={activeGradeRange}
        activeYear={activeYear}
        activeSemester={activeSemester}
        onStatusSelect={(status) => setActiveStatus((prev) => (prev === status ? null : status))}
        onGradeRangeSelect={(range) => setActiveGradeRange((prev) => (prev === range ? null : range))}
        onYearSelect={(year) => setActiveYear((prev) => (prev === year ? null : year))}
        onSemesterSelect={(semester) => setActiveSemester((prev) => (prev === semester ? null : semester))}
      />

      <section className="surface-panel rounded-[1.75rem] p-5 lg:p-6">
        <h3 className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">Muestra filtrada</h3>
        <p className="mt-2 text-sm leading-7 text-foreground-soft">
          Resultado de la exploracion actual: {exploredSubjects.length} materias.
        </p>
        {exploredSubjects.length === 0 ? (
          <p className="empty-state mt-4 rounded-[1.3rem] p-5 text-sm text-foreground-muted">No hay materias que cumplan el filtro activo.</p>
        ) : (
          <div className="table-shell mt-4 overflow-x-auto rounded-[1.25rem]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Codigo</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Semestre</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exploredSubjects.slice(0, 20).map((subject, index) => (
                  <TableRow key={`${subject.code}:${subject.name}:${index}`}>
                    <TableCell className="font-semibold text-primary">{subject.code}</TableCell>
                    <TableCell className="min-w-[240px]">{subject.name}</TableCell>
                    <TableCell>{subject.gradeText || "-"}</TableCell>
                    <TableCell>{subject.status || "-"}</TableCell>
                    <TableCell>{subject.year || "-"}</TableCell>
                    <TableCell>{subject.planSemester || subject.semester || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
