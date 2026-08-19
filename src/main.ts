import "./style.css";
import {
  createCredentialPayload,
  encodeCredentialMemo,
} from "./credential.ts";
import {
  anchorCredential,
  DEVNET_RPC,
  getWallet,
  verifyCredential,
} from "./solana.ts";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("App root not found.");

app.innerHTML = `
  <header class="nav">
    <a href="#top" class="brand">BLACKCHAIN <span>PROOF</span></a>
    <div class="network"><i></i> SOLANA DEVNET</div>
  </header>
  <main id="top">
    <section class="hero">
      <p class="eyebrow">Open-source credential infrastructure</p>
      <h1>Proof belongs<br>to the <span>builder.</span></h1>
      <p class="lede">Anchor privacy-preserving proof of demonstrated Solana skills. No names, emails, grades, or private evidence are written on-chain.</p>
      <div class="hero-actions">
        <button id="connect-wallet" class="button primary">Connect Devnet wallet</button>
        <a href="#verify" class="button secondary">Verify a credential</a>
      </div>
      <p id="wallet-status" class="status">Wallet disconnected</p>
    </section>

    <section class="principles" aria-label="Protocol principles">
      <div><strong>01</strong><span>Open source</span></div>
      <div><strong>02</strong><span>Privacy first</span></div>
      <div><strong>03</strong><span>Issuer signed</span></div>
      <div><strong>04</strong><span>Publicly verifiable</span></div>
    </section>

    <section class="workspace">
      <div class="section-heading">
        <p class="eyebrow">Issuer console</p>
        <h2>Anchor demonstrated work.</h2>
        <p>The prototype hashes private evidence locally and writes only the credential commitment, skill, and issuance time to Solana Devnet.</p>
      </div>
      <form id="issue-form" class="panel">
        <label>Skill demonstrated<input name="skill" required minlength="3" maxlength="80" placeholder="Solana transaction fundamentals"></label>
        <label>Private evidence URL<input name="evidenceUrl" required type="url" placeholder="https://private.example/evidence"></label>
        <label>Learner-held secret<input name="learnerSecret" required type="password" autocomplete="off" placeholder="Never written on-chain"></label>
        <label class="consent"><input name="confirm" required type="checkbox"><span>I reviewed the evidence and confirm that no personal information will be included in the public skill field.</span></label>
        <button class="button primary" type="submit">Create Devnet proof</button>
        <div id="issue-status" class="form-status" aria-live="polite"></div>
      </form>
    </section>

    <section id="verify" class="workspace verify-section">
      <div class="section-heading">
        <p class="eyebrow">Public verifier</p>
        <h2>Trust the chain, then inspect the claim.</h2>
        <p>Paste a Solana Devnet transaction signature. The verifier confirms the transaction, issuer signer, protocol payload, and on-chain slot.</p>
      </div>
      <form id="verify-form" class="panel">
        <label>Devnet transaction signature<textarea name="signature" required rows="4" placeholder="Paste transaction signature"></textarea></label>
        <button class="button primary" type="submit">Verify proof</button>
        <div id="verify-status" class="form-status" aria-live="polite"></div>
      </form>
    </section>

    <section class="truth">
      <p class="eyebrow">Prototype boundary</p>
      <h2>Built to prove the mechanism.</h2>
      <p>This Devnet release uses Solana's Memo program as a transparent credential commitment. Production work will add issuer governance, revocation indexing, sponsored fees, recovery, accessibility testing, and an audited credential program or Token-2022 implementation.</p>
      <p class="rpc">RPC: ${DEVNET_RPC}</p>
    </section>
  </main>
  <footer><span>Project lead: Vincent Owens</span><span>MIT licensed public good</span><span>BlackChain Collective · 2026</span></footer>
`;

const connectButton = document.querySelector<HTMLButtonElement>("#connect-wallet")!;
const walletStatus = document.querySelector<HTMLParagraphElement>("#wallet-status")!;
const issueForm = document.querySelector<HTMLFormElement>("#issue-form")!;
const issueStatus = document.querySelector<HTMLDivElement>("#issue-status")!;
const verifyForm = document.querySelector<HTMLFormElement>("#verify-form")!;
const verifyStatus = document.querySelector<HTMLDivElement>("#verify-status")!;

connectButton.addEventListener("click", async () => {
  try {
    const wallet = getWallet();
    const { publicKey } = await wallet.connect();
    walletStatus.textContent = `Connected issuer: ${publicKey.toBase58()}`;
    connectButton.textContent = "Wallet connected";
  } catch (error) {
    walletStatus.textContent = error instanceof Error ? error.message : "Wallet connection failed.";
  }
});

issueForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  issueStatus.className = "form-status working";
  issueStatus.textContent = "Building the privacy-preserving commitment…";
  try {
    const wallet = getWallet();
    const { publicKey } = await wallet.connect();
    const formData = new FormData(issueForm);
    const payload = await createCredentialPayload({
      skill: String(formData.get("skill") || ""),
      evidenceUrl: String(formData.get("evidenceUrl") || ""),
      learnerSecret: String(formData.get("learnerSecret") || ""),
    });
    issueStatus.textContent = "Approve the Devnet transaction in your wallet…";
    const signature = await anchorCredential(encodeCredentialMemo(payload), publicKey);
    issueStatus.className = "form-status success";
    issueStatus.innerHTML = `<strong>Credential anchored.</strong><span>Credential ID: ${payload.credentialId}</span><span>Signature: ${signature}</span><a href="https://explorer.solana.com/tx/${signature}?cluster=devnet" target="_blank" rel="noreferrer">Open in Solana Explorer ↗</a>`;
    const signatureField = verifyForm.elements.namedItem("signature") as HTMLTextAreaElement;
    signatureField.value = signature;
  } catch (error) {
    issueStatus.className = "form-status error";
    issueStatus.textContent = error instanceof Error ? error.message : "Credential issuance failed.";
  }
});

verifyForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  verifyStatus.className = "form-status working";
  verifyStatus.textContent = "Reading Solana Devnet…";
  try {
    const formData = new FormData(verifyForm);
    const result = await verifyCredential(String(formData.get("signature") || ""));
    verifyStatus.className = "form-status success verified-card";
    verifyStatus.innerHTML = `<strong>✓ Valid BlackChain Proof</strong><dl><dt>Skill</dt><dd>${escapeHtml(result.payload.skill)}</dd><dt>Issuer</dt><dd>${result.issuer}</dd><dt>Credential ID</dt><dd>${result.payload.credentialId}</dd><dt>Issued</dt><dd>${result.payload.issuedAt}</dd><dt>Devnet slot</dt><dd>${result.slot}</dd></dl>`;
  } catch (error) {
    verifyStatus.className = "form-status error";
    verifyStatus.textContent = error instanceof Error ? error.message : "Verification failed.";
  }
});

function escapeHtml(value: string): string {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}
