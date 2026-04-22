import { notFound } from "next/navigation";

import { BridgeHistoryClient } from "@/features/bridges/components/bridge-history-client";
import { parseBridgeSlug } from "@/features/bridges/lib/bridge-slugs";

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

export default async function BridgeHistoryPage({ params }: BridgeHistoryPageProps) {
  const { bridgeSlug } = await params;

  // Keep route-level validation on the server; data fetching happens on the client.
  if (!parseBridgeSlug(bridgeSlug)) {
    notFound();
  }

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <BridgeHistoryClient slug={bridgeSlug} />
      </div>
    </main>
  );
}
