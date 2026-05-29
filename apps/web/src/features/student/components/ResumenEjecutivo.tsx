import type { DashboardAnalytics } from "@/features/student/analytics/types";

type ResumenEjecutivoProps = {
  analytics: DashboardAnalytics;
};

export function ResumenEjecutivo({ analytics }: ResumenEjecutivoProps) {
  const { kpi, blockingSubjects, unresolvedSubjects } = analytics;

  return (
    <section className="relative overflow-hidden surface-hero rounded-[2rem] p-6 lg:p-8 border border-[var(--border-strong)] shadow-xl animate-fade-in-up delay-300">
      <div className="absolute inset-0 bg-gradient-to-tr from-[var(--surface-muted)] to-transparent opacity-50 rounded-[2rem] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="inline-flex items-center gap-2 section-kicker text-[10px] font-bold uppercase tracking-[0.2em] bg-[var(--surface-elevated)] px-3 py-1 rounded-full border border-[var(--border-soft)] mb-3">
             <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
             Resumen Ejecutivo
          </p>
          <h2 className="text-2xl font-black tracking-tight text-[var(--foreground)]">Estado general del plan</h2>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 gap-5 md:grid-cols-3">
        <article className="group surface-elevated rounded-[1.6rem] p-6 border border-[var(--border-soft)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[var(--accent)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--foreground-muted)] group-hover:text-[var(--accent)] transition-colors">Plan Completo</p>
          <p className="mt-4 text-[14px] font-medium leading-relaxed text-[var(--foreground-soft)]">
            <strong className="text-[var(--foreground)] font-black">{kpi.totalSubjects}</strong> materias y <strong className="text-[var(--foreground)] font-black">{kpi.totalCredits.toFixed(1)}</strong> créditos totales en tu expediente.
          </p>
        </article>

        <article className="group surface-elevated rounded-[1.6rem] p-6 border border-[var(--border-soft)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[var(--accent)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--foreground-muted)] group-hover:text-[var(--accent)] transition-colors">No resueltas</p>
          <p className="mt-4 text-[14px] font-medium leading-relaxed text-[var(--foreground-soft)]">
            <strong className="text-[var(--foreground)] font-black">{unresolvedSubjects.length}</strong> materias entre pendientes, en observación o sin concluir.
          </p>
        </article>

        <article className="group surface-elevated rounded-[1.6rem] p-6 border border-[var(--border-soft)] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-amber-500/50">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--foreground-muted)] group-hover:text-amber-500 transition-colors">Principal Bloqueo</p>
          <p className="mt-4 text-[14px] font-medium leading-relaxed text-[var(--foreground-soft)]">
            {blockingSubjects[0] ? (
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                {blockingSubjects[0].subject.code} - {blockingSubjects[0].subject.name}
              </span>
            ) : "Sin bloqueos detectables. ¡Sigue así!"}
          </p>
        </article>
      </div>
    </section>
  );
}
