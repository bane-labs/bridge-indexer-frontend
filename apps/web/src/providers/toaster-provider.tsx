"use client";

import { Toaster } from "sonner";

import type React from "react";

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
}
