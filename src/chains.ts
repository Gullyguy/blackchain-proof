export type ChainFamily = "solana" | "evm";

export interface ChainDefinition {
  id: string;
  family: ChainFamily;
  name: string;
  network: string;
  chainId?: `0x${string}`;
  rpcUrls?: readonly string[];
  explorerTransactionUrl: (transactionId: string) => string;
  nativeCurrency?: {
    name: string;
    symbol: string;
    decimals: 18;
  };
}

export const CHAINS = {
  solanaDevnet: {
    id: "solana-devnet",
    family: "solana",
    name: "Solana",
    network: "Devnet",
    explorerTransactionUrl: (signature: string) =>
      `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
  },
  avalancheFuji: {
    id: "avalanche-fuji",
    family: "evm",
    name: "Avalanche",
    network: "Fuji C-Chain",
    chainId: "0xa869",
    rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
    nativeCurrency: { name: "Avalanche", symbol: "AVAX", decimals: 18 },
    explorerTransactionUrl: (hash: string) =>
      `https://testnet.snowtrace.io/tx/${hash}`,
  },
  baseSepolia: {
    id: "base-sepolia",
    family: "evm",
    name: "Base",
    network: "Sepolia",
    chainId: "0x14a34",
    rpcUrls: ["https://sepolia.base.org"],
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    explorerTransactionUrl: (hash: string) =>
      `https://sepolia.basescan.org/tx/${hash}`,
  },
  arbitrumSepolia: {
    id: "arbitrum-sepolia",
    family: "evm",
    name: "Arbitrum",
    network: "Sepolia",
    chainId: "0x66eee",
    rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    explorerTransactionUrl: (hash: string) =>
      `https://sepolia.arbiscan.io/tx/${hash}`,
  },
  bnbTestnet: {
    id: "bnb-testnet",
    family: "evm",
    name: "BNB Chain",
    network: "Testnet",
    chainId: "0x61",
    rpcUrls: ["https://data-seed-prebsc-1-s1.bnbchain.org:8545"],
    nativeCurrency: { name: "BNB", symbol: "tBNB", decimals: 18 },
    explorerTransactionUrl: (hash: string) =>
      `https://testnet.bscscan.com/tx/${hash}`,
  },
  mantleSepolia: {
    id: "mantle-sepolia",
    family: "evm",
    name: "Mantle",
    network: "Sepolia",
    chainId: "0x138b",
    rpcUrls: ["https://rpc.sepolia.mantle.xyz"],
    nativeCurrency: { name: "Mantle", symbol: "MNT", decimals: 18 },
    explorerTransactionUrl: (hash: string) =>
      `https://sepolia.mantlescan.xyz/tx/${hash}`,
  },
  polygonAmoy: {
    id: "polygon-amoy",
    family: "evm",
    name: "Polygon",
    network: "Amoy",
    chainId: "0x13882",
    rpcUrls: ["https://rpc-amoy.polygon.technology"],
    nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
    explorerTransactionUrl: (hash: string) =>
      `https://amoy.polygonscan.com/tx/${hash}`,
  },
} as const satisfies Record<string, ChainDefinition>;

export type ChainKey = keyof typeof CHAINS;

export function getChain(key: string): ChainDefinition {
  const chain = CHAINS[key as ChainKey];
  if (!chain) throw new Error(`Unsupported BlackChain Proof network: ${key}`);
  return chain;
}

