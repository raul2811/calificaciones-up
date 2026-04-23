import type { DashboardKpi } from "@/features/student/types";

type StatisticsPanelsProps = {
  kpi: DashboardKpi;
};

function asPercentage(value: number): string {
  return `${Math.max(0, Math.min(100, value)).toFixed(1)}%`;
}

const BAR_COLORS = [
  "var(--chart-1)",
  "var(--chart-success)",
  "var(--chart-warning)",
  "var(--chart-danger)",
  "var(--chart-5)",
  "var(--chart-2)",
];

export function StatisticsPanels({ kpi }: StatisticsPanelsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_1fr]">
      <article className="surface-hero rounded-2xl p-5">
        <p className="section-kicker text-xs font-semibold uppercase tracking-wide">Progreso Academico</p>
        <h2 className="mt-1 text-lg font-semibold text-primary">Avance General</h2>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-foreground-soft">Creditos aprobados</span>
            <span className="font-semibold text-primary">
              {kpi.approvedCredits.toFixed(1)} / {kpi.totalCredits.toFixed(1)}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full" style={{ background: "var(--surface-strong)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: asPercentage(kpi.progressPercentage), background: "linear-gradient(90deg, var(--accent), var(--chart-info))" }}
            />
          </div>
          <p className="section-kicker mt-2 text-sm font-medium">{asPercentage(kpi.progressPercentage)} completado</p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div className="surface-elevated rounded-lg p-3">
            <p className="text-xs uppercase tracking-wide text-foreground-muted">Promedio</p>
            <p className="mt-1 text-xl font-bold text-primary">
              {kpi.averageGrade === null ? "-" : kpi.averageGrade.toFixed(2)}
            </p>
          </div>
          <div className="surface-elevated rounded-lg p-3">
            <p className="text-xs uppercase tracking-wide text-foreground-muted">Materias con nota</p>
            <p className="mt-1 text-xl font-bold text-primary">{kpi.gradedSubjects}</p>
          </div>
        </div>
      </article>

      <article className="surface-panel rounded-2xl p-5">
        <p className="section-kicker text-xs font-semibold uppercase tracking-wide">Distribucion</p>
        <h2 className="mt-1 text-lg font-semibold text-primary">Materias por Estado</h2>

        {kpi.statusDistribution.length === 0 ? (
          <p className="mt-4 text-sm text-foreground-soft">Sin estados disponibles para graficar.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {kpi.statusDistribution.map((item, index) => (
              <div key={item.status}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="truncate pr-3 text-foreground-soft">{item.status}</span>
                  <span className="font-semibold text-primary">
                    {item.count} ({asPercentage(item.percentage)})
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full" style={{ background: "var(--surface-strong)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: asPercentage(item.percentage), background: BAR_COLORS[index % BAR_COLORS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
