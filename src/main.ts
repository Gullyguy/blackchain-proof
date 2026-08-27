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
import { CHAINS, getChain } from "./chains.ts";
import {
  anchorEvmCredential,
  connectEvmWallet,
  getEvmWallet,
  switchEvmChain,
  verifyEvmCredential,
} from "./evm.ts";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("App root not found.");

app.innerHTML = `
  <header class="nav">
    <a href="#top" class="brand">BLACKCHAIN <span>PROOF</span></a>
    <div id="network-badge" class="network"><i></i> SOLANA DEVNET</div>
  </header>
  <main id="top">
    <section class="hero">
      <p class="eyebrow">Open-source credential infrastructure</p>
      <h1>Proof belongs<br>to the <span>builder.</span></h1>
      <p class="lede">Anchor privacy-preserving proof of demonstrated technical skills across public test networks. No names, emails, grades, or private evidence are written on-chain.</p>
      <div class="hero-actions">
        <button id="connect-wallet" class="button primary">Connect testnet wallet</button>
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
        <label>Proof network<select id="chain-select" name="chain">${Object.entries(CHAINS).map(([key, chain]) => `<option value="${key}">${chain.name} · ${chain.network}</option>`).join("")}</select></label>
        <label>Skill demonstrated<input name="skill" required minlength="3" maxlength="80" placeholder="Solana transaction fundamentals"></label>
        <label>Private evidence URL<input name="evidenceUrl" required type="url" placeholder="https://private.example/evidence"></label>
        <label>Learner-held secret<input name="learnerSecret" required type="password" autocomplete="off" placeholder="Never written on-chain"></label>
        <label class="consent"><input name="confirm" required type="checkbox"><span>I reviewed the evidence and confirm that no personal information will be included in the public skill field.</span></label>
        <button class="button primary" type="submit">Create testnet proof</button>
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
        <label>Transaction signature or hash<textarea name="signature" required rows="4" placeholder="Paste the selected network transaction ID"></textarea></label>
        <button class="button primary" type="submit">Verify proof</button>
        <div id="verify-status" class="form-status" aria-live="polite"></div>
      </form>
    </section>

    <section class="truth">
      <p class="eyebrow">Prototype boundary</p>
      <h2>Built to prove the mechanism.</h2>
      <p>This release uses Solana's Memo program on Devnet and issuer self-attestation calldata on supported EVM testnets. Production work will add issuer governance, revocation indexing, sponsored fees, recovery, accessibility testing, and audited chain-native registries.</p>
      <p class="rpc">RPC: ${DEVNET_RPC}</p>
    </section>
  </main>
  <footer><span>Project lead: Vincent Owens</span><span>MIT licensed public good</span><span>BlackChain Collective · 2026</span></footer>
`;

const connectButton = document.querySelector<HTMLButtonElement>("#connect-wallet")!;
const walletStatus = document.querySelector<HTMLParagraphElement>("#wallet-status")!;
const networkBadge = document.querySelector<HTMLDivElement>("#network-badge")!;
const chainSelect = document.querySelector<HTMLSelectElement>("#chain-select")!;
const issueForm = document.querySelector<HTMLFormElement>("#issue-form")!;
const issueStatus = document.querySelector<HTMLDivElement>("#issue-status")!;
const verifyForm = document.querySelector<HTMLFormElement>("#verify-form")!;
const verifyStatus = document.querySelector<HTMLDivElement>("#verify-status")!;

function selectedChain() {
  return getChain(chainSelect.value);
}

function refreshNetworkLabel() {
  const chain = selectedChain();
  networkBadge.innerHTML = `<i></i> ${chain.name.toUpperCase()} ${chain.network.toUpperCase()}`;
  walletStatus.textContent = `${chain.name} ${chain.network} wallet disconnected`;
}

chainSelect.addEventListener("change", refreshNetworkLabel);

connectButton.addEventListener("click", async () => {
  try {
    const chain = selectedChain();
    let issuer: string;
    if (chain.family === "solana") {
      issuer = (await getWallet().connect()).publicKey.toBase58();
    } else {
      const provider = getEvmWallet();
      await switchEvmChain(provider, chain);
      issuer = await connectEvmWallet(provider);
    }
    walletStatus.textContent = `Connected issuer: ${issuer}`;
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
    const chain = selectedChain();
    const formData = new FormData(issueForm);
    const payload = await createCredentialPayload({
      skill: String(formData.get("skill") || ""),
      evidenceUrl: String(formData.get("evidenceUrl") || ""),
      learnerSecret: String(formData.get("learnerSecret") || ""),
    });
    issueStatus.textContent = `Approve the ${chain.name} ${chain.network} transaction in your wallet…`;
    const memo = encodeCredentialMemo(payload);
    const signature = chain.family === "solana"
      ? await anchorCredential(memo, (await getWallet().connect()).publicKey)
      : await anchorEvmCredential(memo, chain);
    issueStatus.className = "form-status success";
    issueStatus.innerHTML = `<strong>Credential anchored.</strong><span>Network: ${chain.name} ${chain.network}</span><span>Credential ID: ${payload.credentialId}</span><span>Transaction: ${signature}</span><a href="${chain.explorerTransactionUrl(signature)}" target="_blank" rel="noreferrer">Open in block explorer ↗</a>`;
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
    const chain = selectedChain();
    verifyStatus.textContent = `Reading ${chain.name} ${chain.network}…`;
  try {
    const formData = new FormData(verifyForm);
    const signature = String(formData.get("signature") || "");
    const result = chain.family === "solana"
      ? await verifyCredential(signature)
      : await verifyEvmCredential(signature, chain);
    verifyStatus.className = "form-status success verified-card";
    const position = "slot" in result ? result.slot : result.blockNumber;
    verifyStatus.innerHTML = `<strong>✓ Valid BlackChain Proof</strong><dl><dt>Network</dt><dd>${chain.name} ${chain.network}</dd><dt>Skill</dt><dd>${escapeHtml(result.payload.skill)}</dd><dt>Issuer</dt><dd>${result.issuer}</dd><dt>Credential ID</dt><dd>${result.payload.credentialId}</dd><dt>Issued</dt><dd>${result.payload.issuedAt}</dd><dt>Chain position</dt><dd>${position}</dd></dl>`;
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

refreshNetworkLabel();
