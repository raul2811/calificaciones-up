"use client";

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
      <section className="surface-hero rounded-[1.75rem] p-5 lg:p-6">
        <p className="section-kicker text-[11px] font-semibold uppercase tracking-[0.18em]">Morosidad</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-primary">Estado financiero del estudiante</h2>
        <p className="mt-3 text-sm leading-7 text-foreground-soft">
          Estado actual de cuenta y detalle de registros.
        </p>
      </section>
      <MorosidadPanel morosidad={morosidad} />
    </div>
  );
}
