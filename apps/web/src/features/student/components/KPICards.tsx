import type { DashboardKpi, StudentSummary } from "@/features/student/types";

export type KpiActionKey =
  | "totalSubjects"
  | "totalCredits"
  | "approvedSubjects"
  | "failedSubjects"
  | "observationSubjects"
  | "pendingSubjects"
  | "approvedCredits"
  | "pendingCredits"
  | "progressPercentage"
  | "currentIndex";

type KPICardsProps = {
  student: StudentSummary;
  kpi: DashboardKpi;
  interactive?: boolean;
  activeKey?: KpiActionKey | null;
  onCardClick?: (key: KpiActionKey) => void;
};

type Card = {
  key: KpiActionKey;
  label: string;
  value: string;
  helper: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};

function cardClasses(tone: Card["tone"]): string {
  switch (tone) {
    case "success":
      return "metric-card metric-card--success";
    case "warning":
      return "metric-card metric-card--warning";
    case "danger":
      return "metric-card metric-card--danger";
    case "neutral":
    default:
      return "metric-card metric-card--neutral";
  }
}

export function KPICards({
  student,
  kpi,
  interactive = false,
  activeKey = null,
  onCardClick,
}: KPICardsProps) {
  const cards: Card[] = [
    { key: "totalSubjects", label: "Total materias", value: String(kpi.totalSubjects), helper: "Dimension total del plan", tone: "neutral" },
    { key: "totalCredits", label: "Total creditos", value: kpi.totalCredits.toFixed(1), helper: "Creditos acumulados del plan", tone: "neutral" },
    { key: "approvedSubjects", label: "Aprobadas", value: String(kpi.approvedSubjects), helper: "Materias completadas", tone: "success" },
    { key: "failedSubjects", label: "Reprobadas", value: String(kpi.failedSubjects), helper: "Requieren atencion", tone: "danger" },
    { key: "observationSubjects", label: "En observacion", value: String(kpi.observationSubjects), helper: "Necesitan seguimiento", tone: "warning" },
    { key: "pendingSubjects", label: "Pendientes", value: String(kpi.pendingSubjects), helper: "Aun no cursadas o sin cierre", tone: "neutral" },
    { key: "approvedCredits", label: "Creditos aprobados", value: kpi.approvedCredits.toFixed(1), helper: "Base del avance real", tone: "success" },
    { key: "pendingCredits", label: "Creditos pendientes", value: kpi.pendingCredits.toFixed(1), helper: "Carga restante", tone: "neutral" },
    { key: "progressPercentage", label: "Avance estimado", value: `${kpi.progressPercentage.toFixed(1)}%`, helper: "Progreso del plan", tone: "neutral" },
    { key: "currentIndex", label: "Indice actual", value: student.currentIndex || "-", helper: "Referencia acumulada", tone: "neutral" },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card, index) => (
        <button
          key={card.key}
          type="button"
          onClick={() => onCardClick?.(card.key)}
          disabled={!interactive}
          aria-pressed={interactive ? activeKey === card.key : undefined}
          className={`rounded-xl p-5 text-left border border-[var(--border)] animate-fade-in-up ${
            cardClasses(card.tone)
          } ${interactive ? "hover:border-[var(--border-strong)] hover:shadow-md cursor-pointer" : "cursor-default"} ${
            activeKey === card.key ? "ring-2 ring-[var(--accent)] border-transparent" : ""
          }`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <p className="text-xs text-[var(--foreground-muted)]">{card.label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">{card.value}</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--foreground-soft)]">{card.helper}</p>
          {interactive ? <p className="mt-4 text-xs font-medium text-[var(--accent-strong)]">Abrir detalle</p> : null}
        </button>
      ))}
    </section>
  );
}
