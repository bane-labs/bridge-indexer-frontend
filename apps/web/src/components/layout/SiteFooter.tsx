export function SiteFooter() {
  return (
    <footer className="w-full border-t border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-[#0a0a0a]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
              Bridge Indexer
            </p>
            <p className="max-w-sm text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Real-time monitoring dashboard for Neo N3 ↔ Neo X bridge instances.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-200/60 pt-6 sm:flex-row dark:border-zinc-800/60">
          <p className="text-center text-xs text-zinc-500 sm:text-left dark:text-zinc-400">
            &copy; {new Date().getFullYear()} Bridge Indexer &mdash; developed and maintained by{" "}
            <a
              href="https://axlabs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-zinc-700 underline underline-offset-2 transition hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
            >
              AxLabs
            </a>{" "}
            and{" "}
            <a
              href="https://github.com/bane-labs"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-zinc-700 underline underline-offset-2 transition hover:text-zinc-900 dark:text-zinc-200 dark:hover:text-white"
            >
              BaneLabs
            </a>
          </p>
          <div className="flex items-center gap-5 text-xs text-zinc-500 dark:text-zinc-400">
            <a href="/terms" className="transition hover:text-zinc-700 dark:hover:text-zinc-300">
              Terms of Service
            </a>
            <a href="/privacy" className="transition hover:text-zinc-700 dark:hover:text-zinc-300">
              Privacy Policy
            </a>
            <a href="/cookies" className="transition hover:text-zinc-700 dark:hover:text-zinc-300">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
