import Image from "next/image";

import { BridgeDashboardClient } from "@/features/bridges/components/bridge-dashboard-client";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bridge Operator Dashboard",
  description: "Monitor the health and sync status of all Neo bridge instances.",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center gap-3">
          <Image
            src="/images/neo_color_dark.png"
            alt="Neo"
            width={120}
            height={40}
            className="h-10 w-auto shrink-0"
            priority
          />
          <div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              Bridge Monitor
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Operator dashboard — Neo N3 ↔ Neo X bridge instances
            </p>
          </div>
        </header>

        <BridgeDashboardClient />
      </main>

      <footer className="border-border border-t py-4 text-center text-sm">
        <p className="text-muted-foreground">
          Copyright &copy; Bane Labs, developed and maintained by{" "}
          <a
            href="https://axlabs.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline"
          >
            AxLabs
          </a>
          {" · "}
          <a
            href="https://github.com/bane-labs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline"
          >
            Bane Labs
          </a>
        </p>
      </footer>
    </div>
  );
}
