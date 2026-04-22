"use client";

import { useState } from "react";

import { notify } from "@/lib/notifications";

import { copyToClipboard } from "../lib/bridge-comparison";

interface CopyButtonProps {
  /** The text to copy to clipboard. */
  text: string;
  /** Accessible label for the button. */
  label?: string;
}

/**
 * A small icon button that copies `text` to the clipboard.
 * Renders inline next to hash/root values.
 */
export function CopyButton({ text, label = "Copy to clipboard" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      notify.success("Copied to clipboard", { duration: 2000 });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      className="text-muted-foreground hover:text-foreground inline-flex shrink-0 cursor-pointer items-center rounded p-0.5 transition-colors"
      title={label}
      aria-label={label}
      onClick={handleClick}
    >
      {copied ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-3.5 w-3.5 text-emerald-500"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M4 2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z" />
        </svg>
      )}
    </button>
  );
}
