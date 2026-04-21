"use client";

import { useMemo, useState } from "react";

import { BridgeStateFilters } from "./bridge-state-filters";
import { BridgeStateNoResults } from "./bridge-state-no-results";
import { BridgeSyncSection } from "./bridge-sync-section";

import type {
  BridgeStateFilter,
  BridgeSyncSection as BridgeSyncSectionType,
} from "../types/bridge-state";

interface BridgeStateViewProps {
  sections: BridgeSyncSectionType[];
}

export function BridgeStateView({ sections }: BridgeStateViewProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<BridgeStateFilter>("all");
  const [showStaleOnly, setShowStaleOnly] = useState(false);

  const filteredSections = useMemo(() => {
    return sections.filter((section) => {
      // Search by token symbol or bridge family
      if (search) {
        const query = search.toLowerCase();
        const matchesToken = section.tokenSymbol?.toLowerCase().includes(query);
        const matchesFamily = section.bridgeFamily.toLowerCase().includes(query);
        const matchesTitle = section.title.toLowerCase().includes(query);
        if (!matchesToken && !matchesFamily && !matchesTitle) return false;
      }

      // Filter by status
      if (filter !== "all") {
        const hasMatchingDirection = section.directions.some((d) => {
          if (filter === "lagging") return d.indexerStatus === "lagging";
          return d.operationStatus === filter;
        });
        if (!hasMatchingDirection) return false;
      }

      // Lagging-only toggle
      if (showStaleOnly) {
        const hasLagging = section.directions.some((d) => d.indexerStatus !== "fresh");
        if (!hasLagging) return false;
      }

      return true;
    });
  }, [sections, search, filter, showStaleOnly]);

  return (
    <div className="space-y-6">
      <BridgeStateFilters
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        showStaleOnly={showStaleOnly}
        onShowStaleOnlyChange={setShowStaleOnly}
        resultCount={filteredSections.length}
        totalCount={sections.length}
      />

      {filteredSections.length === 0 ? (
        <BridgeStateNoResults />
      ) : (
        <div className="space-y-8">
          {filteredSections.map((section) => (
            <BridgeSyncSection key={section.id} section={section} />
          ))}
        </div>
      )}
    </div>
  );
}
