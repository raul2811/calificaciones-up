"use client";

import { PageIntro } from "@/components/common/PageIntro";
import { MorosidadPanel } from "@/features/student/components/MorosidadPanel";
import {
  StudentPageErrorState,
  StudentPageLoadingState,
} from "@/features/student/components/StudentPageState";
import { useStudentData } from "@/features/student/context/StudentDataContext";

export function MorosidadPage() {
  const { state, morosidad } = useStudentData();

  if (state.status === "loading") {
    return (
      <StudentPageLoadingState
        title="Cargando morosidad"
        description="Consultando estado financiero y registros."
      />
    );
  }

  if (state.status === "error") {
    return (
      <StudentPageErrorState
        title="No se pudo cargar la vista de morosidad"
        description={state.error}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Morosidad"
        title="Estado financiero del estudiante"
        description="Estado actual de cuenta y detalle de registros."
      />
      <MorosidadPanel morosidad={morosidad} />
    </div>
  );
}
