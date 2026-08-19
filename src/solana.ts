import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  type ParsedTransactionWithMeta,
} from "@solana/web3.js";
import { Buffer } from "buffer";
import { decodeCredentialMemo, type CredentialPayload } from "./credential.ts";

export const DEVNET_RPC =
  import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl("devnet");
export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);

export interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: PublicKey;
  connect(): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  signAndSendTransaction(
    transaction: Transaction,
  ): Promise<{ signature: string }>;
}

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

export const connection = new Connection(DEVNET_RPC, "confirmed");

export function getWallet(): PhantomProvider {
  if (!window.solana?.isPhantom) {
    throw new Error("A Phantom wallet is required for this Devnet prototype.");
  }
  return window.solana;
}

export async function anchorCredential(
  memo: string,
  issuer: PublicKey,
): Promise<string> {
  const wallet = getWallet();
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");
  const transaction = new Transaction({
    feePayer: issuer,
    blockhash,
    lastValidBlockHeight,
  }).add(
    new TransactionInstruction({
      keys: [],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memo, "utf8"),
    }),
  );
  const { signature } = await wallet.signAndSendTransaction(transaction);
  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed",
  );
  return signature;
}

function findMemo(transaction: ParsedTransactionWithMeta): string | null {
  for (const instruction of transaction.transaction.message.instructions) {
    if ("parsed" in instruction) {
      const parsed = instruction.parsed as unknown;
      if (typeof parsed === "string" && parsed.startsWith("BCP1:")) {
        return parsed;
      }
    }
  }
  return null;
}

export async function verifyCredential(signature: string): Promise<{
  payload: CredentialPayload;
  issuer: string;
  slot: number;
  confirmedAt: string | null;
}> {
  const transaction = await connection.getParsedTransaction(signature.trim(), {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  });
  if (!transaction) {
    throw new Error("Transaction was not found on Solana Devnet.");
  }
  if (transaction.meta?.err) {
    throw new Error("The transaction failed and does not prove a credential.");
  }
  const memo = findMemo(transaction);
  if (!memo) {
    throw new Error("No BlackChain Proof credential memo was found.");
  }
  const issuer = transaction.transaction.message.accountKeys.find(
    (account) => account.signer,
  )?.pubkey;
  if (!issuer) {
    throw new Error("Credential issuer signature is missing.");
  }
  return {
    payload: decodeCredentialMemo(memo),
    issuer: issuer.toBase58(),
    slot: transaction.slot,
    confirmedAt: transaction.blockTime
      ? new Date(transaction.blockTime * 1000).toISOString()
      : null,
  };
}
