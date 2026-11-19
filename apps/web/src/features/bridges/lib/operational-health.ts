import type { BackendOverallHealth } from "../types/backend-api";
import type { BridgeDashboardSummary } from "../types/bridge";

export function getOperationalHealth(
  response: BackendOverallHealth | undefined
): NonNullable<BridgeDashboardSummary["health"]> {
  if (response === undefined) return "failed";
  return response;
}
