import "@atlas/ui/globals.css";

import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@atlas/ui";

import { GlobalErrorHandler } from "@/components/SentryErrorBoundary";
import { getNonce } from "@/lib/security/nonce";
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
  const nonce = await getNonce();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const key = "theme-preference";
                  const stored = localStorage.getItem(key);
                  const preference = (stored === "light" || stored === "dark" || stored === "system") ? stored : "system";
                  
                  let theme = preference;
                  if (preference === "system") {
                    theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
                  }
                  
                  if (theme === "dark") {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }
                } catch (e) {
                  // localStorage might be unavailable
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <MainProvider nonce={nonce}>
          <GlobalErrorHandler />
          {children}
          <Toaster />
        </MainProvider>
      </body>
    </html>
  );
}
