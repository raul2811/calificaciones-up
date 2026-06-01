"use client";

import { useRouter } from "next/navigation";

import { BlockingSubjectsPanel } from "@/features/student/components/BlockingSubjectsPanel";
import {
  AnalyticsSkeleton,
  BlockingSubjectsSkeleton,
  DashboardFinancialSkeleton,
  DashboardHeaderSkeleton,
  DashboardSectionError,
  MetricsSkeleton,
  SummarySkeleton,
} from "@/features/student/components/DashboardSkeletons";
import { ExecutiveCharts } from "@/features/student/components/ExecutiveCharts";
import { KPICards, type KpiActionKey } from "@/features/student/components/KPICards";
import { ResumenEjecutivo } from "@/features/student/components/ResumenEjecutivo";
import { StudentHeader } from "@/features/student/components/StudentHeader";
import { useStudentData } from "@/features/student/context/StudentDataContext";

function toPlanStatusQuery(key: KpiActionKey): string | null {
  if (key === "approvedSubjects") {
    return "Aprobada";
  }
  if (key === "failedSubjects") {
    return "Reprobada";
  }
  if (key === "observationSubjects") {
    return "En observacion";
  }
  if (key === "pendingSubjects") {
    return "Pendiente";
  }
  return null;
}

export function DashboardOverviewPage() {
  const router = useRouter();
  const { state, student, analytics, morosidad, refresh } = useStudentData();
  const hasAcademicData = state.status === "success" || state.status === "empty";
  const isLoading = state.status === "loading";

  function handleKpiClick(key: KpiActionKey) {
    const status = toPlanStatusQuery(key);
    if (status) {
      router.push(`/plan?status=${encodeURIComponent(status)}`);
      return;
    }

    if (key === "progressPercentage" || key === "approvedCredits" || key === "pendingCredits") {
      router.push("/analytics");
      return;
    }

    if (key === "totalSubjects" || key === "totalCredits") {
      router.push("/plan");
      return;
    }
  }

  return (
    <div className="space-y-6">
      {hasAcademicData ? (
        <StudentHeader student={student} />
      ) : isLoading ? (
        <DashboardHeaderSkeleton />
      ) : (
        <DashboardSectionError
          title="No se pudo cargar el resumen del estudiante"
          description={state.error}
          onRetry={() => void refresh()}
        />
      )}

      {hasAcademicData ? (
        <section className="surface-hero rounded-xl p-5 lg:p-6">
          <p className="section-kicker">Estado financiero</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                {morosidad?.status === "paz_y_salvo"
                  ? "Paz y salvo"
                  : morosidad?.status === "moroso"
                    ? "Moroso"
                    : "Estado no disponible"}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--foreground-soft)]">
                Año/Semestre: {morosidad?.year || "-"}/{morosidad?.currentSemesterOrCycle || "-"}
              </p>
            </div>
            <div className={`rounded-full border px-4 py-2 text-xs font-medium ${
              morosidad?.status === "paz_y_salvo"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : morosidad?.status === "moroso"
                  ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                  : "bg-[var(--surface-muted)] text-[var(--foreground-muted)] border-[var(--border)]"
            }`}>
              {morosidad?.status === "paz_y_salvo"
                ? "Sin alertas"
                : morosidad?.status === "moroso"
                  ? "Revisar saldo"
                  : "Sin datos"}
            </div>
          </div>
        </section>
      ) : isLoading ? (
        <DashboardFinancialSkeleton />
      ) : (
        <DashboardSectionError
          title="No se pudo consultar el estado financiero"
          description={state.error}
          onRetry={() => void refresh()}
        />
      )}

      {hasAcademicData ? (
        <KPICards student={student} kpi={analytics.kpi} interactive onCardClick={handleKpiClick} />
      ) : isLoading ? (
        <MetricsSkeleton />
      ) : (
        <DashboardSectionError
          title="No se pudieron calcular las métricas"
          description={state.error}
          onRetry={() => void refresh()}
        />
      )}

      {hasAcademicData ? (
        <ExecutiveCharts
          analytics={analytics}
          onStatusClick={(status) => router.push(`/plan?status=${encodeURIComponent(status)}`)}
          onGradeRangeClick={(range) => router.push(`/analytics?gradeRange=${encodeURIComponent(range)}`)}
        />
      ) : isLoading ? (
        <AnalyticsSkeleton />
      ) : (
        <DashboardSectionError
          title="No se pudo preparar el bloque de analytics"
          description={state.error}
          onRetry={() => void refresh()}
        />
      )}

      {hasAcademicData ? (
        <BlockingSubjectsPanel
          subjects={analytics.blockingSubjects}
          onSelectSubject={(code, name) =>
            router.push(`/plan?search=${encodeURIComponent(code || name)}`)
          }
        />
      ) : isLoading ? (
        <BlockingSubjectsSkeleton />
      ) : (
        <DashboardSectionError
          title="No se pudo cargar el análisis de bloqueos"
          description={state.error}
          onRetry={() => void refresh()}
        />
      )}

      {hasAcademicData ? (
        <ResumenEjecutivo analytics={analytics} />
      ) : isLoading ? (
        <SummarySkeleton />
      ) : (
        <DashboardSectionError
          title="No se pudo construir el resumen ejecutivo"
          description={state.error}
          onRetry={() => void refresh()}
        />
      )}
    </div>
  );
}
