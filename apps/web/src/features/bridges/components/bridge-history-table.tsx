"use client";

import { useRef, useState } from "react";

import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@atlas/ui";

import { formatSettledTime, formatSettledTooltip } from "../lib/bridge-history-formatters";
import { formatNonce } from "../lib/formatters";

import { BridgeOperationDetail } from "./bridge-operation-detail";
import { HashCell } from "./hash-cell";
import { TxLinkCell } from "./tx-link-cell";

import type { ChainId } from "../types/bridge";
import type { BridgeOperationHistoryRow } from "../types/bridge-history";

interface BridgeHistoryTableProps {
  rows: BridgeOperationHistoryRow[];
  sourceChain: ChainId;
  destinationChain: ChainId;
}

const STATUS_CONFIG: Record<
  BridgeOperationHistoryRow["status"],
  { label: string; variant: "success" | "destructive" | "warning" | "secondary" | "info" }
> = {
  completed: { label: "Completed (reported)", variant: "secondary" },
  stuck: { label: "Stuck (reported)", variant: "warning" },
  pending: { label: "Pending (reported)", variant: "info" },
};

function ClaimCell({
  claimTxHash,
  destinationChain,
}: {
  claimTxHash?: string;
  destinationChain: ChainId;
}) {
  if (claimTxHash) {
    return <TxLinkCell txHash={claimTxHash} chainId={destinationChain} />;
  }
  return <span className="text-muted-foreground text-sm">Unavailable</span>;
}

/**
 * History table for a single bridge direction.
 * The legacy status and completion time are displayed as reported, without
 * interpreting relay, settlement, distribution, or execution.
 */
export function BridgeHistoryTable({
  rows,
  sourceChain,
  destinationChain,
}: BridgeHistoryTableProps) {
  const [selected, setSelected] = useState<BridgeOperationHistoryRow | null>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);

  if (rows.length === 0) {
    return null; // Handled by parent empty state
  }

  return (
    <>
      <div className="bg-card overflow-x-auto rounded-lg border shadow-sm">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-20">Nonce</TableHead>
              <TableHead>Backend Status</TableHead>
              <TableHead>Claim Tx</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Root</TableHead>
              <TableHead>Source Tx</TableHead>
              <TableHead>Dest Tx</TableHead>
              <TableHead className="text-right">Completion (legacy)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const statusConfig = STATUS_CONFIG[row.status];

              return (
                <TableRow
                  key={row.id}
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={(event) => {
                    if (!(event.target as HTMLElement).closest("a, button")) {
                      returnFocus.current = event.currentTarget.querySelector("button");
                      setSelected(row);
                    }
                  }}
                >
                  <TableCell className="font-mono tabular-nums">
                    <button
                      type="button"
                      className="text-primary cursor-pointer underline-offset-4 hover:underline"
                      onClick={(event) => {
                        returnFocus.current = event.currentTarget;
                        setSelected(row);
                      }}
                      aria-label={`View operation ${formatNonce(row.nonce)} details`}
                    >
                      {formatNonce(row.nonce)}
                    </button>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig.variant} size="sm">
                      {statusConfig.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ClaimCell claimTxHash={row.claimTxHash} destinationChain={destinationChain} />
                  </TableCell>
                  <TableCell className="font-mono text-sm tabular-nums">
                    {row.amount ?? "—"}
                  </TableCell>
                  <TableCell>
                    <HashCell hash={row.root} />
                  </TableCell>
                  <TableCell>
                    <TxLinkCell txHash={row.sourceTxHash} chainId={sourceChain} />
                  </TableCell>
                  <TableCell>
                    <TxLinkCell txHash={row.destinationTxHash} chainId={destinationChain} />
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    {row.completionTimestamp ? (
                      <time
                        dateTime={row.completionTimestamp}
                        title={formatSettledTooltip(row.completionTimestamp)}
                        className="text-sm"
                      >
                        {formatSettledTime(row.completionTimestamp)}
                      </time>
                    ) : (
                      <span className="text-muted-foreground text-sm italic">Unavailable</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <BridgeOperationDetail
        row={selected}
        sourceChain={sourceChain}
        destinationChain={destinationChain}
        onClose={() => setSelected(null)}
        returnFocus={() => returnFocus.current?.focus()}
      />
    </>
  );
}
