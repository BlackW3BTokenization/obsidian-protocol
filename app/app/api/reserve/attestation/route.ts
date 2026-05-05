/**
 * GET /api/reserve/attestation
 *
 * x402-gated endpoint. Returns live AGX reserve data + ZK proof hash.
 * Any external protocol, AI agent, or developer pays 0.0005 SOL per call.
 *
 * Flow:
 *   1. No X-Payment header → 402 with payment requirements
 *   2. X-Payment header present → verify on-chain → return attestation
 */

import { withX402Gate } from "../../../lib/x402";

// Mock reserve data - replace with real AGX API call once authenticated
const RESERVE_DATA = {
  timestamp:        new Date().toISOString(),
  protocol:         "Obsidian Protocol",
  token:            "xGOLD",
  network:          "solana-devnet",
  reserve: {
    custodian:      "AGX / United Precious Metals Association",
    totalOz:        10_000,
    goldPriceUsd:   3178.5,
    totalValueUsd:  10_000 * 3178.5,
    lastAuditDate:  "2026-04-01",
    vaultLocation:  "Alpine, Utah",
  },
  token_supply: {
    circulating:    0,
    max_issuable:   10_000,
    reserve_ratio:  "∞", // no supply yet
  },
  zk_proof: {
    status:         "pending_setup",
    protocol:       "Light Protocol",
    proof_hash:     null,
    next_attestation: "pending",
  },
  fees: {
    mint_bps:       25,
    burn_bps:       25,
    transfer_bps:   10,
    custody_bps:    5,
  },
};

export const GET = withX402Gate("reserve_attestation", async (_req, paymentSignature) => {
  return Response.json({
    ...RESERVE_DATA,
    timestamp: new Date().toISOString(), // fresh on each paid call
    payment:   { verified: true, signature: paymentSignature },
  });
});
