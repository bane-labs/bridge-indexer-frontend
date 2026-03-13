import { notFound } from "next/navigation";
import { Suspense } from "react";

import { BridgeHistoryError } from "@/features/bridges/components/bridge-history-error";
import { BridgeHistoryHeader } from "@/features/bridges/components/bridge-history-header";
import { BridgeHistorySection } from "@/features/bridges/components/bridge-history-section";
import { BridgeHistorySkeleton } from "@/features/bridges/components/bridge-history-skeleton";
import { getBridgeHistory } from "@/features/bridges/lib/get-bridge-history";

import type { Metadata } from "next";

interface BridgeHistoryPageProps {
  params: Promise<{ bridgeSlug: string }>;
}

export async function generateMetadata({ params }: BridgeHistoryPageProps): Promise<Metadata> {
  const { bridgeSlug } = await params;
  return {
    title: `Bridge History — ${bridgeSlug}`,
    description: `Operation history for the ${bridgeSlug} bridge.`,
  };
}

async function BridgeHistoryContent({ slug }: { slug: string }) {
  let data;
  try {
    data = await getBridgeHistory(slug);
  } catch {
    return <BridgeHistoryError />;
  }

  if (!data) {
    notFound();
  }

  const [first] = data.directions;

  return (
    <>
      <BridgeHistoryHeader
        label={data.label}
        bridgeFamily={data.bridgeFamily}
        tokenSymbol={data.tokenSymbol}
        primarySourceChain={first.sourceChain}
        primaryDestChain={first.destinationChain}
      />

      <div className="space-y-10">
        {data.directions.map((direction) => (
          <BridgeHistorySection
            key={`${direction.sourceChain}-${direction.destinationChain}`}
            direction={direction}
          />
        ))}
      </div>
    </>
  );
}

export default async function BridgeHistoryPage({ params }: BridgeHistoryPageProps) {
  const { bridgeSlug } = await params;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <Suspense fallback={<BridgeHistorySkeleton />}>
        <BridgeHistoryContent slug={bridgeSlug} />
      </Suspense>
    </main>
  );
}
