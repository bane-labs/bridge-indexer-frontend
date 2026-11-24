"use client";

import { useBridgeDashboard } from "../hooks/use-bridge-dashboard";

import { BridgeDashboardEmpty } from "./bridge-dashboard-empty";
import { BridgeDashboardError } from "./bridge-dashboard-error";
import { OperationalHealthSummary } from "./operational-health-summary";
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

  if (data.syncUnavailable) {
    return (
      <>
        <OperationalHealthSummary health={data.summary.health} />
        <p role="alert" className="rounded-lg border p-4">
          Could not load bridge sync state.
        </p>
      </>
    );
  }

  if (data.statuses.length === 0) {
    return (
      <>
        <OperationalHealthSummary health={data.summary.health} />
        <BridgeDashboardEmpty />
      </>
    );
  }

  return <OperatorDashboard statuses={data.statuses} summary={data.summary} />;
}
