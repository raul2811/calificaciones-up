import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MorosidadSummary } from "@/features/student/types";

type MorosidadPanelProps = {
  morosidad: MorosidadSummary | null | undefined;
};

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function statusVariant(status: string): "success" | "danger" | "secondary" {
  if (status === "paz_y_salvo") {
    return "success";
  }

  if (status === "moroso") {
    return "danger";
  }

  return "secondary";
}

function statusLabel(status: string): string {
  if (status === "paz_y_salvo") {
    return "Paz y salvo";
  }

  if (status === "moroso") {
    return "Moroso";
  }

  return "Desconocido";
}

export function MorosidadPanel({ morosidad }: MorosidadPanelProps) {
  const status = asText(morosidad?.status) || "desconocido";
  const records = Array.isArray(morosidad?.records) ? morosidad?.records : [];
  const positive = status === "paz_y_salvo";
  const warning = status === "moroso";

  return (
    <section className="surface-panel rounded-[1.75rem] p-5 lg:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">Morosidad</h3>
          <p className="mt-2 text-sm leading-7 text-foreground-soft">
            Ano/Semestre: {asText(morosidad?.year) || "-"}/{asText(morosidad?.currentSemesterOrCycle) || "-"}
          </p>
        </div>
        <Badge variant={statusVariant(status)}>{statusLabel(status)}</Badge>
      </div>

      <div
        className={`mb-5 rounded-[1.45rem] border px-5 py-4 text-sm leading-7 ${
          positive
            ? "status-success"
            : warning
              ? "status-danger"
              : "status-neutral"
        }`}
      >
        {positive
          ? "Estado positivo: paz y salvo activo."
          : warning
            ? "Atencion: se detectaron registros de deuda o saldo pendiente."
            : "No fue posible determinar el estado financiero con certeza."}
      </div>

      {records.length > 0 ? (
        <div className="table-shell overflow-x-auto rounded-[1.25rem]">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Mensaje</TableHead>
                <TableHead>Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((row, index) => (
                <TableRow key={`morosidad:${asText(row.message)}:${asText(row.balance)}:${index}`}>
                  <TableCell className="min-w-[320px]">{asText(row.message) || "-"}</TableCell>
                  <TableCell className="font-semibold text-primary">{asText(row.balance) || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="empty-state rounded-[1.35rem] p-5 text-sm">
          Sin registros de morosidad disponibles.
        </p>
      )}
    </section>
  );
}
