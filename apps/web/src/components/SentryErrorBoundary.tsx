/**
 * Sentry Error Boundary
 *
 * A reusable error boundary component that captures unhandled errors in React components
 * and sends them to Sentry with appropriate context.
 *
 * Usage:
 * ```tsx
 * <SentryErrorBoundary fallback={<ErrorFallback />}>
 *   <YourComponent />
 * </SentryErrorBoundary>
 * ```
 */

"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showDetails?: boolean;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  showDetails?: boolean;
}

/**
 * Default error fallback UI
 *
 * Uses config facade to determine environment in a type-safe way.
 */
function DefaultErrorFallback({ error, resetError, showDetails = false }: ErrorFallbackProps) {
  // Use environment detection for error display
  // In client components, we can check the hostname or use config
  const isDevelopment = typeof window !== "undefined" && window.location.hostname === "localhost";

  return (
    <div className="flex min-h-100 flex-col items-center justify-center p-8">
      <div className="max-w-md space-y-4 text-center">
        <h2 className="text-destructive text-2xl font-semibold">Something went wrong</h2>
        <p className="text-muted-foreground">
          We&apos;ve been notified and will look into this issue. Please try refreshing the page.
        </p>
        {showDetails && isDevelopment && (
          <details className="bg-muted mt-4 rounded-md p-4 text-left text-sm">
            <summary className="cursor-pointer font-semibold">Error details</summary>
            <pre className="mt-2 overflow-auto text-xs">{error.message}</pre>
          </details>
        )}
        <button
          onClick={resetError}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

/**
 * Error boundary that integrates with Sentry
 */
export function SentryErrorBoundary({
  children,
  fallback,
  showDetails = false,
}: ErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => {
        // Use custom fallback if provided, otherwise use default
        if (fallback) {
          return <>{fallback}</>;
        }
        return (
          <DefaultErrorFallback
            error={error as Error}
            resetError={resetError}
            showDetails={showDetails}
          />
        );
      }}
      beforeCapture={(scope, _error, componentStack) => {
        // Add additional context
        scope.setTag("errorBoundary", "react");
        scope.setContext("componentStack", {
          componentStack,
        });
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}

/**
 * Hook to manually report errors to Sentry with additional context
 */
export function useSentryError() {
  const captureError = (error: Error, context?: Record<string, unknown>) => {
    Sentry.captureException(error, {
      contexts: context ? { custom: context } : undefined,
    });
  };

  return { captureError };
}

/**
 * Global error handler for unhandled promise rejections
 * This should be mounted in the root layout
 */
export function GlobalErrorHandler() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      Sentry.captureException(event.reason, {
        tags: {
          errorType: "unhandledRejection",
        },
      });
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  return null;
}
