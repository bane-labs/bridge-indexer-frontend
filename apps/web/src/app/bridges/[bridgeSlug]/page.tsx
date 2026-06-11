import { redirect } from "next/navigation";

import { parseBridgeSlug } from "@/features/bridges/lib/bridge-slugs";

interface BridgeHistoryPageProps {
  params: Promise<{ bridgeSlug: string }>;
}

export default async function BridgeHistoryPage({ params }: BridgeHistoryPageProps) {
  const { bridgeSlug } = await params;

  // Validate the slug exists before redirecting.
  if (!parseBridgeSlug(bridgeSlug)) {
    redirect("/");
  }

  // Each bridge now has per-direction pages. Default to the N3 → X direction.
  redirect(`/bridges/${bridgeSlug}/n3-to-x`);
}
