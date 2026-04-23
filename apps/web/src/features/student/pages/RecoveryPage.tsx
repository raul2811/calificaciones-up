"use client";

import type { SubjectView } from "@/features/student/analytics/types";
import { RecoveryTrackingPanel } from "@/features/student/components/RecoveryTrackingPanel";
import {
  StudentPageErrorState,
  StudentPageLoadingState,
} from "@/features/student/components/StudentPageState";
import { useStudentData } from "@/features/student/context/StudentDataContext";
import { useState } from "react";

function hasMultipleAttempts(subject: SubjectView): boolean {
  const raw = subject.raw.attemptsCount;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw > 1;
  }
  return false;
}

export function RecoveryPage() {
  const { state, analytics } = useStudentData();
  const [mode, setMode] = useState<"all" | "attempts">("all");

  if (state.status === "loading") {
    return (
      <StudentPageLoadingState
        title="Cargando recovery"
        description="Preparando historial de recuperacion e intentos."
      />
    );
  }

  if (state.status === "error") {
    return (
      <StudentPageErrorState
        title="No se pudo cargar recovery"
        description={state.error}
      />
    );
  }

  const repeatedAttempts = analytics.subjects.filter(hasMultipleAttempts);
  const rows = mode === "attempts" ? analytics.recoveryRows.filter((row) => Number(row.attempts) > 1) : analytics.recoveryRows;

  return (
    <div className="space-y-6">
      <section className="surface-hero rounded-[1.75rem] p-5 lg:p-6">
        <p className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">Recovery e intentos</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-primary">Historial de recuperacion academica</h2>
        <p className="mt-3 text-sm leading-7 text-foreground-soft">
          Seguimiento de suficiencias, verano, arreglos y materias repetidas.
        </p>
      </section>

      <section className="surface-panel rounded-[1.75rem] p-5 lg:p-6">
        <h3 className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">
          Materias con multiples intentos
        </h3>
        <p className="mt-4 text-4xl font-semibold tracking-tight text-primary">{repeatedAttempts.length}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("all")}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${mode === "all" ? "chip-button chip-button-active" : "chip-button"}`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setMode("attempts")}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${mode === "attempts" ? "chip-button chip-button-active" : "chip-button"}`}
          >
            Solo repetidas
          </button>
        </div>
      </section>

      <RecoveryTrackingPanel rows={rows} />
    </div>
  );
}
