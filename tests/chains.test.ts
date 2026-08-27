import assert from "node:assert/strict";
import test from "node:test";
import { CHAINS, getChain } from "../src/chains.ts";

test("defines unique network identifiers and EVM chain ids", () => {
  const chains = Object.values(CHAINS);
  assert.equal(new Set(chains.map((chain) => chain.id)).size, chains.length);
  const evm = chains.filter((chain) => chain.family === "evm");
  assert.equal(new Set(evm.map((chain) => chain.chainId)).size, evm.length);
});

test("builds network-specific explorer links", () => {
  assert.match(CHAINS.avalancheFuji.explorerTransactionUrl("0xabc"), /snowtrace/);
  assert.match(CHAINS.baseSepolia.explorerTransactionUrl("0xabc"), /basescan/);
  assert.match(CHAINS.solanaDevnet.explorerTransactionUrl("sig"), /cluster=devnet/);
});

test("rejects unsupported networks", () => {
  assert.throws(() => getChain("made-up-chain"), /Unsupported/);
});

