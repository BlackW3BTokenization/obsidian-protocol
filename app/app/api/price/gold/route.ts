/**
 * GET /api/price/gold
 *
 * x402-gated gold price feed. 0.0001 SOL per call.
 * Serves the AGX spot price to AI agents, DeFi protocols, trading bots.
 *
 * Production: pull from Pyth on-chain oracle or AGX authenticated API.
 * Devnet demo: returns mock price with realistic spread.
 */

import { withX402Gate } from "../../lib/x402";

const BASE_PRICE_USD   = 3178.5;
const BASE_SILVER_USD  = 31.42;

function spotWithSpread(base: number) {
  // ±0.05% random spread to simulate live feed
  const spread = (Math.random() - 0.5) * 0.001 * base;
  return parseFloat((base + spread).toFixed(2));
}

export const GET = withX402Gate("price_feed", async (_req, paymentSignature) => {
  const goldSpot   = spotWithSpread(BASE_PRICE_USD);
  const silverSpot = spotWithSpread(BASE_SILVER_USD);
  const goldSilverRatio = parseFloat((goldSpot / silverSpot).toFixed(2));

  return Response.json({
    timestamp:    new Date().toISOString(),
    source:       "Obsidian Protocol · Pyth Network (devnet)",
    prices: {
      XAU: {
        usd:        goldSpot,
        change_24h: "+0.42%",
        unit:       "troy oz",
      },
      XAG: {
        usd:        silverSpot,
        change_24h: "-0.18%",
        unit:       "troy oz",
      },
    },
    gold_silver_ratio: goldSilverRatio,
    xgold: {
      peg:          "1:1 XAU troy oz",
      implied_price: goldSpot,
      network:      "solana-devnet",
    },
    payment: { verified: true, signature: paymentSignature },
  });
});
