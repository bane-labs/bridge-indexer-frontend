"use client";

import { WebVitalsReporter } from "@/components/WebVitalsReporter";
import { FeatureFlagsProvider } from "@/lib/feature-flags";

import { AnalyticsProvider } from "./analytics-provider";
import { ReactQueryProvider } from "./react-query-provider";
import { ThemeProvider } from "./theme-provider";
import { ToasterProvider } from "./toaster-provider";

import type React from "react";

interface MainProviderProps {
  children: React.ReactNode;
}

export function MainProvider({ children }: MainProviderProps) {
  return (
    <FeatureFlagsProvider>
      <ThemeProvider>
        <ReactQueryProvider>
          <ToasterProvider>
            <AnalyticsProvider>
              <WebVitalsReporter />
              {children}
            </AnalyticsProvider>
          </ToasterProvider>
        </ReactQueryProvider>
      </ThemeProvider>
    </FeatureFlagsProvider>
  );
}
