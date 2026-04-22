"use client";

import { useBridgeDashboard } from "../hooks/use-bridge-dashboard";

import { BridgeDashboardEmpty } from "./bridge-dashboard-empty";
import { BridgeDashboardError } from "./bridge-dashboard-error";
import { OperatorDashboard } from "./operator-dashboard";
import { OperatorDashboardSkeleton } from "./operator-dashboard-skeleton";

export function BridgeDashboardClient() {
  const { data, isLoading, isError } = useBridgeDashboard();

  if (isLoading) {
    return <OperatorDashboardSkeleton />;
  }

  if (isError || !data) {
    return <BridgeDashboardError />;
  }

  if (data.statuses.length === 0) {
    return <BridgeDashboardEmpty />;
  }

  return <OperatorDashboard statuses={data.statuses} summary={data.summary} />;
}
