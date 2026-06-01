import type { SubjectRow } from "@/features/student/types";
import { EmptyState } from "@/components/common/EmptyState";

type AvanceTableProps = {
  subjects: SubjectRow[];
};

export function AvanceTable({ subjects }: AvanceTableProps) {
  if (subjects.length === 0) {
    return (
      <EmptyState
        title="No hay materias para mostrar"
        description="Ajusta la búsqueda o el estado para ver resultados."
      />
    );
  }

  return (
    <section className="table-shell overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-sm">
          <thead className="text-left text-[10.5px] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
            <tr>
              <th className="whitespace-nowrap border-b border-[var(--border)] px-4 py-3">Codigo</th>
              <th className="whitespace-nowrap border-b border-[var(--border)] px-4 py-3">Nombre</th>
              <th className="whitespace-nowrap border-b border-[var(--border)] px-4 py-3">Creditos</th>
              <th className="whitespace-nowrap border-b border-[var(--border)] px-4 py-3">Nota</th>
              <th className="whitespace-nowrap border-b border-[var(--border)] px-4 py-3">Estado</th>
              <th className="whitespace-nowrap border-b border-[var(--border)] px-4 py-3">Observacion</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject, index) => (
              <tr key={`${subject.code}-${index}`} className="align-top transition-colors hover:bg-[var(--accent-soft)]">
                <td className="border-b border-[var(--border-soft)] px-4 py-3 font-semibold text-primary">{subject.code || "-"}</td>
                <td className="border-b border-[var(--border-soft)] px-4 py-3 text-foreground-soft">{subject.name || "-"}</td>
                <td className="border-b border-[var(--border-soft)] px-4 py-3 text-foreground-soft">{subject.credits || "-"}</td>
                <td className="border-b border-[var(--border-soft)] px-4 py-3 text-foreground-soft">{subject.grade || "-"}</td>
                <td className="border-b border-[var(--border-soft)] px-4 py-3 text-foreground-soft">
                  <span className="status-neutral inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold">
                    {subject.status || "-"}
                  </span>
                </td>
                <td className="border-b border-[var(--border-soft)] px-4 py-3 text-foreground-soft">{subject.observation || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
