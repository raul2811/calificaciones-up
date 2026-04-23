import type { DashboardAnalytics } from "@/features/student/analytics/types";

type ResumenEjecutivoProps = {
  analytics: DashboardAnalytics;
};

export function ResumenEjecutivo({ analytics }: ResumenEjecutivoProps) {
  const { kpi, blockingSubjects, unresolvedSubjects } = analytics;

  return (
    <section className="surface-hero rounded-[1.75rem] p-5 lg:p-6">
      <p className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">Resumen ejecutivo</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-primary">Estado general del plan academico</h2>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="surface-elevated rounded-[1.35rem] p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground-muted">Plan completo</p>
          <p className="mt-3 text-base leading-7 text-foreground-soft">
            {kpi.totalSubjects} materias y {kpi.totalCredits.toFixed(1)} creditos totales.
          </p>
        </article>

        <article className="surface-elevated rounded-[1.35rem] p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground-muted">No resueltas</p>
          <p className="mt-3 text-base leading-7 text-foreground-soft">
            {unresolvedSubjects.length} materias entre pendientes, observacion y otros estados no concluidos.
          </p>
        </article>

        <article className="surface-elevated rounded-[1.35rem] p-5">
          <p className="text-[11px] uppercase tracking-[0.16em] text-foreground-muted">Principal bloqueo</p>
          <p className="mt-3 text-base leading-7 text-foreground-soft">
            {blockingSubjects[0] ? `${blockingSubjects[0].subject.code} - ${blockingSubjects[0].subject.name}` : "Sin bloqueos detectables."}
          </p>
        </article>
      </div>
    </section>
  );
}
