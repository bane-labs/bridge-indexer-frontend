import { redirect } from "next/navigation";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bridge Dashboard",
  description: "Redirects to the main operator dashboard.",
};

/**
 * Legacy /bridges route — redirects to / where the operator dashboard now lives.
 * Kept to avoid breaking existing bookmarks.
 */
export default function BridgesPage() {
  redirect("/");
}
