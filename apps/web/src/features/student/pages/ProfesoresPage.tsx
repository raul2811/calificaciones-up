"use client";

import { ProfessorsPanel } from "@/features/student/components/ProfessorsPanel";
import {
  StudentPageErrorState,
  StudentPageLoadingState,
} from "@/features/student/components/StudentPageState";
import { useStudentData } from "@/features/student/context/StudentDataContext";

export function ProfesoresPage() {
  const { state, professors } = useStudentData();

  if (state.status === "loading") {
    return (
      <StudentPageLoadingState
        title="Cargando profesores"
        description="Preparando asignaciones docentes por materia."
      />
    );
  }

  if (state.status === "error") {
    return (
      <StudentPageErrorState
        title="No se pudo cargar la vista de profesores"
        description={state.error}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="surface-hero rounded-[1.75rem] p-5 lg:p-6">
        <p className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">Profesores</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-primary">Asignacion docente por materia</h2>
        <p className="mt-3 text-sm leading-7 text-foreground-soft">
          Asignacion docente por materia y periodos academicos.
        </p>
      </section>
      <ProfessorsPanel professors={professors} />
    </div>
  );
}
