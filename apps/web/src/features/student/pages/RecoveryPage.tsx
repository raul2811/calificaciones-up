"use client";

import type { SubjectView } from "@/features/student/analytics/types";
import { PageIntro } from "@/components/common/PageIntro";
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
      <PageIntro
        eyebrow="Recovery e intentos"
        title="Historial de recuperación académica"
        description="Seguimiento de suficiencias, verano, arreglos y materias repetidas."
      />

      <section className="surface-panel rounded-xl p-5 lg:p-6">
        <h3 className="section-kicker">Materias con múltiples intentos</h3>
        <p className="mt-4 text-4xl font-semibold tracking-tight text-primary">{repeatedAttempts.length}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("all")}
            className={`rounded-full px-4 py-2 text-xs font-medium ${mode === "all" ? "chip-button chip-button-active" : "chip-button"}`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setMode("attempts")}
            className={`rounded-full px-4 py-2 text-xs font-medium ${mode === "attempts" ? "chip-button chip-button-active" : "chip-button"}`}
          >
            Solo repetidas
          </button>
        </div>
      </section>

      <RecoveryTrackingPanel rows={rows} />
    </div>
  );
}
