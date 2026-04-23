import type { DashboardKpi, SubjectRow } from "@/features/student/types";
import type {
  AreaStatusItem,
  BlockingSubject,
  CreditsByYearItem,
  DashboardAnalytics,
  GradeDistributionItem,
  RecoveryRow,
  StatusChartItem,
  SubjectStatusCategory,
  SubjectView,
  SubjectsBySemesterItem,
} from "@/features/student/analytics/types";
import {
  gradeQualityScore,
  normalizeIdentity,
  normalizeLower,
  normalizeString,
  resolveArea,
  resolveCode,
  resolveCredits,
  resolveGrade,
  resolveName,
  resolveObservation,
  resolvePrerequisites,
  resolveRecoveryInfo,
  resolveSemester,
  resolveStatus,
  resolveText,
  resolveYear,
} from "@/features/student/analytics/resolve";

function percentage(part: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return (part / total) * 100;
}

function categorizeStatus(status: string): SubjectStatusCategory {
  const value = normalizeLower(status);

  if (value.includes("aprob") || value.includes("ganad") || value.includes("convalid") || value.includes("cumpl")) {
    return "approved";
  }

  if (value.includes("reprob") || value.includes("f asig") || value === "f") {
    return "failed";
  }

  if (value.includes("observ") || value.includes("recuper") || value.includes("suficien") || value.includes("verano")) {
    return "observation";
  }

  if (value.includes("pend") || value.includes("curs") || value.includes("matric") || value.includes("por cursar")) {
    return "pending";
  }

  if (value.includes("no apro") || value.includes("fracas")) {
    return "failed";
  }

  return "unknown";
}

function toSubjectView(subject: SubjectRow): SubjectView {
  const code = resolveCode(subject) || "-";
  const name = resolveName(subject) || "Sin nombre";
  const observation = resolveObservation(subject);

  const grade = resolveGrade(subject);
  const status = resolveStatus(subject, grade.text, grade.numeric);
  const credits = resolveCredits(subject);

  const planYear = resolveText(subject, ["planYear", "plan_year", "yearPlan", "planAno", "planAño"]);
  const planSemester = resolveText(subject, ["planSemester", "plan_semester", "semesterPlan", "planSemestre"]);
  const year = resolveYear(subject);
  const semester = resolveSemester(subject);

  const prerequisites = resolvePrerequisites(subject, observation);
  const recovery = resolveRecoveryInfo(subject, observation);

  return {
    code,
    name,
    credits: credits.numeric,
    creditsText: credits.text,
    grade: grade.numeric,
    gradeText: grade.text,
    status,
    observation,
    area: resolveArea(subject),
    semester,
    year,
    planSemester,
    planYear,
    prerequisites,
    attempts: recovery.attempts,
    recoveryType: recovery.recoveryType,
    recoveryNote: recovery.recoveryNote,
    raw: subject,
    category: categorizeStatus(status),
  };
}

function getRecencyScore(subject: SubjectView): number {
  const year = Number(subject.year || subject.planYear || 0);
  const semester = Number(subject.semester || subject.planSemester || 0);

  const y = Number.isFinite(year) ? year : 0;
  const s = Number.isFinite(semester) ? semester : 0;

  return y * 10 + s;
}

function subjectIdentityKey(subject: SubjectView): string {
  const code = normalizeIdentity(subject.code);
  const name = normalizeIdentity(subject.name);

  if (name) {
    return `name:${name}`;
  }

  return `code:${code}`;
}

function consolidatePlanSubjects(subjects: SubjectView[]): SubjectView[] {
  const grouped = new Map<string, SubjectView[]>();

  subjects.forEach((subject) => {
    const key = subjectIdentityKey(subject);
    const items = grouped.get(key) ?? [];
    items.push(subject);
    grouped.set(key, items);
  });

  return Array.from(grouped.values()).map((versions) => {
    return versions.reduce((best, current) => {
      const bestGradeScore = gradeQualityScore(best.gradeText, best.grade);
      const currentGradeScore = gradeQualityScore(current.gradeText, current.grade);

      if (currentGradeScore > bestGradeScore) {
        return current;
      }

      const bestScore = getRecencyScore(best);
      const currentScore = getRecencyScore(current);

      if (currentScore > bestScore) {
        return current;
      }

      if (currentScore === bestScore) {
        const bestHasGrade = bestGradeScore > -999;
        const currentHasGrade = currentGradeScore > -999;

        if (!bestHasGrade && currentHasGrade) {
          return current;
        }
      }

      return best;
    });
  });
}

function buildKpi(subjects: SubjectView[]): DashboardKpi {
  let approvedSubjects = 0;
  let observationSubjects = 0;
  let pendingSubjects = 0;
  let failedSubjects = 0;
  let totalCredits = 0;
  let approvedCredits = 0;
  let pendingCredits = 0;
  let observationCredits = 0;
  let gradeTotal = 0;
  let gradedSubjects = 0;

  const statusMap = new Map<string, number>();

  subjects.forEach((subject) => {
    totalCredits += subject.credits;

    const statusLabel = normalizeString(subject.status) || "Sin estado";
    statusMap.set(statusLabel, (statusMap.get(statusLabel) ?? 0) + 1);

    if (subject.grade !== null) {
      gradeTotal += subject.grade;
      gradedSubjects += 1;
    }

    switch (subject.category) {
      case "approved":
        approvedSubjects += 1;
        approvedCredits += subject.credits;
        break;
      case "observation":
        observationSubjects += 1;
        observationCredits += subject.credits;
        break;
      case "failed":
        failedSubjects += 1;
        pendingCredits += subject.credits;
        break;
      case "pending":
      case "unknown":
      default:
        pendingSubjects += 1;
        pendingCredits += subject.credits;
        break;
    }
  });

  const statusDistribution = Array.from(statusMap.entries())
    .map(([status, count]) => ({
      status,
      count,
      percentage: percentage(count, subjects.length),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalSubjects: subjects.length,
    approvedSubjects,
    observationSubjects,
    failedSubjects,
    pendingSubjects,
    totalCredits,
    approvedCredits,
    observationCredits,
    pendingCredits,
    averageGrade: gradedSubjects > 0 ? gradeTotal / gradedSubjects : null,
    gradedSubjects,
    progressPercentage: percentage(approvedCredits, totalCredits),
    statusDistribution,
  };
}

function buildStatusDistribution(kpi: DashboardKpi): StatusChartItem[] {
  return kpi.statusDistribution.map((item) => ({
    label: item.status,
    count: item.count,
    percentage: item.percentage,
  }));
}

function buildGradeDistribution(subjects: SubjectView[]): GradeDistributionItem[] {
  const buckets: Array<{ label: string; min: number; max: number }> = [
    { label: "< 61", min: Number.NEGATIVE_INFINITY, max: 60.99 },
    { label: "61 - 70", min: 61, max: 70.99 },
    { label: "71 - 80", min: 71, max: 80.99 },
    { label: "81 - 90", min: 81, max: 90.99 },
    { label: "91 - 100", min: 91, max: 100.99 },
  ];

  return buckets.map((bucket) => ({
    range: bucket.label,
    count: subjects.filter((subject) => subject.grade !== null && subject.grade >= bucket.min && subject.grade <= bucket.max).length,
  }));
}

function buildCreditsByYear(subjects: SubjectView[]): CreditsByYearItem[] {
  const map = new Map<string, number>();

  subjects.forEach((subject) => {
    const year = subject.year || subject.planYear;
    if (!year) {
      return;
    }

    map.set(year, (map.get(year) ?? 0) + subject.credits);
  });

  return Array.from(map.entries())
    .map(([year, credits]) => ({ year, credits }))
    .sort((a, b) => Number(a.year) - Number(b.year));
}

function buildSubjectsBySemester(subjects: SubjectView[]): SubjectsBySemesterItem[] {
  const map = new Map<string, number>();

  subjects.forEach((subject) => {
    const key = subject.planYear && subject.planSemester ? `${subject.planYear}-${subject.planSemester}` : subject.planSemester || subject.semester;
    if (!key) {
      return;
    }

    map.set(key, (map.get(key) ?? 0) + 1);
  });

  return Array.from(map.entries())
    .map(([semester, count]) => ({ semester, count }))
    .sort((a, b) => Number(a.semester) - Number(b.semester));
}

function buildAreaStatus(subjects: SubjectView[]): AreaStatusItem[] {
  const map = new Map<string, AreaStatusItem>();

  subjects.forEach((subject) => {
    const area = subject.area || "General";

    const current = map.get(area) ?? {
      area,
      approved: 0,
      observation: 0,
      pending: 0,
      failed: 0,
      unknown: 0,
      total: 0,
    };

    current.total += 1;
    current[subject.category] += 1;

    map.set(area, current);
  });

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

function buildBlockingSubjects(unresolved: SubjectView[]): BlockingSubject[] {
  const grouped = new Map<string, { representative: SubjectView; attempts: number }>();

  unresolved.forEach((subject) => {
    const key = `${subject.code}|${subject.name}`;
    const current = grouped.get(key);

    if (!current) {
      grouped.set(key, { representative: subject, attempts: 1 });
      return;
    }

    current.attempts += 1;

    if (getRecencyScore(subject) > getRecencyScore(current.representative)) {
      current.representative = subject;
    }
  });

  return Array.from(grouped.values())
    .map(({ representative, attempts }) => {
      const hasPrereqSignal = !!representative.prerequisites;
      const planSemester = Number(representative.planSemester || representative.semester || 99);
      const semesterWeight = Number.isFinite(planSemester) ? Math.max(0, 10 - planSemester) : 0;
      const attemptWeight = Math.max(0, attempts - 1) * 6;
      const blockingScore = representative.credits * 10 + semesterWeight + (hasPrereqSignal ? 10 : 0) + attemptWeight;

      return {
        subject: representative,
        blockingScore,
        reason: hasPrereqSignal
          ? "Tiene prerrequisitos asociados y afecta continuidad"
          : "Materia no resuelta con impacto en avance",
      };
    })
    .sort((a, b) => b.blockingScore - a.blockingScore)
    .slice(0, 8);
}

function buildRecoveryRows(subjects: SubjectView[]): RecoveryRow[] {
  function isDeferredRecovery(subject: SubjectView): boolean {
    const gradeToken = (subject.gradeText || "").trim().toUpperCase().split(" ")[0] ?? "";
    return subject.category === "observation" && gradeToken === "D";
  }

  return subjects
    .filter((subject) => !!subject.recoveryNote || !!subject.recoveryType || !!subject.attempts || isDeferredRecovery(subject))
    .map((subject) => ({
      code: subject.code,
      name: subject.name,
      status: subject.status,
      attempts: subject.attempts || "-",
      recoveryType: subject.recoveryType || (isDeferredRecovery(subject) ? "Recuperar luego" : "-"),
      recoveryNote:
        subject.recoveryNote ||
        (isDeferredRecovery(subject)
          ? "Nota D en observacion: requiere recuperacion posterior."
          : "-"),
    }));
}

export function deriveDashboardAnalytics(rawSubjects: SubjectRow[]): DashboardAnalytics {
  const rawViews = rawSubjects.map(toSubjectView);
  const planSubjects = consolidatePlanSubjects(rawViews);

  const kpi = buildKpi(planSubjects);
  const unresolvedSubjects = planSubjects.filter((subject) => subject.category !== "approved");

  return {
    kpi,
    subjects: planSubjects,
    statusDistribution: buildStatusDistribution(kpi),
    gradeDistribution: buildGradeDistribution(planSubjects),
    creditsByYear: buildCreditsByYear(planSubjects),
    subjectsBySemester: buildSubjectsBySemester(planSubjects),
    areaStatus: buildAreaStatus(planSubjects),
    blockingSubjects: buildBlockingSubjects(unresolvedSubjects),
    unresolvedSubjects,
    unresolvedPending: unresolvedSubjects.filter((subject) => subject.category === "pending" || subject.category === "unknown"),
    unresolvedFailed: unresolvedSubjects.filter((subject) => subject.category === "failed"),
    unresolvedObservation: unresolvedSubjects.filter((subject) => subject.category === "observation"),
    recoveryRows: buildRecoveryRows(planSubjects),
  };
}
