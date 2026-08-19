import assert from "node:assert/strict";
import test from "node:test";
import {
  createCredentialPayload,
  decodeCredentialMemo,
  encodeCredentialMemo,
} from "../src/credential.ts";

test("creates a deterministic credential payload for fixed inputs", async () => {
  const issuedAt = "2026-08-19T12:00:00.000Z";
  const input = {
    skill: "Solana transaction fundamentals",
    evidenceUrl: "https://example.org/private/evidence/123",
    learnerSecret: "learner-controlled-secret",
  };
  const first = await createCredentialPayload(input, issuedAt);
  const second = await createCredentialPayload(input, issuedAt);
  assert.deepEqual(first, second);
  assert.equal(first.credentialId.length, 64);
  assert.equal(first.evidenceHash.length, 64);
  assert.equal(JSON.stringify(first).includes(input.learnerSecret), false);
  assert.equal(JSON.stringify(first).includes(input.evidenceUrl), false);
});

test("round trips a valid protocol memo", async () => {
  const payload = await createCredentialPayload(
    {
      skill: "Solana transaction fundamentals",
      evidenceUrl: "https://example.org/private/evidence/123",
      learnerSecret: "learner-controlled-secret",
    },
    "2026-08-19T12:00:00.000Z",
  );
  assert.deepEqual(decodeCredentialMemo(encodeCredentialMemo(payload)), payload);
});

test("rejects non-protocol memos", () => {
  assert.throws(() => decodeCredentialMemo("hello world"), /not a BlackChain Proof/);
});
