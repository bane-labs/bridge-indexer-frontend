import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { BridgeHistoryDirection } from "@/features/bridges/components/bridge-history-direction";
import { BridgeHistoryError } from "@/features/bridges/components/bridge-history-error";
import { BridgeHistorySkeleton } from "@/features/bridges/components/bridge-history-skeleton";
import { getBridgeHistory } from "@/features/bridges/lib/get-bridge-history";

import type { Metadata } from "next";

interface BridgeHistoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BridgeHistoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Bridge History — ${slug}`,
    description: `Operation history for the ${slug} bridge.`,
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

  return (
    <div className="space-y-10">
      {data.directions.map((direction) => (
        <BridgeHistoryDirection
          key={`${direction.sourceChain}-${direction.destinationChain}`}
          direction={direction}
        />
      ))}
    </div>
  );
}

export default async function BridgeHistoryPage({ params }: BridgeHistoryPageProps) {
  const { slug } = await params;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <nav className="mb-4">
          <Link
            href="/bridges"
            className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </nav>
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          Bridge History
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Past operations for the <span className="font-medium">{slug}</span> bridge, separated by
          direction.
        </p>
      </header>

      <Suspense fallback={<BridgeHistorySkeleton />}>
        <BridgeHistoryContent slug={slug} />
      </Suspense>
    </main>
  );
}
