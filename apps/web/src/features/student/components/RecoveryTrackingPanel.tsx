import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { RecoveryRow } from "@/features/student/analytics/types";

type RecoveryTrackingPanelProps = {
  rows: RecoveryRow[];
};

export function RecoveryTrackingPanel({ rows }: RecoveryTrackingPanelProps) {
  function isDeferredRecoveryLabel(value: string): boolean {
    return value.trim().toLowerCase() === "recuperar luego";
  }

  return (
    <section className="surface-panel rounded-[1.75rem] p-5 lg:p-6">
      <h3 className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">Seguimiento de recuperacion</h3>
      <p className="mt-2 text-sm leading-7 text-foreground-soft">Intentos, arreglos, suficiencias, verano o notas de recuperacion cuando existan en la respuesta.</p>

      {rows.length === 0 ? (
        <div className="empty-state mt-5 rounded-[1.35rem] p-5 text-sm text-foreground-muted">
          No se detectaron registros de recuperacion en la data actual.
        </div>
      ) : (
        <div className="table-shell mt-5 overflow-x-auto rounded-[1.25rem]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Codigo</TableHead>
                <TableHead>Materia</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Intentos</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={`recovery:${row.code}:${row.name}:${row.status}:${row.attempts}:${index}`}>
                  <TableCell className="font-semibold text-primary">{row.code || "-"}</TableCell>
                  <TableCell className="min-w-[240px]">{row.name || "-"}</TableCell>
                  <TableCell>{row.status || "-"}</TableCell>
                  <TableCell>{row.attempts || "-"}</TableCell>
                  <TableCell>
                    {isDeferredRecoveryLabel(row.recoveryType) ? (
                      <Badge variant="warning">{row.recoveryType}</Badge>
                    ) : (
                      row.recoveryType || "-"
                    )}
                  </TableCell>
                  <TableCell className="max-w-[360px] text-sm leading-6">{row.recoveryNote || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
