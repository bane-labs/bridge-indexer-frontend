import { getChainLabel, getDirectionLabel } from "../lib/formatters";

import { BridgeHistoryTable } from "./bridge-history-table";

import type { DirectionalBridgeHistory } from "../types/bridge-history";

interface BridgeHistoryDirectionProps {
  direction: DirectionalBridgeHistory;
}

export function BridgeHistoryDirection({ direction }: BridgeHistoryDirectionProps) {
  const label = getDirectionLabel(direction.sourceChain, direction.destinationChain);
  const sourceLabel = getChainLabel(direction.sourceChain);
  const destLabel = getChainLabel(direction.destinationChain);

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-foreground text-lg font-semibold tracking-tight">{label}</h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Operations relayed from {sourceLabel} to {destLabel} — {direction.operations.length}{" "}
          {direction.operations.length === 1 ? "operation" : "operations"}
        </p>
      </div>

      <BridgeHistoryTable
        operations={direction.operations}
        sourceChain={direction.sourceChain}
        destinationChain={direction.destinationChain}
      />
    </section>
  );
}
