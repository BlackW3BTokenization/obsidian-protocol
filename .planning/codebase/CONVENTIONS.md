# Coding Conventions

**Analysis Date:** 2026-05-14

## Naming Patterns

**Files:**
- Kebab-case for components: `wallet-balance-card.tsx`, `cluster-context.tsx`, `use-balance.ts`
- Kebab-case for API routes: `/api/mint/route.ts`, `/api/price/gold/route.ts`, `/api/reserve/attestation/route.ts`
- Kebab-case for utility modules: `solana-client.ts`, `lamports.ts`, `explorer.ts`

**Functions:**
- PascalCase for React components: `WalletBalanceCard`, `ClusterProvider`, `SectionEyebrow`
- camelCase for regular functions: `parseTransactionError`, `getDeepestMessage`, `getInitialCluster`
- camelCase with `use` prefix for custom hooks: `useBalance`, `useSolanaClient`, `useCluster`, `usePrices`, `useJupiterQuote`

**Variables:**
- camelCase for local variables: `cluster`, `address`, `balance`, `blockhash`, `ata`
- UPPER_SNAKE_CASE for constants: `LAMPORTS_PER_SOL`, `CLUSTERS`, `STORAGE_KEY`, `RPC`, `VAULT_ERROR_CODES`
- Descriptive names for server-side error messages: `USER_REJECTED`, `VAULT_ALREADY_EXISTS`

**Types:**
- PascalCase for type names: `ClusterMoniker`, `ClusterContextValue`, `VaultError`, `HermesFeed`, `FintechIconName`
- Suffix `Props` for component props interfaces (implicit convention: destructured in function params)
- Suffix `Error` for error type enums: `VaultError`

## Code Style

**Formatting:**
- Prettier 3.6.2
- 2-space indentation
- Double quotes for strings (never single quotes)
- Semicolons required
- Trailing commas in ES5 mode

**Key settings (`.prettierrc`):**
```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**Linting:**
- ESLint 9 with Next.js core-web-vitals and TypeScript presets
- Config: `app/eslint.config.mjs` (flat config format)
- Ignores generated Codama files (`app/generated/**`) and Next.js build outputs

## Import Organization

**Order:**
1. React imports: `import { useState } from "react"`
2. Next.js imports: `import Link from "next/link"`, `import { usePathname } from "next/navigation"`
3. Third-party libraries: `import useSWR from "swr"`, `import { toast } from "sonner"`
4. Solana/blockchain imports: `import { type Address } from "@solana/kit"`, `import { Connection } from "@solana/web3.js"`
5. Local imports (relative paths only): `import { useCluster } from "../lib/solana-client"`
6. Type imports: `import type { ClusterMoniker } from "../lib/solana-client"`

**Path Aliases:**
- `@/*` alias is configured in `tsconfig.json` but **not used in practice**
- All imports use **relative paths exclusively**: `"../lib"`, `"../../components"`, not `@/lib`

**Examples:**
```typescript
// ✓ Correct: relative paths
import { useBalance } from "../lib/hooks/use-balance";
import { WalletButton } from "./wallet-button";

// ✗ Not used: alias imports (available but convention is relative)
// import { useBalance } from "@/app/lib/hooks/use-balance";
```

## Error Handling

**Pattern: Parse-and-humanize approach**

`app/app/lib/errors.ts` provides `parseTransactionError(err: unknown): string`:

```typescript
// Wallet rejection detection
if (err instanceof Error && err.message.includes("User rejected")) {
  return "Transaction was rejected by the wallet.";
}

// Anchor custom program errors
if (isSolanaError(err, SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM)) {
  const vaultError = VAULT_ERROR_CODES[err.context?.code];
  return getVaultErrorMessage(vaultError); // Codama-generated messages
}

// Deep message extraction
const message = getDeepestMessage(err); // Walk error.cause chain
return message.length > 200 ? `${message.slice(0, 200)}...` : message;
```

**Usage in components:**
```typescript
try {
  const sig = await client.airdrop(address, sol(1_000_000_000n));
  toast.success("Airdrop received", { description: ... });
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  const isRateLimited = msg.includes("429") || msg.includes("Internal JSON-RPC error");
  toast.error(isRateLimited ? "Devnet faucet rate-limited." : "Airdrop failed.");
}
```

**API route error handling:**
```typescript
// /api/mint/route.ts pattern
try {
  // Main logic
} catch (err) {
  const message = err instanceof Error ? err.message : "Unknown error";
  console.error("[/api/mint] Unhandled error:", message);
  return NextResponse.json({ ok: false, error: message }, { status: 500 });
}
```

## Logging

**Framework:** `console` (no abstraction library)

**Patterns:**
- Server-side routes log with prefixed brackets: `console.log("[/api/mint] Minted ...")`, `console.error("[/api/mint] Unhandled error: ...")`
- Client-side uses toast notifications (`sonner`) for user feedback instead of logs
- No structured logging framework detected

**Example:**
```typescript
console.log("[/api/mint] Minted", tokenAmount, tokenSymbol, "→", walletAddress, "| sig:", sig);
console.error("[/api/mint] sendRawTransaction failed:", msg, "\nLogs:\n", logs.join("\n"));
```

## Comments

**When to Comment:**
- JSDoc for public module functions and hooks
- Inline comments (`//`) for non-obvious logic, especially in Solana-specific code
- Block comments (`/* */`) for file headers explaining purpose (common in API routes)

**JSDoc/TSDoc:**
Used minimally but present. Example from `app/app/components/primitives.tsx`:
```typescript
/**
 * Section eyebrow: gold rule + uppercase Chakra Petch label.
 * The canonical pattern across every section in the design system.
 */
export function SectionEyebrow({ ... }) { ... }
```

Example from API routes:
```typescript
/**
 * /api/mint — server-side Token-2022 mint
 * 
 * Mint authority keypair is stored in MINT_AUTHORITY_SECRET env var (base58).
 * Call after running: node scripts/create-devnet-mints.mjs
 * 
 * POST { tokenSymbol, walletAddress, tokenAmount }
 * → { ok: true, signature: string }
 */
```

## Function Design

**Size:** Generally 30–80 lines for components, 20–50 for utilities

**Parameters:**
- React components use destructured props object
- Hooks destructure context and state: `const { cluster } = useCluster()`
- API routes accept `NextRequest` and return `NextResponse`
- Utility functions keep parameters minimal (1–3)

**Return Values:**
- Hooks return single object with properties: `return { lamports, isLoading, error, mutate }`
- Components return JSX (implicit)
- API routes return `NextResponse.json()`
- Utilities return data or `undefined` on missing data

**Examples:**

Hook:
```typescript
export function useBalance(address?: Address) {
  // ...
  return {
    lamports: (data ?? null) as Lamports | null,
    isLoading,
    error,
    mutate,
  };
}
```

Component:
```typescript
export function WalletBalanceCard() {
  const { wallet, status } = useWallet();
  const { cluster, getExplorerUrl } = useCluster();
  // ...
  return <section>...</section>;
}
```

## Module Design

**Exports:**
- Named exports preferred for components and utilities
- Default exports avoid (convention: use named)

**Barrel Files:**
- Not extensively used; imports are direct file paths
- Example: `export { CLUSTERS }` re-export from `cluster-context.tsx`

**Context/Provider Pattern:**
```typescript
// Create context
const ClusterContext = createContext<ClusterContextValue | null>(null);

// Export Provider component
export function ClusterProvider({ children }: { children: ReactNode }) { ... }

// Export custom hook
export function useCluster() {
  const ctx = useContext(ClusterContext);
  if (!ctx) throw new Error("useCluster must be used within ClusterProvider");
  return ctx;
}
```

## Tailwind CSS

**Utility classes:** Heavily used inline in component `className` and inline `style` props

**Pattern:**
- Mix Tailwind utilities with CSS custom variables
- Example from `wallet-balance-card.tsx`:
```tsx
<section
  className="relative w-full overflow-hidden border corner-brackets px-5 py-6"
  style={{ borderColor: "var(--carbon)", background: "var(--void)" }}
>
```

- Complex styling uses inline styles for design tokens: `color: "var(--gold)"`, `background: "rgba(200,150,12,0.1)"`
- No CSS modules or styled-components; all inline

## TypeScript

**Strict mode:** Enabled in `tsconfig.json`

**Casting:** Minimal; used only where necessary
```typescript
return stored as ClusterMoniker; // Type narrowing after validation
(data ?? null) as Lamports | null; // Explicit null typing
```

**Types from external packages:**
```typescript
import type { Address, Lamports } from "@solana/kit";
import type { ClusterMoniker } from "../lib/solana-client";
```

## Solana-specific Conventions

**SDK:** `@solana/kit` (per CLAUDE.md)

**Imports:**
```typescript
import { lamports as sol } from "@solana/kit";
import { type Address, type Lamports } from "@solana/kit";
```

**Legacy web3.js** used in server routes only (not Edge-compatible):
```typescript
import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
```

**Client configuration:**
- `app/app/lib/solana-client.ts` — singleton Solana client creator
- `app/app/lib/solana-client-context.tsx` — React context provider
- Always memoized: `useMemo(() => createSolanaClient(cluster), [cluster])`

## Commit Messages

**Format:** Conventional Commits

**Examples from git history:**
- `feat: waitlist modal + nav integration`
- `fix: block horizontal scroll at gesture + compositing level`
- `feat(landing): add BackedBy partner logo marquee section`
- `style(font): swap Chakra Petch for Bebas Neue on display font`

**Types:** `feat:`, `fix:`, `style:`, `chore:`, `docs:`, optionally with scope `feat(scope):`

## Next.js App Router Conventions

**File structure:**
- Pages: `app/app/page.tsx`, `app/app/protocol/page.tsx`
- Layouts: `app/app/layout.tsx`, `app/app/protocol/layout.tsx`
- API routes: `app/app/api/*/route.ts`

**Route handlers:**
```typescript
export const runtime = "nodejs"; // Force Node.js runtime for web3.js

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { ... };
    // Logic
    return NextResponse.json({ ok: true, ... });
  } catch (err) {
    return NextResponse.json({ ok: false, error: ... }, { status: 500 });
  }
}
```

**Client components:**
- Always marked with `"use client"` at top
- Can use hooks, state, event handlers

**Server-side utility functions:**
- No `"use client"` directive
- Used from client components via async API calls or server actions

---

*Convention analysis: 2026-05-14*
