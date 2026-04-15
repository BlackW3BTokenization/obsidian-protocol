# BLKW3B — Obsidian Protocol

## Company

**BLKW3B Inc.** — Delaware C-Corp, founded by Rio (CEO, 23).
Team: Rio (founder, BD/design), Syd (engineering), Semi (engineering/ZK/Solana).

## Product

Obsidian Protocol — tokenized precious metals on Solana, backed 1:1 by physical vaulted metals through a signed Sub-Distributor Agreement with AGX (Alpine Gold Exchange).

**5 tokens:**
- `xGOLD` — tokenized gold
- `xSLVR` — tokenized silver
- `xGLDD` — tokenized gold (second denomination)
- `xSLVD` — tokenized silver (second denomination)
- `xGLDB` — tokenized gold bullion

## Differentiators

1. **AGX Sub-Distributor Agreement** — signed vaulting partner (Section 7.1 tokenization rights, Section 7.2 System of Record API access)
2. **ZK reserve proofs** — daily cryptographic attestation of vault holdings using Light Protocol
3. **x402 integration** — gold-native HTTP payments
4. **5-token basket** — broader than PAXG/XAUT single-gold competitors

## Competitive landscape (as of 2026-04-14)

- **Gildore** (Breakout 2025) — closest on-chain competitor, no signed vault partner
- **ORO** (Radar 2024, Honorable Mention) — yield-generating tokenized gold
- **PAXG / XAUT** — legacy, single-token, non-Solana
- Nobody in precious metals + ZK reserve proofs + Solana combined

## Stack

| Layer | Tech |
|---|---|
| On-chain program | Anchor (Rust), located in `app/anchor/programs/` |
| Token standard | SPL Token 2022 |
| ZK reserve proofs | Light Protocol (compressed state attestation) |
| Price oracle | Pyth (gold/silver USD) |
| Frontend | Next.js 15 + Tailwind (located in `app/src/`) |
| Wallet | Wallet Standard (Phantom, Solflare, Backpack) |
| RPC | Helius |
| Local validator | Surfpool |
| Mobile (Phase 2) | React Native + Expo + Solana Mobile SDK |

## AGX partnership context

- Signed Sub-Distributor Agreement
- $250K funding tranche expected (SOW with execs as of Apr 2026)
- Exec meeting scheduled for end of the week to demo working devnet
- Gary Barsdorf is primary BD contact at AGX
- 55+ demographic → BLKW3B brings 18-35 crypto-native market

## Development conventions

- Use `@solana/kit` (not legacy `@solana/web3.js`)
- Use Anchor for programs, Pinocchio only if sub-200 CU optimization needed later
- Use Light Protocol compressed accounts for reserve attestation (rent-free)
- Use Pyth for live price feeds, Switchboard for custom oracles
- All ZK proof verification happens on-chain, attestation data compressed via Light Protocol
- Commit messages use conventional commits (feat:, fix:, chore:, docs:)

## Current phase

**Build (Phase 2).** MVP target: working xGOLD mint/burn + reserve attestation on devnet by Friday's AGX exec meeting.

## Commands

```bash
cd app
npm install          # install dependencies
npm run dev          # start Next.js dev server
npm run anchor-build # build Anchor program
npm run anchor-test  # run Anchor tests with Surfpool
npm run anchor-deploy # deploy to configured cluster
```

## References

- AGX Sub-Distributor Agreement (signed) — see `BLKW3B 2026/` parent folder
- SOW v2 with Use of Funds breakdown — `BLKW3B_x_AGX_Scope_of_Work.pdf`
- Exec meeting prep playbook — `BLKW3B_AGX_Exec_Meeting_Prep.pdf`
- Team brief — `BLKW3B_Team_Brief_Apr11.pdf`
