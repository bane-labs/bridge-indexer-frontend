import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@atlas/ui";

import { formatNonce, formatTimestamp, getExplorerTxUrl, shortenHash } from "../lib/formatters";

import { CopyableHash } from "./copyable-hash";

import type { ChainId } from "../types/bridge";
import type { BridgeOperation } from "../types/bridge-history";

interface BridgeHistoryTableProps {
  operations: BridgeOperation[];
  sourceChain: ChainId;
  destinationChain: ChainId;
}

export function BridgeHistoryTable({
  operations,
  sourceChain,
  destinationChain,
}: BridgeHistoryTableProps) {
  if (operations.length === 0) {
    return (
      <p className="text-muted-foreground py-8 text-center text-sm">No operations recorded yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Nonce</TableHead>
            <TableHead>Root</TableHead>
            <TableHead>Source Tx</TableHead>
            <TableHead>Dest Tx</TableHead>
            <TableHead className="text-right">Settled</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operations.map((op) => (
            <TableRow key={op.nonce}>
              <TableCell className="font-mono tabular-nums">{formatNonce(op.nonce)}</TableCell>
              <TableCell>
                <CopyableHash hash={op.root} />
              </TableCell>
              <TableCell>
                {op.sourceTx ? (
                  <TxLink chainId={sourceChain} txHash={op.sourceTx} />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                {op.destinationTx ? (
                  <TxLink chainId={destinationChain} txHash={op.destinationTx} />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right text-sm whitespace-nowrap">
                {op.settledAt ? (
                  <time dateTime={op.settledAt} title={op.settledAt}>
                    {formatTimestamp(op.settledAt)}
                  </time>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/** Chain badge colors for visual distinction. */
const CHAIN_BADGE_STYLES: Record<ChainId, string> = {
  neo_n3: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  neo_x: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
};

function TxLink({ chainId, txHash }: { chainId: ChainId; txHash: string }) {
  const url = getExplorerTxUrl(chainId, txHash);
  const chainLabel = chainId === "neo_n3" ? "N3" : "X";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center rounded px-1 py-0.5 text-[10px] leading-none font-semibold ${CHAIN_BADGE_STYLES[chainId]}`}
      >
        {chainLabel}
      </span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground font-mono text-sm underline-offset-4 transition-colors hover:underline"
        title={txHash}
      >
        {shortenHash(txHash, 6, 4)}
      </a>
    </span>
  );
}
