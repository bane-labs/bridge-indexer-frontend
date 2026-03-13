import { redirect } from "next/navigation";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bridge Sync State",
  description: "Redirects to the main operator dashboard.",
};

/**
 * Legacy /bridges/state route — functionality absorbed into / and /bridges/[slug].
 * Redirects to the main dashboard to maintain bookmark compatibility.
 */
export default function BridgeStatePage() {
  redirect("/");
}
