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
    <section className="surface-panel rounded-[1.75rem] p-5 lg:p-6">
      <div className="mb-5">
        <h3 className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">Materias que mas bloquean</h3>
        <p className="mt-2 text-sm leading-7 text-foreground-soft">Identifica rapidamente las materias con mayor impacto sobre el avance del plan.</p>
      </div>
      {subjects.length === 0 ? (
        <div className="empty-state rounded-[1.35rem] p-6">
          <p className="text-sm font-medium text-foreground-soft">Sin materias no resueltas para analizar bloqueos.</p>
        </div>
      ) : (
        <div className="table-shell overflow-x-auto rounded-[1.25rem]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Codigo</TableHead>
                <TableHead>Materia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creditos</TableHead>
                <TableHead>Semestre</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Accion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((item, index) => (
                <TableRow key={buildBlockingKey(item.subject, index)}>
                  <TableCell className="font-semibold text-primary">{item.subject.code}</TableCell>
                  <TableCell className="min-w-[240px]">{item.subject.name}</TableCell>
                  <TableCell><Badge variant="warning">{item.subject.status}</Badge></TableCell>
                  <TableCell>{item.subject.credits.toFixed(1)}</TableCell>
                  <TableCell>{item.subject.planSemester || item.subject.semester || "-"}</TableCell>
                  <TableCell className="max-w-[340px] text-sm leading-6">{item.reason}</TableCell>
                  <TableCell>
                    <Button type="button" variant="outline" onClick={() => onSelectSubject?.(item.subject.code, item.subject.name)}>
                      Ver en plan
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
