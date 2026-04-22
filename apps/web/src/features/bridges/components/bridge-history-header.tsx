import Link from "next/link";

import { Badge } from "@atlas/ui";

import { buildBridgeContext } from "../lib/bridge-slugs";
import { getChainLabel } from "../lib/formatters";

import type { BridgeFamily, ChainId } from "../types/bridge";

interface BridgeHistoryHeaderProps {
  label: string;
  bridgeFamily: BridgeFamily;
  tokenSymbol?: string;
  /** Source chain of the first direction (used for the context line). */
  primarySourceChain: ChainId;
  /** Destination chain of the first direction. */
  primaryDestChain: ChainId;
}

/**
 * Page header for the bridge history view.
 * Shows bridge context, family badge, and a back link.
 */
export function BridgeHistoryHeader({
  label,
  bridgeFamily,
  tokenSymbol,
  primarySourceChain,
  primaryDestChain,
}: BridgeHistoryHeaderProps) {
  const sourceLabel = getChainLabel(primarySourceChain);
  const destLabel = getChainLabel(primaryDestChain);
  const context = buildBridgeContext(bridgeFamily, sourceLabel, destLabel, tokenSymbol);

  const familyColorMap: Record<BridgeFamily, string> = {
    native: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    message: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    token: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  };
  const familyColor = familyColorMap[bridgeFamily];

  return (
    <header className="mb-8">
      <nav className="mb-4">
        <Link
          href="/bridges"
          className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </nav>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">{label}</h1>
        <Badge variant="outline" className={familyColor}>
          {bridgeFamily}
        </Badge>
      </div>

      <p className="text-muted-foreground mt-1.5 font-mono text-sm">{context}</p>
    </header>
  );
}
