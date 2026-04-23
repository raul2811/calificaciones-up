"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type FiltersProps = {
  searchTerm: string;
  statusFilter: string;
  statusOptions: string[];
  onSearchTermChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
};

export function Filters({
  searchTerm,
  statusFilter,
  statusOptions,
  onSearchTermChange,
  onStatusFilterChange,
}: FiltersProps) {
  return (
    <section className="surface-panel grid grid-cols-1 gap-3 rounded-2xl p-4 md:grid-cols-[1fr_260px] md:items-end">
      <div>
        <label htmlFor="search" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          Buscar por codigo o nombre
        </label>
        <Input
          id="search"
          name="search"
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
          className="rounded-lg"
          placeholder="Ej: MAT101 o Algebra"
        />
      </div>

      <div>
        <label htmlFor="status" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-foreground-muted">
          Filtrar por estado
        </label>
        <Select
          id="status"
          name="status"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value)}
          className="rounded-lg"
        >
          <option value="">Todos</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
      </div>
    </section>
  );
}
