/**
 * Demo Section Layout
 *
 * Provides a consistent layout for all demo pages with sidebar navigation.
 * Demonstrates Atlas app shell patterns with nested routing.
 *
 * @module app/demo/layout
 */

import { Suspense } from "react";

import { SkeletonList } from "@atlas/ui";

import { DemoShell } from "./components/DemoShell";

export const metadata = {
  title: "Atlas Showcase | Demo",
  description: "Demonstration of Atlas platform patterns and primitives",
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoShell>
      <Suspense fallback={<SkeletonList count={3} />}>{children}</Suspense>
    </DemoShell>
  );
}
