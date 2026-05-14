# External Integrations

**Analysis Date:** 2026-05-14

## APIs & External Services

**AGX / UPMA (Alpine Gold Exchange):**
- AGX System of Record API - Reserve vault data + tokenization authorization
  - SDK/Client: Custom fetch-based client in `app/app/lib/agx-api.ts`
  - Auth: `NEXT_PUBLIC_AGX_API_KEY` header (X-Api-Key)
  - Endpoints: 
    - `GET /api/referral_sources/branches` - List AGX branches (proxied through Next.js at `/api/agx/branches`)
    - `POST /api/auth/signup` - Create UPMA member account
  - Environments: dev (dev.member.upma.org), qa (qa.member.upma.org), prod (member.upma.org)
  - Environment config: `NEXT_PUBLIC_AGX_ENV` (default: dev)
  - Status: Signed Sub-Distributor Agreement for tokenization rights and vault attestation

**Pyth Network:**
- Live precious metals price feeds (XAU/USD, XAG/USD) + SOL/USD
  - SDK/Client: @pythnetwork/price-service-client 1.11.0 + custom Hermes REST API polling
  - Feed IDs:
    - XAU/USD: 0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2
    - XAG/USD: 0xf2fb02c32b055c805e7238d628e5e9dadef274376114eb1f012337cabe93871e
    - SOL/USD: 0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d
  - Endpoint: https://hermes.pyth.network/v2/updates/price/latest
  - Auth: None (public API)
  - Poll interval: 10 seconds client-side (see `app/app/lib/hooks/use-pyth-prices.ts`)
  - Usage: Derives all 5 token prices (xGOLD, xSLVR, xGLDD, xSLVD, xGLDB)

**Jupiter (DEX Aggregator):**
- Swap routing and quote engine (SOL → token pairs)
  - SDK/Client: @jup-ag/api 6.0.48 + custom HTTP calls in `app/app/lib/hooks/use-jupiter-quote.ts`
  - Endpoints:
    - GET /swap/v1/quote - Fetch quote for swap pair
    - POST /swap/v1/swap - Build serialized swap transaction
  - Base URL: https://lite-api.jup.ag
  - Auth: None (public API)
  - Status: On devnet, BLKW3B tokens have no liquidity pools; fallback to Pyth-derived pricing

**Helius (RPC Provider):**
- Solana JSON-RPC endpoint for blockchain queries and transaction submission
  - SDK/Client: Built into @solana/kit via rpc plugin
  - Config: `HELIUS_RPC_URL` environment variable
  - Default: https://api.devnet.solana.com (can override with Helius endpoint)
  - Methods: sendRawTransaction, simulateTransaction, confirmTransaction, getBalance, etc.
  - Usage: All blockchain read/write operations for x402 payment verification

## Data Storage

**Databases:**
- None detected - Stateless frontend + Anchor on-chain program

**File Storage:**
- Local filesystem only - No cloud storage integration detected
- Generated files: `app/app/generated/` (Codama-generated IDL clients)

**Caching:**
- In-memory state via React hooks (useState, useRef)
- SWR 2.2.0 for HTTP response caching with automatic revalidation

**Blockchain State:**
- Solana devnet/mainnet as source of truth for:
  - Token accounts (SPL Token 2022)
  - Program state (Anchor vault program)
  - Transaction history

## Authentication & Identity

**Auth Provider:**
- Wallet Standard - Decentralized, wallet-based auth (no centralized auth provider)
  - Implementation: `app/app/lib/wallet/standard.ts`
  - Supported wallets: Phantom, Solflare, Backpack (via Wallet Standard protocol)
  - Features: 
    - StandardConnect / StandardDisconnect - Connection lifecycle
    - SolanaSignTransaction - Sign transactions
    - SolanaSignAndSendTransaction - Sign + broadcast
  - Discovery: `getWallets()` from @wallet-standard/app detects installed wallets
  - Watch mode: Real-time wallet registration/unregistration events

**AGX UPMA:**
- Custom credentials (email/password) for AGX member accounts
  - Signup: `signup()` function in `app/app/lib/agx-api.ts`
  - Token-based session (returned in signup response)
  - Required fields: firstName, lastName, email, password, address, birthDate, securityQuestion, etc.

## Monitoring & Observability

**Error Tracking:**
- None detected - No Sentry, Rollbar, or similar integration

**Logs:**
- Console-based only (no centralized logging service)
- Client-side errors logged to browser console
- Server-side route handlers may log to Vercel runtime logs

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from Next.js 16 + `next.config.ts`)

**CI Pipeline:**
- None detected - No GitHub Actions, GitLab CI, or CircleCI config found
- Commands available: `npm run ci` runs build + lint + format:check

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_AGX_API_KEY` - AGX API authentication
- `HELIUS_RPC_URL` - (Optional; defaults to https://api.devnet.solana.com)
- `SOLANA_NETWORK` - (Optional; defaults to devnet)
- `NEXT_PUBLIC_AGX_ENV` - (Optional; defaults to dev)
- `PROTOCOL_TREASURY_PUBKEY` - Wallet receiving x402 payments (defaults to system program)

**Secrets location:**
- Environment variables via `.env.local` (Next.js standard)
- Secrets not found in repository (correctly .gitignored)

## Webhooks & Callbacks

**Incoming:**
- None detected - Application is query-based (GET/POST to external APIs)

**Outgoing:**
- x402 payment gateway: Clients submit signed transactions with `X-Payment` header
  - Payment verification: `verifyX402Payment()` in `app/app/lib/x402.ts`
  - Endpoints gated: `/api/reserve/attestation`, `/api/price/gold`, `/api/mint/authorize`
  - Payment flow: Client calculates x402 requirements → builds + signs SOL transfer → sends with X-Payment header

## Payment Gateway

**x402 Protocol:**
- HTTP 402 Payment Required - gold-native micropayments via Solana
  - SDK: x402-solana 2.0.4
  - Pricing (lamports):
    - Reserve attestation: 500,000 (0.0005 SOL)
    - Price feed: 100,000 (0.0001 SOL)
    - Mint authorization: 1,000,000 (0.001 SOL)
  - Gateway implementation: `app/app/lib/x402.ts`
  - Wrapper: `withX402Gate()` protects API routes
  - Payment requirements: Returned in 402 response if X-Payment header absent
  - Verification: On-chain transaction simulation + confirmation before endpoint execution
  - Treasury: Configurable via `PROTOCOL_TREASURY_PUBKEY`

## Blockchain Networks

**Solana:**
- Devnet (development): https://api.devnet.solana.com
  - Program address: F4jZpgbtTb6RWNWq6v35fUeiAsRJMrDczVPv9U23yXjB
  - Token mints: Not finalized (under development for AGX exec meeting demo)
  - Validator: Surfpool (local development)

- Mainnet (production): https://api.mainnet-beta.solana.com
  - Configured but not yet deployed
  - Token deployment pending AGX partnership funding ($250K SOW)

**RPC Methods Utilized:**
- sendRawTransaction - Submit signed transactions
- simulateTransaction - Pre-flight check x402 payments
- confirmTransaction - Poll transaction status
- getBalance - Query SOL account balances
- getTokenAccountsByOwner - Fetch token holdings

## SPL Token 2022

**Token Standard:**
- SPL Token 2022 (with extensions) for all 5 tokens:
  - xGOLD - Tokenized gold bullion (1 troy oz)
  - xSLVR - Tokenized silver bullion (1 troy oz)
  - xGLDD - Tokenized gold dollar coin (1/20 oz gold)
  - xSLVD - Tokenized silver dollar coin (0.7734 oz silver)
  - xGLDB - Tokenized Goldback note (variable, tracks gold price)
- Client: @solana/spl-token 0.4.14

---

*Integration audit: 2026-05-14*
