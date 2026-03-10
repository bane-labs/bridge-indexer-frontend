import { Suspense } from "react";

import { BridgeDashboardEmpty } from "@/features/bridges/components/bridge-dashboard-empty";
import { BridgeDashboardError } from "@/features/bridges/components/bridge-dashboard-error";
import { BridgeDashboardSkeleton } from "@/features/bridges/components/bridge-dashboard-skeleton";
import { BridgeDashboardSummary } from "@/features/bridges/components/bridge-dashboard-summary";
import { BridgeGroupSection } from "@/features/bridges/components/bridge-group-section";
import { getBridgeDashboard } from "@/features/bridges/lib/get-bridge-dashboard";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bridge Dashboard",
  description: "Monitor the health and sync status of all Neo bridge instances.",
};

async function BridgeDashboardContent() {
  let data;
  try {
    data = await getBridgeDashboard();
  } catch {
    return <BridgeDashboardError />;
  }

  if (data.groups.length === 0) {
    return <BridgeDashboardEmpty />;
  }

  const nativeBridges = data.groups.filter((g) => g.bridgeFamily === "native");
  const messageBridges = data.groups.filter((g) => g.bridgeFamily === "message");
  const tokenBridges = data.groups.filter((g) => g.bridgeFamily === "token");

  return (
    <>
      <BridgeDashboardSummary summary={data.summary} />

      {nativeBridges.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-foreground sr-only text-xl font-semibold tracking-tight">
            Native Bridges
          </h2>
          {nativeBridges.map((group) => (
            <BridgeGroupSection key={group.id} group={group} />
          ))}
        </div>
      )}

      {messageBridges.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-foreground sr-only text-xl font-semibold tracking-tight">
            Message Bridges
          </h2>
          {messageBridges.map((group) => (
            <BridgeGroupSection key={group.id} group={group} />
          ))}
        </div>
      )}

      {tokenBridges.length > 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-foreground text-xl font-semibold tracking-tight">Token Bridges</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {tokenBridges.length} token {tokenBridges.length === 1 ? "bridge" : "bridges"}{" "}
              monitored
            </p>
          </div>
          {tokenBridges.map((group) => (
            <BridgeGroupSection key={group.id} group={group} />
          ))}
        </div>
      )}
    </>
  );
}

export default function BridgesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          Bridge Dashboard
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Real-time sync status for all Neo N3 ↔ Neo X bridge instances.
        </p>
      </header>

      <div className="space-y-8">
        <Suspense fallback={<BridgeDashboardSkeleton />}>
          <BridgeDashboardContent />
        </Suspense>
      </div>
    </main>
  );
}
