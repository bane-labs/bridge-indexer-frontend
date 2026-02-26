"use client";

/**
 * Global Error Boundary
 *
 * Catches catastrophic errors that occur outside of the normal component tree,
 * including errors in the root layout itself.
 *
 * This is a special Next.js error file that:
 * - Wraps the entire application
 * - Must be a client component
 * - Must define its own <html> and <body> tags
 * - Is used when the root layout fails
 *
 * Note: This component cannot use the app's normal styling or providers
 * since those may have failed to render.
 */

import * as Sentry from "@sentry/nextjs";
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Report error to Sentry
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);
  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            backgroundColor: "#f9fafb",
            color: "#111827",
          }}
        >
          <div
            style={{
              textAlign: "center",
              maxWidth: "28rem",
            }}
          >
            {/* Error Icon */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "3rem",
                height: "3rem",
                borderRadius: "0.5rem",
                backgroundColor: "#fee2e2",
                color: "#dc2626",
                marginBottom: "1rem",
              }}
            >
              <AlertTriangleIcon style={{ width: "1.5rem", height: "1.5rem" }} />
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: "600",
                marginBottom: "0.5rem",
              }}
            >
              Something went wrong
            </h1>

            {/* Description */}
            <p
              style={{
                color: "#6b7280",
                marginBottom: "1.5rem",
              }}
            >
              We encountered an unexpected error. Please try refreshing the page.
            </p>

            {/* Correlation ID */}
            {error.digest && (
              <div
                style={{
                  backgroundColor: "#f3f4f6",
                  padding: "0.75rem",
                  borderRadius: "0.375rem",
                  marginBottom: "1.5rem",
                  fontSize: "0.75rem",
                  color: "#6b7280",
                }}
              >
                Reference ID:{" "}
                <code
                  style={{
                    backgroundColor: "#ffffff",
                    padding: "0.125rem 0.375rem",
                    borderRadius: "0.25rem",
                    fontFamily: "monospace",
                    color: "#111827",
                  }}
                >
                  {error.digest}
                </code>
              </div>
            )}

            {/* Retry Button */}
            <button
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                border: "none",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              <RefreshCwIcon style={{ width: "1rem", height: "1rem" }} />
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
