import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Bridge Indexer",
  description: "Privacy policy and data handling disclosures for the Bridge Indexer.",
  robots: "index, follow",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      {/* ── Page heading ── */}
      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">Privacy Policy</h1>
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
            1. About Bridge Indexer
          </h2>
          <p>
            Bridge Indexer is a read-only operator monitoring dashboard for the Neo N3 ↔ Neo X
            bridge infrastructure. It is developed and maintained by{" "}
            <a
              href="https://axlabs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-800 underline underline-offset-2 transition hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
            >
              AxLabs
            </a>{" "}
            and{" "}
            <a
              href="https://github.com/bane-labs"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-800 underline underline-offset-2 transition hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
            >
              BaneLabs
            </a>
            . The dashboard only reads and displays publicly available on-chain data — it never
            executes transactions or holds custody of any assets.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            2. Information We Collect
          </h2>
          <p className="mb-3">
            Bridge Indexer is designed to minimise data collection. No account or sign-up is
            required to use the dashboard.
          </p>
          <h3 className="mb-2 font-semibold text-zinc-800 dark:text-zinc-200">
            2a. Automatically collected data
          </h3>
          <ul className="mb-3 list-inside list-disc space-y-1">
            <li>
              <strong>Performance telemetry (Web Vitals):</strong> anonymised page-load metrics
              (e.g. LCP, CLS, TTFB) are collected to help us monitor application health. These
              contain no personally identifiable information (PII) — query strings and fragments are
              stripped from route paths before transmission.
            </li>
            <li>
              <strong>Error and crash reports:</strong> we use{" "}
              <a
                href="https://sentry.io"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                Sentry
              </a>{" "}
              to capture unhandled exceptions. Sentry may collect browser type, OS, and stack
              traces, and is configured to avoid capturing PII.
            </li>
            <li>
              <strong>Usage analytics:</strong> we use Google Analytics 4 to understand how
              operators interact with the dashboard — for example, which pages are most visited.
              Analytics are only collected with your consent.
            </li>
          </ul>
          <h3 className="mb-2 font-semibold text-zinc-800 dark:text-zinc-200">
            2b. Blockchain and bridge data
          </h3>
          <p>
            Bridge Indexer reads publicly available on-chain data from the Neo N3 and Neo X
            networks, including transaction hashes, block heights, and bridge event logs. This data
            is already publicly visible on both blockchains and is not personal data. We do not
            associate it with individual users of the dashboard.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            3. How We Use Information
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>To monitor and improve application performance and reliability.</li>
            <li>To diagnose and fix bugs reported via error-monitoring tooling.</li>
            <li>To understand how operators use the dashboard and prioritise improvements.</li>
            <li>We do not sell, rent, or share your data with third parties for marketing.</li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            4. Third-Party Services
          </h2>
          <p className="mb-3">
            Bridge Indexer integrates the following third-party services that may process data
            according to their own privacy policies:
          </p>
          <ul className="list-inside list-disc space-y-2">
            <li>
              <strong>Sentry</strong> — error monitoring. See{" "}
              <a
                href="https://sentry.io/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                sentry.io/privacy
              </a>
              .
            </li>
            <li>
              <strong>Google Analytics 4</strong> — usage analytics (consent required). See{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                policies.google.com/privacy
              </a>
              .
            </li>
            <li>
              <strong>Neo N3 / Neo X RPC providers</strong> — the indexer backend fetches blockchain
              data from Neo network RPC nodes, which operate under their own terms.
            </li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            5. Cookies and Local Storage
          </h2>
          <p>
            Bridge Indexer uses browser local storage only to preserve UI preferences (e.g.
            dark/light theme). Analytics cookies are only set after you accept them via your
            browser. No advertising or tracking cookies are set. See our{" "}
            <a href="/cookies" className="underline underline-offset-2">
              Cookie Policy
            </a>{" "}
            for a full list.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            6. Blockchain Transparency
          </h2>
          <p>
            All bridge transaction data displayed in Bridge Indexer is sourced from the public Neo
            N3 and Neo X blockchains. This data is permanently and publicly visible on-chain by
            design. Bridge Indexer has no ability to hide, modify, or delete on-chain records.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            7. Data Retention
          </h2>
          <p>
            We do not operate a user database. Telemetry and error-report data retained by Sentry
            and Google Analytics is subject to their respective retention policies. We do not
            independently store records linked to individual dashboard users.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            8. Your Rights
          </h2>
          <p>
            Because we do not hold personal data on our own infrastructure, most data-subject
            requests (access, deletion, portability) must be directed to the relevant third-party
            processors listed above. For questions about data processed by AxLabs or BaneLabs,
            contact us at the address below.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            9. Disclaimer of Warranties and Limitation of Liability
          </h2>
          <p className="mb-3">
            Bridge Indexer is provided as a monitoring tool only. To the maximum extent permitted by
            applicable law:
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              The service is provided <strong>&ldquo;as is&rdquo;</strong> without warranties of any
              kind, express or implied, including but not limited to warranties of merchantability,
              fitness for a particular purpose, or non-infringement.
            </li>
            <li>
              Bridge data displayed may be delayed, incomplete, or inaccurate. Do not rely solely on
              this dashboard for operational decisions.
            </li>
            <li>
              AxLabs, BaneLabs, and their contributors shall not be liable for any direct, indirect,
              incidental, special, consequential, or exemplary damages arising from your use of, or
              inability to use, the service.
            </li>
          </ul>
        </section>

        {/* 10 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            10. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Material changes will be reflected
            with an updated &ldquo;Last updated&rdquo; date at the top of this page. Continued use
            of Bridge Indexer after any changes constitutes your acceptance of the updated policy.
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            11. Contact
          </h2>
          <p>
            For privacy-related enquiries, please email us at{" "}
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
