# BlackChain Proof

Open-source, privacy-first proof of demonstrated technical skills across public test networks.

**Project lead:** Vincent Owens

**Networks:** Solana Devnet, Avalanche Fuji, Base Sepolia, Arbitrum Sepolia, BNB Testnet, Mantle Sepolia, and Polygon Amoy

**License:** MIT
**Status:** Working prototype, not a production credential system

**Public prototype:** https://gullyguy.github.io/blackchain-proof/

## Why this exists

Community technology programs produce real work, but learners often leave with screenshots, PDFs, and attendance certificates that cannot be independently verified. BlackChain Proof anchors a privacy-preserving credential commitment to a public test network and lets anyone verify the issuer signature and payload from a transaction signature or hash.

## Solana Foundation criteria alignment

| Criterion | Prototype evidence |
|---|---|
| Public good | Free verifier, open schema, MIT-licensed reference implementation |
| Open source | Full source, tests, setup instructions, contribution path |
| Only possible on Solana | Issuer-signed public state, low-fee anchoring, composable verification, future fee sponsorship and Token-2022 path |
| Clear use of funds | Four measurable milestones covering standard, Devnet build, pilots, security, and public release |

## What the prototype does

1. Selects a supported public test network.
2. Connects Phantom for Solana or an EIP-1193 wallet for supported EVM networks.
3. Hashes the private evidence URL and learner-held secret inside the browser.
4. Creates a versioned `BCP1` credential commitment.
5. Anchors the commitment through Solana's Memo program or EVM issuer self-attestation calldata.
6. Verifies a transaction directly against the selected network.
7. Displays the issuer signer, skill, credential ID, issuance time, and chain position.

## Supported test networks

| Network | Wallet path | Current proof mechanism |
|---|---|---|
| Solana Devnet | Phantom | Memo program instruction |
| Avalanche Fuji C-Chain | EIP-1193 | Issuer-signed self-transaction calldata |
| Base Sepolia | EIP-1193 | Issuer-signed self-transaction calldata |
| Arbitrum Sepolia | EIP-1193 | Issuer-signed self-transaction calldata |
| BNB Testnet | EIP-1193 | Issuer-signed self-transaction calldata |
| Mantle Sepolia | EIP-1193 | Issuer-signed self-transaction calldata |
| Polygon Amoy | EIP-1193 | Issuer-signed self-transaction calldata |

The EVM path proves the portable protocol and verifier before a grant-specific registry contract is built. It is not presented as an audited production credential registry.

## Privacy boundary

Do not enter names, emails, grades, employment information, government identifiers, or private student records in the public skill field. The evidence URL and learner secret are hashed locally and never included in the memo. A production design still requires a formal privacy review, issuer governance, revocation indexing, recovery, and security testing.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL, select a network, install or unlock the matching wallet, and fund the issuer wallet with that network's official test token faucet. Every transaction requires the wallet holder's approval.

## Validate

```bash
npm test
npm run lint
npm run build
```

## Protocol payload

The Memo instruction stores a compact payload prefixed with `BCP1:`:

```json
{
  "v": 1,
  "action": "issue",
  "credentialId": "sha256 commitment",
  "skill": "public competency label",
  "evidenceHash": "sha256 evidence URL hash",
  "issuedAt": "ISO-8601 timestamp"
}
```

## Production roadmap

- Publish credential schema and issuer trust model.
- Add indexed revocation and status checks.
- Add fee-sponsored onboarding.
- Evaluate Token-2022 non-transferable credentials, Soroban attestations, and dedicated audited EVM registries.
- Add learner-controlled selective disclosure.
- Complete accessibility, privacy, and security reviews.
- Run controlled pilots with written institutional approval.

## Leadership and governance

Vincent Owens is the project lead, accountable for product direction, community partnerships, milestone delivery, and grant reporting. A named Solana technical lead and independent security reviewer must be appointed before a funding application is submitted.

## No endorsement claim

BlackChain Proof is an independent BlackChain Collective prototype. Funding, endorsement, and partnership from any listed blockchain foundation are not confirmed.

## Chain-specific evidence policy

A chain becomes grant-ready only after the public repository includes a network adapter, automated tests, a successful production build, and a wallet-approved testnet transaction visible in that network's explorer. A shared adapter alone does not prove traction, mainnet readiness, an audited registry, or ecosystem partnership.
