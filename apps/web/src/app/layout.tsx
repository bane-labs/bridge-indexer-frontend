import "@atlas/ui/globals.css";

import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@atlas/ui";

import { GlobalErrorHandler } from "@/components/SentryErrorBoundary";
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
        <MainProvider>
          <GlobalErrorHandler />
          {children}
          <Toaster />
        </MainProvider>
      </body>
    </html>
  );
}
