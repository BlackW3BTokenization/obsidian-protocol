# Codebase Structure

**Analysis Date:** 2026-05-14

## Directory Layout

```
obsidian-protocol/
├── app/                                 # Next.js root
│   ├── app/                             # App Router pages & components (Next.js 16)
│   │   ├── layout.tsx                   # Root layout, providers, nav, footer
│   │   ├── page.tsx                     # Pitch page (marketing/hero)
│   │   ├── globals.css                  # Tailwind + CSS variables (theme tokens)
│   │   ├── components/                  # UI components
│   │   │   ├── providers.tsx            # Context provider tree
│   │   │   ├── nav.tsx                  # Navigation & wallet button
│   │   │   ├── cluster-context.tsx      # Solana cluster selector
│   │   │   ├── cluster-select.tsx       # Dropdown for cluster choice
│   │   │   ├── wallet-button.tsx        # Wallet connect/disconnect button
│   │   │   ├── wallet-balance-card.tsx  # SOL balance display
│   │   │   ├── xgold-card.tsx           # Token mint/burn interactive card
│   │   │   ├── vault-card.tsx           # Vault deposit/withdraw (Anchor demo)
│   │   │   ├── reserve-card.tsx         # Reserve attestation display
│   │   │   ├── protocol-stats.tsx       # 5-token stats grid
│   │   │   ├── revenue-model.tsx        # Fee structure display
│   │   │   ├── x402-gateway.tsx         # x402 payment UI (for premium endpoints)
│   │   │   ├── token-svg.tsx            # Geometric SVG token visuals
│   │   │   ├── primitives.tsx           # Reusable UI primitives (scanlines, gold line)
│   │   │   ├── fintech-icon.tsx         # Icon set for features
│   │   │   ├── backed-by.tsx            # AGX credibility section
│   │   │   ├── footer.tsx               # Page footer with links
│   │   │   ├── theme-toggle.tsx         # Dark/light theme switch
│   │   │   ├── waitlist-modal.tsx       # Email signup modal (future)
│   │   │   └── grid-background.tsx      # Visual grid overlay
│   │   ├── lib/                         # Utilities, hooks, contexts
│   │   │   ├── tokens.ts                # OBSIDIAN_TOKENS const, token metadata
│   │   │   ├── price-context.tsx        # PriceProvider, usePrices() hook
│   │   │   ├── solana-client.ts         # RPC Connection wrapper
│   │   │   ├── solana-client-context.tsx # SolanaClientProvider
│   │   │   ├── x402.ts                  # withX402Gate(), payment verification
│   │   │   ├── agx-api.ts               # AGX UPMA client, types
│   │   │   ├── errors.ts                # Custom error types
│   │   │   ├── explorer.ts              # Solscan URL builders
│   │   │   ├── lamports.ts              # SOL ↔ lamport conversion
│   │   │   ├── hooks/                   # Custom React hooks
│   │   │   │   ├── use-pyth-prices.ts   # Pyth REST polling, price derivation
│   │   │   │   ├── use-balance.ts       # SOL balance query
│   │   │   │   ├── use-token-balances.ts # Token ATA balance queries
│   │   │   │   ├── use-send-transaction.ts # Submit signed transactions
│   │   │   │   └── use-jupiter-quote.ts # Jupiter price quotes (future)
│   │   │   └── wallet/                  # Wallet Standard integration
│   │   │       ├── context.tsx          # WalletProvider, useWallet()
│   │   │       ├── standard.ts          # discoverWallets(), watchWallets()
│   │   │       ├── signer.ts            # createWalletSigner() from session
│   │   │       └── types.ts             # WalletConnector, WalletSession types
│   │   ├── api/                         # Next.js API routes (Node.js runtime)
│   │   │   ├── mint/route.ts            # POST mint SPL token to ATA
│   │   │   ├── redemptions/route.ts     # POST redemption intent to AGX
│   │   │   ├── price/gold/route.ts      # GET gold USD price (x402-gated)
│   │   │   ├── reserve/                 # Reserve attestation endpoints
│   │   │   │   └── attestation/route.ts # GET reserve data (x402-gated)
│   │   │   ├── agx/                     # AGX proxy endpoints
│   │   │   │   └── branches/route.ts    # GET AGX branch list
│   │   │   └── goldback-price/route.ts  # GET calculated xGLDB price
│   │   ├── protocol/                    # Live dApp page
│   │   │   ├── layout.tsx               # Metadata for /protocol
│   │   │   └── page.tsx                 # Mint/burn/redeem interface
│   │   ├── reserves/                    # Reserve display page
│   │   │   ├── layout.tsx               # Metadata for /reserves
│   │   │   └── page.tsx                 # Reserve attestation display
│   │   ├── revenue/                     # Revenue model page
│   │   │   ├── layout.tsx               # Metadata for /revenue
│   │   │   └── page.tsx                 # Fee structure, economics
│   │   ├── developers/                  # Developer docs page
│   │   │   ├── layout.tsx               # Metadata for /developers
│   │   │   └── page.tsx                 # API spec, x402 guide
│   │   └── generated/                   # Codama-generated IDL types (auto)
│   │       └── vault/                   # Anchor program types (vault)
│   │           ├── index.ts             # Re-exports
│   │           ├── instructions/        # Instruction types (deposit, withdraw)
│   │           ├── errors/              # Error enum types
│   │           ├── programs/            # Program client (auto-generated)
│   │           └── shared/              # Shared types
│   │
│   ├── anchor/                          # Anchor program workspace
│   │   ├── Cargo.toml                   # Anchor workspace
│   │   ├── programs/vault/              # Single Anchor program (vault)
│   │   │   ├── Cargo.toml               # Program dependencies (anchor-lang)
│   │   │   └── src/
│   │   │       ├── lib.rs               # deposit(), withdraw() instructions
│   │   │       └── tests.rs             # Anchor tests (litesvm)
│   │   └── ...                          # anchor-cli build outputs
│   │
│   ├── scripts/                         # DevNet setup & utilities
│   │   └── create-devnet-mints.mjs      # Creates Token 2022 mints, seeds with addresses
│   │
│   ├── data/                            # Static/seed data (JSON)
│   │   └── redemptions.json             # Redemption history (empty)
│   │
│   ├── public/                          # Static assets (served at /)
│   │   ├── manifest.json                # PWA manifest
│   │   ├── icon.svg                     # App icon
│   │   └── assets/                      # Images, icons
│   │       ├── pyramid-xgold.jpg        # xGOLD hero image
│   │       ├── pyramid-xslvr.jpg        # xSLVR hero image
│   │       ├── coin-xgldd.jpg           # xGLDD coin visual
│   │       ├── coin-xslvd.jpg           # xSLVD coin visual
│   │       ├── stack-xgldb.webp         # xGLDB stack visual
│   │       ├── blkw3b-crest.webp        # Logo
│   │       ├── blkw3b-crest-molten.png  # Logo variant
│   │       ├── logos/                   # Brand logos
│   │       └── icons/                   # Feature icons (26 icon files)
│   │
│   ├── package.json                     # Dependencies, scripts (npm run dev, npm run anchor-build, etc.)
│   ├── tsconfig.json                    # TypeScript config (strict mode)
│   ├── next.config.ts                   # Next.js config
│   ├── eslint.config.mjs                # ESLint rules
│   ├── .prettierrc                      # Prettier formatting
│   ├── .prettierignore                  # Prettier ignore list
│   └── .env.local (NOT committed)       # Local env vars (SOLANA_RPC_URL, MINT_AUTHORITY_SECRET, etc.)
│
├── .claude/                             # Claude skills/agents directory
├── .planning/codebase/                  # Codebase map documents (this directory)
├── .git/                                # Git history
├── CLAUDE.md                            # Project brief, context
├── README.md                            # Quick start
└── brand.md                             # Design tokens, typography, colors
```

## Directory Purposes

**`app/app/`** (Next.js App Router root):
- Purpose: All frontend pages, server components, API routes, utilities
- Contains: React components, page layouts, server-side logic
- Key files: `layout.tsx` (root), `page.tsx` (home), `globals.css` (theme)

**`app/app/components/`**:
- Purpose: Reusable React components (pages delegate to these)
- Contains: UI building blocks, page sections, provider trees
- Naming: Kebab-case files (`wallet-button.tsx`, `price-context.tsx`)
- Exports: Single component per file (default export)

**`app/app/lib/`**:
- Purpose: Non-UI utilities, hooks, contexts, clients
- Contains: Custom React hooks, context providers, API clients, type definitions
- Naming: Kebab-case files (`price-context.tsx`, `use-pyth-prices.ts`, `agx-api.ts`)
- Usage: `import { usePrices } from "~/app/lib/price-context"` (path alias in tsconfig.json)

**`app/app/lib/hooks/`**:
- Purpose: Custom React hooks for data fetching, state management
- Contains: `use*` named exports, polling logic, error handling
- Pattern: Each hook returns typed object, handles loading/error states

**`app/app/lib/wallet/`**:
- Purpose: Wallet Standard integration, session management
- Contains: Wallet discovery, connection lifecycle, signer creation
- Key file: `context.tsx` (exports `WalletProvider` and `useWallet()`)

**`app/app/api/`**:
- Purpose: Next.js API routes (Node.js runtime)
- Contains: `route.ts` handlers (POST/GET), middleware, request validation
- Pattern: Each endpoint is a directory with `route.ts` file
  - `api/mint/route.ts` → `POST /api/mint`
  - `api/price/gold/route.ts` → `GET /api/price/gold`
  - `api/reserve/attestation/route.ts` → `GET /api/reserve/attestation`

**`app/app/generated/vault/`** (Auto-generated):
- Purpose: Codama-generated types from Anchor program IDL
- Contains: Instruction types, error enums, program client
- Generated by: `npm run codama:js` (runs Codama renderer)
- Read-only: Do NOT edit; regenerate via `npm run codama:js` after Anchor program changes

**`app/anchor/programs/vault/src/`**:
- Purpose: Anchor program source code
- Contains: `lib.rs` (instructions), `tests.rs` (Anchor tests)
- Build: `npm run anchor-build` compiles to `target/idl/vault.json` and program binary

**`app/scripts/`**:
- Purpose: DevNet setup scripts (not deployed to production)
- Contains: Mint creation, keypair generation, initialization
- Usage: `node scripts/create-devnet-mints.mjs` before running dApp

**`app/data/`**:
- Purpose: Static/seed JSON data
- Contains: Redemption history (currently empty), future seed data
- Format: JSON, committed to git (no secrets)

**`app/public/`**:
- Purpose: Static assets served at `/` via Next.js
- Contains: Images, SVGs, manifests, icons
- Pattern: `public/assets/image.jpg` → served as `/assets/image.jpg`

## Key File Locations

**Entry Points:**

| File | Purpose | Route |
|------|---------|-------|
| `app/app/layout.tsx` | Root layout, providers, nav | `/` (all routes) |
| `app/app/page.tsx` | Marketing pitch page | `/` |
| `app/app/protocol/page.tsx` | Live mint/burn dApp | `/protocol` |
| `app/app/reserves/page.tsx` | Reserve display | `/reserves` |
| `app/app/revenue/page.tsx` | Revenue model | `/revenue` |
| `app/app/developers/page.tsx` | API docs | `/developers` |
| `app/anchor/programs/vault/src/lib.rs` | On-chain program | Solana devnet |

**Configuration:**

| File | Purpose |
|------|---------|
| `app/package.json` | Dependencies, scripts (`npm run dev`, `npm run anchor-build`) |
| `app/tsconfig.json` | TypeScript compiler options, path aliases (`~`, `@`) |
| `app/next.config.ts` | Next.js build/runtime config |
| `app/eslint.config.mjs` | ESLint rules, TypeScript plugin |
| `app/.prettierrc` | Code formatting (2 spaces, single quotes) |
| `.env.local` (NOT committed) | Secrets: `SOLANA_RPC_URL`, `MINT_AUTHORITY_SECRET`, `NEXT_PUBLIC_AGX_API_KEY` |

**Core Logic:**

| File | Purpose |
|------|---------|
| `app/app/lib/tokens.ts` | `OBSIDIAN_TOKENS[]`, token metadata (mint, price, reserve qty) |
| `app/app/lib/price-context.tsx` | `PriceProvider`, `usePrices()` (single source of truth for prices) |
| `app/app/lib/hooks/use-pyth-prices.ts` | Pyth REST polling (XAU, XAG, SOL), price derivation |
| `app/app/lib/wallet/context.tsx` | `WalletProvider`, `useWallet()` (Wallet Standard integration) |
| `app/app/lib/x402.ts` | `withX402Gate()` decorator, payment verification |
| `app/app/lib/agx-api.ts` | AGX UPMA client (`getBranches()`, `signup()`) |
| `app/app/api/mint/route.ts` | SPL Token 2022 mint handler |
| `app/app/api/reserve/attestation/route.ts` | x402-gated reserve attestation |

**Testing:**

| File | Purpose |
|------|---------|
| `app/anchor/programs/vault/src/tests.rs` | Anchor program tests (litesvm) |

---

## Naming Conventions

**Files:**
- React components: Kebab-case, ends with `.tsx` (e.g., `wallet-button.tsx`, `price-context.tsx`)
- Hooks: Kebab-case, starts with `use-`, ends with `.ts` or `.tsx` (e.g., `use-pyth-prices.ts`)
- Utilities: Kebab-case, ends with `.ts` (e.g., `agx-api.ts`, `x402.ts`)
- API routes: `route.ts` in a directory matching the path (e.g., `api/mint/route.ts`)
- Styles: `globals.css` (root), component-scoped via Tailwind/inline styles

**Directories:**
- Feature routes (pages): Kebab-case, match URL path (e.g., `/protocol`, `/reserves`, `/developers`)
- Component grouping: `components/` (pages/sections), `lib/` (utilities/hooks)
- API grouping: `api/` root, subdirectories for logical grouping (e.g., `api/reserve/`, `api/agx/`)

**TypeScript:**
- Types: PascalCase (e.g., `ObsidianToken`, `WalletSession`, `PythPrice`)
- Interfaces: PascalCase with `I` prefix optional (e.g., `AgxBranch`, `VaultAction`)
- Enums: PascalCase (e.g., `VaultError`)
- Functions: camelCase (e.g., `usePrices()`, `deriveTokenPrices()`, `withX402Gate()`)
- Constants: UPPER_SNAKE_CASE (e.g., `OBSIDIAN_TOKENS`, `X402_PRICES`, `PYTH_FEED_IDS`)

**CSS:**
- Variables: Kebab-case, prefixed with `--` (e.g., `--gold`, `--vault-gold`, `--obsidian`)
- Tailwind: Use built-in classes (`px-6`, `py-3`, `text-sm`), custom colors via CSS variables
- Inline styles: Use when dynamic or theme-dependent (e.g., `style={{ color: "var(--gold)" }}`)

---

## Where to Add New Code

**New Frontend Page:**
1. Create directory: `app/app/{route-name}/`
2. Add `layout.tsx` (metadata, optional)
3. Add `page.tsx` (client component with "use client" directive)
4. Link in `nav.tsx` or pitch page

Example: To add `/mint-guide`, create `app/app/mint-guide/page.tsx` with mint documentation.

**New API Route:**
1. Create directory: `app/app/api/{path}/{to}/{resource}/`
2. Add `route.ts` with `export const GET/POST/PUT/DELETE` function
3. If x402-gated, wrap handler with `withX402Gate(endpoint, handler)`

Example: To add `GET /api/token/{symbol}/price`, create `app/app/api/token/[symbol]/price/route.ts` with dynamic route segment.

**New Component:**
1. Create file: `app/app/components/{kebab-name}.tsx`
2. Mark as `"use client"` if it uses hooks
3. Export default component

Example: To add a token statistics table, create `app/app/components/token-stats-table.tsx`.

**New Hook:**
1. Create file: `app/app/lib/hooks/use-{kebab-name}.ts`
2. Export function `export function use{PascalName}() { ... }`
3. Return typed object with state, loading, error

Example: To add price polling for a single token, create `app/app/lib/hooks/use-single-token-price.ts`.

**New Context:**
1. Create file: `app/app/lib/{kebab-name}-context.tsx` or `app/app/lib/{context}/context.tsx`
2. Export `{PascalName}Provider` component
3. Export `use{PascalName}()` hook (throws if not in Provider tree)

Example: To add notification context, create `app/app/lib/notification-context.tsx`.

**New Library/Utility:**
1. Create file: `app/app/lib/{kebab-name}.ts` or subdirectory
2. Export typed functions, constants, or classes
3. Import elsewhere with `import { fn } from "~/app/lib/{name}"`

Example: To add Switchboard oracle client, create `app/app/lib/switchboard-oracle.ts`.

**On-Chain Program Changes:**
1. Edit `app/anchor/programs/vault/src/lib.rs`
2. Run `npm run anchor-build`
3. Run `npm run codama:js` to regenerate types in `app/generated/vault/`
4. Import types from `~/app/generated/vault/` in frontend/API routes

---

## Special Directories

**`.next/` (Build Artifacts):**
- Purpose: Next.js build output (dev server cache, production bundles)
- Generated: Auto-created by `npm run dev` or `npm run build`
- Committed: No, in `.gitignore`

**`app/node_modules/` (Dependencies):**
- Purpose: Installed npm packages
- Generated: Auto-created by `npm install`
- Committed: No, in `.gitignore`

**`app/anchor/target/` (Anchor Build Output):**
- Purpose: Compiled program binary, IDL JSON, test artifacts
- Generated: Auto-created by `npm run anchor-build`
- Committed: No, in `.gitignore`

**`app/generated/vault/` (Codama Output):**
- Purpose: Type-safe client for Anchor program (auto-generated)
- Generated: By `npm run codama:js` (runs Codama renderer on `target/idl/vault.json`)
- Committed: Yes, committed for stability (developers don't rebuild IDL on every checkout)
- Regenerate: Only after changing Anchor program source code

---

*Structure analysis: 2026-05-14*
