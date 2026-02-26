/**
 * Feature Flags Dev Panel Layout
 *
 * This layout blocks access in production and redirects to 404.
 * The /__flags route is only accessible in development mode.
 */

import { notFound } from "next/navigation";

import type { Metadata } from "next";
import type React from "react";

export const metadata: Metadata = {
  title: "Feature Flags | Dev Tools",
  description: "Development-only feature flags management panel",
  robots: "noindex, nofollow",
};

/**
 * Force dynamic rendering to check environment at runtime.
 */
export const dynamic = "force-dynamic";

export default function FeatureFlagsLayout({ children }: { children: React.ReactNode }) {
  // Block access in production
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return <>{children}</>;
}
