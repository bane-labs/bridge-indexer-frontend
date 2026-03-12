import { Suspense } from "react";

import { BridgeStateEmpty } from "@/features/bridges/components/bridge-state-empty";
import { BridgeStateError } from "@/features/bridges/components/bridge-state-error";
import { BridgeStateSkeleton } from "@/features/bridges/components/bridge-state-skeleton";
import { BridgeStateView } from "@/features/bridges/components/bridge-state-view";
import { getBridgeState } from "@/features/bridges/lib/get-bridge-state";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bridge Sync State",
  description: "Inspect the sync state for every operated bridge direction.",
};

async function BridgeStateContent() {
  let data;
  try {
    data = await getBridgeState();
  } catch {
    return <BridgeStateError />;
  }

  if (data.sections.length === 0) {
    return <BridgeStateEmpty />;
  }

  return <BridgeStateView sections={data.sections} />;
}

export default function BridgeStatePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          Bridge Sync State
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Compare source and destination state for every bridge direction across Neo N3 ↔ Neo X.
        </p>
      </header>

      <Suspense fallback={<BridgeStateSkeleton />}>
        <BridgeStateContent />
      </Suspense>
    </main>
  );
}
