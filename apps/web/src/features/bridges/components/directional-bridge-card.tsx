import Link from "next/link";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@atlas/ui";

import { getBridgeSlug, getChainLabel, getDirectionLabel, relativeTime } from "../lib/formatters";

import { ChainStateRow } from "./chain-state-row";
import { OperationStatusBadge } from "./sync-status-badge";

import type { DirectionalBridgeStatus } from "../types/bridge";

interface DirectionalBridgeCardProps {
  bridge: DirectionalBridgeStatus;
}

export function DirectionalBridgeCard({ bridge }: DirectionalBridgeCardProps) {
  const directionLabel = getDirectionLabel(bridge.sourceChain, bridge.destinationChain);
  const slug = getBridgeSlug(bridge.bridgeFamily, bridge.tokenSymbol);

  let bridgeLabel: string;
  if (bridge.tokenSymbol) {
    bridgeLabel = `${bridge.tokenSymbol} Token Bridge`;
  } else if (bridge.bridgeFamily === "native") {
    bridgeLabel = "Native Bridge";
  } else {
    bridgeLabel = "Message Bridge";
  }

  return (
    <Card className="gap-4">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-2">
          <OperationStatusBadge status={bridge.operationStatus} />
        </div>
        <CardTitle className="text-base">{bridgeLabel}</CardTitle>
        <p className="text-muted-foreground text-sm">{directionLabel}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <ChainStateRow
          label={`Source — ${getChainLabel(bridge.sourceChain)}`}
          state={bridge.source}
        />
        <div className="border-border border-t" />
        <ChainStateRow
          label={`Destination — ${getChainLabel(bridge.destinationChain)}`}
          state={bridge.destination}
        />
      </CardContent>

      <CardFooter className="text-muted-foreground flex items-center justify-between text-xs">
        <span title={bridge.lastUpdatedAt}>Updated {relativeTime(bridge.lastUpdatedAt)}</span>
        <Link
          href={`/bridges/${slug}`}
          className="hover:text-foreground underline-offset-4 hover:underline"
        >
          View history →
        </Link>
      </CardFooter>
    </Card>
  );
}
