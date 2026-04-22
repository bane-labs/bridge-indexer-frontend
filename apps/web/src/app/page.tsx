import { BridgeDashboardClient } from "@/features/bridges/components/bridge-dashboard-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bridge Operator Dashboard",
  description: "Monitor the health and sync status of all Neo bridge instances.",
};

export default function HomePage() {
  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <BridgeDashboardClient />
      </div>
    </main>
  );
}
