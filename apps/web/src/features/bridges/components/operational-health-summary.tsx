import { formatTimestamp, getDirectionLabel } from "../lib/formatters";

import type { BridgeDashboardSummary, ChainId } from "../types/bridge";

const VERDICTS = {
  healthy: "Healthy",
  degraded: "Degraded",
  unhealthy: "Unhealthy",
  paused: "All directions paused",
  unknown: "Health unknown",
};

export function OperationalHealthSummary({ health }: { health: BridgeDashboardSummary["health"] }) {
  return (
    <section
      aria-labelledby="operational-health-heading"
      className="space-y-2 rounded-lg border p-4"
    >
      <h2 id="operational-health-heading" className="font-semibold">
        Bridge health
      </h2>
      {health === "failed" ? (
        <p>Could not load bridge health.</p>
      ) : !health || health === "unavailable" ? (
        <p>Operational health is unavailable.</p>
      ) : "status" in health ? (
        <>
          <p className="font-medium">{VERDICTS[health.status]}</p>
          <p>Bridge pause health. Operational checks are not available yet.</p>
          <p className="text-muted-foreground text-sm">
            Checked {formatTimestamp(health.updated_at)}
          </p>
          <ul aria-label="Bridge directions" className="text-sm">
            {health.bridges.map((bridge) => (
              <li key={bridge.bridge_type}>
                {bridge.bridge_type} · N3 → Neo X {bridge.deposits_paused ? "Paused" : "Open"}
                {" · "}Neo X → N3 {bridge.withdrawals_paused ? "Paused" : "Open"}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <p className="font-medium">{VERDICTS[health.overallStatus]}</p>
          <p>{health.summary}</p>
          <p className="text-muted-foreground text-sm">
            {health.checkedAt
              ? `Checked ${formatTimestamp(health.checkedAt)}`
              : "Waiting for the first health check."}
          </p>
          {health.issues.length > 0 && (
            <ul className="list-inside list-disc text-sm">
              {health.issues.map((issue) => (
                <li
                  key={JSON.stringify([issue.code, issue.chain, issue.instanceId, issue.message])}
                >
                  {issue.message}
                  {issue.instanceId && <span> ({issue.instanceId})</span>}
                </li>
              ))}
            </ul>
          )}
          {health.issueCount > health.issues.length && (
            <p className="text-muted-foreground text-sm">
              Showing {health.issues.length} of {health.issueCount} health issues.
            </p>
          )}
          {health.bridges.length > 0 && (
            <ul aria-label="Bridge directions" className="grid gap-1 text-sm sm:grid-cols-2">
              {health.bridges.flatMap((bridge) =>
                bridge.directions.map((direction) => (
                  <li key={`${bridge.bridgeType}-${direction.srcChain}-${direction.dstChain}`}>
                    <span className="capitalize">{bridge.bridgeType}</span>{" "}
                    {getDirectionLabel(
                      direction.srcChain as ChainId,
                      direction.dstChain as ChainId
                    )}
                    {" · "}
                    {direction.paused === null
                      ? "Pause state unavailable"
                      : direction.paused
                        ? "Paused"
                        : "Open"}
                  </li>
                ))
              )}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
