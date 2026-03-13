"use client";

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
  return (
    <button
      type="button"
      className="text-muted-foreground hover:text-foreground inline-flex shrink-0 cursor-pointer items-center rounded p-0.5 transition-colors"
      title={label}
      aria-label={label}
      onClick={() => copyToClipboard(text)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="h-3.5 w-3.5"
        aria-hidden="true"
      >
        <path d="M4 2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z" />
      </svg>
    </button>
  );
}
