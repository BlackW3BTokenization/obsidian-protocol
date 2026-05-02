"use client";

/**
 * PriceContext - single source of truth for live Pyth prices.
 * Mounted once in layout. All components read from here - no duplicate polling.
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
