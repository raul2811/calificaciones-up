export type StudentSummary = {
  name: string;
  career: string;
  plan: string;
  currentIndex: string;
  currentYear: string;
  currentSemester: string;
};

export type SubjectRow = {
  code: string | null;
  name: string | null;
  credits: string | null;
  grade: string | null;
  status: string | null;
  bestGrade?: string | null;
  derivedStatus?: string | null;
  observation: string | null;
  planYear?: string | null;
  planSemester?: string | null;
  takenYear?: string | null;
  takenSemester?: string | null;
  attemptsCount?: number | null;
  sourceFlags?: {
    fromAvance?: boolean;
    fromNotasCreditosCompletos?: boolean;
  } | null;
  academicPeriodLabel?: string | null;
  prerequisites?: string | null;
  semester?: string | number | null;
  year?: string | number | null;
  area?: string | null;
  attempts?: string | number | null;
  recoveryType?: string | null;
  recoveryNote?: string | null;
  [key: string]: unknown;
};

export type ProfessorRow = {
  source?: string | null;
  academicPeriodLabel?: string | null;
  periodYear?: string | null;
  periodType?: string | null;
  cHor?: string | null;
  code?: string | null;
  name?: string | null;
  professorName?: string | null;
  professorEmail?: string | null;
  assignmentPending?: boolean | null;
  [key: string]: unknown;
};

export type MorosidadRecord = {
  message?: string | null;
  balance?: string | null;
  [key: string]: unknown;
};

export type MorosidadSummary = {
  year?: string | null;
  currentSemesterOrCycle?: string | null;
  status?: "paz_y_salvo" | "moroso" | "desconocido" | string | null;
  records?: MorosidadRecord[] | null;
  [key: string]: unknown;
};

export type AvanceAcademicoResponse = {
  student: StudentSummary;
  subjects: SubjectRow[];
  professors?: ProfessorRow[];
  morosidad?: MorosidadSummary | null;
};

export type StatusDistributionItem = {
  status: string;
  count: number;
  percentage: number;
};

export type DashboardKpi = {
  totalSubjects: number;
  approvedSubjects: number;
  observationSubjects: number;
  failedSubjects: number;
  pendingSubjects: number;
  totalCredits: number;
  approvedCredits: number;
  observationCredits: number;
  pendingCredits: number;
  averageGrade: number | null;
  gradedSubjects: number;
  progressPercentage: number;
  statusDistribution: StatusDistributionItem[];
};
