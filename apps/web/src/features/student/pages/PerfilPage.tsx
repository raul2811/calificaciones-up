"use client";

import { StudentHeader } from "@/features/student/components/StudentHeader";
import {
  StudentPageErrorState,
  StudentPageLoadingState,
} from "@/features/student/components/StudentPageState";
import { useStudentData } from "@/features/student/context/StudentDataContext";

export function PerfilPage() {
  const { state, student, analytics } = useStudentData();

  if (state.status === "loading") {
    return (
      <StudentPageLoadingState
        title="Cargando perfil"
        description="Preparando resumen personal academico."
      />
    );
  }

  if (state.status === "error") {
    return (
      <StudentPageErrorState
        title="No se pudo cargar el perfil"
        description={state.error}
      />
    );
  }

  return (
    <div className="space-y-6">
      <StudentHeader student={student} />
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className="metric-card metric-card--success rounded-[1.6rem] p-5">
          <p className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">
            Materias aprobadas
          </p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-primary">
            {analytics.kpi.approvedSubjects}
          </p>
          <p className="mt-2 text-sm leading-7 text-foreground-soft">Carga academica completada con exito.</p>
        </article>
        <article className="metric-card metric-card--warning rounded-[1.6rem] p-5">
          <p className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">
            Materias pendientes
          </p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-primary">
            {analytics.kpi.pendingSubjects}
          </p>
          <p className="mt-2 text-sm leading-7 text-foreground-soft">Materias aun por resolver dentro del plan.</p>
        </article>
        <article className="metric-card metric-card--neutral rounded-[1.6rem] p-5">
          <p className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">
            Avance
          </p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-primary">
            {analytics.kpi.progressPercentage.toFixed(1)}%
          </p>
          <p className="mt-2 text-sm leading-7 text-foreground-soft">Progreso estimado frente al total de creditos.</p>
        </article>
      </section>
    </div>
  );
}
