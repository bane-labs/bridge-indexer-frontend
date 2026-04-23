/**
 * Google Analytics Adapter
 *
 * Implements the Analytics interface for Google Analytics 4 (GA4).
 * Uses the gtag.js pattern via next/script for optimal loading.
 * Only active when NEXT_PUBLIC_GA_MEASUREMENT_ID is configured.
 *
 * @module analytics/adapters/ga
 *
 * @example
 * ```typescript
 * import { createGAAdapter, GAScript } from "@/lib/analytics/adapters/ga";
 *
 * // In layout or providers:
 * <GAScript measurementId="G-XXXXXXXXXX" />
 *
 * // Create adapter:
 * const adapter = createGAAdapter({
 *   measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!,
 * });
 * ```
 */

"use client";

import Script from "next/script";

import type {
  Analytics,
  AnalyticsEventMap,
  AnalyticsEventName,
  PageProps,
  UserTraits,
} from "../types";

// Extend window to include gtag
declare global {
  interface Window {
    dataLayer?: Object[];
    gtag: (...args: unknown[]) => void;
  }
}

/**
 * GA adapter configuration.
 */
export interface GAAdapterConfig {
  /** GA4 Measurement ID (G-XXXXXXXXXX) */
  measurementId: string;
  /** Enable debug mode */
  debug?: boolean;
  /** Initial consent state */
  consentGranted?: boolean;
}

/**
 * Google Analytics Adapter.
 *
 * Wraps the gtag.js API to conform to the Atlas Analytics interface.
 */
class GAAdapter implements Analytics {
  private measurementId: string;
  private consentGranted: boolean;
  private debug: boolean;

  constructor(config: GAAdapterConfig) {
    this.measurementId = config.measurementId;
    this.consentGranted = config.consentGranted ?? false;
    this.debug = config.debug ?? false;

    // Set initial consent state
    this.initializeConsent();
  }

  private initializeConsent(): void {
    // SSR guard
    if (typeof window === "undefined") return;

    // Initialize dataLayer if not present
    window.dataLayer = window.dataLayer || [];

    // Create gtag function if not present
    if (typeof window.gtag !== "function") {
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args);
      };
    }

    // Set initial consent mode
    this.updateConsent();
  }

  private updateConsent(): void {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;

    window.gtag("consent", "update", {
      analytics_storage: this.consentGranted ? "granted" : "denied",
      ad_storage: "denied", // Always deny ad storage for privacy
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }

  private gtag(...args: unknown[]): void {
    if (typeof window === "undefined") return;

    if (typeof window.gtag === "function") {
      window.gtag(...args);
    } else if (this.debug) {
      // eslint-disable-next-line no-console
      console.warn("[analytics:ga] gtag not available, event queued:", args);
      // Queue in dataLayer for when gtag loads
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(args);
    }
  }

  track<E extends AnalyticsEventName>(event: E, props: AnalyticsEventMap[E]): void {
    if (!this.consentGranted) return;

    try {
      // Convert event name to GA4 format (replace dots with underscores)
      const gaEventName = event.replace(/\./g, "_");

      this.gtag("event", gaEventName, {
        ...props,
        send_to: this.measurementId,
      });

      if (this.debug) {
        // eslint-disable-next-line no-console
        console.debug("[analytics:ga] track", gaEventName, props);
      }
    } catch (error) {
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.error("[analytics:ga] track error:", error);
      }
    }
  }

  page(name?: string, props?: PageProps): void {
    if (!this.consentGranted) return;

    try {
      this.gtag("event", "page_view", {
        page_title: props?.title ?? document.title,
        page_location: props?.url ?? window.location.href,
        page_path: props?.path ?? window.location.pathname,
        page_referrer: props?.referrer ?? document.referrer,
        page_name: name,
        send_to: this.measurementId,
      });

      if (this.debug) {
        // eslint-disable-next-line no-console
        console.debug("[analytics:ga] page", name, props);
      }
    } catch (error) {
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.error("[analytics:ga] page error:", error);
      }
    }
  }

  identify(userId: string, traits?: UserTraits): void {
    try {
      // Set user ID for GA4
      this.gtag("set", { user_id: userId });

      // Set user properties
      if (traits) {
        const userProperties: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(traits)) {
          // GA4 user properties must be strings or numbers
          if (typeof value === "string" || typeof value === "number") {
            userProperties[key] = value;
          }
        }
        this.gtag("set", "user_properties", userProperties);
      }

      if (this.debug) {
        // eslint-disable-next-line no-console
        console.debug("[analytics:ga] identify", userId, traits);
      }
    } catch (error) {
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.error("[analytics:ga] identify error:", error);
      }
    }
  }

  reset(): void {
    try {
      // Clear user ID
      this.gtag("set", { user_id: null });

      if (this.debug) {
        // eslint-disable-next-line no-console
        console.debug("[analytics:ga] reset");
      }
    } catch (error) {
      if (this.debug) {
        // eslint-disable-next-line no-console
        console.error("[analytics:ga] reset error:", error);
      }
    }
  }

  setConsent(granted: boolean): void {
    this.consentGranted = granted;
    this.updateConsent();

    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug("[analytics:ga] setConsent", granted);
    }
  }

  isEnabled(): boolean {
    return this.consentGranted;
  }
}

/**
 * Create a Google Analytics adapter.
 *
 * @param config - GA configuration
 * @returns Analytics adapter instance
 *
 * @example
 * ```typescript
 * const adapter = createGAAdapter({
 *   measurementId: "G-XXXXXXXXXX",
 *   debug: process.env.NODE_ENV === "development",
 * });
 * ```
 */
export function createGAAdapter(config: GAAdapterConfig): Analytics {
  return new GAAdapter(config);
}

/**
 * Check if GA is configured via environment variables.
 */
export function isGAConfigured(): boolean {
  // SSR guard
  if (typeof window === "undefined") {
    return false;
  }

  const measurementId =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID : undefined;

  return Boolean(measurementId);
}

/**
 * Props for the GA Script component.
 */
interface GAScriptProps {
  /** GA4 Measurement ID */
  measurementId: string;
  /** Enable debug mode */
  debug?: boolean;
}

/**
 * Google Analytics Script Component.
 *
 * Injects the gtag.js script using next/script for optimal loading.
 * Should be placed in the app layout or providers.
 *
 * @example
 * ```tsx
 * import { GAScript } from "@/lib/analytics/adapters/ga";
 *
 * export default function Layout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <GAScript measurementId="G-XXXXXXXXXX" />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function GAScript({ measurementId, debug }: GAScriptProps) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        onLoad={() => {
          if (debug) {
            // eslint-disable-next-line no-console
            console.debug("[analytics:ga] gtag.js loaded");
          }
        }}
      />
      <Script
        id="ga-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Default consent to denied (will be updated by adapter)
            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
            });
            
            gtag('config', '${measurementId}', {
              send_page_view: false,
              debug_mode: ${debug ? "true" : "false"}
            });
          `,
        }}
      />
    </>
  );
}
