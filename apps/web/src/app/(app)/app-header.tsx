"use client";

/**
 * App Header Component
 *
 * Header with branding and user authentication menu.
 */

import { UserMenu } from "@/components/auth";

export function AppHeader() {
  return (
    <div className="flex h-14 items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        <span className="text-lg font-semibold">Atlas</span>
      </div>
      <div className="flex items-center gap-4">
        <UserMenu />
      </div>
    </div>
  );
}
