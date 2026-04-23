import type { DashboardAnalytics } from "@/features/student/analytics/types";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type DistributionChartsProps = {
  analytics: DashboardAnalytics;
  activeStatus?: string | null;
  activeGradeRange?: string | null;
  activeYear?: string | null;
  activeSemester?: string | null;
  onStatusSelect?: (status: string) => void;
  onGradeRangeSelect?: (range: string) => void;
  onYearSelect?: (year: string) => void;
  onSemesterSelect?: (semester: string) => void;
};

type DonutItem = {
  label: string;
  value: number;
  color: string;
};

function maxOrOne(values: number[]): number {
  const max = Math.max(...values, 0);
  return max > 0 ? max : 1;
}

function buildConicGradient(items: DonutItem[]): string {
  const total = items.reduce((acc, item) => acc + item.value, 0);
  if (total <= 0) {
    return "conic-gradient(var(--chart-neutral) 0 100%)";
  }

  let cursor = 0;
  const segments = items.map((item) => {
    const portion = (item.value / total) * 100;
    const start = cursor;
    const end = cursor + portion;
    cursor = end;
    return `${item.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
  });

  return `conic-gradient(${segments.join(",")})`;
}

function DonutChart({
  title,
  items,
  activeLabel,
  onSelect,
}: {
  title: string;
  items: DonutItem[];
  activeLabel?: string | null;
  onSelect?: (label: string) => void;
}) {
  const total = items.reduce((acc, item) => acc + item.value, 0);
  const gradient = buildConicGradient(items);

  return (
    <article className="surface-panel rounded-[1.6rem] p-5">
      <h3 className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">{title}</h3>
      <div className="mt-5 grid grid-cols-1 items-center gap-5 sm:grid-cols-[220px_1fr]">
        <div
          className="mx-auto flex h-44 w-44 items-center justify-center rounded-full border border-[color:var(--border)] shadow-inner"
          style={{ background: gradient, boxShadow: "var(--panel-shadow-soft)" }}
        >
          <div className="surface-elevated flex h-28 w-28 items-center justify-center rounded-full text-center">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-foreground-muted">Total</p>
              <p className="mt-2 text-2xl font-semibold text-primary">{total}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {items.map((item) => (
            <button
              key={`${title}-${item.label}`}
              type="button"
              onClick={() => onSelect?.(item.label)}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
                activeLabel === item.label ? "chip-button chip-button-active" : "chip-button"
              }`}
              title={`Filtrar por ${item.label}`}
            >
              <div className="flex items-center gap-3">
                <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-foreground-soft">{item.label}</span>
              </div>
              <span className="font-semibold text-primary">{item.value}</span>
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

function resolveStatusColor(label: string): string {
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

export function DistributionCharts({
  analytics,
  activeStatus = null,
  activeGradeRange = null,
  activeYear = null,
  activeSemester = null,
  onStatusSelect,
  onGradeRangeSelect,
  onYearSelect,
  onSemesterSelect,
}: DistributionChartsProps) {
  const creditsByYearMax = maxOrOne(analytics.creditsByYear.map((item) => item.credits));
  const semesterMax = maxOrOne(analytics.subjectsBySemester.map((item) => item.count));

  const statusDonutItems: DonutItem[] = analytics.statusDistribution.map((item) => ({
    label: item.label,
    value: item.count,
    color: resolveStatusColor(item.label),
  }));

  const gradeDonutItems: DonutItem[] = analytics.gradeDistribution
    .filter((item) => item.count > 0)
    .map((item, index) => ({
      label: item.range,
      value: item.count,
      color: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"][index % 5],
    }));

  return (
    <section className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
      <DonutChart
        title="Distribucion por estado"
        items={statusDonutItems}
        activeLabel={activeStatus}
        onSelect={onStatusSelect}
      />
      <DonutChart
        title="Distribucion de calificaciones"
        items={gradeDonutItems.length > 0 ? gradeDonutItems : [{ label: "Sin notas", value: 1, color: "var(--chart-neutral)" }]}
        activeLabel={activeGradeRange}
        onSelect={onGradeRangeSelect}
      />

      <article className="surface-panel rounded-[1.6rem] p-5">
        <h3 className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">Creditos por ano cursado</h3>
        <div className="mt-5 space-y-3">
          {analytics.creditsByYear.length === 0 ? (
            <p className="text-sm text-foreground-muted">Sin datos de ano en las materias deduplicadas.</p>
          ) : (
            analytics.creditsByYear.map((item) => (
              <button
                key={item.year}
                type="button"
                onClick={() => onYearSelect?.(item.year)}
                className={`block w-full rounded-2xl p-3 text-left transition ${
                  activeYear === item.year ? "chip-button chip-button-active" : "chip-button"
                }`}
                title={`Filtrar por ano ${item.year}`}
              >
                <div className="mb-2 flex items-center justify-between text-sm text-foreground-soft">
                  <span>Ano {item.year}</span>
                  <span className="font-semibold text-primary">{item.credits.toFixed(1)}</span>
                </div>
                <div className="h-2.5 rounded-full" style={{ background: "var(--surface-strong)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(item.credits / creditsByYearMax) * 100}%`, background: "var(--chart-success)" }}
                  />
                </div>
              </button>
            ))
          )}
        </div>
      </article>

      <article className="surface-panel rounded-[1.6rem] p-5">
        <h3 className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">Materias por semestre del plan</h3>
        <div className="mt-5 space-y-3">
          {analytics.subjectsBySemester.length === 0 ? (
            <p className="text-sm text-foreground-muted">Sin semestre identificado en las materias deduplicadas.</p>
          ) : (
            analytics.subjectsBySemester.map((item) => (
              <button
                key={item.semester}
                type="button"
                onClick={() => onSemesterSelect?.(item.semester)}
                className={`block w-full rounded-2xl p-3 text-left transition ${
                  activeSemester === item.semester ? "chip-button chip-button-active" : "chip-button"
                }`}
                title={`Filtrar por semestre ${item.semester}`}
              >
                <div className="mb-2 flex items-center justify-between text-sm text-foreground-soft">
                  <span>Semestre {item.semester}</span>
                  <span className="font-semibold text-primary">{item.count}</span>
                </div>
                <div className="h-2.5 rounded-full" style={{ background: "var(--surface-strong)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(item.count / semesterMax) * 100}%`, background: "var(--chart-5)" }}
                  />
                </div>
              </button>
            ))
          )}
        </div>
      </article>

      {analytics.areaStatus.length > 1 ? (
        <article className="surface-panel rounded-[1.6rem] p-5 2xl:col-span-2">
          <h3 className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">Bloques por prefijo academico</h3>
          <p className="mt-2 text-sm leading-7 text-foreground-soft">Agrupacion derivada por prefijo del codigo para lectura rapida.</p>
          <div className="table-shell mt-5 overflow-x-auto rounded-[1.25rem]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Prefijo</TableHead>
                  <TableHead>Aprobadas</TableHead>
                  <TableHead>Reprobadas</TableHead>
                  <TableHead>Observacion</TableHead>
                  <TableHead>Pendientes</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.areaStatus.map((item) => (
                  <TableRow key={item.area}>
                    <TableCell className="font-semibold text-primary">{item.area}</TableCell>
                    <TableCell>{item.approved}</TableCell>
                    <TableCell>{item.failed}</TableCell>
                    <TableCell>{item.observation}</TableCell>
                    <TableCell>{item.pending + item.unknown}</TableCell>
                    <TableCell>{item.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </article>
      ) : null}
    </section>
  );
}
