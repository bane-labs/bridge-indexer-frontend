import { ThemeToggle } from "@atlas/ui";

import { BridgeDashboardClient } from "@/features/bridges/components/bridge-dashboard-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bridge Operator Dashboard",
  description: "Monitor the health and sync status of all Neo bridge instances.",
};

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

      <BridgeDashboardClient />
    </main>
  );
}
