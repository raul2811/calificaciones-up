import type { SubjectRow } from "@/features/student/types";

export function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeLower(value: unknown): string {
  return normalizeString(value).toLowerCase();
}

export function pickFirst(subject: SubjectRow, aliases: string[]): unknown {
  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(subject, alias)) {
      const value = subject[alias];
      if (value !== undefined && value !== null && normalizeString(value) !== "") {
        return value;
      }
    }
  }

  return undefined;
}

export function resolveText(subject: SubjectRow, aliases: string[], fallback = ""): string {
  const value = pickFirst(subject, aliases);
  const normalized = normalizeString(value);
  return normalized || fallback;
}

export function resolveNumber(subject: SubjectRow, aliases: string[]): number | null {
  const raw = pickFirst(subject, aliases);

  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }

  const source = normalizeString(raw);
  if (!source) {
    return null;
  }

  const compact = source.replace(/\s+/g, "");
  const hasComma = compact.includes(",");
  const hasDot = compact.includes(".");

  let normalized = compact;
  if (hasComma && hasDot) {
    normalized = compact.replace(/\./g, "").replace(/,/g, ".");
  } else if (hasComma) {
    normalized = compact.replace(/,/g, ".");
  }

  normalized = normalized.replace(/[^0-9.-]/g, "");

  if (!normalized || normalized === "." || normalized === "-" || normalized === "-.") {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function gradeLetterToScore(letter: string): number | null {
  const map: Record<string, number> = {
    A: 95,
    B: 85,
    C: 75,
    D: 65,
    F: 50,
    S: 85,
    P: 75,
    R: 50,
    I: 0,
    NP: 50,
    NA: 0,
    N: 0,
  };

  return map[letter] ?? null;
}

export function resolveGrade(subject: SubjectRow): { text: string; numeric: number | null } {
  const text = resolveText(subject, ["bestGrade", "best_grade", "grade", "nota", "finalGrade", "score", "calificacion", "calificación"]);
  if (!text) {
    return { text: "", numeric: null };
  }

  const numeric = resolveNumber(subject, ["bestGrade", "best_grade", "grade", "nota", "finalGrade", "score", "calificacion", "calificación"]);
  if (numeric !== null) {
    return { text, numeric };
  }

  const letter = text.toUpperCase().split(" ")[0] ?? "";
  return { text, numeric: gradeLetterToScore(letter) };
}

function inferStatusFromGrade(gradeText: string, gradeNumeric: number | null): string {
  const grade = normalizeLower(gradeText);

  if (!grade) {
    return "Pendiente";
  }

  if (grade.includes("f asig") || grade.includes("reprob")) {
    return "Reprobada";
  }

  if (grade.includes("sin nota") || grade.includes("inasistencia") || grade.includes("retir")) {
    return "En observacion";
  }

  if (gradeNumeric !== null) {
    if (gradeNumeric >= 61) {
      return "Aprobada";
    }
    if (gradeNumeric > 0) {
      return "Reprobada";
    }
  }

  const letter = gradeText.toUpperCase().split(" ")[0] ?? "";
  if (["A", "B", "C", "S", "P"].includes(letter)) {
    return "Aprobada";
  }
  if (["F", "R", "NP"].includes(letter)) {
    return "Reprobada";
  }
  if (["D", "N", "NA", "I"].includes(letter)) {
    return "En observacion";
  }

  return "Pendiente";
}

export function resolveStatus(subject: SubjectRow, gradeText: string, gradeNumeric: number | null): string {
  const status = resolveText(subject, ["derivedStatus", "derived_status", "status", "estado", "condition", "condicion", "condición"]);
  if (status) {
    return status;
  }

  return inferStatusFromGrade(gradeText, gradeNumeric);
}

export function resolveYear(subject: SubjectRow): string {
  return resolveText(subject, [
    "takenYear",
    "taken_year",
    "ano_lectivo",
    "anio_lectivo",
    "year_lectivo",
    "lectiveYear",
    "yearTaken",
    "planYear",
    "plan_year",
    "yearPlan",
    "anoPlan",
    "añoPlan",
    "year",
    "ano",
    "año",
    "academicYear",
    "schoolYear",
    "currentYear",
    "anioLectivo",
  ]);
}

export function resolveSemester(subject: SubjectRow): string {
  return resolveText(subject, [
    "takenSemester",
    "taken_semester",
    "sem_lectivo",
    "lectiveSemester",
    "semesterTaken",
    "planSemester",
    "plan_semester",
    "semesterPlan",
    "semPlan",
    "semestrePlan",
    "semester",
    "semestre",
    "currentSemester",
  ]);
}

export function resolveCredits(subject: SubjectRow): { text: string; numeric: number } {
  const text = resolveText(subject, ["credits", "creditos", "créditos", "credit"]);
  const numeric = resolveNumber(subject, ["credits", "creditos", "créditos", "credit"]) ?? 0;

  return {
    text: text || (numeric > 0 ? String(numeric) : ""),
    numeric,
  };
}

export function resolveArea(subject: SubjectRow): string {
  const area = resolveText(subject, ["area", "subjectArea", "department", "departamento"]);
  if (area) {
    return area;
  }

  const code = resolveText(subject, ["code", "codigo", "codAsig", "cod", "subjectCode"]).toUpperCase();
  const prefix = code.match(/^[A-Z]+/);
  if (prefix && prefix[0]) {
    return prefix[0];
  }

  if (/^\d/.test(code) && code.length >= 2) {
    return `Area ${code.slice(0, 2)}`;
  }

  return "General";
}

export function resolveObservation(subject: SubjectRow): string {
  return resolveText(subject, ["observation", "observacion", "observación", "note", "remarks", "comment"]);
}

export function resolveCode(subject: SubjectRow): string {
  return resolveText(subject, ["code", "codigo", "codAsig", "cod", "subjectCode"]);
}

export function resolveName(subject: SubjectRow): string {
  return resolveText(subject, ["name", "nombre", "subjectName", "courseName"]);
}

export function resolvePrerequisites(subject: SubjectRow, observation: string): string {
  const direct = resolveText(subject, ["prerequisites", "prerequisito", "prerequisitos", "requirements"]);
  if (direct) {
    return direct;
  }

  const match = observation.match(/(prerrequisit[oa]s?:?.*)$/i);
  return match ? match[1].trim() : "";
}

export function resolveRecoveryInfo(subject: SubjectRow, observation: string): {
  attempts: string;
  recoveryType: string;
  recoveryNote: string;
} {
  return {
    attempts: resolveText(subject, ["attempts", "intentos", "retries"]),
    recoveryType: resolveText(subject, ["recoveryType", "tipoRecuperacion", "recuperacionTipo", "recovery"]),
    recoveryNote:
      resolveText(subject, ["recoveryNote", "notaRecuperacion", "recuperacionNota", "recoveryObservation"]) ||
      (/(recuper|suficien|verano|arreglo|extraordin|reemplaz)/i.test(observation) ? observation : ""),
  };
}

export function normalizeIdentity(value: string): string {
  return normalizeString(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

export function gradeQualityScore(gradeText: string, gradeNumeric: number | null): number {
  const normalized = normalizeLower(gradeText);
  const token = gradeText.toUpperCase().split(" ")[0] ?? "";

  if (!normalized) {
    return -1000;
  }

  if (gradeNumeric !== null) {
    return gradeNumeric;
  }

  const letterScale: Record<string, number> = {
    A: 95,
    B: 85,
    C: 75,
    D: 65,
    S: 80,
    P: 75,
    F: 0,
    R: 0,
    N: 10,
    NP: 0,
    NA: 0,
    I: 0,
  };

  if (token in letterScale) {
    return letterScale[token];
  }

  if (normalized.includes("pend")) {
    return -200;
  }

  if (normalized.includes("sin nota") || normalized.includes("inasistencia")) {
    return -300;
  }

  return -50;
}
