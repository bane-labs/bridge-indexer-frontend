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
  string,
  { label: string; variant: "success" | "destructive" | "warning" | "secondary" | "info" }
> = {
  completed: { label: "Completed", variant: "success" },
  relayed: { label: "Relayed", variant: "secondary" },
  pending: { label: "In Progress", variant: "info" },
};

const SETTLEMENT_LABEL: Record<string, string> = {
  waiting_to_be_claimed: "Waiting to be claimed",
  waiting_for_execution: "Waiting for execution",
};

function SettlementCell({
  claimTxHash,
  settlementStatus,
  destinationChain,
}: {
  claimTxHash?: string;
  settlementStatus?: string;
  destinationChain: ChainId;
}) {
  if (claimTxHash) {
    return <TxLinkCell txHash={claimTxHash} chainId={destinationChain} />;
  }
  if (settlementStatus) {
    return (
      <span className="text-muted-foreground text-sm">
        {SETTLEMENT_LABEL[settlementStatus] ?? settlementStatus}
      </span>
    );
  }
  return <span className="text-muted-foreground text-sm">—</span>;
}

/**
 * History table for a single bridge direction.
 * Columns: Nonce, Status, Amount, Root, Source Tx, Dest Tx, Settled.
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
              <TableHead>Status</TableHead>
              <TableHead>Settlement</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Root</TableHead>
              <TableHead>Source Tx</TableHead>
              <TableHead>Dest Tx</TableHead>
              <TableHead className="text-right">Settled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const statusConfig = STATUS_CONFIG[row.status] ?? {
                label: row.status,
                variant: "secondary" as const,
              };

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
                    <SettlementCell
                      claimTxHash={row.claimTxHash}
                      settlementStatus={row.settlementStatus}
                      destinationChain={destinationChain}
                    />
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
                    {row.settledAt ? (
                      <time
                        dateTime={row.settledAt}
                        title={formatSettledTooltip(row.settledAt)}
                        className="text-sm"
                      >
                        {formatSettledTime(row.settledAt)}
                      </time>
                    ) : (
                      <span className="text-muted-foreground text-sm italic">Pending</span>
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
