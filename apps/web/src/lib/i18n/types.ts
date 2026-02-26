/**
 * i18n Type Definitions
 *
 * Minimal i18n-ready types for future localization support.
 * Currently supports English only; add new locales as needed.
 */

/**
 * Supported locales.
 * Add new locales here as they become available.
 */
export type Locale = "en";

/**
 * Default locale used when no locale is specified.
 */
export const DEFAULT_LOCALE: Locale = "en";

/**
 * Available locales for locale selection UI.
 */
export const AVAILABLE_LOCALES: readonly Locale[] = ["en"] as const;

/**
 * Locale display names for UI.
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
} as const;
