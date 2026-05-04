"use client";

/**
 * PriceContext - single source of truth for all live prices.
 *
 * All 5 token prices are derived from Pyth Network XAU/XAG feeds (10s polling):
 *   xGOLD  = XAU/USD
 *   xSLVR  = XAG/USD
 *   xGLDD  = XAU / 20
 *   xSLVD  = XAG × 0.7734
 *   xGLDB  = XAU × 0.002742  (1/1000 oz gold × ~2.74 premium — tracks live gold)
 *
 * All components call usePrices() — no duplicate polling anywhere.
 */

import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";
import { usePythPrices, deriveTokenPrices, type PythPriceMap } from "./hooks/use-pyth-prices";

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

export function PriceProvider({ children }: PropsWithChildren) {
  const { prices, loading, error, lastUpdated, refresh } = usePythPrices();

  const tokenPrices = useMemo(() => deriveTokenPrices(prices), [prices]);
  const solUsd      = prices.SOL?.usd ?? 0;

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
