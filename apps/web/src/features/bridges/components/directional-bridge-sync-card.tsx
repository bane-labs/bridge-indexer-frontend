"use client";

import Link from "next/link";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@atlas/ui";

import { getBridgeSlug, getChainLabel, getDirectionLabel, relativeTime } from "../lib/formatters";
import { buildDirectionSlug } from "../lib/bridge-slugs";

import { BridgeSideStatePanel } from "./bridge-side-state-panel";
import { ComparisonSummaryBadge } from "./comparison-summary";
import { StaleIndicator } from "./stale-indicator";
import { IndexerStatusBadge, OperationStatusBadge } from "./sync-status-badge";

import type { DirectionalBridgeSyncState } from "../types/bridge-state";

interface DirectionalBridgeSyncCardProps {
  direction: DirectionalBridgeSyncState;
}

export function DirectionalBridgeSyncCard({ direction }: DirectionalBridgeSyncCardProps) {
  const directionLabel = getDirectionLabel(direction.sourceChain, direction.destinationChain);
  const slug = getBridgeSlug(direction.bridgeFamily, direction.tokenSymbol);
  const directionSlug = buildDirectionSlug(direction.sourceChain);

  return (
    <Card className="gap-3">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <OperationStatusBadge status={direction.operationStatus} />
          {direction.indexerStatus !== "fresh" && (
            <IndexerStatusBadge status={direction.indexerStatus} />
          )}
          <ComparisonSummaryBadge summary={direction.comparisonSummary} />
        </div>
        <CardTitle className="text-base">{directionLabel}</CardTitle>
        {direction.indexerStatus !== "fresh" && <StaleIndicator reason={direction.staleReason} />}
      </CardHeader>

      <CardContent className="space-y-4">
        <BridgeSideStatePanel
          label={`Source — ${getChainLabel(direction.sourceChain)}`}
          chainId={direction.sourceChain}
          state={direction.source}
        />
        <div className="border-border border-t" />
        <BridgeSideStatePanel
          label={`Destination — ${getChainLabel(direction.destinationChain)}`}
          chainId={direction.destinationChain}
          state={direction.destination}
        />
      </CardContent>

      <CardFooter className="text-muted-foreground flex items-center justify-between text-xs">
        <span title={direction.lastUpdatedAt}>Updated {relativeTime(direction.lastUpdatedAt)}</span>
        <Link
          href={`/bridges/${slug}/${directionSlug}`}
          className="hover:text-foreground underline-offset-4 hover:underline"
        >
          View history →
        </Link>
      </CardFooter>
    </Card>
  );
}
