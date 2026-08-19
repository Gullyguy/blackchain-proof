# Security Policy

This repository contains a Devnet prototype. It has not been audited and must not hold funds, production credentials, personal records, or confidential evidence.

## Supported version

Only the latest commit on the default branch is supported during the prototype phase.

## Reporting

Do not publish vulnerability details in a public issue. Contact BlackChain Collective through its established business channel and include reproduction steps without secrets or personal data.

## Known prototype limitations

- The Memo program does not enforce issuer authorization or credential schema rules.
- Revocation indexing is not implemented.
- Learner key recovery is not implemented.
- Wallet and RPC availability are external dependencies.
- Hashing an evidence URL does not prove the evidence itself is true.
- Production use requires an audited program or carefully evaluated Token-2022 design.
- `@solana/web3.js` 1.98.4 currently pulls `jayson` and `uuid` versions flagged by npm advisory GHSA-w5hq-g745-h8pq. The affected UUID buffer-input code path is not called by this prototype, but the dependency must be upgraded or replaced before production use. Do not use `npm audit fix --force`; it proposes an incompatible downgrade.
