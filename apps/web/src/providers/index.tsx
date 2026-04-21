"use client";

import { WebVitalsReporter } from "@/components/WebVitalsReporter";
import { FeatureFlagsProvider } from "@/lib/feature-flags";

import { AnalyticsProvider } from "./analytics-provider";
import { ReactQueryProvider } from "./react-query-provider";
import { ToasterProvider } from "./toaster-provider";

import type React from "react";

interface MainProviderProps {
  children: React.ReactNode;
}

export function MainProvider({ children }: MainProviderProps) {
  return (
    <FeatureFlagsProvider>
      <ReactQueryProvider>
        <ToasterProvider>
          <AnalyticsProvider>
            <WebVitalsReporter />
            {children}
          </AnalyticsProvider>
        </ToasterProvider>
      </ReactQueryProvider>
    </FeatureFlagsProvider>
  );
}
