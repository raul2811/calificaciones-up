"use client";

import { useMemo, useState } from "react";

import { PageIntro } from "@/components/common/PageIntro";
import { DistributionCharts } from "@/features/student/components/DistributionCharts";
import {
  StudentPageErrorState,
  StudentPageLoadingState,
} from "@/features/student/components/StudentPageState";
import { useStudentData } from "@/features/student/context/StudentDataContext";

function asGrade(value: number | null): string {
  if (value === null) {
    return "Sin nota";
  }
  return value.toFixed(2);
}

export function AnalyticsPage() {
  const { state, analytics } = useStudentData();
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [activeGradeRange, setActiveGradeRange] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<string | null>(null);
  const [activeSemester, setActiveSemester] = useState<string | null>(null);

  const summaryCards = useMemo(
    () => [
      {
        label: "Promedio visible",
        value: asGrade(analytics.kpi.averageGrade),
        helper: `${analytics.kpi.gradedSubjects} materias con nota numérica.`,
      },
      {
        label: "Estados detectados",
        value: String(analytics.statusDistribution.length),
        helper: "Categorías de estado identificadas en el expediente.",
      },
      {
        label: "Áreas académicas",
        value: String(analytics.areaStatus.length),
        helper: "Bloques derivados por prefijo o agrupación académica.",
      },
      {
        label: "Materias críticas",
        value: String(analytics.blockingSubjects.length),
        helper: "Elementos priorizados por impacto en el avance.",
      },
    ],
    [analytics],
  );

  if (state.status === "loading") {
    return (
      <StudentPageLoadingState
        title="Cargando analytics"
        description="Preparando distribuciones y métricas derivadas del expediente."
      />
    );
  }

  if (state.status === "error") {
    return (
      <StudentPageErrorState
        title="No se pudo cargar analytics"
        description={state.error}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Analytics"
        title="Lectura analítica del expediente"
        description="Todos los gráficos y resúmenes de esta vista se derivan de las materias cargadas en el expediente. No se usan métricas simuladas."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <article key={item.label} className="surface-panel rounded-xl p-5">
            <p className="text-xs text-foreground-muted">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-primary">{item.value}</p>
            <p className="mt-3 text-sm leading-7 text-foreground-soft">{item.helper}</p>
          </article>
        ))}
      </section>

      <DistributionCharts
        analytics={analytics}
        activeStatus={activeStatus}
        activeGradeRange={activeGradeRange}
        activeYear={activeYear}
        activeSemester={activeSemester}
        onStatusSelect={(value) => setActiveStatus((current) => (current === value ? null : value))}
        onGradeRangeSelect={(value) => setActiveGradeRange((current) => (current === value ? null : value))}
        onYearSelect={(value) => setActiveYear((current) => (current === value ? null : value))}
        onSemesterSelect={(value) => setActiveSemester((current) => (current === value ? null : value))}
      />
    </div>
  );
}
