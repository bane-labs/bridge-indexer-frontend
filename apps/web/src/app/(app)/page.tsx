/**
 * App Section Home
 *
 * This page is shown when navigating to the (app) route group root.
 * Redirects to dashboard or shows a landing page.
 */

import { redirect } from "next/navigation";

export default function AppHomePage() {
  // Redirect to dashboard by default
  redirect("/dashboard");
}
