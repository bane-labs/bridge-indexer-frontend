"use client";

import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@atlas/ui";

import {
  getExplorerAddressUrl,
  getExplorerContractUrl,
  getExplorerTxUrl,
} from "../lib/bridge-explorer-links";
import { formatNonce, formatTimestamp, getChainLabel, getDirectionLabel } from "../lib/formatters";

import { CopyButton } from "./copy-button";

import type { ChainId } from "../types/bridge";
import type { BridgeOperationHistoryRow } from "../types/bridge-history";

interface BridgeOperationDetailProps {
  row: BridgeOperationHistoryRow | null;
  sourceChain: ChainId;
  destinationChain: ChainId;
  onClose: () => void;
  returnFocus: () => void;
}

function Field({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-muted-foreground text-xs font-medium uppercase">{label}</dt>
      <dd className="min-w-0 text-sm">
        {children ?? <span className="text-muted-foreground">Unavailable</span>}
      </dd>
    </div>
  );
}

function Copyable({ value, label }: { value?: string; label: string }) {
  if (!value) return <span className="text-muted-foreground">Unavailable</span>;
  return (
    <span className="inline-flex max-w-full items-start gap-1">
      <code className="font-mono text-xs break-all">{value}</code>
      <CopyButton text={value} label={`Copy ${label}`} />
    </span>
  );
}

function explorerUrl(
  chain: ChainId,
  value: string | undefined,
  kind: "transaction" | "address" | "contract"
): string | Promise<string | undefined> | undefined {
  if (!value) return undefined;
  if (kind === "transaction") return getExplorerTxUrl(chain, value);
  if (kind === "contract") return getExplorerContractUrl(chain, value);
  return getExplorerAddressUrl(chain, value);
}

function ExplorerValue({
  value,
  label,
  chain,
  kind,
}: {
  value?: string;
  label: string;
  chain: ChainId;
  kind: "transaction" | "address" | "contract";
}) {
  const [url, setUrl] = useState<string | undefined>();
  useEffect(() => {
    let active = true;
    Promise.resolve(explorerUrl(chain, value, kind))
      .then((resolved) => {
        if (active) setUrl(resolved);
      })
      .catch(() => {
        if (active) setUrl(undefined);
      });
    return () => {
      active = false;
    };
  }, [chain, kind, value]);

  if (!value) return <span className="text-muted-foreground">Unavailable</span>;
  return (
    <span className="flex flex-wrap items-start gap-x-2 gap-y-1">
      <Copyable value={value} label={label} />
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${label} on ${getChainLabel(chain)} explorer`}
          className="text-primary inline-flex shrink-0 items-center gap-1 text-xs underline-offset-4 hover:underline"
        >
          Explorer <ExternalLink aria-hidden="true" className="size-3" />
        </a>
      ) : (
        <span className="text-muted-foreground text-xs">Explorer link unavailable</span>
      )}
    </span>
  );
}

function TimeValue({ value }: { value?: string }) {
  return value ? (
    <time dateTime={value} title={value}>
      {formatTimestamp(value)}
    </time>
  ) : (
    <span className="text-muted-foreground">Unavailable</span>
  );
}

export function BridgeOperationDetail({
  row,
  sourceChain,
  destinationChain,
  onClose,
  returnFocus,
}: BridgeOperationDetailProps) {
  const op = row?.operation;
  return (
    <Sheet
      open={row !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto sm:max-w-2xl"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocus();
        }}
      >
        <SheetHeader className="border-b pr-12">
          <SheetTitle>Operation {row ? formatNonce(row.nonce) : "details"}</SheetTitle>
          <SheetDescription>
            {op
              ? `${op.bridge_type} bridge · ${getDirectionLabel(sourceChain, destinationChain)}`
              : "Bridge operation details"}
          </SheetDescription>
        </SheetHeader>
        {op && (
          <div className="space-y-7 p-4 pb-10">
            <section aria-labelledby="operation-identity" className="space-y-3">
              <h3 id="operation-identity" className="font-semibold">
                Operation identity
              </h3>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Field label="Bridge type">{op.bridge_type}</Field>
                <Field label="Nonce">{formatNonce(op.nonce)}</Field>
                <Field label="Direction">{getDirectionLabel(sourceChain, destinationChain)}</Field>
                <Field label="Root">
                  <Copyable value={op.root} label="root" />
                </Field>
                {op.bridge_type !== "message" && (
                  <Field label="Amount (as reported)">{op.amount || undefined}</Field>
                )}
                {op.bridge_type === "token" && (
                  <Field label="Token symbol">{op.token_symbol}</Field>
                )}
              </dl>
            </section>

            <section aria-labelledby="operation-source" className="space-y-3 border-t pt-5">
              <h3 id="operation-source" className="font-semibold">
                Source · {getChainLabel(sourceChain)}
              </h3>
              <dl className="grid gap-4">
                <Field label="Sender">
                  <ExplorerValue
                    value={op.from_address}
                    label="sender address"
                    chain={sourceChain}
                    kind="address"
                  />
                </Field>
                <Field label="Transaction">
                  <ExplorerValue
                    value={op.source_tx_hash}
                    label="source transaction hash"
                    chain={sourceChain}
                    kind="transaction"
                  />
                </Field>
                <Field label="Block">
                  {op.source_block_height === undefined
                    ? undefined
                    : `#${formatNonce(op.source_block_height)}`}
                </Field>
                <Field label="Source timestamp">
                  <TimeValue value={op.timestamp} />
                </Field>
                {op.bridge_type === "token" && (
                  <Field label="Source token contract">
                    <ExplorerValue
                      value={op.token_contract}
                      label="source token contract"
                      chain={sourceChain}
                      kind="contract"
                    />
                  </Field>
                )}
              </dl>
            </section>

            <section aria-labelledby="operation-destination" className="space-y-3 border-t pt-5">
              <h3 id="operation-destination" className="font-semibold">
                Destination · {getChainLabel(destinationChain)}
              </h3>
              <p className="text-muted-foreground text-xs">
                Destination transaction and legacy completion time are reported by the backend; they
                do not independently establish execution, distribution, or a claim.
              </p>
              <dl className="grid gap-4">
                <Field label="Recipient">
                  <ExplorerValue
                    value={op.to_address}
                    label="recipient address"
                    chain={destinationChain}
                    kind="address"
                  />
                </Field>
                <Field label="Transaction">
                  <ExplorerValue
                    value={op.dest_tx_hash}
                    label="destination transaction hash"
                    chain={destinationChain}
                    kind="transaction"
                  />
                </Field>
                <Field label="Block">
                  {op.dest_block_height === undefined
                    ? undefined
                    : `#${formatNonce(op.dest_block_height)}`}
                </Field>
                <Field label="Completion timestamp (legacy)">
                  <TimeValue value={op.completion_timestamp} />
                </Field>
                {op.claim_tx_hash && (
                  <Field label="Claim transaction">
                    <ExplorerValue
                      value={op.claim_tx_hash}
                      label="claim transaction hash"
                      chain={destinationChain}
                      kind="transaction"
                    />
                  </Field>
                )}
                {op.bridge_type === "token" && (
                  <Field label="Destination token contract">
                    <ExplorerValue
                      value={op.dest_token_contract}
                      label="destination token contract"
                      chain={destinationChain}
                      kind="contract"
                    />
                  </Field>
                )}
              </dl>
            </section>

            {op.bridge_type === "message" && (
              <section aria-labelledby="operation-message" className="space-y-3 border-t pt-5">
                <h3 id="operation-message" className="font-semibold">
                  Message
                </h3>
                <dl className="grid gap-4">
                  <Field label="Message type">{op.amb_message_type?.replaceAll("_", " ")}</Field>
                  <Field label="On-chain metadata sender" />
                  <Field label="On-chain metadata timestamp" />
                  <Field label="Raw message hex" />
                </dl>
              </section>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
