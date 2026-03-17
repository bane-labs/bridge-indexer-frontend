const TOKEN_CONTRACT_SYMBOLS: Record<string, string> = {
  // Add known contract-to-symbol mappings here when available.
};

/**
 * Resolve token symbol from contract address with a deterministic fallback.
 */
export function resolveTokenSymbol(tokenContract?: string): string | undefined {
  if (!tokenContract) {
    return undefined;
  }

  const normalized = tokenContract.toLowerCase();
  if (TOKEN_CONTRACT_SYMBOLS[normalized]) {
    return TOKEN_CONTRACT_SYMBOLS[normalized];
  }

  const compact = normalized.startsWith("0x") ? normalized.slice(2) : normalized;
  return compact.slice(0, 6).toUpperCase();
}
