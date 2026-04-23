"use client";

import { useRouter } from "next/navigation";

import { BlockingSubjectsPanel } from "@/features/student/components/BlockingSubjectsPanel";
import { ExecutiveCharts } from "@/features/student/components/ExecutiveCharts";
import { KPICards, type KpiActionKey } from "@/features/student/components/KPICards";
import { ResumenEjecutivo } from "@/features/student/components/ResumenEjecutivo";
import { StudentHeader } from "@/features/student/components/StudentHeader";
import { StudentPageErrorState, StudentPageLoadingState } from "@/features/student/components/StudentPageState";
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
  const { state, student, analytics, morosidad } = useStudentData();

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

  if (state.status === "loading") {
    return (
      <StudentPageLoadingState
        title="Cargando dashboard"
        description="Preparando resumen ejecutivo del expediente academico."
      />
    );
  }

  if (state.status === "error") {
    return (
      <StudentPageErrorState
        title="No se pudo cargar el dashboard"
        description={state.error}
      />
    );
  }

  return (
    <div className="space-y-6">
      <StudentHeader student={student} />

      <section className="surface-hero rounded-[1.75rem] p-5 lg:p-6">
        <p className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">Estado financiero</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-semibold tracking-tight text-primary">
              {morosidad?.status === "paz_y_salvo"
                ? "Paz y salvo"
                : morosidad?.status === "moroso"
                  ? "Moroso"
                  : "Estado no disponible"}
            </p>
            <p className="mt-2 text-sm leading-7 text-foreground-soft">
              Ano/Semestre: {morosidad?.year || "-"}/{morosidad?.currentSemesterOrCycle || "-"}
            </p>
          </div>
          <div className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
            morosidad?.status === "paz_y_salvo"
              ? "status-success"
              : morosidad?.status === "moroso"
                ? "status-danger"
                : "status-neutral"
          }`}>
            {morosidad?.status === "paz_y_salvo"
              ? "Sin alertas"
              : morosidad?.status === "moroso"
                ? "Revisar saldo"
                : "Sin datos"}
          </div>
        </div>
      </section>

      <KPICards student={student} kpi={analytics.kpi} interactive onCardClick={handleKpiClick} />
      <ExecutiveCharts
        analytics={analytics}
        onStatusClick={(status) => router.push(`/plan?status=${encodeURIComponent(status)}`)}
        onGradeRangeClick={(range) => router.push(`/analytics?gradeRange=${encodeURIComponent(range)}`)}
      />
      <BlockingSubjectsPanel
        subjects={analytics.blockingSubjects}
        onSelectSubject={(code, name) =>
          router.push(`/plan?search=${encodeURIComponent(code || name)}`)
        }
      />
      <ResumenEjecutivo analytics={analytics} />
    </div>
  );
}
