import type { DashboardKpi, SubjectRow } from "@/features/student/types";

export type SubjectStatusCategory = "approved" | "observation" | "pending" | "failed" | "unknown";

export type SubjectView = {
  code: string;
  name: string;
  credits: number;
  creditsText: string;
  grade: number | null;
  gradeText: string;
  status: string;
  observation: string;
  area: string;
  semester: string;
  year: string;
  planSemester: string;
  planYear: string;
  prerequisites: string;
  attempts: string;
  recoveryType: string;
  recoveryNote: string;
  raw: SubjectRow;
  category: SubjectStatusCategory;
};

export type StatusChartItem = {
  label: string;
  count: number;
  percentage: number;
};

export type GradeDistributionItem = {
  range: string;
  count: number;
};

export type CreditsByYearItem = {
  year: string;
  credits: number;
};

export type SubjectsBySemesterItem = {
  semester: string;
  count: number;
};

export type AreaStatusItem = {
  area: string;
  approved: number;
  observation: number;
  pending: number;
  failed: number;
  unknown: number;
  total: number;
};

export type BlockingSubject = {
  subject: SubjectView;
  blockingScore: number;
  reason: string;
};

export type RecoveryRow = {
  code: string;
  name: string;
  status: string;
  attempts: string;
  recoveryType: string;
  recoveryNote: string;
};

export type DashboardAnalytics = {
  kpi: DashboardKpi;
  subjects: SubjectView[];
  statusDistribution: StatusChartItem[];
  gradeDistribution: GradeDistributionItem[];
  creditsByYear: CreditsByYearItem[];
  subjectsBySemester: SubjectsBySemesterItem[];
  areaStatus: AreaStatusItem[];
  blockingSubjects: BlockingSubject[];
  unresolvedSubjects: SubjectView[];
  unresolvedPending: SubjectView[];
  unresolvedFailed: SubjectView[];
  unresolvedObservation: SubjectView[];
  recoveryRows: RecoveryRow[];
};
