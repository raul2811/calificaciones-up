import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildBlockingKey } from "@/features/student/analytics/keys";
import type { BlockingSubject } from "@/features/student/analytics/types";

type BlockingSubjectsPanelProps = {
  subjects: BlockingSubject[];
  onSelectSubject?: (code: string, name: string) => void;
};

export function BlockingSubjectsPanel({ subjects, onSelectSubject }: BlockingSubjectsPanelProps) {
  return (
    <section className="surface-panel rounded-[2rem] p-6 lg:p-8 border border-[var(--border)] shadow-lg animate-fade-in-up delay-200">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="section-kicker text-[10px] font-bold uppercase tracking-[0.2em] text-rose-500 mb-1">
            Materias que más bloquean
          </h3>
          <p className="text-[14px] font-medium leading-relaxed text-[var(--foreground-soft)]">
            Identifica rápidamente las materias con mayor impacto sobre el avance de tu plan.
          </p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-full px-4 py-1.5 text-[11px] font-black shadow-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          {subjects.length} Bloqueos
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="empty-state rounded-[1.6rem] p-8 bg-[var(--surface-muted)] border border-dashed border-[var(--border-strong)] flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
            <span className="text-emerald-500 text-xl">✓</span>
          </div>
          <p className="text-[14px] font-bold text-[var(--foreground)]">Excelente progreso</p>
          <p className="text-[13px] font-medium text-[var(--foreground-soft)] mt-1">No tienes materias no resueltas generando bloqueos.</p>
        </div>
      ) : (
        <div className="table-shell overflow-hidden rounded-[1.4rem] border border-[var(--border-soft)] shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-[var(--surface-muted)]">
                  <TableHead>Código</TableHead>
                  <TableHead>Materia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Créditos</TableHead>
                  <TableHead>Semestre</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((item, index) => (
                  <TableRow key={buildBlockingKey(item.subject, index)} className="group">
                    <TableCell className="font-black text-[var(--foreground)]">{item.subject.code}</TableCell>
                    <TableCell className="min-w-[240px] font-medium text-[var(--foreground-soft)] group-hover:text-[var(--foreground)] transition-colors">
                      {item.subject.name}
                    </TableCell>
                    <TableCell><Badge variant="warning">{item.subject.status}</Badge></TableCell>
                    <TableCell className="font-medium">{item.subject.credits.toFixed(1)}</TableCell>
                    <TableCell className="text-[var(--foreground-muted)]">{item.subject.planSemester || item.subject.semester || "-"}</TableCell>
                    <TableCell className="max-w-[340px] text-[13px] font-medium text-rose-500/80">
                      {item.reason}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onSelectSubject?.(item.subject.code, item.subject.name)}
                        aria-label={`Ver ${item.subject.code} en el plan`}
                        className="scale-90 opacity-80 group-hover:opacity-100 group-hover:scale-100"
                      >
                        Ver en Plan
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </section>
  );
}
