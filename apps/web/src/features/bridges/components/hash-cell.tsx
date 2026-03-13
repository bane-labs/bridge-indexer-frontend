import { shortenRoot } from "../lib/bridge-history-formatters";

import { CopyButton } from "./copy-button";

interface HashCellProps {
  /** The full hash value. */
  hash: string;
}

/**
 * Table cell content for root/hash values.
 * Shows a shortened hash with a copy button.
 */
export function HashCell({ hash }: HashCellProps) {
  return (
    <span className="inline-flex items-center gap-1">
      <code className="text-muted-foreground font-mono text-sm tabular-nums" title={hash}>
        {shortenRoot(hash)}
      </code>
      <CopyButton text={hash} label={`Copy root ${hash.slice(0, 10)}…`} />
    </span>
  );
}
