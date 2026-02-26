/**
 * i18n Module
 *
 * Minimal i18n-ready infrastructure for future localization support.
 *
 * Usage:
 * ```ts
 * import { t, tReplace, hasTranslation } from "@/lib/i18n";
 *
 * t("errors.generic"); // "Something went wrong"
 * tReplace("greeting", { name: "World" }); // "Hello, World!"
 * hasTranslation("errors.generic"); // true
 * ```
 *
 * Adding a new locale:
 * 1. Create `strings/<locale>.ts` (e.g., `strings/es.ts`)
 * 2. Add the locale to `types.ts` (Locale type and AVAILABLE_LOCALES)
 * 3. Update `t.ts` to select strings based on current locale
 */

// Types
export type { Locale } from "./types";
export { AVAILABLE_LOCALES, DEFAULT_LOCALE, LOCALE_NAMES } from "./types";

// Strings (for direct access if needed)
export { en } from "./strings/en";

// Translation functions
export type { TranslationKey } from "./t";
export { hasTranslation, t, tReplace } from "./t";
