/**
 * Feature Flags Dev Panel Page
 *
 * Development-only page for viewing and managing feature flags.
 * Shows current flag states, sources, and allows toggling local overrides.
 *
 * Accessible at: /__flags (development only)
 *
 * @route /__flags
 */

"use client";

import { useCallback, useEffect, useState } from "react";

import {
  ALL_FEATURE_FLAGS,
  clearLocalOverrides,
  isKillSwitchFlag,
  readLocalOverrides,
  useFlags,
  writeLocalOverrides,
} from "@/lib/feature-flags";

import type { FeatureFlagKey, LocalOverrides } from "@/lib/feature-flags";

/**
 * Badge component for displaying flag source.
 */
function SourceBadge({ source }: { source: string }) {
  const colors: Record<string, string> = {
    runtime: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    local: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    query: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    posthog: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    mixed: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[source] || colors.default}`}
    >
      {source}
    </span>
  );
}

/**
 * Status badge component.
 */
function StatusBadge({ isKilled, isEnabled }: { isKilled: boolean; isEnabled: boolean }) {
  if (isKilled) {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
        KILLED
      </span>
    );
  }

  if (isEnabled) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
        ON
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
      OFF
    </span>
  );
}

/**
 * Toggle switch component.
 */
function Toggle({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 focus:outline-none ${
        enabled ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/**
 * Feature flag row component.
 */
function FlagRow({
  flagKey,
  isEnabled,
  isKilled,
  source,
  localOverride,
  onOverrideChange,
  onClearOverride,
}: {
  flagKey: FeatureFlagKey;
  isEnabled: boolean;
  isKilled: boolean;
  source: string;
  localOverride: boolean | undefined;
  onOverrideChange: (value: boolean) => void;
  onClearOverride: () => void;
}) {
  const isKillSwitch = isKillSwitchFlag(flagKey);
  const hasOverride = localOverride !== undefined;

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <code className="font-mono text-sm">{flagKey}</code>
          {isKillSwitch && (
            <span className="inline-flex items-center rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
              KILL
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <StatusBadge isKilled={isKilled} isEnabled={isEnabled} />
      </td>
      <td className="px-4 py-3 text-center">
        <SourceBadge source={source} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Toggle enabled={localOverride ?? isEnabled} onChange={onOverrideChange} />
          {hasOverride && (
            <button
              onClick={onClearOverride}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

/**
 * Feature Flags Dev Panel.
 *
 * Shows all feature flags with their current states and allows local overrides.
 */
export default function FeatureFlagsDevPanel() {
  const { isEnabled, isKilled, getSource, snapshot, refresh } = useFlags();
  const [localOverrides, setLocalOverrides] = useState<LocalOverrides>({ flags: {} });
  const [mounted, setMounted] = useState(false);

  // Load local overrides on mount
  useEffect(() => {
    setLocalOverrides(readLocalOverrides());
    setMounted(true);
  }, []);

  // Handle override change
  const handleOverrideChange = useCallback(
    (flagKey: FeatureFlagKey, value: boolean) => {
      const newOverrides: LocalOverrides = {
        ...localOverrides,
        flags: {
          ...localOverrides.flags,
          [flagKey]: value,
        },
      };
      writeLocalOverrides(newOverrides);
      setLocalOverrides(newOverrides);
      refresh();
    },
    [localOverrides, refresh]
  );

  // Handle clear single override
  const handleClearOverride = useCallback(
    (flagKey: FeatureFlagKey) => {
      const newFlags = { ...localOverrides.flags };
      delete newFlags[flagKey];
      const newOverrides: LocalOverrides = {
        ...localOverrides,
        flags: newFlags,
      };
      writeLocalOverrides(newOverrides);
      setLocalOverrides(newOverrides);
      refresh();
    },
    [localOverrides, refresh]
  );

  // Handle clear all overrides
  const handleClearAll = useCallback(() => {
    clearLocalOverrides();
    setLocalOverrides({ flags: {} });
    refresh();
  }, [refresh]);

  // Block render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const hasOverrides = Object.keys(localOverrides.flags).length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🚩 Feature Flags</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Development-only panel for viewing and managing feature flags.
          </p>
        </div>

        {/* Snapshot Info */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Source:</span>{" "}
              <SourceBadge source={snapshot.source} />
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Updated:</span>{" "}
              <span className="font-mono text-gray-700 dark:text-gray-300">
                {new Date(snapshot.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <div className="grow" />
            <button
              onClick={refresh}
              className="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Refresh
            </button>
            {hasOverrides && (
              <button
                onClick={handleClearAll}
                className="rounded bg-red-100 px-3 py-1 text-sm text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
              >
                Clear All Overrides
              </button>
            )}
          </div>
        </div>

        {/* Flags Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Flag Key
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Local Override
                </th>
              </tr>
            </thead>
            <tbody>
              {ALL_FEATURE_FLAGS.map((flagKey) => (
                <FlagRow
                  key={flagKey}
                  flagKey={flagKey}
                  isEnabled={isEnabled(flagKey)}
                  isKilled={isKilled(flagKey)}
                  source={getSource(flagKey)}
                  localOverride={localOverrides.flags[flagKey]}
                  onOverrideChange={(value) => handleOverrideChange(flagKey, value)}
                  onClearOverride={() => handleClearOverride(flagKey)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Usage Hints */}
        <div className="mt-8 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <h2 className="text-sm font-medium text-blue-800 dark:text-blue-300">💡 Quick Tips</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-700 dark:text-blue-400">
            <li>Local overrides persist in localStorage and survive page reloads</li>
            <li>
              Use URL params for temporary overrides:{" "}
              <code className="rounded bg-blue-100 px-1 dark:bg-blue-800">?ff_new_dashboard=1</code>
            </li>
            <li>
              Kill switches (prefixed with <code>kill_</code>) have highest precedence
            </li>
            <li>This page is only accessible in development mode</li>
          </ul>
        </div>

        {/* Raw Snapshot (collapsible) */}
        <details className="mt-8">
          <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
            View Raw Snapshot (Debug)
          </summary>
          <pre className="mt-2 overflow-auto rounded-lg bg-gray-800 p-4 text-xs text-gray-300">
            {JSON.stringify(snapshot, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
