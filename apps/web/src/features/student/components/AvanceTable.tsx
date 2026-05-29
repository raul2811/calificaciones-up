import type { SubjectRow } from "@/features/student/types";

type AvanceTableProps = {
  subjects: SubjectRow[];
};

export function AvanceTable({ subjects }: AvanceTableProps) {
  if (subjects.length === 0) {
    return (
      <section className="empty-state rounded-2xl p-8 text-center">
        <p className="text-sm font-medium text-foreground-soft">No hay materias para mostrar con los filtros actuales.</p>
        <p className="mt-1 text-sm text-foreground-muted">Ajusta la busqueda o el estado para ver resultados.</p>
      </section>
    );
  }

  return (
    <section className="table-shell overflow-hidden rounded-2xl">
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
