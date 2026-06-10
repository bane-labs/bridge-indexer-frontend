import { resolveTokenSymbol } from "./bridge-operation-utils";

import type { BackendBridgeOperation, BackendDirectionalInstanceSync } from "../types/backend-api";

/** Normalize contract addresses for set membership checks. */
export function normalizeTokenContractAddress(addr?: string): string | null {
  if (!addr?.trim()) {
    return null;
  }
  const s = addr.trim().toLowerCase();
  return s.startsWith("0x") ? s : `0x${s}`;
}

/**
 * Resolve the display token ticker for a sync instance (destination-side symbol).
 */
export function resolvedSyncInstanceTokenSymbol(
  sync: BackendDirectionalInstanceSync
): string | undefined {
  if (sync.bridge_type !== "token") {
    return undefined;
  }
  return (
    sync.dst_token_symbol ??
    sync.src_token_symbol ??
    resolveTokenSymbol(sync.dst_token ?? undefined) ??
    resolveTokenSymbol(sync.src_token ?? undefined)
  );
}

/**
 * Collect normalized token contract addresses for a slug ticker using /sync/instances
 * (authoritative symbol ↔ contract mapping from the backend).
 */
export function collectTokenContractsForSymbol(
  instances: BackendDirectionalInstanceSync[],
  slugTokenSymbol: string
): Set<string> {
  const out = new Set<string>();
  const sym = slugTokenSymbol.toLowerCase();

  for (const sync of instances) {
    if (sync.bridge_type !== "token") {
      continue;
    }

    const instanceSym = resolvedSyncInstanceTokenSymbol(sync);
    if (instanceSym?.toLowerCase() !== sym) {
      continue;
    }

    for (const raw of [sync.src_token, sync.dst_token]) {
      const norm = normalizeTokenContractAddress(raw ?? undefined);
      if (norm) {
        out.add(norm);
      }
    }
  }

  return out;
}

/** Whether an operation belongs to the token bridge identified by slug ticker + contract set. */
export function operationMatchesTokenSlug(
  op: BackendBridgeOperation,
  slugTokenSymbol: string,
  contractsForSymbol: Set<string>
): boolean {
  if (op.bridge_type !== "token") {
    return true;
  }

  const sym = slugTokenSymbol.toLowerCase();

  if (op.token_symbol?.trim() && op.token_symbol.trim().toLowerCase() === sym) {
    return true;
  }

  if (contractsForSymbol.size > 0) {
    const src = normalizeTokenContractAddress(op.token_contract);
    const dst = normalizeTokenContractAddress(op.dest_token_contract);
    return (
      (src !== null && contractsForSymbol.has(src)) || (dst !== null && contractsForSymbol.has(dst))
    );
  }

  const resolved =
    resolveTokenSymbol(op.dest_token_contract) ?? resolveTokenSymbol(op.token_contract);
  return resolved?.toLowerCase() === sym;
}
