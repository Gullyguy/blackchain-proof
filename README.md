# BlackChain Proof

Open-source, privacy-first proof of demonstrated Solana skills.

**Project lead:** Vincent Owens

**Network:** Solana Devnet

**License:** MIT
**Status:** Working prototype, not a production credential system

## Why this exists

Community technology programs produce real work, but learners often leave with screenshots, PDFs, and attendance certificates that cannot be independently verified. BlackChain Proof anchors a privacy-preserving credential commitment to Solana Devnet and lets anyone verify the issuer signature and payload from a transaction signature.

## Solana Foundation criteria alignment

| Criterion | Prototype evidence |
|---|---|
| Public good | Free verifier, open schema, MIT-licensed reference implementation |
| Open source | Full source, tests, setup instructions, contribution path |
| Only possible on Solana | Issuer-signed public state, low-fee anchoring, composable verification, future fee sponsorship and Token-2022 path |
| Clear use of funds | Four measurable milestones covering standard, Devnet build, pilots, security, and public release |

## What the prototype does

1. Connects an injected Phantom wallet configured for Devnet.
2. Hashes the private evidence URL and learner-held secret inside the browser.
3. Creates a versioned `BCP1` credential commitment.
4. Anchors the commitment through Solana's Memo program.
5. Verifies a transaction signature directly against Solana Devnet.
6. Displays the issuer signer, skill, credential ID, issuance time, and Devnet slot.

## Privacy boundary

Do not enter names, emails, grades, employment information, government identifiers, or private student records in the public skill field. The evidence URL and learner secret are hashed locally and never included in the memo. A production design still requires a formal privacy review, issuer governance, revocation indexing, recovery, and security testing.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL, install or unlock Phantom, switch Phantom to Solana Devnet, and fund the issuer wallet with Devnet SOL from an official faucet.

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
- Evaluate Token-2022 non-transferable credentials or a dedicated audited program.
- Add learner-controlled selective disclosure.
- Complete accessibility, privacy, and security reviews.
- Run controlled pilots with written institutional approval.

## Leadership and governance

Vincent Owens is the project lead, accountable for product direction, community partnerships, milestone delivery, and grant reporting. A named Solana technical lead and independent security reviewer must be appointed before a funding application is submitted.

## No endorsement claim

BlackChain Proof is an independent BlackChain Collective prototype. Solana Foundation funding, endorsement, and partnership are not confirmed.
