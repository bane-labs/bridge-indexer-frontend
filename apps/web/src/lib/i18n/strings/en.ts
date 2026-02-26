/**
 * English Strings
 *
 * All user-facing strings for the English locale.
 * Organized by domain for easy maintenance.
 *
 * Conventions:
 * - Use sentence case for descriptions
 * - Use title case for headings
 * - Keep strings concise
 * - Use placeholders like {name} for dynamic values
 */

export const en = {
  /**
   * Common strings used across the application.
   */
  common: {
    loading: "Loading",
    loadingWithEllipsis: "Loading...",
    tryAgain: "Try again",
    dismiss: "Dismiss",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    submit: "Submit",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    previous: "Previous",
    close: "Close",
    search: "Search",
    filter: "Filter",
    refresh: "Refresh",
    viewAll: "View all",
    learnMore: "Learn more",
    goBack: "Go back",
    goHome: "Go home",
  },

  /**
   * Error-related strings.
   */
  errors: {
    generic: "Something went wrong",
    genericDescription: "An unexpected error occurred. Please try again.",
    notFound: "Not Found",
    notFoundDescription: "The page you're looking for doesn't exist.",
    networkError: "Connection Error",
    networkErrorDescription: "Unable to connect to the server. Please check your connection.",
    unauthorized: "Unauthorized",
    unauthorizedDescription: "You don't have permission to access this resource.",
    forbidden: "Access Denied",
    forbiddenDescription: "You don't have permission to perform this action.",
    serverError: "Server Error",
    serverErrorDescription: "Something went wrong on our end. Please try again later.",
    validationError: "Validation Error",
    validationErrorDescription: "Please check your input and try again.",
    timeout: "Request Timeout",
    timeoutDescription: "The request took too long. Please try again.",
    referenceId: "Reference ID",
    contactSupport: "If the problem persists, contact support with this reference ID.",
  },

  /**
   * Navigation-related strings.
   */
  nav: {
    home: "Home",
    dashboard: "Dashboard",
    settings: "Settings",
    profile: "Profile",
    projects: "Projects",
    admin: "Admin",
    breadcrumb: "Breadcrumb",
    mainNavigation: "Main navigation",
    userMenu: "User menu",
  },

  /**
   * Empty state strings.
   */
  empty: {
    noData: "No data",
    noDataDescription: "There's nothing to show here yet.",
    noResults: "No results",
    noResultsDescription: "Try adjusting your search or filters.",
    noItems: "No items",
    noItemsDescription: "Get started by creating your first item.",
  },

  /**
   * Notification strings.
   */
  notifications: {
    success: "Success",
    error: "Error",
    warning: "Warning",
    info: "Information",
    saved: "Changes saved successfully",
    deleted: "Item deleted successfully",
    created: "Item created successfully",
    updated: "Item updated successfully",
    errorOccurred: "An error occurred",
  },

  /**
   * Form-related strings.
   */
  forms: {
    required: "This field is required",
    invalid: "Invalid input",
    tooShort: "Input is too short",
    tooLong: "Input is too long",
    invalidEmail: "Invalid email address",
    invalidUrl: "Invalid URL",
    invalidNumber: "Invalid number",
    invalidDate: "Invalid date",
  },
} as const;

/**
 * Type helper for string paths.
 * Enables autocomplete for t() function.
 */
export type StringPath = keyof typeof en | `${keyof typeof en}.${string}`;
