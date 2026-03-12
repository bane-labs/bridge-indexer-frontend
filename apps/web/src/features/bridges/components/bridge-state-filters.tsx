"use client";

import { Input } from "@atlas/ui";

import type { BridgeStateFilter } from "../types/bridge-state";

const FILTER_OPTIONS: { value: BridgeStateFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "synced", label: "Synced" },
  { value: "out_of_sync", label: "Out of Sync" },
  { value: "stale", label: "Stale" },
];

interface BridgeStateFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: BridgeStateFilter;
  onFilterChange: (value: BridgeStateFilter) => void;
  showStaleOnly: boolean;
  onShowStaleOnlyChange: (value: boolean) => void;
  resultCount: number;
  totalCount: number;
}

export function BridgeStateFilters({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  showStaleOnly,
  onShowStaleOnlyChange,
  resultCount,
  totalCount,
}: BridgeStateFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          placeholder="Search by token symbol…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:max-w-xs"
          aria-label="Search bridges by token symbol"
        />

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onFilterChange(option.value)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filter === option.value
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
              aria-pressed={filter === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <input
            type="checkbox"
            checked={showStaleOnly}
            onChange={(e) => onShowStaleOnlyChange(e.target.checked)}
            className="accent-primary size-3.5 rounded"
          />
          Stale only
        </label>
      </div>

      {(search || filter !== "all" || showStaleOnly) && (
        <p className="text-muted-foreground text-xs">
          Showing {resultCount} of {totalCount} bridge{totalCount !== 1 ? " sections" : " section"}
        </p>
      )}
    </div>
  );
}
