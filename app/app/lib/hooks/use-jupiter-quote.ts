"use client";

/**
 * use-jupiter-quote.ts
 *
 * Fetches a live Jupiter swap quote: SOL → Obsidian token.
 * On devnet, BLKW3B tokens have no Jupiter liquidity — the hook returns
 * `noRoute: true` and the caller falls back to Pyth-derived math.
 *
 * API: https://lite-api.jup.ag/swap/v1/quote
 */

import { useEffect, useRef, useState, useCallback } from "react";

const JUP_QUOTE_URL  = "https://lite-api.jup.ag/swap/v1/quote";
const JUP_SWAP_URL   = "https://lite-api.jup.ag/swap/v1/swap";
const SOL_MINT       = "So11111111111111111111111111111111111111112";
const LAMPORTS_PER_SOL = 1_000_000_000;

export interface JupiterQuote {
  inAmount:       number;   // lamports
  outAmount:      number;   // token native units (with decimals)
  outAmountFloat: number;   // outAmount / 10^decimals
  priceImpact:    string;   // "0.01%"
  minReceived:    number;   // after slippage
  routeLabel:     string;   // e.g. "Orca → Raydium"
  raw:            JupQuoteResponse;
}

export interface JupQuoteResponse {
  inputMint:        string;
  inAmount:         string;
  outputMint:       string;
  outAmount:        string;
  otherAmountThreshold: string;
  swapMode:         string;
  slippageBps:      number;
  priceImpactPct:   string;
  routePlan:        Array<{ swapInfo: { label: string } }>;
}

export interface UseJupiterQuoteResult {
  quote:    JupiterQuote | null;
  loading:  boolean;
  noRoute:  boolean;         // true when no Jupiter liquidity (devnet)
  error:    string | null;
}

const DEBOUNCE_MS = 500;

export function useJupiterQuote(
  solAmount: number,          // SOL to swap (float)
  outputMint: string,         // token mintAddress
  decimals: number,           // token decimals
  slippageBps = 50,           // 0.5%
): UseJupiterQuoteResult {
  const [quote,   setQuote]   = useState<JupiterQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [noRoute, setNoRoute] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchQuote = useCallback(async (sol: number) => {
    if (sol <= 0) {
      setQuote(null); setNoRoute(false); setError(null); setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const lamports = Math.floor(sol * LAMPORTS_PER_SOL);
      const url = `${JUP_QUOTE_URL}?inputMint=${SOL_MINT}&outputMint=${outputMint}&amount=${lamports}&slippageBps=${slippageBps}`;
      const res = await fetch(url);

      if (res.status === 400 || res.status === 404) {
        // Jupiter returns 4xx when no route exists for this pair
        setNoRoute(true); setQuote(null); setError(null);
        return;
      }
      if (!res.ok) throw new Error(`Jupiter API ${res.status}`);

      const data = await res.json() as JupQuoteResponse;
      if (!data.outAmount) { setNoRoute(true); setQuote(null); return; }

      const outRaw   = parseInt(data.outAmount, 10);
      const minRaw   = parseInt(data.otherAmountThreshold, 10);
      const divisor  = Math.pow(10, decimals);
      const impact   = parseFloat(data.priceImpactPct || "0");
      const label    = data.routePlan?.map((r) => r.swapInfo?.label).filter(Boolean).join(" → ") || "Jupiter";

      setQuote({
        inAmount:       parseInt(data.inAmount, 10),
        outAmount:      outRaw,
        outAmountFloat: parseFloat((outRaw / divisor).toFixed(decimals)),
        priceImpact:    (impact >= 0 ? "+" : "") + impact.toFixed(3) + "%",
        minReceived:    parseFloat((minRaw / divisor).toFixed(decimals)),
        routeLabel:     label,
        raw:            data,
      });
      setNoRoute(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Quote fetch failed");
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, [outputMint, decimals, slippageBps]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void fetchQuote(solAmount), DEBOUNCE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [solAmount, fetchQuote]);

  return { quote, loading, noRoute, error };
}

/** Fetch a swap transaction from Jupiter and return the base64-encoded tx */
export async function fetchJupiterSwapTx(
  quote: JupQuoteResponse,
  userPublicKey: string,
  priorityFeeLamports = 5000,
): Promise<string> {
  const res = await fetch(JUP_SWAP_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      quoteResponse:          quote,
      userPublicKey,
      wrapAndUnwrapSol:       true,
      prioritizationFeeLamports: priorityFeeLamports,
      dynamicComputeUnitLimit: true,
    }),
  });
  if (!res.ok) throw new Error(`Jupiter swap API ${res.status}`);
  const data = await res.json() as { swapTransaction: string };
  return data.swapTransaction; // base64 versioned transaction
}
