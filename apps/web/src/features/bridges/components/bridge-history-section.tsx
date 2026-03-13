import { getChainLabel, getDirectionLabel } from "../lib/formatters";

import { BridgeHistoryEmptyState } from "./bridge-history-empty-state";
import { BridgeHistoryTable } from "./bridge-history-table";

import type { BridgeDirectionHistory } from "../types/bridge-history";

interface BridgeHistorySectionProps {
  direction: BridgeDirectionHistory;
}

/**
 * A direction section for the bridge history page.
 * Renders a heading (e.g. "Neo N3 → Neo X") and the history table.
 */
export function BridgeHistorySection({ direction }: BridgeHistorySectionProps) {
  const label = getDirectionLabel(direction.sourceChain, direction.destinationChain);
  const sourceLabel = getChainLabel(direction.sourceChain);
  const destLabel = getChainLabel(direction.destinationChain);

  return (
    <section aria-labelledby={`dir-${direction.sourceChain}-${direction.destinationChain}`}>
      <div className="mb-4">
        <h2
          id={`dir-${direction.sourceChain}-${direction.destinationChain}`}
          className="text-foreground text-lg font-semibold tracking-tight"
        >
          {label}
        </h2>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Operations relayed from {sourceLabel} to {destLabel} — {direction.rows.length}{" "}
          {direction.rows.length === 1 ? "operation" : "operations"}
        </p>
      </div>

      {direction.rows.length === 0 ? (
        <BridgeHistoryEmptyState direction={label} />
      ) : (
        <BridgeHistoryTable
          rows={direction.rows}
          sourceChain={direction.sourceChain}
          destinationChain={direction.destinationChain}
        />
      )}
    </section>
  );
}
