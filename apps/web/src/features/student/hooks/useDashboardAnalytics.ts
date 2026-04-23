import { useMemo } from "react";

import { deriveDashboardAnalytics } from "@/features/student/analytics/deriveDashboardAnalytics";
import type { DashboardAnalytics } from "@/features/student/analytics/types";
import type { SubjectRow } from "@/features/student/types";

export function useDashboardAnalytics(subjects: SubjectRow[]): DashboardAnalytics {
  return useMemo(() => deriveDashboardAnalytics(subjects), [subjects]);
}
