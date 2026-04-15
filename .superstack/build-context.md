# Build Context — Obsidian Protocol

**Phase:** 2 (Build)
**Scaffolded:** 2026-04-14
**Scaffolded by:** superstack `scaffold-project` skill

## Stack Decisions

### Product type
Web dApp (frontend + custom on-chain program) + Mobile (Phase 2)

### Template
`gh:solana-foundation/templates/kit/nextjs-anchor` — Next.js 15 + Anchor + @solana/kit

### On-chain
- **Framework:** Anchor (Rust)
- **Token standard:** SPL Token 2022 (supports transfer hooks for compliance, transfer fees for protocol revenue)
- **Programs:**
  - `obsidian` — mint authority, mint/burn tied to AGX API verification
  - `reserve-attestor` — daily ZK proof verification via Light Protocol
- **Location:** `app/anchor/programs/`

### Off-chain
- **Frontend:** Next.js 15 + Tailwind CSS
- **Wallet:** Wallet Standard (`@solana/wallet-adapter-react`)
- **Client SDK:** `@solana/kit` (modern, tree-shakeable, zero-dependency)
- **RPC provider:** Helius (dev: devnet, prod: mainnet-beta)
- **Location:** `app/src/`

### Integrations
- **Light Protocol:** ZK compression for reserve attestation (rent-free state)
- **Pyth:** Live gold/silver USD price feeds
- **x402:** HTTP payment protocol (community template: `x402-solana-rust`)
- **AGX API:** System of Record integration (authentication, vault queries, mint/burn authorization)

### Testing
- **Local validator:** Surfpool
- **Unit tests:** Anchor test framework
- **Fuzzing:** Trident (Phase 3 pre-mainnet)

## Skills Installed

From superstack:
- `scaffold-project` ✅
- `build-with-claude` (next phase)
- `deploy-to-mainnet`
- `submit-to-hackathon`
- `competitive-landscape`
- `colosseum-copilot`

To install (Phase 2 build):
- `programs-anchor` (official Anchor patterns)
- `security` (Anchor security best practices)
- `testing` (Anchor test suites)
- `light-protocol-skill` (ZK compression)
- `pyth-skill` (price feeds)
- `solana-kit-skill` (modern token ops)
- `frontend-framework-kit` (Next.js + wallet)
- `surfpool` (local validator)

## MCPs to Configure

- `helius-mcp` — 60+ RPC tools, DAS, webhooks
- `solana-fender-mcp` — security scanning for programs
- `phantom-mcp-server` — wallet ops
- `anchor-mcp` — Anchor workspace tooling

## Architecture Pattern

**Pattern:** Monorepo (Next.js + Anchor workspace)
**Rationale:** Shared TypeScript types between program and frontend, single dev workflow, easy deployment coordination.

## Build Status

```json
{
  "mvp_complete": false,
  "tests_passing": false,
  "devnet_deployed": false,
  "agx_api_connected": false,
  "zk_reserve_proofs_live": false,
  "pyth_oracle_integrated": false
}
```

## Milestones

- [ ] **Today:** Workspace scaffolded, dependencies installed
- [ ] **Tue:** xGOLD mint/burn Anchor program complete
- [ ] **Wed:** Reserve attestation via Light Protocol
- [ ] **Wed:** AGX API integration (mocked first, real endpoints second)
- [ ] **Thu:** UI polish, Blender 3D assets integrated as hero visuals
- [ ] **Fri:** AGX exec meeting — working devnet demo

## Mobile Phase 2 (Post-AGX Demo)

Template: `gh:solana-foundation/templates/mobile/kit-expo-uniwind`
Location: `app-mobile/`
Priority: Ship after xGOLD is live on devnet, before mainnet launch.

## Next Step

Run `/build-with-claude` to begin guided MVP implementation.
