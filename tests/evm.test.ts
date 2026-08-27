import assert from "node:assert/strict";
import test from "node:test";
import { getChain } from "../src/chains.ts";
import {
  anchorEvmCredential,
  discoverEvmWallet,
  EVM_ATTESTATION_SINK,
  hexToUtf8,
  utf8ToHex,
} from "../src/evm.ts";

test("round trips a UTF-8 BlackChain Proof memo through EVM calldata", () => {
  const memo = 'BCP1:{"v":1,"action":"issue","skill":"Avalanche fundamentals"}';
  assert.equal(hexToUtf8(utf8ToHex(memo)), memo);
});

test("rejects malformed transaction data", () => {
  assert.throws(() => hexToUtf8("0xabc"), /valid hexadecimal/);
  assert.throws(() => hexToUtf8("0xzz"), /valid hexadecimal/);
});

test("anchors EVM credentials with zero value at the fixed attestation sink", async () => {
  let transaction: Record<string, string> | undefined;
  const provider = {
    async request({ method, params }: { method: string; params?: unknown[] | object }) {
      if (method === "wallet_switchEthereumChain") return null;
      if (method === "eth_requestAccounts") return ["0x1111111111111111111111111111111111111111"];
      if (method === "eth_sendTransaction") {
        transaction = (params as Array<Record<string, string>>)[0];
        return "0xtransaction";
      }
      throw new Error(`Unexpected method: ${method}`);
    },
  };

  const hash = await anchorEvmCredential("BCP1:{}", getChain("avalancheFuji"), provider);
  assert.equal(hash, "0xtransaction");
  assert.equal(transaction?.to, EVM_ATTESTATION_SINK);
  assert.equal(transaction?.value, "0x0");
});

test("wallet discovery fails closed outside a browser", async () => {
  await assert.rejects(discoverEvmWallet(), /requires a browser/);
});
