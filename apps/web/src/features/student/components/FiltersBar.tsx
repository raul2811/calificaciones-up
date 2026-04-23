"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type FiltersBarProps = {
  searchTerm: string;
  statusFilter: string;
  statusOptions: string[];
  onSearchTermChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onClearFilters?: () => void;
};

export function FiltersBar({
  searchTerm,
  statusFilter,
  statusOptions,
  onSearchTermChange,
  onStatusFilterChange,
  onClearFilters,
}: FiltersBarProps) {
  return (
    <section className="surface-panel grid grid-cols-1 gap-4 rounded-[1.65rem] p-5 md:grid-cols-[minmax(0,1fr)_280px_auto] md:items-end">
      <div>
        <label htmlFor="dashboard-search" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground-muted">
          Buscar por codigo o nombre
        </label>
        <Input
          id="dashboard-search"
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          placeholder="Ej: MAT101 o Algebra"
        />
      </div>

      <div>
        <label htmlFor="dashboard-status" className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground-muted">
          Estado academico
        </label>
        <Select
          id="dashboard-status"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value)}
        >
          <option value="">Todos</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
      </div>

      {onClearFilters ? (
        <button
          type="button"
          onClick={onClearFilters}
          className="btn-secondary h-11 rounded-xl px-4 text-sm font-semibold"
        >
          Limpiar filtros
        </button>
      ) : null}
    </section>
  );
}
