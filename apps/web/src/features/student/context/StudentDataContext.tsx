"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  AVANCE_ACADEMICO_LOADING_STATE,
  fetchAvanceAcademicoData,
  type AvanceAcademicoState,
} from "@/features/student/api";
import type { DashboardAnalytics } from "@/features/student/analytics/types";
import { useDashboardAnalytics } from "@/features/student/hooks/useDashboardAnalytics";
import type {
  MorosidadSummary,
  ProfessorRow,
  StudentSummary,
  SubjectRow,
} from "@/features/student/types";

type StudentDataContextValue = {
  state: AvanceAcademicoState;
  student: StudentSummary;
  subjects: SubjectRow[];
  professors: ProfessorRow[];
  morosidad: MorosidadSummary | null;
  analytics: DashboardAnalytics;
  refresh: () => Promise<void>;
};

const EMPTY_STUDENT: StudentSummary = {
  name: "-",
  career: "-",
  plan: "-",
  currentIndex: "-",
  currentYear: "-",
  currentSemester: "-",
};

const StudentDataContext = createContext<StudentDataContextValue | null>(null);

export function StudentDataProvider({ children }: { children: React.ReactNode }) {
  const query = useQuery({
    queryKey: ["student", "avance"],
    queryFn: fetchAvanceAcademicoData,
  });

  const state = useMemo<AvanceAcademicoState>(() => {
    if (query.isPending) {
      return AVANCE_ACADEMICO_LOADING_STATE;
    }

    if (query.isError) {
      return {
        status: "error",
        data: null,
        error:
          query.error instanceof Error
            ? query.error.message
            : "Error inesperado al consultar el avance academico.",
      };
    }

    if (!query.data) {
      return AVANCE_ACADEMICO_LOADING_STATE;
    }

    if (query.data.subjects.length === 0) {
      return {
        status: "empty",
        data: query.data,
        error: null,
      };
    }

    return {
      status: "success",
      data: query.data,
      error: null,
    };
  }, [query.data, query.error, query.isError, query.isPending]);

  const refresh = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const subjects = useMemo(
    () => (state.status === "success" || state.status === "empty" ? state.data.subjects : []),
    [state],
  );
  const student = useMemo(
    () =>
      state.status === "success" || state.status === "empty"
        ? state.data.student
        : EMPTY_STUDENT,
    [state],
  );
  const professors = useMemo(
    () =>
      state.status === "success" || state.status === "empty"
        ? state.data.professors ?? []
        : [],
    [state],
  );
  const morosidad = useMemo(
    () =>
      state.status === "success" || state.status === "empty"
        ? state.data.morosidad ?? null
        : null,
    [state],
  );
  const analytics = useDashboardAnalytics(subjects);

  const value = useMemo(
    () => ({
      state,
      student,
      subjects,
      professors,
      morosidad,
      analytics,
      refresh,
    }),
    [analytics, morosidad, professors, refresh, state, student, subjects],
  );

  return (
    <StudentDataContext.Provider value={value}>
      {children}
    </StudentDataContext.Provider>
  );
}

export function useStudentData(): StudentDataContextValue {
  const context = useContext(StudentDataContext);

  if (!context) {
    throw new Error("useStudentData must be used within StudentDataProvider");
  }

  return context;
}
