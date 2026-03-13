import { Suspense } from "react";

import { ThemeToggle } from "@atlas/ui";

import { BridgeDashboardEmpty } from "@/features/bridges/components/bridge-dashboard-empty";
import { BridgeDashboardError } from "@/features/bridges/components/bridge-dashboard-error";
import { OperatorDashboard } from "@/features/bridges/components/operator-dashboard";
import { OperatorDashboardSkeleton } from "@/features/bridges/components/operator-dashboard-skeleton";
import { getBridgeDashboard } from "@/features/bridges/lib/get-bridge-dashboard";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bridge Operator Dashboard",
  description: "Monitor the health and sync status of all Neo bridge instances.",
};

async function DashboardContent() {
  let data;
  try {
    data = await getBridgeDashboard();
  } catch {
    return <BridgeDashboardError />;
  }

  if (data.statuses.length === 0) {
    return <BridgeDashboardEmpty />;
  }

  return <OperatorDashboard statuses={data.statuses} summary={data.summary} />;
}

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Bridge Monitor
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Operator dashboard — Neo N3 ↔ Neo X bridge instances
          </p>
        </div>
        <ThemeToggle />
      </header>

      <Suspense fallback={<OperatorDashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </main>
  );
}
