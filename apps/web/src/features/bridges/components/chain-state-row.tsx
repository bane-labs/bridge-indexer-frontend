import { formatBlockNumber, formatNonce, relativeTime, shortenHash } from "../lib/formatters";

import type { BridgeSideState } from "../types/bridge";

interface ChainStateRowProps {
  label: string;
  state: BridgeSideState;
}

export function ChainStateRow({ label, state }: ChainStateRowProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        <dt className="text-muted-foreground">Nonce</dt>
        <dd className="font-mono tabular-nums">{formatNonce(state.nonce)}</dd>

        <dt className="text-muted-foreground">Root</dt>
        <dd className="font-mono tabular-nums" title={state.root}>
          {shortenHash(state.root)}
        </dd>

        {state.blockNumber !== undefined && (
          <>
            <dt className="text-muted-foreground">Block</dt>
            <dd className="font-mono tabular-nums">{formatBlockNumber(state.blockNumber)}</dd>
          </>
        )}

        <dt className="text-muted-foreground">Updated</dt>
        <dd title={state.updatedAt}>{relativeTime(state.updatedAt)}</dd>
      </dl>
    </div>
  );
}
