import type { DashboardAnalytics } from "@/features/student/analytics/types";

type ExecutiveChartsProps = {
  analytics: DashboardAnalytics;
  activeStatus?: string | null;
  activeGradeRange?: string | null;
  onStatusClick?: (status: string) => void;
  onGradeRangeClick?: (range: string) => void;
};

function maxOrOne(values: number[]): number {
  const max = Math.max(...values, 0);
  return max > 0 ? max : 1;
}

function statusColor(label: string): string {
  const normalized = label.toLowerCase();
  if (normalized.includes("aprob")) {
    return "var(--chart-success)";
  }
  if (normalized.includes("reprob")) {
    return "var(--chart-danger)";
  }
  if (normalized.includes("observ")) {
    return "var(--chart-warning)";
  }
  return "var(--chart-neutral)";
}

export function ExecutiveCharts({
  analytics,
  activeStatus = null,
  activeGradeRange = null,
  onStatusClick,
  onGradeRangeClick,
}: ExecutiveChartsProps) {
  const maxStatus = maxOrOne(analytics.statusDistribution.map((item) => item.count));
  const maxGrades = maxOrOne(analytics.gradeDistribution.map((item) => item.count));

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1.1fr_0.8fr]">
      <article className="surface-panel rounded-[1.6rem] p-5">
        <h3 className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">Distribucion por estado</h3>
        <div className="mt-4 space-y-3">
          {analytics.statusDistribution.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onStatusClick?.(item.label)}
              className={`block w-full rounded-2xl p-3 text-left transition ${
                activeStatus === item.label ? "chip-button chip-button-active" : "chip-button"
              }`}
              title={`Filtrar por ${item.label}`}
            >
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-foreground-soft">{item.label}</span>
                <span className="font-semibold text-primary">{item.count}</span>
              </div>
              <div className="h-2.5 rounded-full" style={{ background: "var(--surface-strong)" }}>
                <div className="h-full rounded-full" style={{ width: `${(item.count / maxStatus) * 100}%`, background: statusColor(item.label) }} />
              </div>
            </button>
          ))}
        </div>
      </article>

      <article className="surface-panel rounded-[1.6rem] p-5">
        <h3 className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">Distribucion de calificaciones</h3>
        <div className="mt-4 space-y-3">
          {analytics.gradeDistribution.map((item) => (
            <button
              key={item.range}
              type="button"
              onClick={() => onGradeRangeClick?.(item.range)}
              className={`block w-full rounded-2xl p-3 text-left transition ${
                activeGradeRange === item.range ? "chip-button chip-button-active" : "chip-button"
              }`}
              title={`Filtrar por rango ${item.range}`}
            >
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-foreground-soft">{item.range}</span>
                <span className="font-semibold text-primary">{item.count}</span>
              </div>
              <div className="h-2.5 rounded-full" style={{ background: "var(--surface-strong)" }}>
                <div className="h-full rounded-full" style={{ width: `${(item.count / maxGrades) * 100}%`, background: "var(--chart-info)" }} />
              </div>
            </button>
          ))}
        </div>
      </article>

      <article className="surface-hero rounded-[1.6rem] p-5">
        <h3 className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">Avance estimado</h3>
        <p className="mt-4 text-4xl font-semibold tracking-tight text-primary">
          {analytics.kpi.progressPercentage.toFixed(1)}%
        </p>
        <div className="mt-5 h-3 overflow-hidden rounded-full" style={{ background: "var(--surface-strong)" }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.max(0, Math.min(100, analytics.kpi.progressPercentage))}%`, background: "linear-gradient(90deg, var(--accent), var(--chart-info))" }}
          />
        </div>
        <div className="mt-5 grid gap-3">
          <div className="surface-elevated rounded-2xl p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground-muted">Creditos aprobados</p>
            <p className="mt-2 text-lg font-semibold text-primary">{analytics.kpi.approvedCredits.toFixed(1)}</p>
          </div>
          <div className="surface-elevated rounded-2xl p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground-muted">Total del plan</p>
            <p className="mt-2 text-lg font-semibold text-primary">{analytics.kpi.totalCredits.toFixed(1)}</p>
          </div>
        </div>
      </article>
    </section>
  );
}
