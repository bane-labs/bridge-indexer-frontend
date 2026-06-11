"use client";

import Image from "next/image";

import { ThemeToggle } from "@atlas/ui";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-[#0a0a0a]">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Neo logo + wordmark + pipe + tagline */}
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-3">
            {/* Neo logo: dark version shown in light mode, light version in dark mode */}
            <Image
              src="/images/neo_color_dark.png"
              alt="Neo"
              width={80}
              height={28}
              className="h-7 w-auto shrink-0 dark:hidden"
              priority
            />
            <Image
              src="/images/neo_color_light.png"
              alt="Neo"
              width={80}
              height={28}
              className="hidden h-7 w-auto shrink-0 dark:block"
              priority
            />
            <div aria-hidden="true" className="h-5 w-px bg-zinc-300 dark:bg-zinc-700" />
            <div>
              <p className="text-sm leading-tight font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
                Bridge Indexer
              </p>
              <p className="hidden text-xs leading-tight text-zinc-500 sm:block dark:text-zinc-400">
                Neo N3 ↔ Neo X bridge monitoring
              </p>
            </div>
          </a>
        </div>

        {/* Right: theme toggle */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
