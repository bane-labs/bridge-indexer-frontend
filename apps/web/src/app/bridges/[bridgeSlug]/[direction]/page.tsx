import { notFound } from "next/navigation";

import { BridgeHistoryClient } from "@/features/bridges/components/bridge-history-client";
import { parseDirectionSlug, parseBridgeSlug } from "@/features/bridges/lib/bridge-slugs";

import type { BridgeDirectionSlug } from "@/features/bridges/lib/bridge-slugs";
import type { Metadata } from "next";

interface BridgeDirectionPageProps {
  params: Promise<{ bridgeSlug: string; direction: string }>;
}

export async function generateMetadata({ params }: BridgeDirectionPageProps): Promise<Metadata> {
  const { bridgeSlug, direction } = await params;
  return {
    title: `Bridge Detail — ${bridgeSlug} (${direction})`,
    description: `Sync state and operation history for the ${bridgeSlug} bridge (${direction}).`,
  };
}

export default async function BridgeDirectionPage({ params }: BridgeDirectionPageProps) {
  const { bridgeSlug, direction } = await params;

  if (!parseBridgeSlug(bridgeSlug) || !parseDirectionSlug(direction)) {
    notFound();
  }

  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <BridgeHistoryClient slug={bridgeSlug} direction={direction as BridgeDirectionSlug} />
      </div>
    </main>
  );
}
