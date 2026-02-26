/**
 * Global Notification System
 *
 * Provides a consistent API for showing notifications (toasts/banners) across the app.
 * Wraps the underlying toast library (sonner) to avoid vendor lock-in.
 *
 * Usage:
 * ```ts
 * import { notify, notifyApiError } from "@/lib/notifications";
 *
 * notify.success("Changes saved!");
 * notify.error("Something went wrong");
 * notifyApiError(error);
 * ```
 */

import { toast } from "sonner";

import { ApiError, getUserFacingMessage } from "@/lib/api";
import { t } from "@/lib/i18n";

/**
 * Notification options.
 */
export interface NotifyOptions {
  /**
   * Optional description text shown below the main message.
   */
  description?: string;

  /**
   * Duration in milliseconds. Default: 4000 for success/info, 6000 for errors.
   */
  duration?: number;

  /**
   * Action button configuration.
   */
  action?: {
    label: string;
    onClick: () => void;
  };

  /**
   * Whether the notification can be dismissed.
   * Default: true
   */
  dismissible?: boolean;

  /**
   * Unique ID to prevent duplicate notifications.
   */
  id?: string;
}

/**
 * Show a success notification.
 *
 * @param message - Main notification message
 * @param options - Additional options
 *
 * @example
 * ```ts
 * notify.success("Profile updated");
 * notify.success("File uploaded", { description: "image.png" });
 * ```
 */
function success(message: string, options?: NotifyOptions): void {
  toast.success(message, {
    description: options?.description,
    duration: options?.duration ?? 4000,
    dismissible: options?.dismissible ?? true,
    id: options?.id,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  });
}

/**
 * Show an error notification.
 *
 * @param message - Main error message
 * @param options - Additional options
 *
 * @example
 * ```ts
 * notify.error("Failed to save changes");
 * notify.error("Upload failed", { description: "File too large" });
 * ```
 */
function error(message: string, options?: NotifyOptions): void {
  toast.error(message, {
    description: options?.description,
    duration: options?.duration ?? 6000,
    dismissible: options?.dismissible ?? true,
    id: options?.id,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  });
}

/**
 * Show an info notification.
 *
 * @param message - Main notification message
 * @param options - Additional options
 *
 * @example
 * ```ts
 * notify.info("New version available");
 * ```
 */
function info(message: string, options?: NotifyOptions): void {
  toast.info(message, {
    description: options?.description,
    duration: options?.duration ?? 4000,
    dismissible: options?.dismissible ?? true,
    id: options?.id,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  });
}

/**
 * Show a warning notification.
 *
 * @param message - Main warning message
 * @param options - Additional options
 *
 * @example
 * ```ts
 * notify.warning("Your session will expire soon");
 * ```
 */
function warning(message: string, options?: NotifyOptions): void {
  toast.warning(message, {
    description: options?.description,
    duration: options?.duration ?? 5000,
    dismissible: options?.dismissible ?? true,
    id: options?.id,
    action: options?.action
      ? {
          label: options.action.label,
          onClick: options.action.onClick,
        }
      : undefined,
  });
}

/**
 * Show a loading notification that can be updated.
 *
 * @param message - Loading message
 * @returns Toast ID for updating/dismissing
 *
 * @example
 * ```ts
 * const id = notify.loading("Uploading...");
 * // Later:
 * notify.dismiss(id);
 * notify.success("Upload complete!");
 * ```
 */
function loading(message: string): string | number {
  return toast.loading(message);
}

/**
 * Dismiss a specific notification or all notifications.
 *
 * @param id - Optional notification ID. If not provided, dismisses all.
 */
function dismiss(id?: string | number): void {
  if (id !== undefined) {
    toast.dismiss(id);
  } else {
    toast.dismiss();
  }
}

/**
 * Show a promise-based notification.
 *
 * @param promise - Promise to track
 * @param messages - Messages for each state
 *
 * @example
 * ```ts
 * notify.promise(saveData(), {
 *   loading: "Saving...",
 *   success: "Saved!",
 *   error: "Failed to save",
 * });
 * ```
 */
function promise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  }
): Promise<T> {
  toast.promise(promise, messages);
  return promise;
}

/**
 * Unified notification API.
 */
export const notify = {
  success,
  error,
  info,
  warning,
  loading,
  dismiss,
  promise,
} as const;

/**
 * Notify user of an API error.
 *
 * Normalizes the error and shows a user-friendly message.
 * Includes correlation ID in description if available.
 *
 * @param err - The error to notify about
 * @param fallbackMessage - Optional fallback message
 *
 * @example
 * ```ts
 * try {
 *   await api.updateUser(data);
 * } catch (err) {
 *   notifyApiError(err);
 * }
 * ```
 */
export function notifyApiError(err: unknown, fallbackMessage?: string): void {
  const message = getUserFacingMessage(err) ?? fallbackMessage ?? t("errors.generic");

  let description: string | undefined;

  // Extract correlation ID if available
  if (err instanceof ApiError && err.shape.correlationId) {
    description = `${t("errors.referenceId")}: ${err.shape.correlationId}`;
  }

  error(message, { description });
}

export default notify;
