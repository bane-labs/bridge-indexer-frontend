import {
  getChainBadgeLabel,
  getExplorerLabel,
  getExplorerTxUrl,
} from "../lib/bridge-explorer-links";
import { shortenTxHash } from "../lib/bridge-history-formatters";

import type { ChainId } from "../types/bridge";

/** Chain badge color schemes for visual distinction. */
const CHAIN_BADGE_STYLES: Record<ChainId, string> = {
  neo_n3: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  neo_x: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
};

interface TxLinkCellProps {
  /** The full transaction hash. */
  txHash?: string;
  /** Which chain this transaction is on. */
  chainId: ChainId;
}

/**
 * Table cell content for a transaction link.
 * Shows a chain badge + shortened hash linking to the block explorer.
 * Renders a dash placeholder when no tx hash is available.
 */
export function TxLinkCell({ txHash, chainId }: TxLinkCellProps) {
  if (!txHash) {
    return <span className="text-muted-foreground select-none">—</span>;
  }

  const url = getExplorerTxUrl(chainId, txHash);
  const badgeLabel = getChainBadgeLabel(chainId);
  const explorerLabel = getExplorerLabel(chainId);

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center rounded px-1 py-0.5 text-[10px] leading-none font-semibold ${CHAIN_BADGE_STYLES[chainId]}`}
        aria-hidden="true"
      >
        {badgeLabel}
      </span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground font-mono text-sm underline-offset-4 transition-colors hover:underline"
        title={`View on ${explorerLabel}: ${txHash}`}
        aria-label={`Transaction ${txHash.slice(0, 10)}… on ${explorerLabel}`}
      >
        {shortenTxHash(txHash)}
      </a>
    </span>
  );
}
