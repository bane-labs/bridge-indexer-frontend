"use client";

/**
 * Web Vitals Reporter Component
 *
 * Client component that initializes Web Vitals reporting.
 * Should be mounted once in the app (e.g., in root layout or providers).
 */

import { useEffect } from "react";

import { initWebVitalsReporting } from "@/lib/telemetry";

/**
 * WebVitalsReporter component
 *
 * Initializes Web Vitals collection on mount.
 * Runs only once per page load.
 */
export function WebVitalsReporter() {
  useEffect(() => {
    // Initialize Web Vitals reporting
    initWebVitalsReporting();
  }, []); // Empty deps - run once on mount

  // This component renders nothing
  return null;
}
