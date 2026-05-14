# Testing Patterns

**Analysis Date:** 2026-05-14

## Test Framework

**Frontend:**
- **No frontend test framework detected** — No Jest, Vitest, or testing-library config found
- No `.ts`/`.tsx` test files in `app/app/` directory
- No vitest.config.ts, jest.config.js, or equivalent setup

**Backend/Anchor Programs:**
- **LiteSVM** (Solana Lite VM) — lightweight in-process validator
- **Rust test modules** — native `#[cfg(test)]` + `#[test]` attributes
- **No test runner abstraction** — uses `cargo test` directly via `Anchor.toml` scripts

**Run Commands:**
```bash
npm run anchor-test  # cd anchor && anchor test --skip-deploy
cargo test           # Raw Rust test execution (fallback)
```

## Test File Organization

**Anchor Programs:**
- Location: `app/anchor/programs/vault/src/tests.rs`
- Naming: `tests.rs` (co-located with source in same module)
- Structure: Single `#[cfg(test)] mod tests { ... }` block at end of library

**Frontend:**
- No test files detected
- Coverage: Gap identified — see Test Coverage Gaps below

## Test Structure

**Rust (Anchor) Test Pattern:**

```rust
#[cfg(test)]
mod tests {
    use crate::ID as PROGRAM_ID;
    use litesvm::LiteSVM;
    use solana_sdk::{
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey,
        signature::Keypair,
        signer::Signer,
        system_program,
        transaction::Transaction,
    };

    const LAMPORTS_PER_SOL: u64 = 1_000_000_000;

    // Helper functions
    fn get_vault_pda(signer: &Pubkey) -> (Pubkey, u8) {
        Pubkey::find_program_address(&[b"vault", signer.as_ref()], &PROGRAM_ID)
    }

    fn create_deposit_ix(signer: &Pubkey, vault: &Pubkey, amount: u64) -> Instruction {
        let discriminator: [u8; 8] = [242, 35, 198, 137, 82, 225, 242, 182];
        let mut data = discriminator.to_vec();
        data.extend_from_slice(&amount.to_le_bytes());
        Instruction { program_id: PROGRAM_ID, accounts: vec![...], data }
    }

    // Individual test
    #[test]
    fn test_deposit_and_withdraw() {
        let mut svm = LiteSVM::new();
        svm.add_program(PROGRAM_ID, program_bytes);
        
        let user = Keypair::new();
        svm.airdrop(&user.pubkey(), 10 * LAMPORTS_PER_SOL).unwrap();
        
        // Execute instruction
        let result = svm.send_transaction(deposit_tx);
        assert!(result.is_ok(), "Deposit should succeed");
        
        // Verify state
        let vault_account = svm.get_account(&vault_pda).unwrap();
        assert_eq!(vault_account.lamports, deposit_amount);
    }
}
```

**Key characteristics:**
- Setup: Manual instruction construction (Anchor discriminators hardcoded)
- Execution: LiteSVM transaction simulation in-process
- Assertion: Rust `assert!` and `assert_eq!`
- No teardown: LiteSVM state discarded after test

## Mocking

**Solana Programs (Rust):**
- LiteSVM provides fake blockchain state (in-memory)
- No external service mocking — programs tested in isolation
- Mock data injected via `svm.add_program()` and `svm.airdrop()`

**Frontend (if tests existed):**
- Not applicable — no frontend tests present

**Pattern (Anchor):**
```rust
let mut svm = LiteSVM::new();                          // Fresh isolated state
svm.add_program(PROGRAM_ID, program_bytes);           // Load program under test
svm.airdrop(&user.pubkey(), 10 * LAMPORTS_PER_SOL);   // Seed test account
let result = svm.send_transaction(tx);                // Execute in sandbox
```

## Fixtures and Factories

**Test Data (Anchor):**
- Helper functions for instruction creation:
  ```rust
  fn create_deposit_ix(signer: &Pubkey, vault: &Pubkey, amount: u64) -> Instruction { ... }
  fn create_withdraw_ix(signer: &Pubkey, vault: &Pubkey) -> Instruction { ... }
  ```
- Constants for account setup:
  ```rust
  const LAMPORTS_PER_SOL: u64 = 1_000_000_000;
  ```
- PDA derivation utilities:
  ```rust
  fn get_vault_pda(signer: &Pubkey) -> (Pubkey, u8) { ... }
  ```

**Location:** Inline in `tests.rs` module (no separate fixtures file)

## Coverage

**Requirements:** Not enforced (no coverage reporting config detected)

**Current state:**
- Anchor programs: 2 unit tests (`test_deposit_and_withdraw`, `test_deposit_fails_if_vault_has_funds`, `test_withdraw_fails_if_vault_empty`)
- Frontend: 0% coverage (no tests)
- API routes: 0% coverage (no tests)

**View Coverage (not implemented):**
- `cargo tarpaulin` would work for Rust but not configured
- `npm run coverage` not defined in `package.json`

## Test Types

**Unit Tests (Anchor):**
- Scope: Individual program instructions (deposit, withdraw)
- Approach: LiteSVM simulation, manual transaction construction
- Example: `test_deposit_and_withdraw()` exercises a full workflow

**Integration Tests:**
- **Not present** — Anchor tests run in-process, not full-stack
- No tests for API routes calling program instructions

**E2E Tests:**
- **Not implemented** — No Playwright, Cypress, or similar
- No browser automation or devnet workflow tests

## Common Patterns

**Async Testing:**
Not applicable to Rust unit tests. LiteSVM operations are synchronous.

**Error Testing (Anchor):**
```rust
#[test]
fn test_deposit_fails_if_vault_has_funds() {
    let mut svm = LiteSVM::new();
    // ... setup first deposit ...
    svm.send_transaction(tx).unwrap(); // Success
    
    // Second deposit should fail
    let result = svm.send_transaction(tx2);
    assert!(result.is_err(), "Second deposit should fail");
}
```

**State Verification (Anchor):**
```rust
// Check vault balance after operation
let vault_account = svm.get_account(&vault_pda).unwrap();
assert_eq!(vault_account.lamports, deposit_amount);

// Check empty after withdraw
let vault_account = svm.get_account(&vault_pda);
assert!(
    vault_account.is_none() || vault_account.unwrap().lamports == 0,
    "Vault should be empty"
);
```

---

## Test Coverage Gaps

**Critical gaps identified:**

### Frontend (React/Next.js) — No tests
**What's not tested:**
- Component rendering (`WalletBalanceCard`, `ClusterSelect`, `Nav`, etc.)
- Hook behavior (`useBalance`, `useSolanaClient`, `useCluster`, custom hooks)
- Error handling UI (toast notifications)
- User interactions (button clicks, form inputs)
- Context providers and state management

**Files affected:**
- `app/app/components/**/*.tsx` — All components
- `app/app/lib/hooks/**/*.ts` — All custom hooks
- `app/app/lib/**/*-context.tsx` — All context providers

**Risk:** Medium-High — UI regressions not caught; wallet integration changes could break silently

**Priority:** High for Phase 2+ (after MVP stability)

### API Routes — No tests
**What's not tested:**
- `/api/mint/route.ts` — Mint authority, Token-2022 account creation, transaction signing, error handling
- `/api/price/gold/route.ts` — Pyth feed parsing, fallback logic, x402 gating
- `/api/redemptions/route.ts` — Redemption submission and validation
- `/api/agx/branches/route.ts` — AGX API integration
- `/api/reserve/attestation/route.ts` — Payment gating and data formatting

**Files affected:**
- `app/app/api/**/*.ts` — All API routes

**Risk:** High — Mint/burn/redeem workflows untested; AGX integration changes could break

**Priority:** Critical for production (before launch)

### Anchor Programs — Partial coverage
**What IS tested:**
- Basic deposit/withdraw workflow
- Vault exists check (prevents double-deposit)
- Empty vault check for withdraw

**What's NOT tested:**
- PDA derivation correctness (assumed working)
- Transaction fee scenarios (no fee testing)
- Multiple programs interaction (if applicable)
- Program upgrade paths
- Edge cases (max u64 amounts, overflow protection)
- Permission/authorization (if relevant)

**Files affected:**
- `app/anchor/programs/vault/src/lib.rs` — Primary program logic

**Risk:** Medium — Core MVP tested but edge cases untested

**Priority:** Medium-High for robustness beyond MVP

---

## Recommended Testing Strategy

### Phase 1 (MVP) — Current
- Keep Anchor tests focused on happy path (deposit/withdraw)
- `npm run anchor-test` gates deploy confidence

### Phase 2 (Post-MVP)
1. **Add API route tests** using Node.js + ts-node:
   - Mock Solana RPC responses
   - Test error handling paths
   - Verify x402 gating logic

2. **Add component tests** using Vitest + @testing-library/react:
   - Wallet connection/disconnection
   - Hook data fetching (useBalance, usePrices)
   - Error toast notifications

3. **Expand Anchor tests:**
   - Edge case amounts
   - Authorization checks
   - Multi-signature scenarios (if protocol adds)

### Phase 3 (Production-ready)
1. **E2E tests** (Playwright or similar):
   - Full wallet → mint → balance flow on devnet
   - AGX reserve attestation API call

2. **Load testing:**
   - Mint throughput
   - API rate limiting

---

## Config Files

**Anchor/Rust:**
- `app/anchor/Anchor.toml` — Test script: `test = "cargo test"`
- `app/anchor/Cargo.toml` — Release profile with overflow checks, LTO

**Frontend:**
- No vitest.config.ts or jest.config.js (not yet present)
- ESLint configured but no test linter rules

---

*Testing analysis: 2026-05-14*
