"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  AVANCE_ACADEMICO_LOADING_STATE,
  getAvanceAcademico,
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
  const [state, setState] = useState<AvanceAcademicoState>(AVANCE_ACADEMICO_LOADING_STATE);

  const refresh = useCallback(async () => {
    setState(AVANCE_ACADEMICO_LOADING_STATE);
    const nextState = await getAvanceAcademico();
    setState(nextState);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setState(AVANCE_ACADEMICO_LOADING_STATE);
      const nextState = await getAvanceAcademico();

      if (!mounted) {
        return;
      }

      setState(nextState);
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

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
