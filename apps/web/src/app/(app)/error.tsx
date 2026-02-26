"use client";

/**
 * App Shell Error Boundary
 *
 * Catches errors within the (app) route group and displays a user-friendly fallback.
 * Uses the shared ErrorFallback component from @atlas/ui.
 *
 * This error boundary:
 * - Preserves the app shell layout (nav, sidebar)
 * - Shows a friendly error message
 * - Displays correlation ID if available (from error.digest)
 * - Provides a "Try again" button using Next.js reset()
 *
 * For catastrophic errors (root layout failures), see global-error.tsx
 */

import { ErrorFallback } from "@atlas/ui";

import { t } from "@/lib/i18n";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <ErrorFallback
        title={t("errors.generic")}
        description={t("errors.genericDescription")}
        error={error}
        correlationId={error.digest}
        onRetry={reset}
      />
    </div>
  );
}
