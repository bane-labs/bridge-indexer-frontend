import { notFound } from "next/navigation";
import { Suspense } from "react";

import { BridgeDetailView } from "@/features/bridges/components/bridge-detail-view";
import { BridgeHistoryError } from "@/features/bridges/components/bridge-history-error";
import { BridgeHistorySkeleton } from "@/features/bridges/components/bridge-history-skeleton";
import { getBridgeDashboard } from "@/features/bridges/lib/get-bridge-dashboard";
import { getBridgeHistory } from "@/features/bridges/lib/get-bridge-history";

import type { Metadata } from "next";

interface BridgeHistoryPageProps {
  params: Promise<{ bridgeSlug: string }>;
}

export async function generateMetadata({ params }: BridgeHistoryPageProps): Promise<Metadata> {
  const { bridgeSlug } = await params;
  return {
    title: `Bridge Detail — ${bridgeSlug}`,
    description: `Sync state and operation history for the ${bridgeSlug} bridge.`,
  };
}

async function BridgeDetailContent({ slug }: { slug: string }) {
  let historyData;
  let dashboardData;
  try {
    [historyData, dashboardData] = await Promise.all([
      getBridgeHistory(slug),
      getBridgeDashboard(),
    ]);
  } catch {
    return <BridgeHistoryError />;
  }

  if (!historyData) {
    notFound();
  }

  // Find matching directional statuses for this bridge slug
  const matchingStatuses = dashboardData.statuses.filter((s) => {
    const statusSlug = s.tokenSymbol ? `token-${s.tokenSymbol.toLowerCase()}` : s.bridgeFamily;
    return statusSlug === slug;
  });

  return <BridgeDetailView history={historyData} statuses={matchingStatuses} />;
}

export default async function BridgeHistoryPage({ params }: BridgeHistoryPageProps) {
  const { bridgeSlug } = await params;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<BridgeHistorySkeleton />}>
        <BridgeDetailContent slug={bridgeSlug} />
      </Suspense>
    </main>
  );
}
