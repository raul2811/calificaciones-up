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

      <section className="relative overflow-hidden surface-hero rounded-[2rem] p-6 lg:p-8 animate-fade-in-up border border-[var(--border-strong)] shadow-xl">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,_var(--accent-glow)_0%,_transparent_70%)] opacity-40 pointer-events-none" />
        <p className="relative z-10 section-kicker text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--accent)] mb-2">Estado Financiero</p>
        <div className="relative z-10 mt-4 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-3xl font-black tracking-tight text-[var(--foreground)]">
              {morosidad?.status === "paz_y_salvo"
                ? "Paz y salvo"
                : morosidad?.status === "moroso"
                  ? "Moroso"
                  : "Estado no disponible"}
            </p>
            <p className="mt-2 text-[13px] font-medium leading-7 text-[var(--foreground-soft)]">
              Año/Semestre: {morosidad?.year || "-"}/{morosidad?.currentSemesterOrCycle || "-"}
            </p>
          </div>
          <div className={`rounded-full border px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] shadow-sm backdrop-blur-md ${
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
