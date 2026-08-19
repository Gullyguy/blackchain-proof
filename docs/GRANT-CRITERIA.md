# Solana Foundation Criteria Matrix

This matrix is the submission gate. A criterion marked incomplete blocks the application.

## 1. Public good

**Current evidence**

- MIT-licensed source.
- Public verifier design.
- Open `BCP1` credential payload.
- Free setup, testing, and contribution documentation.
- No required BlackChain account for verification.

**Application claim**

BlackChain Proof gives schools, nonprofits, hackathons, employers, and community programs a reusable open credential issuer and verifier for demonstrated Solana work.

**Remaining gate**

- Publish the repository.
- Secure at least one external implementation or pilot interest letter.

## 2. Open source

**Current evidence**

- Complete source, tests, MIT license, contribution guide, and security policy.
- Reproducible local setup.
- Protocol payload documented in the repository.

**Remaining gate**

- Push to the public `Gullyguy/blackchain-proof` repository.
- Add issue templates and a public roadmap after the first external review.

## 3. Only possible on Solana

**Current evidence**

- Issuer wallet signs a Solana Devnet transaction.
- The credential commitment is anchored through the Solana Memo program.
- The verifier independently reads Solana Devnet and recovers the issuer signer, payload, slot, and confirmation state.
- Devnet RPC was verified against `solana-core 4.2.0` on August 19, 2026.

**Production path**

- Sponsored fees for learners without SOL.
- Token-2022 non-transferable credentials or a dedicated audited credential program.
- Indexed revocation and issuer governance.
- Optional merchant and event integrations that reuse the same credential state.

**Remaining gate**

- Record at least one successful credential transaction and public Explorer link.
- Appoint a named Solana technical lead.

## 4. Clear use of funds

**Current evidence**

- $150,000 request divided across four acceptance-based milestones.
- Budget separates engineering, security, student fellowships, pilot operations, documentation, and infrastructure.
- Cohort and integration targets are labeled proposed rather than confirmed.

**Remaining gate**

- Tie each budget line to named personnel or procurement assumptions.
- Attach acceptance tests to every milestone.
- Secure written pilot interest before claiming institutional participation.

## Leadership

Vincent Owens is the project lead and is accountable for product direction, community partnerships, milestone delivery, and grant reporting.

The application must also name:

- Solana technical lead.
- Privacy and security reviewer.
- Curriculum or learning-design lead.
- Pilot operations lead.

## Submission rule

Do not submit while any remaining gate above is unresolved. The prototype proves the mechanism. It does not yet prove institutional demand, production security, or team completeness.
