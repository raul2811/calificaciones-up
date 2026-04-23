"use client";

import { useEffect, useMemo, useState } from "react";

import type { SubjectView } from "@/features/student/analytics/types";

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function asValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

type UseSubjectFiltersOptions = {
  initialSearchTerm?: string;
  initialStatusFilter?: string;
};

export function useSubjectFilters(subjects: SubjectView[], options: UseSubjectFiltersOptions = {}) {
  const [searchTerm, setSearchTerm] = useState(options.initialSearchTerm ?? "");
  const [statusFilter, setStatusFilter] = useState(options.initialStatusFilter ?? "");

  useEffect(() => {
    setSearchTerm(options.initialSearchTerm ?? "");
  }, [options.initialSearchTerm]);

  useEffect(() => {
    setStatusFilter(options.initialStatusFilter ?? "");
  }, [options.initialStatusFilter]);

  const statusOptions = useMemo(() => {
    const map = new Map<string, string>();

    subjects.forEach((subject) => {
      const display = asValue(subject.status);
      const key = normalize(display);

      if (!key || map.has(key)) {
        return;
      }

      map.set(key, display);
    });

    return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    const query = normalize(searchTerm);
    const status = normalize(statusFilter);

    return subjects.filter((subject) => {
      const code = normalize(subject.code);
      const name = normalize(subject.name);
      const currentStatus = normalize(subject.status);

      const searchMatch = !query || code.includes(query) || name.includes(query);
      const statusMatch = !status || currentStatus === status;

      return searchMatch && statusMatch;
    });
  }, [subjects, searchTerm, statusFilter]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    statusOptions,
    filteredSubjects,
  };
}
