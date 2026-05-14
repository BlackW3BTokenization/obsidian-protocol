# Technology Stack

**Analysis Date:** 2026-05-14

## Languages

**Primary:**
- TypeScript 5 - Frontend (Next.js), API routes, client libraries
- Rust - Anchor program (on-chain Solana vault program)

**Secondary:**
- JavaScript (ES2020) - PostCSS, build config

## Runtime

**Environment:**
- Node.js (no specific version locked; .nvmrc not found)
- Browser environment (React 19.2.3 + DOM APIs)

**Package Manager:**
- npm
- Lockfile: `app/package-lock.json` (present, 360KB)

## Frameworks

**Core:**
- Next.js 16.0.10 - Full-stack web application (app router)
- React 19.2.3 - UI framework
- Anchor 0.32.1 - Solana program framework (Rust)

**Wallet & Blockchain:**
- @solana/kit 6.3.0 - Modern Solana SDK for transactions and account queries
- @solana/kit-client-rpc 0.7.0 - RPC client plugin for @solana/kit
- @solana/kit-plugin-rpc 0.7.0 - RPC plugin system
- @solana/wallet-standard-features 1.3.0 - Wallet Standard feature implementations
- @wallet-standard/app 1.1.0 - Wallet discovery and connection
- @wallet-standard/base 1.1.0 - Base types for Wallet Standard
- @wallet-standard/features 1.1.0 - Feature definitions

**Testing:**
- litesvm 0.7.1 (dev) - Solana test validator
- cargo test - Anchor/Rust test runner

**Build/Dev:**
- Next.js TurboWEB (configured in `next.config.ts`)
- Codama 1.5.0 - IDL code generator from Anchor programs
- @codama/nodes-from-anchor 1.3.8 - Parse Anchor IDLs to Codama nodes
- @codama/renderers-js 1.5.5 - Generate JavaScript/TypeScript from Codama
- Tailwind CSS 4 - Utility-first CSS framework
- @tailwindcss/postcss 4 - PostCSS Tailwind v4 plugin
- PostCSS 4 - CSS transformation (`app/postcss.config.mjs`)
- ESLint 9 - Linting
- eslint-config-next 16.0.10 - Next.js linting rules
- Prettier 3.6.2 - Code formatter

## Key Dependencies

**Critical:**
- @solana/web3.js 1.98.4 - Legacy Web3 SDK (used for x402 payment verification)
- @solana/spl-token 0.4.14 - SPL Token program client
- bs58 6.0.0 - Base58 encoding (Solana addresses)
- ws 8.18.3 - WebSocket client (configured as serverExternalPackage)

**Price Oracle & DEX:**
- @pythnetwork/price-service-client 1.11.0 - Pyth Network price feeds (XAU/USD, XAG/USD, SOL/USD)
- @jup-ag/api 6.0.48 - Jupiter swap API client (SOL → token quotes)

**Payments & Gateway:**
- x402-solana 2.0.4 - x402 HTTP payment protocol (gold-native micropayments)

**UI & Utilities:**
- swr 2.2.0 - Data fetching library (HTTP cache layer)
- sonner 2.0.7 - Toast notifications
- next-themes 0.4.6 - Dark mode theme management

## Configuration

**Environment:**
- `NEXT_PUBLIC_AGX_ENV` - AGX API environment (dev/qa/prod, default: dev)
- `NEXT_PUBLIC_AGX_API_KEY` - AGX UPMA API key (prefixed NEXT_PUBLIC for client exposure)
- `SOLANA_NETWORK` - Solana cluster (devnet/testnet/mainnet, default: devnet)
- `HELIUS_RPC_URL` - Helius RPC endpoint (default: https://api.devnet.solana.com)
- `PROTOCOL_TREASURY_PUBKEY` - Obsidian Protocol treasury wallet for x402 payments

**Build:**
- `app/tsconfig.json` - TypeScript compiler options (target: ES2020, strict mode enabled)
- `app/next.config.ts` - Next.js build config with Turbopack alias for `fs` fallback
- `app/postcss.config.mjs` - PostCSS config with Tailwind v4
- `app/eslint.config.mjs` - ESLint config extending next/core-web-vitals and next/typescript
- `app/anchor/Anchor.toml` - Anchor workspace config with devnet program address `F4jZpgbtTb6RWNWq6v35fUeiAsRJMrDczVPv9U23yXjB`

## Platform Requirements

**Development:**
- Solana CLI (for anchor build/test)
- Rust toolchain (cargo 2021 edition)
- Node.js LTS or modern version

**Production:**
- Deployment target: Vercel (Next.js native)
- Anchor program deployment to Solana (devnet/mainnet)
- Helius RPC node for blockchain queries
- Pyth Network (public, no auth required)
- Jupiter API (public, no auth required)

---

*Stack analysis: 2026-05-14*
