# Architecture

**Analysis Date:** 2026-05-14

## Pattern Overview

**Overall:** Next.js 16 App Router + Anchor on-chain program, layered architecture with clear separation between frontend, API routes, Solana clients, and on-chain logic.

**Key Characteristics:**
- Client-server boundary: Next.js App Router (SSR + client components) → Node.js API routes → Solana RPC/on-chain
- Wallet-to-chain flow: Browser wallet (Phantom, Solflare, Backpack) → Next API → Solana RPC → Anchor program
- x402-gated premium endpoints: Micropayment-based API access for reserve attestation, price feeds, mint authorization
- Provider-based context (React) for cluster, wallet session, prices, Solana client, theme
- Codama-generated IDL types (`app/generated/vault/`) for type-safe Anchor program interaction

## Layers

**Frontend (Client Components):**
- Purpose: Interactive UI for mint/burn/redeem, price display, wallet connection, reserve display
- Location: `app/app/components/`, `app/app/page.tsx`, `app/app/protocol/page.tsx`, `app/app/reserves/page.tsx`, `app/app/revenue/page.tsx`, `app/app/developers/page.tsx`
- Contains: React components, page layouts, hooks for UI state, wallet integration UI
- Depends on: React context (wallet, prices, cluster, theme), Next.js router, Solana Kit
- Used by: Browser runtime via Next.js SSR

**Context & State Management:**
- Purpose: Single source of truth for wallet session, prices, cluster selection, Solana client, theme
- Location: `app/app/components/providers.tsx` (provider tree), `app/app/lib/*-context.tsx`, `app/app/lib/wallet/context.tsx`
- Contains: React context providers (`PriceProvider`, `WalletProvider`, `ClusterProvider`, `SolanaClientProvider`, `ThemeProvider`)
- Key providers:
  - `PriceProvider` (`app/app/lib/price-context.tsx`): Pyth Network prices, derives token prices from XAU/XAG spot
  - `WalletProvider` (`app/app/lib/wallet/context.tsx`): Wallet Standard integration (Phantom, Solflare, Backpack), auto-reconnect, signer creation
  - `ClusterProvider` (`app/app/components/cluster-context.tsx`): Solana cluster selection (devnet/mainnet-beta)
  - `SolanaClientProvider` (`app/app/lib/solana-client-context.tsx`): Connection singleton per cluster
- Used by: All client components via hooks (`usePrices()`, `useWallet()`, `useCluster()`, `useSolanaClient()`)

**API Routes (Next.js):**
- Purpose: Server-side handlers for SPL token operations, reserve attestation, price feeds, AGX integration, x402 payment verification
- Location: `app/app/api/`
- Routes:
  - `POST /api/mint` → mint SPL Token 2022 to user's ATA using mint authority keypair
  - `POST /api/redemptions` → record redemption intent (metadata only, AGX executes physical redemption)
  - `GET /api/price/gold` → AGX-sourced gold spot price (x402-gated)
  - `GET /api/reserve/attestation` → live reserve data + ZK proof hash (x402-gated)
  - `POST /api/agx/branches` → proxy to AGX UPMA API (returns branch list for signup)
  - `GET /api/goldback-price` → calculated xGLDB price from Pyth XAU feed
- Runtime: Node.js (requires `@solana/web3.js` APIs, not Edge-compatible)
- Depends on: `@solana/web3.js`, `@solana/spl-token`, Solana RPC, x402 verification, AGX API client
- Used by: Frontend via fetch, external x402 clients

**Solana Client Layer:**
- Purpose: Stateful Solana RPC connection, wallet signing, transaction submission
- Location: `app/app/lib/solana-client.ts`, `app/app/lib/solana-client-context.tsx`, `app/app/lib/wallet/signer.ts`
- Contains:
  - `SolanaClient`: Connection wrapper around `@solana/web3.js` Connection, cluster-aware
  - `TransactionSigner` (via Wallet Standard): Delegates signing to connected wallet
  - `useBalance()`, `useTokenBalances()`, `useSendTransaction()`: Custom hooks for RPC calls
- Depends on: `@solana/web3.js`, `@solana/kit`, Solana RPC (Helius devnet endpoint)
- Used by: API routes, client-side transaction flows (mint, burn, redemption)

**Data & Library Layer:**
- Purpose: Shared utilities, constants, price derivation, error handling
- Location: `app/app/lib/`
- Key files:
  - `tokens.ts`: `OBSIDIAN_TOKENS` array (xGOLD, xSLVR, xGLDD, xSLVD, xGLDB), reserve quantities, mint addresses
  - `price-context.tsx`: `PriceProvider`, `deriveTokenPrices()` (calculates per-token USD from Pyth XAU/XAG)
  - `hooks/use-pyth-prices.ts`: Fetches live prices from Pyth Hermes REST API (10s polling)
  - `x402.ts`: `withX402Gate()` wrapper, payment verification, lamport pricing for endpoints
  - `agx-api.ts`: AGX UPMA client (branches, signup, auth)
  - `wallet/`: Wallet Standard discovery, connection, session management
  - `errors.ts`: Custom error types for Solana operations
  - `explorer.ts`: Solscan/Solana Explorer URL builders
  - `lamports.ts`: Lamport/SOL conversion utilities
- Used by: All layers above

**On-Chain Program (Anchor):**
- Purpose: SOL vault operations (deposit/withdraw) with PDA-based account derivation
- Location: `app/anchor/programs/vault/src/lib.rs`
- Contains:
  - `deposit()`: Transfer SOL from signer to PDA vault account
  - `withdraw()`: Transfer SOL from vault PDA back to signer (requires PDA signature authority)
  - `VaultAction` context: Signer, vault PDA (seed: `[b"vault", signer_key]`), system program
  - Error codes: `VaultAlreadyExists`, `InvalidAmount`
- Program ID (devnet): `F4jZpgbtTb6RWNWq6v35fUeiAsRJMrDczVPv9U23yXjB`
- Compiled IDL exported to: `app/generated/vault/` (Codama auto-generated types)
- Used by: API routes (future integration), on-chain composability

## Data Flow

**Mint Flow (Browser → Next API → Solana):**

1. User connects wallet (Phantom/Solflare) via `WalletProvider`
2. User selects token (xGOLD, xSLVR, etc.) and amount in `/protocol` page
3. Click "MINT" → POST `/api/mint` with `{ tokenSymbol, walletAddress, tokenAmount }`
4. API handler:
   - Loads mint authority keypair from `MINT_AUTHORITY_SECRET` env var
   - Derives user's ATA for Token 2022 mint using `getAssociatedTokenAddressSync()`
   - Creates `createMintToInstruction()` and `createAssociatedTokenAccountIdempotentInstruction()`
   - Signs transaction with mint authority keypair
   - Submits to Solana RPC, returns signature
5. Frontend awaits signature, displays success/error toast

**Price Display Flow (Pyth → React Context):**

1. On mount, `PriceProvider` starts `usePythPrices()` hook (client-side polling)
2. Hook fetches from Pyth Hermes REST (no API key) every 10s: XAU/USD, XAG/USD, SOL/USD
3. Parses exponent-encoded prices into USD floats
4. `deriveTokenPrices()` memo:
   - xGOLD = XAU/USD
   - xSLVR = XAG/USD
   - xGLDD = XAU / 20
   - xSLVD = XAG × 0.7734
   - xGLDB = XAU × 0.002742
5. All components subscribe via `usePrices()`, no duplicate polling anywhere

**x402 Payment Flow (Premium API):**

1. Client calls protected endpoint (e.g., `GET /api/reserve/attestation`) without `X-Payment` header
2. Server returns 402 status + `X-Payment-Required` with lamport amount and payment details
3. Client signs and submits payment transaction (off-chain, x402-solana handles details)
4. Client retries request with `X-Payment` header (base64-encoded signed transaction)
5. API `withX402Gate()` wrapper:
   - Decodes header
   - Verifies transaction goes to `PROTOCOL_TREASURY` pubkey
   - Simulates and submits on-chain
   - Passes verification result to handler
6. Handler returns protected data (signature required in response metadata)

**AGX Reserve Attestation Flow:**

1. `/reserves` page displays live reserve data
2. On demand or 1m polling: `GET /api/reserve/attestation` with x402 payment
3. API mocks AGX data (real: calls AGX System of Record API)
4. Response includes:
   - Reserve quantities (troy oz per token)
   - Reserve custody fees (25bps mint, 25bps burn, 10bps transfer, 5bps custody)
   - ZK proof status (Light Protocol compressed account hash, pending)
   - Timestamp (fresh per paid call)

**State Management (Context):**

```
Root (layout.tsx)
├─ Providers (provider tree)
│  ├─ ThemeProvider (next-themes)
│  ├─ ClusterProvider → useCluster() { cluster, setCluster }
│  ├─ SolanaClientProvider → useSolanaClient() { connection, rpc }
│  ├─ WalletProvider → useWallet() { wallet, signer, connect, disconnect }
│  └─ PriceProvider → usePrices() { tokenPrices, raw, solUsd, loading }
└─ Nav, main, Footer
   └─ Page components (all have access to all contexts)
```

Each context uses React's `useContext()` hook; consuming components must be "use client" children.

## Key Abstractions

**`withX402Gate(endpoint, handler)`:**
- Purpose: Decorator for API route handlers that enforces x402 payment verification
- Location: `app/app/lib/x402.ts`
- Pattern: `export const GET = withX402Gate("reserve_attestation", async (req, signature) => { ... })`
- Abstracts: 402 response construction, payment proof parsing, on-chain verification, transaction submission
- Returns: Either 402 with payment requirements, or handler result with verified payment signature

**`useWallet()`:**
- Purpose: Access wallet session, signer, connection state, connect/disconnect actions
- Location: `app/app/lib/wallet/context.tsx`
- Returns: `{ connectors, wallet, signer, status, error, connect(), disconnect(), isReady }`
- Integrates: Wallet Standard (auto-discovery of Phantom, Solflare, Backpack)
- Auto-reconnect: Checks `localStorage:solana:last-connector` on mount, silently re-establishes if present

**`usePrices()`:**
- Purpose: Single source of truth for all token/metal prices
- Location: `app/app/lib/price-context.tsx`
- Returns: `{ raw: PythPriceMap, tokenPrices, solUsd, loading, error, lastUpdated, refresh() }`
- Derivation: All 5 token prices calculated from 2 Pyth feeds (XAU, XAG) via `deriveTokenPrices()`
- Prevents: N duplicate Pyth API calls across N components

**`PriceProvider + usePythPrices()`:**
- Purpose: Manages Pyth REST polling lifecycle, exposes via context
- Location: `app/app/lib/price-context.tsx`, `app/app/lib/hooks/use-pyth-prices.ts`
- Pattern: Hook handles polling, context wraps and memoizes for React optimization
- Update interval: 10 seconds (configurable)

**Wallet Standard Integration (`@wallet-standard/*`):**
- Purpose: Discover and connect to multiple Solana wallets (Phantom, Solflare, Backpack)
- Location: `app/app/lib/wallet/standard.ts`, `app/app/lib/wallet/context.tsx`
- Pattern: `discoverWallets()` discovers installed wallet adapters, `watchWallets()` subscribes to changes
- Signer: Creates `TransactionSigner` from wallet session public key + signTransaction method
- Auto-reconnect: Uses localStorage to restore last-connected wallet on app reload

## Entry Points

**Frontend (Browser):**
- `app/app/layout.tsx`: Root layout, wraps `Providers`, renders `Nav` + `main` + `Footer`
- `app/app/page.tsx`: Pitch/marketing page, hero section, call-to-action links
- `app/app/protocol/page.tsx`: Live dApp (mint/burn/redeem), transaction feed, token selector
- `app/app/reserves/page.tsx`: Reserve display (AGX vault quantities, ZK proof status)
- `app/app/revenue/page.tsx`: Revenue model (fee breakdown, economic parameters)
- `app/app/developers/page.tsx`: API documentation, x402 payment guide

**API Routes (Server):**
- `app/app/api/mint/route.ts`: POST handler, mints token to ATA
- `app/app/api/redemptions/route.ts`: POST handler, records redemption metadata
- `app/app/api/price/gold/route.ts`: GET handler, returns gold spot price (x402-gated)
- `app/app/api/reserve/attestation/route.ts`: GET handler, returns reserve data (x402-gated)
- `app/app/api/agx/branches/route.ts`: GET handler, proxies to AGX UPMA branches endpoint
- `app/app/api/goldback-price/route.ts`: GET handler, calculates xGLDB price

**Anchor Program:**
- `app/anchor/programs/vault/src/lib.rs`: Declare ID, define `deposit()` and `withdraw()` instructions

## Error Handling

**Strategy:** Layered error propagation with context-specific messaging.

**Patterns:**

**Frontend:**
- React hooks throw on context unavailable: `if (!ctx) throw new Error("must be used within Provider")`
- Wallet errors caught in `WalletProvider`, stored in state: `useWallet().error`
- Price fetch errors stored and re-attempted: `usePrices().error`, `usePrices().loading`
- Toast notifications for user-facing errors (via `sonner` package)
- Custom error types in `app/app/lib/errors.ts`

**API Routes:**
- Request validation: Check required body fields, return 400 with error message
- Solana RPC errors: Catch and return 500 with reason
- AGX API errors: `AgxApiError` class wraps status + response body
- x402 payment verification: Return 402 if invalid, with error code and description

**On-Chain:**
- Anchor error codes: `VaultError::VaultAlreadyExists`, `VaultError::InvalidAmount`
- `require!()` macro checks, emit error code + message to logs

## Cross-Cutting Concerns

**Logging:** 
- No centralized logging library currently. Approach:
  - Use `console.log()` in client components (dev)
  - Use `console.error()` in API routes for server-side logs
  - On-chain: Anchor's `emit!()` macro for instruction events (not yet in vault program)
- Potential upgrade: Implement structured logging via Pino (server) or `tslog` (cross-platform)

**Validation:**
- Frontend: React component prop validation via TypeScript types
- API: Manual `if (!param) throw Error()` checks in route handlers
- On-chain: Anchor `require!()` macros and `#[account(...)]` constraints

**Authentication:**
- No centralized auth system (marketing site + permissionless dApp)
- Wallet signing as proof-of-identity: Wallet session public key = user identity
- x402 payment verification: Transaction signature on-chain = proof of payment
- AGX signup: Requires UPMA member agreement (future: OAuth flow)

**Cluster Selection:**
- `ClusterProvider` stores cluster preference in component state
- Cluster dropdown in `Nav` component calls `setCluster()`
- `SolanaClientProvider` recreates RPC Connection when cluster changes
- All RPC calls via `useSolanaClient().connection`

**Theme:**
- `next-themes` provider (dark mode default)
- CSS variables in `app/app/globals.css`: `--gold`, `--vault-gold`, `--obsidian`, etc.
- Component styling uses `style={{ color: "var(--gold)" }}` inline or Tailwind

---

*Architecture analysis: 2026-05-14*
