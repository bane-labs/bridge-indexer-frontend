/**
 * Notifications Module
 *
 * Global notification system for consistent user feedback.
 *
 * Usage:
 * ```ts
 * import { notify, notifyApiError } from "@/lib/notifications";
 *
 * // Simple notifications
 * notify.success("Changes saved!");
 * notify.error("Something went wrong");
 * notify.info("New update available");
 * notify.warning("Session expires soon");
 *
 * // API error handling
 * try {
 *   await api.updateUser(data);
 * } catch (err) {
 *   notifyApiError(err);
 * }
 *
 * // Promise tracking
 * notify.promise(saveData(), {
 *   loading: "Saving...",
 *   success: "Saved!",
 *   error: "Failed to save",
 * });
 * ```
 */

export type { NotifyOptions } from "./notify";
export { notify, notifyApiError } from "./notify";
