import { DirectionalBridgeCard } from "./directional-bridge-card";

import type { BridgeGroup } from "../types/bridge";

interface BridgeGroupSectionProps {
  group: BridgeGroup;
}

export function BridgeGroupSection({ group }: BridgeGroupSectionProps) {
  return (
    <section aria-labelledby={`group-${group.id}`}>
      <h2
        id={`group-${group.id}`}
        className="text-foreground mb-4 text-lg font-semibold tracking-tight"
      >
        {group.label}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {group.directions.map((direction) => (
          <DirectionalBridgeCard key={direction.id} bridge={direction} />
        ))}
      </div>
    </section>
  );
}
