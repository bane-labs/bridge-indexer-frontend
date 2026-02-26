"use client";

/**
 * Feature Flags Demo Page
 *
 * Demonstrates Atlas feature flag patterns:
 * - useFlag hook for checking flag state
 * - FeatureGuard component for conditional rendering
 * - Kill switch patterns for emergency disablement
 *
 * @module app/demo/flags/page
 */

import { AlertTriangle, CheckCircle, Flag, ShieldOff, XCircle } from "lucide-react";

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
} from "@atlas/ui";

import { FeatureFlags, FeatureGuard, useFlag, useFlags, useKillSwitch } from "@/lib/feature-flags";

function FlagStatus({ enabled, killed }: { enabled: boolean; killed?: boolean }) {
  if (killed) {
    return (
      <Badge variant="destructive">
        <ShieldOff className="mr-1 h-3 w-3" />
        Killed
      </Badge>
    );
  }
  if (enabled) {
    return (
      <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
        <CheckCircle className="mr-1 h-3 w-3" />
        Enabled
      </Badge>
    );
  }
  return (
    <Badge variant="secondary">
      <XCircle className="mr-1 h-3 w-3" />
      Disabled
    </Badge>
  );
}

export default function FlagsDemoPage() {
  const { snapshot, isEnabled, isKilled } = useFlags();

  // Individual flag states for display
  const isDangerousActionEnabled = useFlag(FeatureFlags.DEMO_DANGEROUS_ACTION);
  const isDangerousActionKilled = useKillSwitch(FeatureFlags.DEMO_DANGEROUS_ACTION);

  // List of demo flags
  const demoFlags = [
    {
      key: FeatureFlags.DEMO_NEW_TABLE,
      name: "Demo New Table",
      description: "When enabled, shows the new table design",
    },
    {
      key: FeatureFlags.DEMO_DANGEROUS_ACTION,
      name: "Demo Dangerous Action",
      description: "A risky feature that can be killed",
      hasKillSwitch: true,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Feature Flags Demo</h1>
        <p className="text-muted-foreground">
          Demonstrates feature toggles and kill switch patterns using the Atlas feature flags
          module.
        </p>
      </div>

      {/* Flag Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Current Flag States
          </CardTitle>
          <CardDescription>
            Flags are read from runtime config. Source: {snapshot.source}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {demoFlags.map((flag) => {
            const enabled = isEnabled(flag.key);
            const killed = flag.hasKillSwitch ? isKilled(flag.key) : undefined;

            return (
              <div
                key={flag.key}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{flag.name}</p>
                  <p className="text-muted-foreground text-sm">{flag.description}</p>
                  <p className="text-muted-foreground mt-1 font-mono text-xs">key: {flag.key}</p>
                </div>
                <div className="flex items-center gap-2">
                  <FlagStatus enabled={enabled} killed={killed} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* FeatureGuard Demo */}
      <Card>
        <CardHeader>
          <CardTitle>FeatureGuard Component</CardTitle>
          <CardDescription>
            Conditionally render content based on flag state with fallback support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4">
            <p className="mb-4 text-sm font-medium">New Table Feature:</p>
            <FeatureGuard
              feature={FeatureFlags.DEMO_NEW_TABLE}
              fallback={
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-muted-foreground">
                    🚫 New table is disabled. Enable <code>demo_new_table</code> flag.
                  </p>
                </div>
              }
            >
              <div className="rounded-lg bg-green-500/10 p-4 text-center">
                <p className="text-green-600">✨ New table feature is enabled!</p>
              </div>
            </FeatureGuard>
          </div>
        </CardContent>
      </Card>

      {/* Kill Switch Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldOff className="text-destructive h-5 w-5" />
            Kill Switch Pattern
          </CardTitle>
          <CardDescription>
            Kill switches forcibly disable features, taking precedence over the feature flag
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Kill Switch Alert */}
          {isDangerousActionKilled && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Kill Switch Active</AlertTitle>
              <AlertDescription>
                The dangerous action has been disabled by a kill switch. The feature flag state is
                ignored while the kill switch is active.
              </AlertDescription>
            </Alert>
          )}

          {/* Dangerous Action Demo */}
          <div className="rounded-lg border p-4">
            <p className="mb-4 text-sm font-medium">Dangerous Action Button:</p>
            <FeatureGuard
              feature={FeatureFlags.DEMO_DANGEROUS_ACTION}
              fallback={
                <Button disabled variant="outline">
                  🔒 Dangerous Action (Disabled)
                </Button>
              }
              killedFallback={
                <Button disabled variant="destructive">
                  ⛔ Dangerous Action (KILLED)
                </Button>
              }
            >
              <Button variant="destructive">🔥 Dangerous Action (Enabled)</Button>
            </FeatureGuard>
          </div>

          {/* Explanation */}
          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p className="font-medium">Kill Switch Logic:</p>
            <ul className="text-muted-foreground mt-2 list-inside list-disc space-y-1">
              <li>
                Feature flag <code>demo_dangerous_action</code>:{" "}
                {isDangerousActionEnabled ? "enabled" : "disabled"}
              </li>
              <li>
                Kill switch <code>kill_demo_dangerous_action</code>:{" "}
                {isDangerousActionKilled ? "ACTIVE" : "inactive"}
              </li>
              <li>
                Result: Action is{" "}
                <strong>
                  {isDangerousActionEnabled && !isDangerousActionKilled ? "available" : "blocked"}
                </strong>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Note */}
      <Card>
        <CardHeader>
          <CardTitle>How to Configure Flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p className="text-muted-foreground">
            Feature flags are read from runtime config. To change flag values:
          </p>
          <div className="bg-muted/50 rounded-lg p-4 font-mono text-xs">
            <p className="text-muted-foreground mb-2">
              <code>config/server.ts</code>:
            </p>
            <pre className="whitespace-pre-wrap">
              {`features: {
  demo_new_table: true,
  demo_dangerous_action: true,
  kill_demo_dangerous_action: false,
}`}
            </pre>
          </div>
          <p className="text-muted-foreground">
            In production, flags are typically managed via environment variables or a feature flag
            service (LaunchDarkly, etc.).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
