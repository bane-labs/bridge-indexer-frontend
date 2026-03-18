"use client";

import { useBridgeHistory } from "../hooks/use-bridge-history";

import { BridgeDetailView } from "./bridge-detail-view";
import { BridgeHistoryError } from "./bridge-history-error";
import { BridgeHistorySkeleton } from "./bridge-history-skeleton";

interface BridgeHistoryClientProps {
  slug: string;
}

export function BridgeHistoryClient({ slug }: BridgeHistoryClientProps) {
  const { data, isLoading, isError } = useBridgeHistory(slug);

  if (isLoading) {
    return <BridgeHistorySkeleton />;
  }

  if (isError || !data) {
    return <BridgeHistoryError />;
  }

  return <BridgeDetailView history={data.history} statuses={data.statuses} />;
}
