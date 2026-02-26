/**
 * Analytics Demo Component
 *
 * Demonstrates how to use the analytics API in Atlas.
 * This component is for demonstration purposes only.
 *
 * @example Usage in any component:
 * ```tsx
 * import { analytics } from "@/lib/analytics";
 *
 * // Track a button click
 * analytics.track("ui.button_click", { buttonId: "demo-btn", label: "Demo" });
 * ```
 */

"use client";

import { Button } from "@atlas/ui";

import { analytics } from "@/lib/analytics";

export function AnalyticsDemo() {
  const handleTrackClick = () => {
    analytics.track("ui.button_click", {
      buttonId: "analytics-demo-btn",
      label: "Track Event Demo",
    });
  };

  const handleTrackFeature = () => {
    analytics.track("feature.used", {
      feature: "analytics-demo",
      metadata: { source: "demo-page" },
    });
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-6">
      <div className="space-y-1">
        <h4 className="font-medium">Analytics Demo</h4>
        <p className="text-muted-foreground text-sm">
          Click buttons to trigger analytics events. Enable debug mode to see events in console.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={handleTrackClick}>
          Track Click
        </Button>
        <Button size="sm" variant="outline" onClick={handleTrackFeature}>
          Track Feature Usage
        </Button>
      </div>
    </div>
  );
}
