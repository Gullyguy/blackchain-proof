# BlackChain Proof Multichain Architecture

## Design principle

BlackChain Proof uses one privacy-preserving credential envelope and separate chain adapters. The shared envelope prevents six chains from producing six incompatible credential formats. Each adapter remains small, inspectable, and replaceable by a production registry later.

## Shared credential envelope

`BCP1` contains:

- protocol version
- action, currently `issue` or `revoke`
- credential commitment
- public competency label
- private evidence hash
- issuance timestamp

The learner-held secret and evidence URL are hashed locally. Names, emails, grades, employment records, and government identifiers must never enter the public payload.

## Solana adapter

The Solana Devnet adapter writes the encoded `BCP1` payload through the Memo program. Verification reads the confirmed transaction, locates the protocol memo, confirms the transaction succeeded, and reports the signing issuer.

## EVM adapter

The EVM testnet adapter sends a zero-value transaction from the issuer to the same issuer with the encoded `BCP1` payload in calldata. Verification reads the transaction from the selected chain, requires `from` and `to` to match, decodes the payload, and reports the signing address and block number.

This self-attestation pattern proves portable issuance and verification with no contract deployment. Grant-funded production work should replace it with a chain-native registry that supports:

- issuer authorization
- credential status and revocation
- replay protection
- sponsored fees or account abstraction
- indexable events
- governance and recovery
- independent security review

## Supported EVM configurations

Network metadata lives in `src/chains.ts`. The application currently supports Avalanche Fuji, Base Sepolia, Arbitrum Sepolia, BNB Testnet, Mantle Sepolia, and Polygon Amoy. Adding a network requires a unique internal ID, testnet chain ID, official RPC endpoint, native currency metadata, and explorer URL builder.

## Evidence ladder

1. **Code evidence:** adapter, configuration, tests, lint, build.
2. **Network evidence:** wallet-approved testnet transaction and explorer receipt.
3. **Product evidence:** public issuer and verifier experience.
4. **Adoption evidence:** independently documented users, integrations, or pilots.
5. **Production evidence:** reviewed contracts, mainnet deployment, monitoring, governance, and incident response.

Applications must state the highest completed rung and label later rungs as proposed work.
