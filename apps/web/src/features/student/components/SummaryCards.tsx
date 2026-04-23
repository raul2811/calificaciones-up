import type { DashboardKpi, StudentSummary } from "@/features/student/types";

type SummaryCardsProps = {
  student: StudentSummary;
  kpi: DashboardKpi;
};

type CardItem = {
  label: string;
  value: string;
};

export function SummaryCards({ student, kpi }: SummaryCardsProps) {
  const items: CardItem[] = [
    { label: "Nombre", value: student.name },
    { label: "Carrera", value: student.career },
    { label: "Plan", value: student.plan },
    { label: "Indice actual", value: student.currentIndex },
    { label: "Ano/Semestre actual", value: `${student.currentYear}/${student.currentSemester}` },
  ];

  const kpiItems: CardItem[] = [
    { label: "Total materias", value: String(kpi.totalSubjects) },
    { label: "Aprobadas", value: String(kpi.approvedSubjects) },
    { label: "Pendientes", value: String(kpi.pendingSubjects) },
    { label: "Reprobadas", value: String(kpi.failedSubjects) },
  ];

  return (
    <div className="space-y-3">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => (
          <article key={item.label} className="surface-elevated rounded-xl p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">{item.label}</p>
            <p className="mt-2 text-sm font-semibold text-primary">{item.value || "-"}</p>
          </article>
        ))}
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpiItems.map((item) => (
          <article key={item.label} className="metric-card metric-card--neutral rounded-xl p-4">
            <p className="section-kicker text-[11px] font-semibold uppercase tracking-wide">{item.label}</p>
            <p className="mt-2 text-xl font-bold text-primary">{item.value || "-"}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
