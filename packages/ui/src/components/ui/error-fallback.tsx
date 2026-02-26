import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const errorFallbackVariants = cva("flex flex-col items-center justify-center gap-4 text-center", {
  variants: {
    variant: {
      default: "min-h-[400px] rounded-lg border border-destructive/20 bg-destructive/5 p-6 md:p-12",
      inline: "p-6",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface ErrorFallbackProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof errorFallbackVariants> {
  title?: string;
  description?: string;
  error?: unknown;
  correlationId?: string;
  onRetry?: () => void;
  actions?: React.ReactNode;
}

/**
 * Check if error is an ApiError (duck-typing to avoid dependency)
 */
function isApiError(error: unknown): error is {
  shape: {
    code: string;
    message: string;
    userMessage?: string;
    correlationId?: string;
    details?: unknown;
  };
  status?: number;
} {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  if (!("shape" in error)) {
    return false;
  }

  const errorWithShape = error as { shape: unknown };
  if (typeof errorWithShape.shape !== "object" || errorWithShape.shape === null) {
    return false;
  }

  const shape = errorWithShape.shape as Record<string, unknown>;
  return "message" in shape;
}

/**
 * Extract user-friendly message from error
 */
function getUserMessage(error: unknown): string | undefined {
  if (isApiError(error)) {
    return error.shape.userMessage;
  }
  if (error instanceof Error && process.env.NODE_ENV !== "production") {
    // Only show error message in development
    return error.message;
  }
  return undefined;
}

/**
 * Extract correlation ID from error
 */
function getCorrelationId(error: unknown): string | undefined {
  if (isApiError(error)) {
    return error.shape.correlationId;
  }
  return undefined;
}

function ErrorFallback({
  className,
  variant,
  title = "Something went wrong",
  description,
  error,
  correlationId: providedCorrelationId,
  onRetry,
  actions,
  ...props
}: ErrorFallbackProps) {
  const userMessage = getUserMessage(error);
  const errorCorrelationId = getCorrelationId(error) || providedCorrelationId;

  // Use user message from error if available, otherwise use provided description
  const finalDescription = userMessage || description;

  return (
    <div
      role="alert"
      data-slot="error-fallback"
      className={cn(errorFallbackVariants({ variant, className }))}
      {...props}
    >
      <div className="flex max-w-md flex-col items-center gap-4">
        <div
          className="bg-destructive/10 text-destructive flex size-12 shrink-0 items-center justify-center rounded-lg"
          aria-hidden="true"
        >
          <AlertTriangleIcon className="size-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-foreground text-lg font-semibold tracking-tight">{title}</h2>
          {finalDescription && (
            <p className="text-muted-foreground text-sm/relaxed">{finalDescription}</p>
          )}
        </div>

        {errorCorrelationId && (
          <div className="bg-muted/50 border-border w-full rounded-md border p-3">
            <p className="text-muted-foreground text-xs">
              Reference ID:{" "}
              <code className="bg-background text-foreground rounded px-1.5 py-0.5 font-mono text-xs">
                {errorCorrelationId}
              </code>
            </p>
          </div>
        )}

        {(onRetry || actions) && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              >
                <RefreshCwIcon className="size-4" />
                Try again
              </button>
            )}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export { ErrorFallback, errorFallbackVariants };
