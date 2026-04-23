import { ApiClientError, apiFetch } from "@/lib/api/client";
import type { AvanceAcademicoResponse, MorosidadRecord, MorosidadSummary, ProfessorRow, SubjectRow } from "@/features/student/types";

export type AvanceAcademicoState =
  | {
      status: "loading";
      data: null;
      error: null;
    }
  | {
      status: "empty";
      data: AvanceAcademicoResponse;
      error: null;
    }
  | {
      status: "success";
      data: AvanceAcademicoResponse;
      error: null;
    }
  | {
      status: "error";
      data: null;
      error: string;
    };

export const AVANCE_ACADEMICO_LOADING_STATE: AvanceAcademicoState = {
  status: "loading",
  data: null,
  error: null,
};

function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    if (error.code === "HTTP_ERROR" && typeof error.details === "object" && error.details !== null) {
      const details = error.details as { error?: string; message?: string };

      if (typeof details.error === "string" && details.error.trim()) {
        return details.error;
      }

      if (typeof details.message === "string" && details.message.trim()) {
        return details.message;
      }
    }

    return "No fue posible consultar el avance academico.";
  }

  return "Error inesperado al consultar el avance academico.";
}

function isAvanceAcademicoResponse(value: unknown): value is AvanceAcademicoResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<AvanceAcademicoResponse>;

  return Boolean(payload.student && Array.isArray(payload.subjects));
}

function readText(record: Record<string, unknown>, aliases: string[]): string {
  for (const alias of aliases) {
    const value = record[alias];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function adaptAvanceAcademicoResponse(value: unknown): AvanceAcademicoResponse | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const payload = value as { student?: unknown; subjects?: unknown; professors?: unknown; morosidad?: unknown };
  if (!payload.student || typeof payload.student !== "object" || !Array.isArray(payload.subjects)) {
    return null;
  }

  const studentRecord = payload.student as Record<string, unknown>;

  const student = {
    name: readText(studentRecord, ["name", "nombre", "studentName"]),
    career: readText(studentRecord, ["career", "carrera"]),
    plan: readText(studentRecord, ["plan", "studyPlan"]),
    currentIndex: readText(studentRecord, ["currentIndex", "current_index", "indice", "index"]),
    currentYear: readText(studentRecord, ["currentYear", "current_year", "ano", "año", "year"]),
    currentSemester: readText(studentRecord, ["currentSemester", "current_semester", "semestre", "semester"]),
  };

  const subjects = payload.subjects
    .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
    .map((subject) => ({
      ...subject,
      code: typeof subject.code === "string" ? subject.code : (subject.codigo as string | null | undefined) ?? null,
      name: typeof subject.name === "string" ? subject.name : (subject.nombre as string | null | undefined) ?? null,
      credits:
        typeof subject.credits === "string" ? subject.credits : (subject.creditos as string | null | undefined) ?? null,
      grade: typeof subject.grade === "string" ? subject.grade : (subject.nota as string | null | undefined) ?? null,
      bestGrade:
        typeof subject.bestGrade === "string"
          ? subject.bestGrade
          : (subject.best_grade as string | null | undefined) ?? null,
      derivedStatus:
        typeof subject.derivedStatus === "string"
          ? subject.derivedStatus
          : (subject.derived_status as string | null | undefined) ?? null,
      status: typeof subject.status === "string" ? subject.status : (subject.estado as string | null | undefined) ?? null,
      observation:
        typeof subject.observation === "string"
          ? subject.observation
          : (subject.observacion as string | null | undefined) ?? null,
      planYear:
        typeof subject.planYear === "string"
          ? subject.planYear
          : (subject.plan_year as string | null | undefined) ??
            (subject.ano_plan as string | null | undefined) ??
            (subject.anio_plan as string | null | undefined) ??
            null,
      planSemester:
        typeof subject.planSemester === "string"
          ? subject.planSemester
          : (subject.plan_semester as string | null | undefined) ??
            (subject.sem_plan as string | null | undefined) ??
            null,
      takenYear:
        typeof subject.takenYear === "string"
          ? subject.takenYear
          : (subject.taken_year as string | null | undefined) ??
            (subject.ano_lectivo as string | null | undefined) ??
            (subject.anio_lectivo as string | null | undefined) ??
            null,
      takenSemester:
        typeof subject.takenSemester === "string"
          ? subject.takenSemester
          : (subject.taken_semester as string | null | undefined) ??
            (subject.sem_lectivo as string | null | undefined) ??
            null,
      attemptsCount:
        typeof subject.attemptsCount === "number"
          ? subject.attemptsCount
          : (subject.attempts_count as number | null | undefined) ?? null,
      sourceFlags:
        typeof subject.sourceFlags === "object" && subject.sourceFlags !== null
          ? (subject.sourceFlags as SubjectRow["sourceFlags"])
          : ((subject.source_flags as SubjectRow["sourceFlags"]) ?? null),
      academicPeriodLabel:
        typeof subject.academicPeriodLabel === "string"
          ? subject.academicPeriodLabel
          : (subject.academic_period_label as string | null | undefined) ?? null,
    }));

  const professors: ProfessorRow[] = Array.isArray(payload.professors)
    ? payload.professors
        .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
        .map((row) => ({
          ...row,
          source: typeof row.source === "string" ? row.source : null,
          academicPeriodLabel:
            typeof row.academicPeriodLabel === "string"
              ? row.academicPeriodLabel
              : (row.academic_period_label as string | null | undefined) ?? null,
          periodYear:
            typeof row.periodYear === "string" ? row.periodYear : (row.period_year as string | null | undefined) ?? null,
          periodType:
            typeof row.periodType === "string" ? row.periodType : (row.period_type as string | null | undefined) ?? null,
          cHor: typeof row.cHor === "string" ? row.cHor : (row.c_hor as string | null | undefined) ?? null,
          code: typeof row.code === "string" ? row.code : null,
          name: typeof row.name === "string" ? row.name : null,
          professorName:
            typeof row.professorName === "string"
              ? row.professorName
              : (row.professor_name as string | null | undefined) ?? null,
          professorEmail:
            typeof row.professorEmail === "string"
              ? row.professorEmail
              : (row.professor_email as string | null | undefined) ?? null,
          assignmentPending:
            typeof row.assignmentPending === "boolean"
              ? row.assignmentPending
              : (row.assignment_pending as boolean | null | undefined) ?? null,
        }))
    : [];

  const morosidad: MorosidadSummary | null = payload.morosidad && typeof payload.morosidad === "object"
    ? {
        ...(payload.morosidad as Record<string, unknown>),
        year:
          typeof (payload.morosidad as Record<string, unknown>).year === "string"
            ? ((payload.morosidad as Record<string, unknown>).year as string)
            : null,
        currentSemesterOrCycle:
          typeof (payload.morosidad as Record<string, unknown>).currentSemesterOrCycle === "string"
            ? ((payload.morosidad as Record<string, unknown>).currentSemesterOrCycle as string)
            : ((payload.morosidad as Record<string, unknown>).current_semester_or_cycle as string | null | undefined) ??
              null,
        status:
          typeof (payload.morosidad as Record<string, unknown>).status === "string"
            ? ((payload.morosidad as Record<string, unknown>).status as string)
            : null,
        records: Array.isArray((payload.morosidad as Record<string, unknown>).records)
          ? ((payload.morosidad as Record<string, unknown>).records as unknown[])
              .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
              .map((item): MorosidadRecord => ({
                ...item,
                message: typeof item.message === "string" ? item.message : null,
                balance: typeof item.balance === "string" ? item.balance : null,
              }))
          : [],
      }
    : null;

  return {
    student,
    subjects,
    professors,
    morosidad,
  };
}

export async function getAvanceAcademico(): Promise<AvanceAcademicoState> {
  try {
    const response = await apiFetch<unknown>("/student/avance", {
      method: "GET",
      credentials: "include",
    });

    const adapted = adaptAvanceAcademicoResponse(response);

    if (!adapted || !isAvanceAcademicoResponse(adapted)) {
      return {
        status: "error",
        data: null,
        error: "Respuesta invalida de la API de avance academico.",
      };
    }

    if (adapted.subjects.length === 0) {
      return {
        status: "empty",
        data: adapted,
        error: null,
      };
    }

    return {
      status: "success",
      data: adapted,
      error: null,
    };
  } catch (error) {
    return {
      status: "error",
      data: null,
      error: getApiErrorMessage(error),
    };
  }
}
