import assert from "node:assert/strict";
import test from "node:test";
import { discoverEvmWallet, hexToUtf8, utf8ToHex } from "../src/evm.ts";

test("round trips a UTF-8 BlackChain Proof memo through EVM calldata", () => {
  const memo = 'BCP1:{"v":1,"action":"issue","skill":"Avalanche fundamentals"}';
  assert.equal(hexToUtf8(utf8ToHex(memo)), memo);
});

test("rejects malformed transaction data", () => {
  assert.throws(() => hexToUtf8("0xabc"), /valid hexadecimal/);
  assert.throws(() => hexToUtf8("0xzz"), /valid hexadecimal/);
});

test("wallet discovery fails closed outside a browser", async () => {
  await assert.rejects(discoverEvmWallet(), /requires a browser/);
});
