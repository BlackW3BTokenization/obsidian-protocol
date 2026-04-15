# Obsidian Protocol

Tokenized precious metals on Solana, backed 1:1 by physical vaulted metals through BLKW3B Inc.'s Sub-Distributor Agreement with AGX (Alpine Gold Exchange).

**Tokens:** xGOLD · xSLVR · xGLDD · xSLVD · xGLDB

## Quick Start

```bash
cd app
npm install
npm run dev
```

## Architecture

- **On-chain:** Anchor programs in `app/anchor/programs/`
- **Frontend:** Next.js 15 in `app/src/`
- **ZK reserve proofs:** Light Protocol compressed attestation
- **Price oracle:** Pyth
- **Wallet:** Wallet Standard (Phantom, Solflare, Backpack)
- **RPC:** Helius

## Development

```bash
# Frontend
npm run dev

# Anchor program
npm run anchor-build
npm run anchor-test
npm run anchor-deploy

# Run local validator (Surfpool)
surfpool start
```

## Docs

- Project context: [CLAUDE.md](./CLAUDE.md)
- Build decisions: [.superstack/build-context.md](./.superstack/build-context.md)

## Team

BLKW3B Inc. — Rio (founder), Syd (eng), Semi (eng/ZK/Solana)
