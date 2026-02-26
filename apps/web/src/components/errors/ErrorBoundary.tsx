"use client";

/**
 * Component-Level Error Boundary
 *
 * A reusable error boundary for wrapping individual components or sections.
 * Unlike route-level error.tsx, this can be used anywhere in the component tree.
 *
 * Features:
 * - Catches errors in child components
 * - Renders ErrorFallback with retry support
 * - Optional onError callback for logging/notifications
 * - Optional custom fallback rendering
 * - Integrates with global notification system
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary onError={(error) => console.error(error)}>
 *   <SomeComponent />
 * </ErrorBoundary>
 *
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomErrorUI />}>
 *   <SomeComponent />
 * </ErrorBoundary>
 * ```
 */

import { Component, type ErrorInfo, type ReactNode } from "react";

import { ErrorFallback } from "@atlas/ui";

import { notifyApiError } from "@/lib/notifications";

export interface ErrorBoundaryProps {
  /**
   * Children to render.
   */
  children: ReactNode;

  /**
   * Custom fallback to render on error.
   * If not provided, uses ErrorFallback component.
   */
  fallback?: ReactNode;

  /**
   * Custom fallback render function.
   * Receives error and reset function for more control.
   */
  renderFallback?: (error: Error, reset: () => void) => ReactNode;

  /**
   * Callback when an error is caught.
   * Use for logging, analytics, or showing notifications.
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;

  /**
   * Whether to show a toast notification on error.
   * Default: false
   */
  showNotification?: boolean;

  /**
   * Title for the error fallback.
   */
  title?: string;

  /**
   * Description for the error fallback.
   */
  description?: string;

  /**
   * Whether to show the retry button.
   * Default: true
   */
  showRetry?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Component-level error boundary.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Show notification if enabled
    if (this.props.showNotification) {
      notifyApiError(error);
    }
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, renderFallback, title, description, showRetry = true } = this.props;

    if (hasError && error) {
      // Custom render function
      if (renderFallback) {
        return renderFallback(error, this.reset);
      }

      // Custom fallback element
      if (fallback) {
        return fallback;
      }

      // Default ErrorFallback
      return (
        <ErrorFallback
          title={title}
          description={description}
          error={error}
          onRetry={showRetry ? this.reset : undefined}
          variant="inline"
        />
      );
    }

    return children;
  }
}

export default ErrorBoundary;
