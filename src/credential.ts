export const PROTOCOL_PREFIX = "BCP1";
export const MAX_MEMO_BYTES = 566;

export type CredentialAction = "issue" | "revoke";

export interface CredentialPayload {
  v: 1;
  action: CredentialAction;
  credentialId: string;
  skill: string;
  evidenceHash: string;
  issuedAt: string;
}

export interface CredentialInput {
  skill: string;
  evidenceUrl: string;
  learnerSecret: string;
}

const encoder = new TextEncoder();

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export async function createCredentialPayload(
  input: CredentialInput,
  issuedAt = new Date().toISOString(),
): Promise<CredentialPayload> {
  const skill = normalize(input.skill);
  const evidenceUrl = normalize(input.evidenceUrl);
  const learnerSecret = normalize(input.learnerSecret);

  if (skill.length < 3 || skill.length > 80) {
    throw new Error("Skill must be between 3 and 80 characters.");
  }
  if (!learnerSecret) {
    throw new Error("A learner-held secret is required.");
  }

  const evidenceHash = await sha256Hex(evidenceUrl);
  const credentialId = await sha256Hex(
    `${PROTOCOL_PREFIX}|${learnerSecret}|${skill}|${evidenceHash}|${issuedAt}`,
  );

  return {
    v: 1,
    action: "issue",
    credentialId,
    skill,
    evidenceHash,
    issuedAt,
  };
}

export function encodeCredentialMemo(payload: CredentialPayload): string {
  const memo = `${PROTOCOL_PREFIX}:${JSON.stringify(payload)}`;
  if (encoder.encode(memo).length > MAX_MEMO_BYTES) {
    throw new Error("Credential payload exceeds the Solana memo size limit.");
  }
  return memo;
}

export function decodeCredentialMemo(memo: string): CredentialPayload {
  if (!memo.startsWith(`${PROTOCOL_PREFIX}:`)) {
    throw new Error("This transaction is not a BlackChain Proof credential.");
  }
  const payload = JSON.parse(memo.slice(PROTOCOL_PREFIX.length + 1)) as Partial<CredentialPayload>;
  if (
    payload.v !== 1 ||
    (payload.action !== "issue" && payload.action !== "revoke") ||
    typeof payload.credentialId !== "string" ||
    typeof payload.skill !== "string" ||
    typeof payload.evidenceHash !== "string" ||
    typeof payload.issuedAt !== "string"
  ) {
    throw new Error("Credential payload is malformed.");
  }
  return payload as CredentialPayload;
}
