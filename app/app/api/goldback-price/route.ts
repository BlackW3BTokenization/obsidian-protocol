/**
 * /api/goldback-price
 *
 * Returns the current Goldback daily exchange rate.
 *
 * Source: goldback.com — published daily at 10 AM MST by Goldback Inc.
 * Their REST endpoint (/goldback/v1/rates/exchange) requires a private API key.
 * Until that key is provisioned, the rate is read from GOLDBACK_RATE_USD in .env.local.
 *
 * To upgrade to live fetching:
 *   1. Get API key from Goldback Inc.
 *   2. Add GOLDBACK_API_KEY=<key> to .env.local
 *   3. Uncomment the live fetch block below and remove the env-var fallback.
 *
 * Cache: revalidates every hour (rate only changes once daily).
 */

import { NextResponse } from "next/server";

export const revalidate = 3600; // 1 hour — rate only updates once daily

/* ---------- live fetch (uncomment when API key is available) ----------
async function fetchLiveRate(): Promise<number> {
  const res = await fetch("https://goldback.com/wp-json/goldback/v1/rates/exchange", {
    headers: {
      "X-API-Key": process.env.GOLDBACK_API_KEY ?? "",
      Accept: "application/json",
    },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Goldback API error: ${res.status}`);
  const data = await res.json();
  // Adjust field name once API contract is known
  return parseFloat(data.exchange_rate ?? data.rate ?? data.price);
}
---------------------------------------------------------------------- */

export async function GET() {
  const envRate = process.env.GOLDBACK_RATE_USD;
  const price   = envRate ? parseFloat(envRate) : null;

  if (!price || isNaN(price)) {
    return NextResponse.json(
      { error: "GOLDBACK_RATE_USD not set in environment" },
      { status: 503 }
    );
  }

  return NextResponse.json({
    price,
    currency: "USD",
    per: "1 Goldback",
    source: "goldback.com (env — update GOLDBACK_RATE_USD daily)",
    note: "goldback.com publishes the daily rate at 10 AM MST",
  });
}
