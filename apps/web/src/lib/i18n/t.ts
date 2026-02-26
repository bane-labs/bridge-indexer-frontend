/**
 * Translation Function
 *
 * Minimal t() function for i18n-ready string lookups.
 * Currently returns English strings; will support locale selection in the future.
 *
 * Usage:
 * ```ts
 * import { t } from "@/lib/i18n";
 *
 * t("errors.generic"); // "Something went wrong"
 * t("common.tryAgain"); // "Try again"
 * ```
 */

import { en } from "./strings/en";

/**
 * Type-safe path accessor for nested objects.
 */
type NestedKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}` | `${K}.${NestedKeyOf<T[K]>}`
          : `${K}`
        : never;
    }[keyof T]
  : never;

/**
 * Valid string paths for the translation function.
 */
export type TranslationKey = NestedKeyOf<typeof en>;

/**
 * Get a nested value from an object by dot-separated path.
 */
function getNestedValue(obj: unknown, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  if (typeof current === "string") {
    return current;
  }

  return undefined;
}

/**
 * Translate a string key to its localized value.
 *
 * @param key - Dot-separated path to the string (e.g., "errors.generic")
 * @param fallback - Optional fallback string if key is not found
 * @returns The translated string or fallback
 *
 * @example
 * ```ts
 * t("errors.generic"); // "Something went wrong"
 * t("errors.unknown", "Unknown error"); // "Unknown error" (fallback)
 * ```
 */
export function t(key: TranslationKey, fallback?: string): string {
  const value = getNestedValue(en, key);

  if (value !== undefined) {
    return value;
  }

  return fallback ?? key;
}

/**
 * Translate with placeholder replacement.
 *
 * @param key - Dot-separated path to the string
 * @param replacements - Object with placeholder values
 * @returns The translated string with placeholders replaced
 *
 * @example
 * ```ts
 * // Assuming "greeting": "Hello, {name}!"
 * tReplace("greeting", { name: "World" }); // "Hello, World!"
 * ```
 */
export function tReplace(
  key: TranslationKey,
  replacements: Record<string, string | number>
): string {
  let value = t(key);

  for (const [placeholder, replacement] of Object.entries(replacements)) {
    value = value.replaceAll(`{${placeholder}}`, String(replacement));
  }

  return value;
}

/**
 * Check if a translation key exists.
 *
 * @param key - Dot-separated path to check
 * @returns True if the key exists
 */
export function hasTranslation(key: string): boolean {
  return getNestedValue(en, key) !== undefined;
}
