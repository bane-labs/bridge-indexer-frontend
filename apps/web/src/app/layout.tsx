import "@atlas/ui/globals.css";

import { GoogleAnalytics } from "@next/third-parties/google";
import { Geist, Geist_Mono } from "next/font/google";

import { GlobalErrorHandler } from "@/components/SentryErrorBoundary";
import { SiteFooter, SiteHeader } from "@/components/layout";
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
  title: {
    default: "Bridge Indexer",
    template: "%s | Bridge Indexer",
  },
  description: "Real-time operator monitoring dashboard for Neo N3 ↔ Neo X bridge instances.",
  authors: [{ name: "AxLabs", url: "https://axlabs.com" }],
  creator: "AxLabs",
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var key = "theme-preference";
                  var stored = localStorage.getItem(key);
                  var preference = (stored === "light" || stored === "dark" || stored === "system") ? stored : "system";
                  var theme = preference;
                  if (preference === "system") {
                    theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                  }
                  if (theme === "dark") {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {clientEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={clientEnv.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <MainProvider>
          <GlobalErrorHandler />
          <div className="bg-background flex min-h-screen flex-col dark:bg-[#131313]">
            <SiteHeader />
            {children}
            <SiteFooter />
          </div>
        </MainProvider>
      </body>
    </html>
  );
}
