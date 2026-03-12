import { DirectionalBridgeSyncCard } from "./directional-bridge-sync-card";

import type { BridgeSyncSection as BridgeSyncSectionType } from "../types/bridge-state";

interface BridgeSyncSectionProps {
  section: BridgeSyncSectionType;
}

export function BridgeSyncSection({ section }: BridgeSyncSectionProps) {
  return (
    <section aria-labelledby={`state-section-${section.id}`}>
      <h2
        id={`state-section-${section.id}`}
        className="text-foreground mb-4 text-lg font-semibold tracking-tight"
      >
        {section.title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {section.directions.map((direction) => (
          <DirectionalBridgeSyncCard key={direction.id} direction={direction} />
        ))}
      </div>
    </section>
  );
}
