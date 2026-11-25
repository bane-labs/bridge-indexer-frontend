import { Card, CardContent } from "@atlas/ui";

import { getExplorerContractUrl } from "../lib/bridge-explorer-links";
import { getChainLabel } from "../lib/formatters";

import { CopyButton } from "./copy-button";

import type { ChainId } from "../types/bridge";

function TokenContract({ chain, value }: { chain: ChainId; value: string }) {
  const explorer = getExplorerContractUrl(chain, value);
  return (
    <div className="min-w-0 space-y-1">
      <h3 className="font-medium">{getChainLabel(chain)} token</h3>
      <div className="flex items-start gap-2">
        <span className="min-w-0 font-mono text-xs break-all">{value}</span>
        <CopyButton text={value} label={`Copy ${getChainLabel(chain)} token contract`} />
      </div>
      {explorer ? (
        <a
          href={explorer}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary text-xs underline-offset-4 hover:underline"
          aria-label={`View ${getChainLabel(chain)} token contract on explorer`}
        >
          Explorer ↗
        </a>
      ) : (
        <span className="text-muted-foreground text-xs">Explorer link unavailable</span>
      )}
    </div>
  );
}

/** Token-pair identity from the selected backend instance, not contract configuration. */
export function BridgeTokenPairIdentity({ tokenPairId }: { tokenPairId?: string }) {
  const [n3Token, xToken] = tokenPairId?.split(":") ?? [];
  return (
    <section aria-labelledby="token-pair-heading" className="mb-8 space-y-3">
      <h2 id="token-pair-heading" className="text-lg font-semibold">
        Token pair identity
      </h2>
      {n3Token && xToken ? (
        <Card>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <TokenContract chain="neo_n3" value={n3Token} />
            <TokenContract chain="neo_x" value={xToken} />
          </CardContent>
        </Card>
      ) : (
        <p className="text-muted-foreground text-sm">
          Exact token-pair identity unavailable for this selection.
        </p>
      )}
    </section>
  );
}
