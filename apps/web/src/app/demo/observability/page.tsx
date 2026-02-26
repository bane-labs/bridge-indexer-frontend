"use client";

/**
 * Observability Demo Page
 *
 * Demonstrates Atlas observability patterns:
 * - Sentry error capture (when configured)
 * - Correlation IDs in API responses
 * - Structured logging patterns
 *
 * @module app/demo/observability/page
 */

import { AlertTriangle, Bug, FileText, Radio, RefreshCw } from "lucide-react";
import { useState } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ErrorFallback,
  Input,
} from "@atlas/ui";

import { clientEnv } from "@/env";
import { ApiError } from "@/lib/api";
import { generateCorrelationId } from "@/lib/api/correlation";
import { useApiClient } from "@/lib/api/hooks";
import { captureException, captureMessage } from "@/lib/telemetry/sentry.client";

export default function ObservabilityDemoPage() {
  const api = useApiClient();
  const [apiError, setApiError] = useState<ApiError | null>(null);
  const [captureStatus, setCaptureStatus] = useState<"idle" | "captured" | "no-dsn">("idle");
  const [loggedEvent, setLoggedEvent] = useState<{ event: string; correlationId: string } | null>(
    null
  );

  // Check if Sentry is configured
  const sentryConfigured = Boolean(clientEnv.NEXT_PUBLIC_SENTRY_DSN);

  const handleCaptureError = () => {
    if (!sentryConfigured) {
      setCaptureStatus("no-dsn");
      return;
    }

    try {
      // Create a demo error
      const demoError = new Error("Demo error captured from Atlas Showcase");

      captureException(demoError, {
        tags: { demo: "true", page: "observability" },
        extra: { timestamp: new Date().toISOString() },
        level: "warning",
      });

      setCaptureStatus("captured");
      setTimeout(() => setCaptureStatus("idle"), 3000);
    } catch {
      setCaptureStatus("no-dsn");
    }
  };

  const handleTriggerApiError = async () => {
    setApiError(null);
    try {
      await api.get("/demo/items?mode=error");
    } catch (error) {
      if (error instanceof ApiError) {
        setApiError(error);

        // Capture to Sentry with correlation context
        captureException(error, {
          tags: {
            demo: "true",
            page: "observability",
            "api.code": error.shape.code,
            "api.status": String(error.status ?? 0),
          },
          extra: {
            correlationId: error.shape.correlationId,
            userMessage: error.shape.userMessage,
            details: error.shape.details,
          },
          level: (error.status ?? 0) >= 500 ? "error" : "warning",
        });
      }
    }
  };

  const handleLogEvent = () => {
    const correlationId = generateCorrelationId();
    const event = "demo.button_clicked";

    // In a real app, this would go to server-side logging
    // For demo, we just show what would be logged
    setLoggedEvent({ event, correlationId });

    // Also capture as Sentry message if available
    if (sentryConfigured) {
      captureMessage(`Demo event: ${event}`, "info", {
        tags: { demo: "true" },
        extra: { correlationId },
      });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Observability Demo</h1>
        <p className="text-muted-foreground">
          Demonstrates Sentry error capture, correlation IDs, and structured logging patterns.
        </p>
      </div>

      {/* Sentry Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Sentry Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">SENTRY_DSN</p>
              <p className="text-muted-foreground text-sm">
                {sentryConfigured
                  ? "Configured - errors will be captured"
                  : "Not configured - error capture disabled"}
              </p>
            </div>
            <Badge variant={sentryConfigured ? "default" : "secondary"}>
              {sentryConfigured ? "Active" : "Inactive"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Error Capture Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Error Capture
          </CardTitle>
          <CardDescription>Manually capture errors to Sentry with context</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button onClick={handleCaptureError} variant="outline">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Capture Handled Error
            </Button>
            {captureStatus === "captured" && (
              <Badge className="bg-green-500/10 text-green-600">✓ Sent to Sentry</Badge>
            )}
            {captureStatus === "no-dsn" && (
              <Badge variant="secondary">No SENTRY_DSN configured</Badge>
            )}
          </div>

          {!sentryConfigured && (
            <Alert>
              <AlertTitle>Sentry Not Configured</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                Set <code>NEXT_PUBLIC_SENTRY_DSN</code> in your environment to enable error capture.
                In dev mode, events are not sent by default.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* API Error Demo */}
      <Card>
        <CardHeader>
          <CardTitle>API Error with Correlation ID</CardTitle>
          <CardDescription>
            Trigger an API error and see the correlation ID in the response
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleTriggerApiError} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Trigger API Error
          </Button>

          {apiError && (
            <ErrorFallback
              title="API Error Occurred"
              description={apiError.shape.userMessage}
              correlationId={apiError.shape.correlationId}
              onRetry={() => setApiError(null)}
              actions={
                <div className="space-y-1 font-mono text-xs">
                  <p>
                    <span className="text-muted-foreground">Code:</span> {apiError.shape.code}
                  </p>
                </div>
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Structured Logging Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Structured Logging
          </CardTitle>
          <CardDescription>Log events with correlation IDs for request tracing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleLogEvent} variant="outline">
            Log Event
          </Button>

          {loggedEvent && (
            <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs">
              <p className="text-muted-foreground mb-2">Structured log event:</p>
              <pre className="whitespace-pre-wrap">
                {`{
  "event": "${loggedEvent.event}",
  "correlationId": "${loggedEvent.correlationId}",
  "timestamp": "${new Date().toISOString()}",
  "level": "info",
  "runtime": "client"
}`}
              </pre>
            </div>
          )}

          <p className="text-muted-foreground text-sm">
            In production, server-side logs use Pino with automatic request context injection.
            Client events can be sent to Sentry as breadcrumbs.
          </p>
        </CardContent>
      </Card>

      {/* Correlation ID Generator */}
      <Card>
        <CardHeader>
          <CardTitle>Correlation ID Generator</CardTitle>
          <CardDescription>
            Each API request includes a unique correlation ID for tracing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input value={generateCorrelationId()} readOnly className="font-mono text-sm" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Force re-render to generate new ID
                setLoggedEvent(null);
              }}
            >
              Generate
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Correlation IDs link client requests to server logs. They&apos;re passed via the{" "}
            <code>x-request-id</code> header and returned in error responses.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
