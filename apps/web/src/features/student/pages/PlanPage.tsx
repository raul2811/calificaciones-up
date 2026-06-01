"use client";

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { PageIntro } from "@/components/common/PageIntro";
import type { SubjectView } from "@/features/student/analytics/types";
import { TableSectionSkeleton } from "@/features/student/components/DashboardSkeletons";
import { FiltersBar } from "@/features/student/components/FiltersBar";
import { type PlanSortDirection, type PlanSortKey, PlanTable } from "@/features/student/components/PlanTable";
import {
  StudentPageErrorState,
  StudentPageLoadingState,
} from "@/features/student/components/StudentPageState";
import { useStudentData } from "@/features/student/context/StudentDataContext";
import { useSubjectFilters } from "@/features/student/hooks/useSubjectFilters";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function parseSortKey(value: string | null): PlanSortKey {
  const allowed: PlanSortKey[] = [
    "planYear",
    "planSemester",
    "code",
    "name",
    "credits",
    "grade",
    "status",
    "year",
    "semester",
  ];
  if (value && allowed.includes(value as PlanSortKey)) {
    return value as PlanSortKey;
  }
  return "planYear";
}

function parseSortDirection(value: string | null): PlanSortDirection {
  return value === "desc" ? "desc" : "asc";
}

function asNumber(value: string): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : Number.POSITIVE_INFINITY;
}

function sortSubjects(subjects: SubjectView[], sortBy: PlanSortKey, direction: PlanSortDirection): SubjectView[] {
  const sorted = [...subjects].sort((left, right) => {
    const modifier = direction === "asc" ? 1 : -1;

    switch (sortBy) {
      case "credits":
        return (left.credits - right.credits) * modifier;
      case "grade":
        return ((left.grade ?? -1) - (right.grade ?? -1)) * modifier;
      case "planYear":
        return (asNumber(left.planYear) - asNumber(right.planYear)) * modifier;
      case "planSemester":
        return (asNumber(left.planSemester) - asNumber(right.planSemester)) * modifier;
      case "year":
        return (asNumber(left.year) - asNumber(right.year)) * modifier;
      case "semester":
        return (asNumber(left.semester) - asNumber(right.semester)) * modifier;
      case "code":
      case "name":
      case "status":
      default: {
        const l = left[sortBy] || "";
        const r = right[sortBy] || "";
        return l.localeCompare(r) * modifier;
      }
    }
  });

  return sorted;
}

export function PlanPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, analytics } = useStudentData();

  const initialSearch = searchParams.get("search") || "";
  const initialStatus = searchParams.get("status") || "";
  const initialSortBy = parseSortKey(searchParams.get("sort"));
  const initialSortDir = parseSortDirection(searchParams.get("dir"));

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    statusOptions,
    filteredSubjects,
  } = useSubjectFilters(analytics.subjects, {
    initialSearchTerm: initialSearch,
    initialStatusFilter: initialStatus,
  });

  const [sortBy, setSortBy] = useState<PlanSortKey>(initialSortBy);
  const [sortDirection, setSortDirection] = useState<PlanSortDirection>(initialSortDir);
  const [expandedRowKey, setExpandedRowKey] = useState<string | null>(null);

  useEffect(() => {
    setSortBy(initialSortBy);
    setSortDirection(initialSortDir);
  }, [initialSortBy, initialSortDir]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }
    if (statusFilter.trim()) {
      params.set("status", statusFilter.trim());
    }
    if (sortBy !== "planYear") {
      params.set("sort", sortBy);
    }
    if (sortDirection !== "asc") {
      params.set("dir", sortDirection);
    }
    navigate(params.toString() ? `/plan?${params.toString()}` : "/plan", { replace: true });
  }, [navigate, searchTerm, sortBy, sortDirection, statusFilter]);

  const sortedSubjects = useMemo(
    () => sortSubjects(filteredSubjects, sortBy, sortDirection),
    [filteredSubjects, sortBy, sortDirection],
  );

  function handleSortChange(key: PlanSortKey) {
    if (sortBy === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(key);
    setSortDirection("asc");
  }

  function handleStatusClick(status: string) {
    setStatusFilter(status);
  }

  function handleToggleRow(rowKey: string) {
    setExpandedRowKey((prev) => (prev === rowKey ? null : rowKey));
  }

  const liveStats = useMemo(() => {
    const statusMap = new Map<string, number>();
    sortedSubjects.forEach((subject) => {
      const status = normalize(subject.status) || "sin estado";
      statusMap.set(status, (statusMap.get(status) ?? 0) + 1);
    });
    return Array.from(statusMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [sortedSubjects]);

  if (state.status === "loading") {
    return (
      <div className="space-y-6">
        <StudentPageLoadingState
          title="Cargando plan academico"
          description="Preparando tabla completa del expediente."
        />
        <TableSectionSkeleton />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <StudentPageErrorState
        title="No se pudo cargar el plan academico"
        description={state.error}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Plan académico"
        title="Vista integral del expediente"
        description="Consulta materias, filtros, ordenamiento y exportación desde una sola tabla."
      />
      <section className="surface-panel rounded-xl p-4">
        <div className="flex flex-wrap gap-2">
          {liveStats.map(([status, count]) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              aria-pressed={normalize(statusFilter) === status}
              className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                normalize(statusFilter) === status ? "chip-button chip-button-active" : "chip-button"
              }`}
            >
              {status} ({count})
            </button>
          ))}
        </div>
      </section>

      <FiltersBar
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        statusOptions={statusOptions}
        onSearchTermChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onClearFilters={() => {
          setSearchTerm("");
          setStatusFilter("");
        }}
      />
      <PlanTable
        subjects={sortedSubjects}
        sortBy={sortBy}
        sortDirection={sortDirection}
        expandedRowKey={expandedRowKey}
        onSortChange={handleSortChange}
        onToggleRow={handleToggleRow}
        onStatusClick={handleStatusClick}
      />
      <p className="text-sm text-foreground-muted">
        Filas visibles: {sortedSubjects.length}. Selecciona una fila para ver detalle.
      </p>
    </div>
  );
}
