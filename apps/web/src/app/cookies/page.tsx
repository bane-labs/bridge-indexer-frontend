import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Bridge Indexer",
  description: "How Bridge Indexer uses cookies and how to manage your preferences.",
  robots: "index, follow",
};

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">Cookie Policy</h1>
      <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
        Last updated:{" "}
        {new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>

      <div className="space-y-10 text-sm leading-7 text-zinc-700 dark:text-zinc-300">
        {/* 1 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            1. What Are Cookies?
          </h2>
          <p>
            Cookies are small text files placed on your device by a website you visit. They are
            widely used to make websites work efficiently, remember your preferences, and provide
            information to site owners. Bridge Indexer uses a minimal set of cookies — only those
            necessary to operate the site or to analyse usage in aggregate with your consent.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            2. Cookies We Use
          </h2>

          {/* 2a - Analytics */}
          <h3 className="mb-3 font-semibold text-zinc-800 dark:text-zinc-200">
            2a. Analytics Cookies{" "}
            <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-700 uppercase dark:bg-amber-900/40 dark:text-amber-400">
              Consent required
            </span>
          </h3>
          <p className="mb-4">
            We use <strong>Google Analytics 4</strong> (via Google&rsquo;s{" "}
            <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">gtag.js</code>) to
            understand how operators interact with Bridge Indexer — for example, which pages are
            most visited. Analytics cookies are only active when the GA measurement ID is configured
            and your browser has not opted out.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="py-2 pr-4 text-left font-semibold text-zinc-800 dark:text-zinc-200">
                    Cookie
                  </th>
                  <th className="py-2 pr-4 text-left font-semibold text-zinc-800 dark:text-zinc-200">
                    Provider
                  </th>
                  <th className="py-2 pr-4 text-left font-semibold text-zinc-800 dark:text-zinc-200">
                    Duration
                  </th>
                  <th className="py-2 text-left font-semibold text-zinc-800 dark:text-zinc-200">
                    Purpose
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <tr>
                  <td className="py-2 pr-4 font-mono">_ga</td>
                  <td className="py-2 pr-4">Google Analytics</td>
                  <td className="py-2 pr-4 whitespace-nowrap">2 years</td>
                  <td className="py-2">
                    Distinguishes unique users by assigning a randomly generated client ID.
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono">_ga_*</td>
                  <td className="py-2 pr-4">Google Analytics</td>
                  <td className="py-2 pr-4 whitespace-nowrap">2 years</td>
                  <td className="py-2">
                    Persists GA4 session state. The suffix matches the GA4 Measurement ID.
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 font-mono">_gid</td>
                  <td className="py-2 pr-4">Google Analytics</td>
                  <td className="py-2 pr-4 whitespace-nowrap">24 hours</td>
                  <td className="py-2">
                    Distinguishes users within a single day — supplements{" "}
                    <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">_ga</code>.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
            Ad storage, ad personalisation, and ad user data are permanently denied. Google
            Analytics is used solely for aggregate usage metrics.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            3. Error Monitoring — Sentry
          </h2>
          <p className="mb-3">
            We use{" "}
            <a
              href="https://sentry.io"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Sentry
            </a>{" "}
            for error and crash monitoring. Sentry collects JavaScript stack traces and browser
            metadata to help us identify and fix bugs.
          </p>
          <p className="mb-3">
            Sentry operates primarily via in-memory state rather than persistent cookies. It does
            not set long-lived tracking cookies. Sentry is classified as a{" "}
            <strong>functional / necessary</strong> service because its purpose is to maintain
            application stability — not to track user behaviour for marketing. As such, it is active
            regardless of analytics consent.
          </p>
          <p>
            Sentry is configured to avoid capturing personally identifiable information. See{" "}
            <a
              href="https://sentry.io/privacy/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              Sentry&rsquo;s Privacy Policy
            </a>{" "}
            for further details.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            4. Local Storage
          </h2>
          <p className="mb-3">
            In addition to cookies, Bridge Indexer uses browser local storage, which is not
            technically a cookie but serves a similar function:
          </p>
          <ul className="list-inside list-disc space-y-2">
            <li>
              <strong>Theme preference</strong> (localStorage, key:{" "}
              <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">theme-preference</code>) —
              stores your light/dark/system mode choice. No expiry. Never transmitted to any server.
            </li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            5. Managing Your Preferences
          </h2>
          <p className="mb-3">You have several options for controlling cookies:</p>
          <ul className="list-inside list-disc space-y-2">
            <li>
              <strong>Browser settings:</strong> Most browsers let you block or delete cookies via
              their settings. Note that blocking certain cookies may affect site functionality.
            </li>
            <li>
              <strong>Google Analytics opt-out:</strong> Install the{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                Google Analytics opt-out browser add-on
              </a>{" "}
              to prevent GA from collecting data across all sites you visit.
            </li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            6. Changes to This Policy
          </h2>
          <p>
            We may update this Cookie Policy from time to time. Changes will be reflected with an
            updated &ldquo;Last updated&rdquo; date at the top of this page.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            7. Contact
          </h2>
          <p>
            For questions about our use of cookies, please email us at{" "}
            <a
              href="mailto:contact@axlabs.com"
              className="font-medium underline underline-offset-2"
            >
              contact@axlabs.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
