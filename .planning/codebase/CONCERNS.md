# Codebase Concerns

**Analysis Date:** 2026-05-14

## Tech Debt

**Mock AGX API data blocks real demo:**
- Issue: `/api/reserve/attestation` and `/api/agx/branches` still return hardcoded mock data instead of calling authenticated AGX endpoints
- Files:
  - `app/app/api/reserve/attestation/route.ts:14` - "Mock reserve data - replace with real AGX API call once authenticated"
  - `app/app/api/agx/branches/route.ts:9-15` - `MOCK_BRANCHES` hardcoded
  - `app/app/lib/agx-api.ts` - client setup present but not connected to `/api/reserve/attestation`
- Impact: AGX exec demo this Friday cannot show live reserve ratio or real vault data. Blocks earning trust in signed Sub-Distributor Agreement value. Demo will be obviously fake to AGX stakeholders.
- Fix approach: Replace `MOCK_BRANCHES` with real fetch to AGX API. Replace mock RESERVE_DATA with call to `agxFetch()` in `agx-api.ts` that pulls live custody data, audit date, vault location from AGX System of Record.
- Priority: **CRITICAL** - blocks executive demo

**Mock gold/silver price fallback in production path:**
- Issue: `/api/price/gold` has fallback stub that generates synthetic spread noise (`Math.random() - 0.5 * 0.001 * base`) instead of retrieving fresh prices
- Files: `app/app/api/price/gold/route.ts:48-51`
- Impact: Prices reported to AI agents, trading bots, and other DeFi protocols could be stale or wildly inaccurate if Pyth Hermes goes down. x402 payment verification still happens, but data integrity is compromised.
- Fix approach: Either (1) fail gracefully with 503 if Pyth unreachable, or (2) use cached last-known-good price from database. Do not serve synthetic noise as prices.

**Mock transaction feed on protocol page:**
- Issue: Protocol dashboard displays hardcoded `MOCK_TX_FEED` instead of real on-chain mint/burn/transfer events
- Files: `app/app/protocol/page.tsx:13-19`
- Impact: Misleading to visitors and team — shows fake "2.5 xGOLD minted 12s ago" that never happened. Confuses early adopters about actual volume.
- Fix approach: Connect to Helius webhook or poll program event logs from anchor-generated event discriminators to populate real tx feed.

**ZK proof status stuck at "pending_setup":**
- Issue: `/api/reserve/attestation` returns `zk_proof.status: "pending_setup"` and `proof_hash: null`
- Files: `app/app/api/reserve/attestation/route.ts:33-38`
- Impact: Blocks core product differentiator (daily ZK attestation of reserves). Exec demo cannot show cryptographic proof that AGX vault is backing xGOLD 1:1.
- Fix approach: Integrate Light Protocol compressed accounts for state attestation. Generate proof hash on-chain daily via reserve-attestor program. Return actual `proof_hash` and attestation timestamp.

**Generated Anchor program has TODO markers:**
- Issue: Auto-generated Anchor instruction files have unresolved error handling
- Files:
  - `app/app/generated/vault/instructions/withdraw.ts:262` - "// TODO: Coded error."
  - `app/app/generated/vault/instructions/deposit.ts:283` - "// TODO: Coded error."
- Impact: Generated bindings are incomplete. If these are used client-side, error mapping will fail silently.
- Fix approach: Regenerate via `npm run codama:js` after Anchor program fixes, or map errors manually in client code.

## Security Considerations

**x402 payment verification has no amount confirmation:**
- Risk: `verifyX402Payment()` checks transaction destination but does not verify amount sent matches `X402_PRICES[endpoint]`
- Files: `app/app/lib/x402.ts:130-145` - `hasValidTransfer` only checks `programId === "11111111111111111111111111111111"` (system program) and `toKey === treasuryPubkey`, not lamport amount
- Impact: Client could send 1 lamport instead of 100,000 (price_feed) and still get verified response. Breaks monetization model.
- Current mitigation: RPC-side simulation catches insufficient funds, but this is implicit. No explicit assert.
- Recommendations: Add explicit amount check: `const amount = extractTransferAmount(ix); assert(amount >= requiredLamports)` before returning `{ valid: true }`.

**AGX API key might leak to frontend:**
- Risk: `NEXT_PUBLIC_AGX_API_KEY` env var name suggests it could be published to browser bundles
- Files: `app/app/lib/agx-api.ts:25` - `process.env.NEXT_PUBLIC_AGX_API_KEY ?? ""`
- Impact: If real AGX API key is set in `.env.local`, it could be embedded in Next.js client bundle and exposed to browser devtools. AGX API is not designed for public exposure (per AGX Postman docs — authentication is server-only).
- Current mitigation: Key is used server-side only in proxy routes. Frontend calls `/api/agx/*` not direct AGX endpoints.
- Recommendations: Remove `NEXT_PUBLIC_` prefix. Use server-only env var `AGX_API_KEY` and pass through server route handlers only. Never expose to client.

**On-chain treasury wallet hardcoded to dummy pubkey:**
- Risk: Protocol receives x402 payments but default treasury is `"11111111111111111111111111111111"` (System Program)
- Files: `app/app/lib/x402.ts:26-27` - `PROTOCOL_TREASURY` defaults to dummy address, blocks real payment collection
- Impact: If deployed to devnet without `PROTOCOL_TREASURY_PUBKEY` env var set, all x402 payments go to nowhere (system program rejects transfers). No revenue collection.
- Current mitigation: Devnet only, env var override exists.
- Recommendations: Fail fast if `PROTOCOL_TREASURY_PUBKEY` is not set in production. Add validator in build that checks treasury pubkey is valid Solana address and not dummy.

**Missing x402 integration test for replay attacks:**
- Risk: `verifyX402Payment()` accepts any valid transaction signature. Same tx could be submitted twice.
- Files: `app/app/lib/x402.ts:107-166`
- Impact: Attacker could replay a confirmed payment signature to claim free calls to price feed or reserve attestation.
- Current mitigation: Blockchain confirms tx only once. Replaying the exact tx bytes will fail on-chain. But signature could be forged client-side.
- Recommendations: Track transaction signatures in-memory (or database) for 1-minute window. Return 400 if signature already verified in recent window.

**Environment secrets handling:**
- Risk: `.env.local` not in git, but no `.env.example` guide provided
- Files: Missing `.env.example` at `app/.env.example`
- Impact: New developers unclear which env vars are required. Risk of unset keys causing silent failures (e.g., AGX_API_KEY defaults to empty string, branches endpoint silently falls back to mock).
- Recommendations: Create `app/.env.example` with all required vars and sensible defaults documented:
  ```
  NEXT_PUBLIC_AGX_ENV=dev
  PROTOCOL_TREASURY_PUBKEY=YourTreasuryAddressHere
  HELIUS_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
  ```

## Performance Bottlenecks

**xGold card component is 853 lines:**
- Problem: Single component handles token selection, mint form, burn form, shipping form, payment verification, all UI states
- Files: `app/app/components/xgold-card.tsx` (853 lines)
- Cause: No extraction of sub-components (TokenPill already extracted as function, but forms and state logic not split). All local state and event handlers in one closure.
- Impact: Hard to reason about, slow re-renders when any pill is selected or form field changes, bundle size inflated. Difficult to test individual form logic.
- Improvement path: Extract `MintForm` component (~200 lines), `BurnForm` component (~250 lines), `ShippingForm` component (~150 lines). Keep parent xgold-card as orchestrator only.

**Solana RPC calls not batched:**
- Problem: `useSendTransaction` likely makes individual RPC calls per operation (simulation, send, confirmation)
- Files: `app/app/lib/hooks/use-send-transaction.ts` - not reviewed in detail, but pattern suggests sequential sends
- Impact: Latency adds up. Devnet can take 5-10s per mint if not batched. Blocks demo flow.
- Improvement path: Use `@solana/web3.js` connection batching or Helius batch RPC. Confirm + simulate in parallel.

**Price feed called on every component mount:**
- Problem: `usePrices()` context hook fetches from `/api/goldback-price` and `/api/price/gold` on every mount
- Files: `app/app/lib/price-context.tsx` - not fully reviewed, but implied by component patterns
- Impact: Heavy dApp that mounts many components (protocol page + reserves page + revenue page) will make 15+ redundant price fetches on initial load. Each fetch is x402-gated and costs lamports.
- Improvement path: Cache prices in context for 30s. Use Helius subscription for live price updates instead of polling.

## Fragile Areas

**Recently generated Anchor bindings have stale discriminators:**
- Files:
  - `app/app/generated/vault/instructions/withdraw.ts:262`
  - `app/app/generated/vault/instructions/deposit.ts:283`
  - Manual discriminators hardcoded in tests: `app/anchor/programs/vault/src/tests.rs:22, 39`
- Why fragile: If Anchor program `lib.rs` or instruction names change, generated bindings can go out of sync. Tests hardcode discriminators that won't auto-update.
- Safe modification: Regenerate via `npm run codama:js` after any on-chain instruction changes. Re-run tests to verify discriminators still match. Do not hand-edit generated files.
- Test coverage: Anchor test suite exists (`tests.rs`), but does not verify client-side discriminator alignment.

**x402 gateway hardcodes endpoint pricing:**
- Files: `app/app/lib/x402.ts:35-42` - `X402_PRICES` object baked into code
- Why fragile: If pricing changes (e.g., price feed cost drops to 50k lamports), requires code change + redeploy. No runtime configuration.
- Safe modification: Before changing prices, notify all known x402 clients (AI agents, DeFi protocols) of new costs. For now, treat as one-time MVP pricing. Plan for v2 dynamic pricing endpoint.

**AGX branch list hardcoded for fallback:**
- Files: `app/app/api/agx/branches/route.ts:9-15` - `MOCK_BRANCHES` array
- Why fragile: If AGX adds branches or changes UUIDs in production, fallback will serve stale data. No cache invalidation logic.
- Safe modification: Use `next: { revalidate: 300 }` in fetch options (already present on line 29). Increase revalidate if AGX branches change infrequently. Plan to move to database cache for Phase 2.

**Empty-module stubbing for fs import:**
- Files: `app/next.config.ts:7-14` - webpack alias for `fs: { browser: "./empty-module.js" }`
- Why fragile: Workaround for `@solana/kit-plugin-payer` spurious import. If that package updates, workaround may break or become unnecessary. Browser bundle size includes stubbed `fs` module.
- Safe modification: Track upstream `@solana/kit` updates. When fixed, remove webpack config and verify bundle still builds.

## Deployment Concerns

**Vercel build may fail on native binding rebuild:**
- Issue: Build logs show `bigint: Failed to load bindings, pure JS will be used (try npm run rebuild?)`
- Files: Build output mentions this 4+ times during `npm run build`
- Impact: npm rebuild might fail in Vercel's Linux environment if `node-gyp-build` is missing from lockfile (as mentioned in context notes). Pure JS fallback works but slower for big integer operations.
- Current context: Local build succeeds but lockfile may differ on Vercel due to platform differences. Historical issue: `node-gyp-build` was pruned locally after install.
- Recommendations: (1) Test `npm run build` in clean environment (e.g., Docker) to verify lockfile completeness. (2) Add `npm run rebuild` to Vercel build script if native bindings required. (3) Or commit to pure JS if performance acceptable.

**baseline-browser-mapping package is 2+ months outdated:**
- Issue: Build logs show `[baseline-browser-mapping] The data in this module is over two months old.` repeated 11 times
- Impact: Browser compatibility data used by Next.js might be inaccurate. Could generate incorrect polyfills for older browsers. Slows build with 11 warnings.
- Fix approach: `npm install baseline-browser-mapping@latest -D` and commit updated lockfile.

**No .env setup documentation for Vercel deployment:**
- Risk: Vercel env vars must be set manually in dashboard. No way to know which ones are required without reading source code.
- Recommendations: Create `.env.example` and document how to set each var in Vercel project settings. Or use Vercel project templates feature to auto-populate.

**Node-gyp-build lockfile issue context:**
- From context notes: "`node-gyp-build` was pruned from lockfile after my local install, may differ on Vercel"
- Files: `app/package-lock.json` (not inspected in detail)
- Risk: Vercel build might fail if `node-gyp-build` is missing, causing `bigint: Failed to load bindings` to escalate to build failure instead of graceful fallback.
- Recommendations: Run `npm ci --prefer-offline` locally to match Vercel's install behavior. Verify `node-gyp-build` is present in resolved dependencies.

## Missing Critical Features

**No test suite for frontend (0% coverage):**
- What's missing: No Jest/Vitest config, no test files in `app/app/`. Only Anchor program has tests.
- Files: No `jest.config.js`, `vitest.config.ts`, or `*.test.tsx` files in `app/app/`
- Risk: Mint/burn flow untested. Component state regressions undetected. UI breaks in demo with no safety net.
- Priority: **HIGH** - exec demo is this Friday. Need smoke tests for mint and burn flows at minimum.
- Approach: Add Vitest + React Testing Library. Write tests for:
  1. `XGoldCard` - mint form submission, state transitions
  2. `ReserveCard` - fetch and render live reserve data
  3. `x402Gate` wrapper - payment requirement response, verification flow
  4. Jupiter quote hook - handles zero balance, network errors
  5. Redemption flow - shipping form validation, POST to `/api/redemptions`

**No continuous integration:**
- What's missing: No GitHub Actions, pre-commit hooks, or lint checks enforced before merge
- Impact: Broken code can be pushed. TypeScript errors, style inconsistencies, build failures go unnoticed until production.
- Referenced config exists but not active: `.eslintrc` + `prettier` config present but `npm ci` doesn't enforce them.
- Approach: Add `.github/workflows/ci.yml` that runs `npm run ci` (build + lint + format check) on every PR.

**No Anchor program audit or security scan:**
- What's missing: No formal security review of `app/anchor/programs/vault/`
- Impact: Vault program handles real SOL transfers and token mints. Critical path for AGX partnership. Bugs could lose custody of vault.
- Approach: Schedule Anchor-certified security firm (e.g., Trail of Bits, Neodyme) for Phase 1.5 pre-mainnet audit. Until then, use Solana Fender MCP for automated checks.

## Test Coverage Gaps

**Anchor program missing instruction error path tests:**
- What's not tested: Error paths in `deposit` and `withdraw` instructions (marked TODO in generated bindings)
- Files: `app/anchor/programs/vault/src/tests.rs` - only basic happy-path tests. No coverage for:
  - Insufficient balance deposit
  - Overflow on large amounts
  - Invalid account ownership
  - Double-spend attempts
- Risk: Logic errors in error handling undetected. Could cause panics in production.
- Priority: **HIGH** - vault is critical path
- Approach: Add test cases for each error enum variant in vault program.

**x402 payment verification untested for:**
- What's not tested: No tests for x402 signature verification, amount validation, replay attacks
- Files: `app/app/lib/x402.ts:107-166` - pure server-side logic with no test file
- Risk: Payment verification bugs silently allow free API access or payment theft.
- Approach: Create `app/app/lib/__tests__/x402.test.ts` with cases for:
  1. Missing X-Payment header → returns 402
  2. Malformed X-Payment → returns 402 with error
  3. Valid payment → returns data with signature
  4. Invalid destination → returns 402
  5. Insufficient amount → returns 402
  6. Same signature twice → should reject (replay prevention)

**Price feed fallback not tested:**
- What's not tested: `/api/price/gold` fallback when Pyth unreachable
- Files: `app/app/api/price/gold/route.ts:48-51` - `fallbackSpot()` not covered by tests
- Risk: If Pyth goes down during exec demo, demo uses synthetic noise prices. No way to verify behavior before live event.
- Approach: Mock Pyth Hermes in test, make requests fail, verify fallback response structure and price ranges.

**Mock AGX integration untested:**
- What's not tested: `/api/agx/branches` fallback when AGX unreachable
- Files: `app/app/api/agx/branches/route.ts:23-38` - mock fallback not tested
- Risk: If AGX API is slow/down at demo time, fallback kicks in. Branch UUIDs may be stale, causing mint authorization to fail silently.
- Approach: Test both success and failure paths:
  1. AGX returns branches → passes through
  2. AGX 500s → serves mock
  3. Mock matches current AGX structure (verify against AGX API docs)

## Mock-vs-Production Gaps That Block Real AGX Exec Demo

**Reserve attestation cannot be verified against real AGX data:**
- Current state: `/api/reserve/attestation` returns hardcoded custodian, gold oz, price, audit date, vault location
- What AGX exec will see: Data that looks plausible but has no cryptographic proof of origin
- What's needed: Fetch from AGX System of Record API (authenticated) to prove Obsidian Protocol is authorized as Sub-Distributor with real custody data
- Blocker for demo: If AGX VP sees demo pulls from mock data, credibility loss. Partnership value unclear.
- Fix: Implement `agxFetch("/api/vault/custody", headers)` in `/api/reserve/attestation` route. Include in ZK attestation hash.

**Mint authorization signature cannot come from AGX:**
- Current state: No `/api/mint/authorize` endpoint that calls AGX to request mint authorization
- Missing component: AGX API flow to verify "user has AGX account + sufficient custody balance + is authorized to mint"
- What's needed: Client submits mint request → backend hits AGX System of Record → AGX signs authorization → server returns to client → client broadcasts tx
- Blocker for demo: Cannot show "real" xGOLD mint because AGX hasn't authorized it. Demo mint is fake.
- Fix: Implement full AGX auth flow. Requires AGX API credentials + vault account setup.

**Gold price not live from AGX:**
- Current state: `/api/price/gold` fetches from Pyth Hermes (correct), but `/api/reserve/attestation` hardcodes price
- Gap: Reserve attestation should use current spot price from `/api/price/gold` to calculate real `totalValueUsd`
- Blocker for demo: Reserve value shown to AGX exec is stale (3178.5 USD per oz is frozen).
- Fix: At attestation time, fetch current Pyth price and recalculate reserve value dynamically.

**Transaction feed is 100% fake:**
- Current state: `MOCK_TX_FEED` on protocol page shows fake mints/burns/transfers
- What AGX exec will see: Fake transaction volume, 0 real txs on-chain
- What's needed: Real transaction log from on-chain program events
- Blocker for demo: If exec checks Solana explorer during meeting, sees no actual mints. Credibility destroyed.
- Fix: Deploy vault program to devnet. Mint 1-2 tokens live during demo. Show real tx signatures in feed.

---

**Summary of blocking issues for Friday AGX exec demo:**

| Issue | Impact | Fix Effort | Priority |
|-------|--------|-----------|----------|
| Mock reserve data in `/api/reserve/attestation` | Demo shows fake reserve, AGX sees unverified data | 2-3h (AGX auth) | **CRITICAL** |
| Mock tx feed on protocol page | 0 real txs, exec sees fake volume | 1h (event logging) | **CRITICAL** |
| ZK proof status "pending_setup" | No proof of 1:1 backing shown | 4-6h (Light Protocol) | **CRITICAL** |
| Missing mint authorization endpoint | Cannot mint in live demo | 3-4h (AGX flow) | **CRITICAL** |
| No test suite | Demo breaks, no regression detection | 2-3 days | **HIGH** |
| Anchor program TODO markers | Incomplete error handling | 1-2h | **MEDIUM** |
| baseline-browser-mapping outdated | Build warnings, possible compat issues | 10min | **LOW** |

---

*Concerns audit: 2026-05-14*
