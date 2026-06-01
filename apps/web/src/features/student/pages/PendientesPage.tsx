"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PageIntro } from "@/components/common/PageIntro";
import { BlockingSubjectsPanel } from "@/features/student/components/BlockingSubjectsPanel";
import {
  StudentPageErrorState,
  StudentPageLoadingState,
} from "@/features/student/components/StudentPageState";
import { UnresolvedSubjectsPanel } from "@/features/student/components/UnresolvedSubjectsPanel";
import { useStudentData } from "@/features/student/context/StudentDataContext";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function statusToFocus(status: string | null): "all" | "pending" | "failed" | "observation" {
  const value = normalize(status || "");
  if (value.includes("reprob")) {
    return "failed";
  }
  if (value.includes("observ")) {
    return "observation";
  }
  if (value.includes("pend")) {
    return "pending";
  }
  return "all";
}

export function PendientesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state, analytics } = useStudentData();
  const [focus, setFocus] = useState<"all" | "pending" | "failed" | "observation">(
    statusToFocus(searchParams.get("status")),
  );

  if (state.status === "loading") {
    return (
      <StudentPageLoadingState
        title="Cargando pendientes"
        description="Calculando materias criticas y bloqueos."
      />
    );
  }

  if (state.status === "error") {
    return (
      <StudentPageErrorState
        title="No se pudieron cargar las materias pendientes"
        description={state.error}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Pendientes y bloqueos"
        title="Prioriza lo que afecta el avance"
        description="Identifica materias no resueltas y elementos que frenan la continuidad del plan."
      />
      <UnresolvedSubjectsPanel
        pending={analytics.unresolvedPending}
        failed={analytics.unresolvedFailed}
        observation={analytics.unresolvedObservation}
        focus={focus}
        onFocusChange={setFocus}
        onOpenPlan={(subject) =>
          router.push(`/plan?search=${encodeURIComponent(subject.code || subject.name)}`)
        }
      />
      <BlockingSubjectsPanel
        subjects={analytics.blockingSubjects}
        onSelectSubject={(code, name) => router.push(`/plan?search=${encodeURIComponent(code || name)}`)}
      />
    </div>
  );
}
