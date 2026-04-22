"use client";

import { useCallback, useState } from "react";

import { notify } from "@/lib/notifications";

import { copyToClipboard } from "../lib/bridge-comparison";
import {
  formatBlockNumber,
  formatNonce,
  formatTimestamp,
  relativeTime,
  shortenHash,
} from "../lib/formatters";

import type { BridgeSideState, ChainId } from "../types/bridge";

interface BridgeSideStatePanelProps {
  label: string;
  chainId: ChainId;
  state: BridgeSideState;
}

export function BridgeSideStatePanel({ label, state }: BridgeSideStatePanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(state.root);
    if (ok) {
      setCopied(true);
      notify.success("Copied to clipboard", { duration: 2000 });
      setTimeout(() => setCopied(false), 2000);
    }
  }, [state.root]);

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
        <dt className="text-muted-foreground">Nonce</dt>
        <dd className="font-mono tabular-nums">{formatNonce(state.nonce)}</dd>

        <dt className="text-muted-foreground">Root</dt>
        <dd className="flex items-center gap-1.5">
          <span className="font-mono tabular-nums" title={state.root}>
            {shortenHash(state.root)}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="text-muted-foreground hover:text-foreground inline-flex shrink-0 cursor-pointer rounded p-0.5 text-xs transition-colors"
            aria-label={`Copy root hash ${state.root}`}
          >
            {copied ? "✓" : "⎘"}
          </button>
        </dd>

        {state.blockNumber !== undefined && (
          <>
            <dt className="text-muted-foreground">Block</dt>
            <dd className="font-mono tabular-nums">{formatBlockNumber(state.blockNumber)}</dd>
          </>
        )}

        <dt className="text-muted-foreground">Updated</dt>
        <dd title={formatTimestamp(state.updatedAt)}>{relativeTime(state.updatedAt)}</dd>
      </dl>
    </div>
  );
}
