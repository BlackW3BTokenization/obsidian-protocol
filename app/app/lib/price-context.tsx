"use client";

/**
 * PriceContext - single source of truth for all live prices.
 *
 * - XAU, XAG, SOL: Pyth Network Hermes REST API (10s polling)
 * - xGLDB (Goldback): /api/goldback-price (env var, updated daily)
 *   goldback.com sets their own rate - it is NOT derived from XAU spot.
 *
 * All components call usePrices() - no duplicate polling anywhere.
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  type PropsWithChildren,
} from "react";
import { usePythPrices, deriveTokenPrices, type PythPriceMap } from "./hooks/use-pyth-prices";
import { OBSIDIAN_TOKENS } from "./tokens";

const GOLDBACK_POLL_MS = 60 * 60 * 1000; // 1 hour - rate only changes once daily

interface PriceContextValue {
  /** Raw Pyth prices keyed by metal symbol: XAU, XAG, SOL */
  raw: PythPriceMap;
  /** Derived USD price per Obsidian token: xGOLD, xSLVR, xGLDD, xSLVD, xGLDB */
  tokenPrices: Record<string, number>;
  /** SOL price in USD */
  solUsd: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

const PriceContext = createContext<PriceContextValue | null>(null);

/** Fallback static price for xGLDB while the API route loads */
const GOLDBACK_FALLBACK = OBSIDIAN_TOKENS.find((t) => t.symbol === "xGLDB")?.priceUsd ?? 9.28;

export function PriceProvider({ children }: PropsWithChildren) {
  const { prices, loading, error, lastUpdated, refresh } = usePythPrices();

  // Goldback rate - fetched from our server-side API route (sourced from goldback.com daily rate)
  const [goldbackUsd, setGoldbackUsd] = useState<number>(GOLDBACK_FALLBACK);
  const gbTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gbMounted  = useRef(true);

  const fetchGoldback = useCallback(async () => {
    try {
      const res = await fetch("/api/goldback-price");
      if (!res.ok) return;
      const data = await res.json() as { price: number };
      if (gbMounted.current && data.price > 0) {
        setGoldbackUsd(data.price);
      }
    } catch {
      // silently keep the fallback - rate doesn't change intraday
    }
  }, []);

  useEffect(() => {
    gbMounted.current = true;
    void fetchGoldback();
    gbTimerRef.current = setInterval(() => { void fetchGoldback(); }, GOLDBACK_POLL_MS);
    return () => {
      gbMounted.current = false;
      if (gbTimerRef.current) clearInterval(gbTimerRef.current);
    };
  }, [fetchGoldback]);

  // Derive Pyth-based prices, then override xGLDB with goldback.com actual rate
  const tokenPrices = useMemo(() => {
    const derived = deriveTokenPrices(prices);
    return { ...derived, xGLDB: goldbackUsd };
  }, [prices, goldbackUsd]);

  const solUsd = prices.SOL?.usd ?? 0;

  const value = useMemo<PriceContextValue>(
    () => ({ raw: prices, tokenPrices, solUsd, loading, error, lastUpdated, refresh }),
    [prices, tokenPrices, solUsd, loading, error, lastUpdated, refresh]
  );

  return (
    <PriceContext.Provider value={value}>{children}</PriceContext.Provider>
  );
}

export function usePrices(): PriceContextValue {
  const ctx = useContext(PriceContext);
  if (!ctx) throw new Error("usePrices must be used within PriceProvider");
  return ctx;
}
