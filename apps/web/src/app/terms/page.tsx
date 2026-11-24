import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Bridge Indexer",
  description: "Terms of service governing your use of the Bridge Indexer dashboard.",
  robots: "index, follow",
};

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
      {/* ── DISCLAIMER — prominently visible ── */}
      <div
        role="alert"
        className="mb-10 rounded-2xl border-2 border-amber-400 bg-amber-50 px-6 py-5 dark:border-amber-500/60 dark:bg-amber-950/30"
      >
        <p className="text-base font-bold tracking-wide text-amber-700 uppercase dark:text-amber-400">
          ⚠ No Data Accuracy Guarantees
        </p>
        <p className="mt-2 text-sm leading-relaxed text-amber-700 dark:text-amber-300">
          <strong>
            Bridge Indexer is provided &ldquo;as is&rdquo; without any warranty of accuracy,
            completeness, or fitness for a particular purpose.
          </strong>{" "}
          Bridge data is sourced from public blockchain nodes and may be delayed, incomplete, or
          temporarily unavailable. This dashboard is a monitoring aid only — it is not an
          authoritative source of truth for bridge operations.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-amber-700 dark:text-amber-300">
          <strong>By using this product you acknowledge and accept that:</strong>
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-amber-700 dark:text-amber-300">
          <li>Displayed bridge data may not reflect the real-time state of the blockchain.</li>
          <li>Indexer nodes may experience delays, gaps, or synchronisation issues.</li>
          <li>AxLabs and BaneLabs bear no liability for decisions made based on this data.</li>
          <li>
            Always verify critical bridge state directly on-chain or through your own node
            infrastructure.
          </li>
        </ul>
      </div>

      {/* ── Page heading ── */}
      <h1 className="mb-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">Terms of Service</h1>
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
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using Bridge Indexer (the &ldquo;Service&rdquo;), you agree to be bound
            by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, you
            must not use the Service. These Terms constitute a legally binding agreement between you
            and AxLabs GmbH (&ldquo;AxLabs&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;).
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            2. Description of Service
          </h2>
          <p className="mb-3">
            Bridge Indexer is a read-only web dashboard that indexes and displays publicly available
            data from the Neo N3 ↔ Neo X bridge infrastructure. The Service:
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              Provides a monitoring interface for bridge instance health, sync status, and
              transaction history sourced from public blockchain nodes.
            </li>
            <li>
              Does not execute, initiate, or relay any blockchain transactions on your behalf.
            </li>
            <li>Does not hold, control, or have access to any digital assets at any time.</li>
            <li>
              Is provided as a convenience tool only; operators should maintain independent access
              to their own node infrastructure for authoritative data.
            </li>
          </ul>
        </section>

        {/* 3 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            3. Eligibility and Permitted Use
          </h2>
          <p className="mb-3">By using the Service you represent and warrant that:</p>
          <ul className="list-inside list-disc space-y-1">
            <li>You are at least 18 years of age or the age of majority in your jurisdiction.</li>
            <li>Your use of the Service complies with all applicable laws and regulations.</li>
            <li>
              You will not use the Service for any unlawful purpose or in a way that violates these
              Terms.
            </li>
            <li>You will not attempt to scrape, overload, or abuse the Service infrastructure.</li>
          </ul>
        </section>

        {/* 4 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            4. Data Accuracy and Limitations
          </h2>
          <p className="mb-3">
            Bridge Indexer aggregates data from public blockchain nodes and indexer services. You
            acknowledge and accept that:
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              <strong>Data may be delayed or incomplete.</strong> Indexer synchronisation lags, RPC
              node outages, or network congestion can cause stale or missing data.
            </li>
            <li>
              <strong>Data is not guaranteed to be accurate.</strong> Always verify critical bridge
              state directly on-chain through your own infrastructure.
            </li>
            <li>
              <strong>The Service may be unavailable.</strong> Planned and unplanned maintenance may
              interrupt access without prior notice.
            </li>
            <li>
              You are solely responsible for any decisions or actions you take based on data
              displayed in this dashboard.
            </li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            5. Blockchain and Protocol Risks
          </h2>
          <p className="mb-3">
            Blockchain infrastructure involves inherent risks outside the control of AxLabs or
            BaneLabs, including but not limited to:
          </p>
          <ul className="list-inside list-disc space-y-2">
            <li>
              <strong>Network and protocol risk:</strong> Neo N3 and Neo X are independent
              blockchain networks whose operation depends on third parties and network participants.
              Network outages, forks, or protocol changes may affect bridge functionality and the
              data displayed by this Service.
            </li>
            <li>
              <strong>Smart contract risk:</strong> Bridge smart contracts deployed on-chain may
              contain bugs or vulnerabilities. The Service only displays data from these contracts
              and takes no responsibility for their behaviour.
            </li>
            <li>
              <strong>Infrastructure dependency risk:</strong> The Service relies on third-party RPC
              endpoints and indexer nodes. Their availability or integrity cannot be guaranteed.
            </li>
          </ul>
        </section>

        {/* 6 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            6. No Financial or Operational Advice
          </h2>
          <p>
            Nothing in the Service or these Terms constitutes financial, investment, legal, or
            operational advice. Bridge Indexer is a monitoring aid. You should independently verify
            all bridge state and consult qualified professionals before making any operational or
            financial decisions. AxLabs is not a broker, dealer, financial adviser, or investment
            adviser.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            7. Intellectual Property
          </h2>
          <p>
            The Bridge Indexer web interface, including its source code, design, and documentation,
            is open source and available on{" "}
            <a
              href="https://github.com/bane-labs"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              GitHub
            </a>
            . Use of the source code is governed by the applicable open-source licence in that
            repository. AxLabs and BaneLabs retain all rights to their respective branding and
            trademarks.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            8. Disclaimer of Warranties
          </h2>
          <p className="mb-3">
            To the maximum extent permitted by applicable law, the Service is provided{" "}
            <strong>&ldquo;as is&rdquo;</strong> and <strong>&ldquo;as available&rdquo;</strong>{" "}
            without warranties of any kind, whether express, implied, or statutory, including but
            not limited to:
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>Warranties of merchantability or fitness for a particular purpose.</li>
            <li>Warranties of non-infringement.</li>
            <li>Warranties that the Service will be uninterrupted, error-free, or secure.</li>
            <li>Warranties that the data displayed will be accurate, complete, or up to date.</li>
          </ul>
        </section>

        {/* 9 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            9. Limitation of Liability
          </h2>
          <p className="mb-3">
            To the maximum extent permitted by applicable law, in no event shall AxLabs, BaneLabs,
            their affiliates, officers, directors, employees, contractors, or contributors be liable
            for:
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              Any indirect, incidental, special, consequential, exemplary, or punitive damages.
            </li>
            <li>Loss of profits, revenue, data, goodwill, or other intangible losses.</li>
            <li>
              Any operational losses arising from reliance on inaccurate or delayed bridge data.
            </li>
            <li>
              Any damages arising from your reliance on information obtained through the Service.
            </li>
          </ul>
          <p className="mt-3">
            These limitations apply regardless of the legal theory under which such liability is
            asserted, even if AxLabs or BaneLabs has been advised of the possibility of such
            damages.
          </p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            10. Indemnification
          </h2>
          <p>
            You agree to indemnify, defend, and hold harmless AxLabs, BaneLabs, and their
            affiliates, officers, directors, employees, and contributors from and against any
            claims, liabilities, damages, losses, and expenses (including reasonable legal fees)
            arising out of or in any way connected with your access to or use of the Service, your
            violation of these Terms, or your violation of any applicable law or regulation.
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            11. Third-Party Links and Services
          </h2>
          <p>
            The Service may contain links to third-party websites, block explorers, or external
            services. AxLabs has no control over, and assumes no responsibility for, the content,
            privacy policies, or practices of any third-party sites or services. You access them at
            your own risk.
          </p>
        </section>

        {/* 12 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            12. Modifications to the Service and Terms
          </h2>
          <p>
            AxLabs reserves the right to modify, suspend, or discontinue the Service at any time
            without notice or liability. We may also revise these Terms at any time by updating this
            page. Continued use of the Service after any changes constitutes your acceptance of the
            revised Terms. It is your responsibility to review these Terms periodically.
          </p>
        </section>

        {/* 13 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            13. Governing Law
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of
            Switzerland, without regard to its conflict-of-law principles. Any disputes arising
            under these Terms shall be subject to the exclusive jurisdiction of the courts located
            in Switzerland, unless prohibited by applicable law in your jurisdiction.
          </p>
        </section>

        {/* 14 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            14. Severability
          </h2>
          <p>
            If any provision of these Terms is found to be invalid or unenforceable under applicable
            law, that provision shall be modified to the minimum extent necessary to make it
            enforceable, and the remaining provisions shall continue in full force and effect.
          </p>
        </section>

        {/* 15 */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            15. Contact
          </h2>
          <p>
            Questions about these Terms may be directed to{" "}
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
