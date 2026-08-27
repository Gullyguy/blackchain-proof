import { decodeCredentialMemo, type CredentialPayload } from "./credential.ts";
import type { ChainDefinition } from "./chains.ts";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

interface EvmTransaction {
  from?: string;
  to?: string;
  input?: string;
  data?: string;
  blockNumber?: string;
}

export function utf8ToHex(value: string): `0x${string}` {
  return `0x${Array.from(textEncoder.encode(value), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("")}`;
}

export function hexToUtf8(value: string): string {
  const clean = value.startsWith("0x") ? value.slice(2) : value;
  if (clean.length % 2 !== 0 || !/^[0-9a-f]*$/i.test(clean)) {
    throw new Error("Transaction data is not valid hexadecimal.");
  }
  const bytes = new Uint8Array(clean.match(/.{2}/g)?.map((byte) => parseInt(byte, 16)) ?? []);
  return textDecoder.decode(bytes);
}

export function getEvmWallet(): Eip1193Provider {
  if (!window.ethereum) {
    throw new Error("An EIP-1193 wallet such as MetaMask is required.");
  }
  return window.ethereum;
}

export async function switchEvmChain(
  provider: Eip1193Provider,
  chain: ChainDefinition,
): Promise<void> {
  if (!chain.chainId) throw new Error("The selected network is not EVM compatible.");
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chain.chainId }],
    });
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code !== 4902 || !chain.rpcUrls || !chain.nativeCurrency) throw error;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: chain.chainId,
          chainName: `${chain.name} ${chain.network}`,
          rpcUrls: [...chain.rpcUrls],
          nativeCurrency: chain.nativeCurrency,
        },
      ],
    });
  }
}

export async function connectEvmWallet(
  provider = getEvmWallet(),
): Promise<string> {
  const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
  if (!accounts[0]) throw new Error("The wallet did not return an account.");
  return accounts[0];
}

export async function anchorEvmCredential(
  memo: string,
  chain: ChainDefinition,
  provider = getEvmWallet(),
): Promise<string> {
  await switchEvmChain(provider, chain);
  const issuer = await connectEvmWallet(provider);
  return (await provider.request({
    method: "eth_sendTransaction",
    params: [{ from: issuer, to: issuer, value: "0x0", data: utf8ToHex(memo) }],
  })) as string;
}

export async function verifyEvmCredential(
  transactionHash: string,
  chain: ChainDefinition,
  provider = getEvmWallet(),
): Promise<{ payload: CredentialPayload; issuer: string; blockNumber: number }> {
  await switchEvmChain(provider, chain);
  const transaction = (await provider.request({
    method: "eth_getTransactionByHash",
    params: [transactionHash.trim()],
  })) as EvmTransaction | null;
  if (!transaction) throw new Error(`Transaction was not found on ${chain.name} ${chain.network}.`);
  if (!transaction.from) throw new Error("Credential issuer signature is missing.");
  if (!transaction.to || transaction.to.toLowerCase() !== transaction.from.toLowerCase()) {
    throw new Error("BlackChain Proof EVM credentials must be issuer self-attestations.");
  }
  const memo = hexToUtf8(transaction.input || transaction.data || "0x");
  return {
    payload: decodeCredentialMemo(memo),
    issuer: transaction.from,
    blockNumber: Number.parseInt(transaction.blockNumber || "0x0", 16),
  };
}

