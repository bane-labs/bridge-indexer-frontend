import { formatTimestamp, getDirectionLabel } from "../lib/formatters";

import type { BackendLegacyHealth } from "../types/backend-api";
import type { BridgeDashboardSummary, ChainId } from "../types/bridge";

const VERDICTS = {
  healthy: "Healthy",
  degraded: "Degraded",
  unhealthy: "Unhealthy",
  paused: "All directions paused",
  unknown: "Health unknown",
};

export function OperationalHealthSummary({ health }: { health: BridgeDashboardSummary["health"] }) {
  if (health && typeof health !== "string" && "status" in health) {
    return <LegacyPauseSummary health={health} />;
  }
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
                        : "Unpaused"}
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

function LegacyPauseSummary({ health }: { health: BackendLegacyHealth }) {
  const pausedDirections = health.bridges
    .flatMap((bridge) => [
      {
        bridgeType: bridge.bridge_type,
        source: "neo_n3" as const,
        destination: "neo_x" as const,
        paused: bridge.deposits_paused,
      },
      {
        bridgeType: bridge.bridge_type,
        source: "neo_x" as const,
        destination: "neo_n3" as const,
        paused: bridge.withdrawals_paused,
      },
    ])
    .filter((direction) => direction.paused);

  let label = "Pause state unavailable";
  if (health.bridges.length > 0) {
    label =
      pausedDirections.length === 0
        ? "All directions unpaused"
        : `${pausedDirections.length} direction${pausedDirections.length === 1 ? "" : "s"} paused`;
  }

  return (
    <section
      aria-labelledby="bridge-pause-heading"
      className="bg-card rounded-lg border px-4 py-3 text-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 id="bridge-pause-heading" className="text-muted-foreground">
            Bridge pauses
          </h2>
          <p
            className={
              pausedDirections.length > 0 ? "text-warning-text font-medium" : "font-medium"
            }
          >
            {label}
          </p>
        </div>
        {health.updated_at && (
          <time
            dateTime={health.updated_at}
            title={health.updated_at}
            className="text-muted-foreground text-xs"
          >
            Checked {formatTimestamp(health.updated_at)}
          </time>
        )}
      </div>
      {pausedDirections.length > 0 && (
        <ul aria-label="Paused bridge directions" className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
          {pausedDirections.map((direction) => (
            <li key={`${direction.bridgeType}-${direction.source}`}>
              <span className="capitalize">{direction.bridgeType}</span>
              {" · "}
              {getDirectionLabel(direction.source, direction.destination)}
              {" · Paused"}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
