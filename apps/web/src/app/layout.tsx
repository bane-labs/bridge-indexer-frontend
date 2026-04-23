import "@atlas/ui/globals.css";

import { GoogleAnalytics } from "@next/third-parties/google";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";

import { GlobalErrorHandler } from "@/components/SentryErrorBoundary";
import { clientEnv } from "@/env";
import { MainProvider } from "@/providers";

import type { Metadata } from "next";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Frontend Platform",
  description: "Enterprise frontend platform built with Next.js",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {clientEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={clientEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <MainProvider>
          <GlobalErrorHandler />
          <div className="flex min-h-screen flex-col">
            <header className="border-border border-b px-4 py-4 sm:px-6 lg:px-8">
              <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
                <Image
                  src="/images/neo_color_dark.png"
                  alt="Neo"
                  width={120}
                  height={40}
                  className="h-10 w-auto shrink-0"
                  priority
                />
                <div>
                  <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                    Bridge Indexer
                  </h1>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Operator dashboard — Neo N3 ↔ Neo X bridge instances
                  </p>
                </div>
              </div>
            </header>
            {children}
            <footer className="border-border border-t py-4 text-center text-sm">
              <p className="text-muted-foreground">
                Copyright &copy;{" "}
                <a
                  href="https://github.com/bane-labs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline"
                >
                  Bane Labs
                </a>
                , developed and maintained by{" "}
                <a
                  href="https://axlabs.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline"
                >
                  AxLabs
                </a>
              </p>
            </footer>
          </div>
        </MainProvider>
      </body>
    </html>
  );
}
