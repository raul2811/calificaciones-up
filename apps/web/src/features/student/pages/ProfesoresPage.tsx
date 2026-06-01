"use client";

import { PageIntro } from "@/components/common/PageIntro";
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
      <PageIntro
        eyebrow="Profesores"
        title="Asignación docente por materia"
        description="Asignación docente por materia y períodos académicos."
      />
      <ProfessorsPanel professors={professors} />
    </div>
  );
}
