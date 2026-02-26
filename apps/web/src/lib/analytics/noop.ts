/**
 * No-Op Analytics Implementation
 *
 * A safe default analytics adapter that does nothing.
 * Used when no analytics providers are configured.
 *
 * @module analytics/noop
 */

import type {
  Analytics,
  AnalyticsConfig,
  AnalyticsEventMap,
  AnalyticsEventName,
  PageProps,
  UserTraits,
} from "./types";

/**
 * NoopAnalytics - A no-operation analytics implementation.
 *
 * All methods are safe to call but do nothing.
 * This ensures the app never crashes due to missing analytics configuration.
 */
export class NoopAnalytics implements Analytics {
  private readonly debug: boolean;
  private enabled: boolean;

  constructor(config: AnalyticsConfig = {}) {
    this.debug = config.debug ?? false;
    this.enabled = config.enabled ?? false;
  }

  track<E extends AnalyticsEventName>(event: E, props: AnalyticsEventMap[E]): void {
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug("[analytics:noop] track", event, props);
    }
  }

  page(name?: string, props?: PageProps): void {
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug("[analytics:noop] page", name, props);
    }
  }

  identify(userId: string, traits?: UserTraits): void {
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug("[analytics:noop] identify", userId, traits);
    }
  }

  reset(): void {
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug("[analytics:noop] reset");
    }
  }

  setConsent(granted: boolean): void {
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.debug("[analytics:noop] setConsent", granted);
    }
    this.enabled = granted;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

/**
 * Singleton noop instance for default export.
 */
export const noopAnalytics = new NoopAnalytics();
