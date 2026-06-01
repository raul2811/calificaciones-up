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
    <section className="surface-panel grid grid-cols-1 gap-4 rounded-xl p-5 md:grid-cols-[minmax(0,1fr)_240px_auto] md:items-end">
      <div>
        <label htmlFor="dashboard-search" className="mb-2 block text-sm font-medium text-primary">
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
        <label htmlFor="dashboard-status" className="mb-2 block text-sm font-medium text-primary">
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
          className="btn-secondary h-10 rounded-md px-4 text-sm font-semibold md:self-end"
        >
          Limpiar filtros
        </button>
      ) : null}
    </section>
  );
}
