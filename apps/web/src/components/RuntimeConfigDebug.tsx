/**
 * Config Debug Component
 *
 * Displays configuration values for debugging.
 * Only shown in development mode.
 *
 * @internal Development only
 */

"use client";

import { useConfig } from "@/config";

export function RuntimeConfigDebug() {
  const config = useConfig();

  // Only show in development
  if (config.app.env === "production") {
    return null;
  }

  return (
    <div className="border-border bg-card fixed right-4 bottom-4 max-w-md rounded-lg border p-4 text-xs shadow-lg">
      <div className="text-card-foreground mb-2 font-semibold">Config (Dev Only)</div>
      <div className="text-muted-foreground space-y-1 font-mono">
        <div>
          <span className="text-foreground">Environment:</span> {config.app.env}
        </div>
        <div className="break-all">
          <span className="text-foreground">API URL:</span> {config.api.baseUrl}
        </div>
        <div className="break-all">
          <span className="text-foreground">App URL:</span> {config.app.url}
        </div>
        {config.app.buildId && (
          <div>
            <span className="text-foreground">Build:</span> {config.app.buildId}
          </div>
        )}
        {config.webVitals && (
          <div>
            <span className="text-foreground">Web Vitals:</span>{" "}
            {config.webVitals.enabled ? "enabled" : "disabled"}
          </div>
        )}
      </div>
    </div>
  );
}
