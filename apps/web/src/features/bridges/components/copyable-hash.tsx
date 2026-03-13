"use client";

import { copyToClipboard } from "../lib/bridge-comparison";
import { shortenHash } from "../lib/formatters";

interface CopyableHashProps {
  hash: string;
}

export function CopyableHash({ hash }: CopyableHashProps) {
  return (
    <button
      type="button"
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-mono text-sm tabular-nums transition-colors"
      title={`${hash}\nClick to copy`}
      onClick={() => copyToClipboard(hash)}
    >
      {shortenHash(hash)}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="h-3 w-3 shrink-0 opacity-50"
        aria-hidden="true"
      >
        <path d="M4 2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z" />
      </svg>
    </button>
  );
}
