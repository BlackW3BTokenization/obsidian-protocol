"use client";

/**
 * use-pyth-prices.ts
 *
 * Fetches live spot prices from Pyth Network's Hermes REST API.
 * No API key required. Refreshes every 10 seconds client-side.
 *
 * Price feed IDs (Pyth mainnet + devnet share the same IDs):
 *   XAU/USD  - 0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2
 *   XAG/USD  - 0xf2fb02c32b055c805e7238d628e5e9dadef274376114eb1f012337cabe93871e
 *   XPT/USD  - 0x9b4d6cecdb7d3f9e92e1fc97d4b38e47c18f77d3ae2a9d4e4edaf1898ec5e4bf
 *   SOL/USD  - 0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d
 */

import { useEffect, useRef, useState, useCallback } from "react";

const HERMES_URL = "https://hermes.pyth.network/v2/updates/price/latest";

// Map our metal symbols to Pyth price feed IDs
export const PYTH_FEED_IDS: Record<string, string> = {
  XAU: "0x765d2ba906dbc32ca17cc11f5310a89e9ee1f6420508c63861f2f8ba4ee34bb2",
  XAG: "0xf2fb02c32b055c805e7238d628e5e9dadef274376114eb1f012337cabe93871e",
  SOL: "0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d",
};

export interface PythPrice {
  usd: number;
  confidence: number;    // ± confidence interval in USD
  expo: number;
  publishTime: number;   // unix timestamp
  updatedAt: Date;
  change24h: string;     // formatted e.g. "+0.42%"
}

export type PythPriceMap = Record<string, PythPrice>;

interface HermesPriceFeed {
  id: string;
  price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
  ema_price: {
    price: string;
    conf: string;
    expo: number;
    publish_time: number;
  };
}

function parseHermesPrice(feed: HermesPriceFeed): PythPrice {
  const expo = feed.price.expo;
  const raw  = parseInt(feed.price.price, 10);
  const conf = parseInt(feed.price.conf, 10);
  const multiplier = Math.pow(10, expo);

  const usd  = raw  * multiplier;
  const confUsd = conf * multiplier;

  // EMA for 24h change approximation
  const emaRaw = parseInt(feed.ema_price.price, 10);
  const emaUsd = emaRaw * multiplier;
  const changePct = emaUsd > 0 ? ((usd - emaUsd) / emaUsd) * 100 : 0;
  const changeStr = (changePct >= 0 ? "+" : "") + changePct.toFixed(2) + "%";

  return {
    usd:        parseFloat(usd.toFixed(2)),
    confidence: parseFloat(confUsd.toFixed(4)),
    expo,
    publishTime: feed.price.publish_time,
    updatedAt:  new Date(feed.price.publish_time * 1000),
    change24h:  changeStr,
  };
}

async function fetchPythPrices(): Promise<PythPriceMap> {
  const ids = Object.values(PYTH_FEED_IDS);
  const params = ids.map((id) => `ids[]=${encodeURIComponent(id)}`).join("&");
  const res = await fetch(`${HERMES_URL}?${params}&parsed=true`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error(`Pyth Hermes error: ${res.status}`);

  const json = await res.json() as { parsed: HermesPriceFeed[] };
  const result: PythPriceMap = {};

  const symbols = Object.keys(PYTH_FEED_IDS);
  const feedIds = Object.values(PYTH_FEED_IDS);

  json.parsed.forEach((feed) => {
    const normalizedId = feed.id.startsWith("0x") ? feed.id : `0x${feed.id}`;
    const idx = feedIds.findIndex(
      (fid) => fid.toLowerCase() === normalizedId.toLowerCase()
    );
    if (idx !== -1) {
      result[symbols[idx]] = parseHermesPrice(feed);
    }
  });

  return result;
}

interface UsePythPricesReturn {
  prices: PythPriceMap;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

const POLL_INTERVAL_MS = 10_000;

export function usePythPrices(): UsePythPricesReturn {
  const [prices, setPrices]           = useState<PythPriceMap>({});
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const timerRef                      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef                    = useRef(true);

  const fetch_ = useCallback(async () => {
    try {
      const data = await fetchPythPrices();
      if (!mountedRef.current) return;
      setPrices(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Pyth fetch failed");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  const schedule = useCallback(() => {
    timerRef.current = setTimeout(async () => {
      await fetch_();
      if (mountedRef.current) schedule();
    }, POLL_INTERVAL_MS);
  }, [fetch_]);

  useEffect(() => {
    mountedRef.current = true;
    void fetch_().then(() => { if (mountedRef.current) schedule(); });
    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [fetch_, schedule]);

  return { prices, loading, error, lastUpdated, refresh: fetch_ };
}

/**
 * Derive a USD price for each Obsidian token from raw Pyth metal prices.
 * xGOLD  = XAU/USD (1 troy oz)
 * xSLVR  = XAG/USD (1 troy oz)
 * xGLDD  = XAU/USD / 20  (1/20 oz gold coin)
 * xSLVD  = XAG/USD * 0.7734  (0.7734 oz silver dollar)
 * xGLDB  = XAU/USD / 1000 * 1.45  (1/1000 oz 24k gold + ~45% manufacturing premium)
 *          Goldbacks trade above spot: atomized gold polymer layering, serial numbers,
 *          UV security. goldback.com updates exchange rate daily at 10 AM MST.
 *          1.45x is a conservative mid-market premium based on typical retail range.
 */
export function deriveTokenPrices(raw: PythPriceMap): Record<string, number> {
  const xau = raw.XAU?.usd ?? 0;
  const xag = raw.XAG?.usd ?? 0;
  // Goldback manufacturing premium: atomized 24k gold in polymer - trades ~40-50% over spot
  const GOLDBACK_PREMIUM = 1.45;
  return {
    xGOLD: xau,
    xSLVR: xag,
    xGLDD: xau > 0 ? parseFloat((xau / 20).toFixed(4))                        : 0,
    xSLVD: xag > 0 ? parseFloat((xag * 0.7734).toFixed(4))                    : 0,
    xGLDB: xau > 0 ? parseFloat((xau / 1000 * GOLDBACK_PREMIUM).toFixed(4))   : 0,
  };
}
