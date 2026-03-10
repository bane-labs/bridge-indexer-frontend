import type { DirectionalBridgeStatus } from "../types/bridge";

/**
 * Mock directional bridge statuses for the dashboard.
 * Covers native, message, and multiple token bridges in both directions
 * with a mix of sync states.
 */
export const MOCK_BRIDGE_STATUSES: DirectionalBridgeStatus[] = [
  // ─── Native Bridge ──────────────────────────────────────
  {
    id: "native-n3-to-x",
    bridgeFamily: "native",
    sourceChain: "neo_n3",
    destinationChain: "neo_x",
    source: {
      nonce: 14_832,
      root: "0xa3f1c9e7d4b82056fa9301ee2c4d8b76a1f3e5d9",
      blockNumber: 8_421_093,
      updatedAt: "2026-03-10T14:32:10Z",
    },
    destination: {
      nonce: 14_832,
      root: "0xa3f1c9e7d4b82056fa9301ee2c4d8b76a1f3e5d9",
      blockNumber: 2_104_887,
      updatedAt: "2026-03-10T14:32:15Z",
    },
    syncStatus: "synced",
    isStale: false,
    lastUpdatedAt: "2026-03-10T14:32:15Z",
  },
  {
    id: "native-x-to-n3",
    bridgeFamily: "native",
    sourceChain: "neo_x",
    destinationChain: "neo_n3",
    source: {
      nonce: 11_205,
      root: "0xb7e4a2d6c93f10584e8b2a61d0c7f39e5b4a81d2",
      blockNumber: 2_104_880,
      updatedAt: "2026-03-10T14:31:58Z",
    },
    destination: {
      nonce: 11_205,
      root: "0xb7e4a2d6c93f10584e8b2a61d0c7f39e5b4a81d2",
      blockNumber: 8_421_090,
      updatedAt: "2026-03-10T14:32:02Z",
    },
    syncStatus: "synced",
    isStale: false,
    lastUpdatedAt: "2026-03-10T14:32:02Z",
  },

  // ─── Message Bridge ─────────────────────────────────────
  {
    id: "message-n3-to-x",
    bridgeFamily: "message",
    sourceChain: "neo_n3",
    destinationChain: "neo_x",
    source: {
      nonce: 6_419,
      root: "0xd2c8e1f47a5b930861e4d7c2a0f6b83e197d5c4a",
      blockNumber: 8_421_091,
      updatedAt: "2026-03-10T14:30:44Z",
    },
    destination: {
      nonce: 6_418,
      root: "0xc1a9d0e36b4a820750d3c6b1f9e5a72d086c4b39",
      blockNumber: 2_104_882,
      updatedAt: "2026-03-10T14:30:50Z",
    },
    syncStatus: "syncing",
    isStale: false,
    lastUpdatedAt: "2026-03-10T14:30:50Z",
  },
  {
    id: "message-x-to-n3",
    bridgeFamily: "message",
    sourceChain: "neo_x",
    destinationChain: "neo_n3",
    source: {
      nonce: 5_887,
      root: "0xe5f9a1b3c7d208463b1e0d4f6a8c25e3d7b9f0a1",
      blockNumber: 2_104_878,
      updatedAt: "2026-03-10T14:29:32Z",
    },
    destination: {
      nonce: 5_887,
      root: "0xe5f9a1b3c7d208463b1e0d4f6a8c25e3d7b9f0a1",
      blockNumber: 8_421_088,
      updatedAt: "2026-03-10T14:29:40Z",
    },
    syncStatus: "synced",
    isStale: false,
    lastUpdatedAt: "2026-03-10T14:29:40Z",
  },

  // ─── Token Bridge: NEO ──────────────────────────────────
  {
    id: "token-neo-n3-to-x",
    bridgeFamily: "token",
    tokenSymbol: "NEO",
    sourceChain: "neo_n3",
    destinationChain: "neo_x",
    source: {
      nonce: 3_210,
      root: "0xf4a7b38c1d6e0952a4c8d3f2b0e71a9c5d836f4e",
      blockNumber: 8_421_092,
      updatedAt: "2026-03-10T14:31:20Z",
    },
    destination: {
      nonce: 3_210,
      root: "0xf4a7b38c1d6e0952a4c8d3f2b0e71a9c5d836f4e",
      blockNumber: 2_104_885,
      updatedAt: "2026-03-10T14:31:28Z",
    },
    syncStatus: "synced",
    isStale: false,
    lastUpdatedAt: "2026-03-10T14:31:28Z",
  },
  {
    id: "token-neo-x-to-n3",
    bridgeFamily: "token",
    tokenSymbol: "NEO",
    sourceChain: "neo_x",
    destinationChain: "neo_n3",
    source: {
      nonce: 2_987,
      root: "0xa1c3d5e7f90b2d4e6a8c0f2e4d6b8a1c3e5f7d9b",
      blockNumber: 2_104_883,
      updatedAt: "2026-03-10T14:31:05Z",
    },
    destination: {
      nonce: 2_987,
      root: "0xa1c3d5e7f90b2d4e6a8c0f2e4d6b8a1c3e5f7d9b",
      blockNumber: 8_421_089,
      updatedAt: "2026-03-10T14:31:12Z",
    },
    syncStatus: "synced",
    isStale: false,
    lastUpdatedAt: "2026-03-10T14:31:12Z",
  },

  // ─── Token Bridge: GAS ──────────────────────────────────
  {
    id: "token-gas-n3-to-x",
    bridgeFamily: "token",
    tokenSymbol: "GAS",
    sourceChain: "neo_n3",
    destinationChain: "neo_x",
    source: {
      nonce: 8_741,
      root: "0xc2d4e6f8a0b1c3d5e7f9a1b3c5d7e9f0a2b4c6d8",
      blockNumber: 8_421_090,
      updatedAt: "2026-03-10T14:28:55Z",
    },
    destination: {
      nonce: 8_736,
      root: "0xb1c3d5e7f9a0b2c4d6e8f0a1b3c5d7e9f2a4b6c8",
      blockNumber: 2_104_879,
      updatedAt: "2026-03-10T14:28:48Z",
    },
    syncStatus: "out_of_sync",
    isStale: false,
    lastUpdatedAt: "2026-03-10T14:28:55Z",
  },
  {
    id: "token-gas-x-to-n3",
    bridgeFamily: "token",
    tokenSymbol: "GAS",
    sourceChain: "neo_x",
    destinationChain: "neo_n3",
    source: {
      nonce: 7_553,
      root: "0xd3e5f7a9b1c3d5e7f9a0b2c4d6e8f1a3b5c7d9e0",
      blockNumber: 2_104_877,
      updatedAt: "2026-03-10T14:27:30Z",
    },
    destination: {
      nonce: 7_553,
      root: "0xd3e5f7a9b1c3d5e7f9a0b2c4d6e8f1a3b5c7d9e0",
      blockNumber: 8_421_086,
      updatedAt: "2026-03-10T14:27:38Z",
    },
    syncStatus: "synced",
    isStale: false,
    lastUpdatedAt: "2026-03-10T14:27:38Z",
  },

  // ─── Token Bridge: bNEO ─────────────────────────────────
  {
    id: "token-bneo-n3-to-x",
    bridgeFamily: "token",
    tokenSymbol: "bNEO",
    sourceChain: "neo_n3",
    destinationChain: "neo_x",
    source: {
      nonce: 1_456,
      root: "0xe4f6a8b0c2d4e6f8a1b3c5d7e9f0a2b4c6d8e0f2",
      blockNumber: 8_421_085,
      updatedAt: "2026-03-10T14:10:00Z",
    },
    destination: {
      nonce: 1_448,
      root: "0xd5e7f9a1b3c5d7e9f0a2b4c6d8e0f1a3b5c7d9e2",
      blockNumber: 2_104_870,
      updatedAt: "2026-03-10T14:08:22Z",
    },
    syncStatus: "stale",
    isStale: true,
    lastUpdatedAt: "2026-03-10T14:10:00Z",
  },
  {
    id: "token-bneo-x-to-n3",
    bridgeFamily: "token",
    tokenSymbol: "bNEO",
    sourceChain: "neo_x",
    destinationChain: "neo_n3",
    source: {
      nonce: 1_102,
      root: "0xf5a7b9c1d3e5f7a9b0c2d4e6f8a1b3c5d7e9f0a2",
      blockNumber: 2_104_868,
      updatedAt: "2026-03-10T14:25:10Z",
    },
    destination: {
      nonce: 1_101,
      root: "0xe6f8a0b2c4d6e8f0a1b3c5d7e9f2a4b6c8d0e1f3",
      blockNumber: 8_421_083,
      updatedAt: "2026-03-10T14:25:18Z",
    },
    syncStatus: "syncing",
    isStale: false,
    lastUpdatedAt: "2026-03-10T14:25:18Z",
  },

  // ─── Token Bridge: fUSDT ────────────────────────────────
  {
    id: "token-fusdt-n3-to-x",
    bridgeFamily: "token",
    tokenSymbol: "fUSDT",
    sourceChain: "neo_n3",
    destinationChain: "neo_x",
    source: {
      nonce: 22_019,
      root: "0xa6b8c0d2e4f6a8b1c3d5e7f9a0b2c4d6e8f0a1b3",
      blockNumber: 8_421_093,
      updatedAt: "2026-03-10T14:32:05Z",
    },
    destination: {
      nonce: 22_019,
      root: "0xa6b8c0d2e4f6a8b1c3d5e7f9a0b2c4d6e8f0a1b3",
      blockNumber: 2_104_886,
      updatedAt: "2026-03-10T14:32:12Z",
    },
    syncStatus: "synced",
    isStale: false,
    lastUpdatedAt: "2026-03-10T14:32:12Z",
  },
  {
    id: "token-fusdt-x-to-n3",
    bridgeFamily: "token",
    tokenSymbol: "fUSDT",
    sourceChain: "neo_x",
    destinationChain: "neo_n3",
    source: {
      nonce: 19_844,
      root: "0xb7c9d1e3f5a7b9c0d2e4f6a8b1c3d5e7f9a0b2c4",
      blockNumber: 2_104_884,
      updatedAt: "2026-03-10T14:31:50Z",
    },
    destination: {
      nonce: 19_844,
      root: "0xb7c9d1e3f5a7b9c0d2e4f6a8b1c3d5e7f9a0b2c4",
      blockNumber: 8_421_091,
      updatedAt: "2026-03-10T14:31:55Z",
    },
    syncStatus: "synced",
    isStale: false,
    lastUpdatedAt: "2026-03-10T14:31:55Z",
  },
];
