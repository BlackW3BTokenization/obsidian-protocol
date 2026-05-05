/**
 * x402 Payment Gateway - Obsidian Protocol
 *
 * x402 gates premium API endpoints behind per-call SOL micropayments.
 * Any client (AI agent, DeFi protocol, dev) pays to call, server verifies
 * the on-chain transaction before returning data.
 *
 * Docs: https://solana.com/developers/guides/getstarted/intro-to-x402
 * Package: x402-solana
 *
 * Gated endpoints:
 *   GET /api/reserve/attestation  - live reserve ratio + ZK proof hash
 *   GET /api/price/gold           - AGX-sourced gold spot price
 *   POST /api/mint/authorize      - AGX-verified mint authorization signature
 */

import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { SOLANA_DEVNET_CAIP2, SOLANA_MAINNET_CAIP2 } from "x402-solana";

// ── Config ─────────────────────────────────────────────────────────────────

const NETWORK = process.env.SOLANA_NETWORK ?? "devnet";
const RPC_URL = process.env.HELIUS_RPC_URL ?? "https://api.devnet.solana.com";

/** Protocol treasury wallet - receives all x402 payments */
export const PROTOCOL_TREASURY =
  process.env.PROTOCOL_TREASURY_PUBKEY ?? "11111111111111111111111111111111";

/** CAIP-2 network identifier for x402 */
export const X402_NETWORK =
  NETWORK === "mainnet-beta" ? SOLANA_MAINNET_CAIP2 : SOLANA_DEVNET_CAIP2;

// ── Pricing (in lamports) ──────────────────────────────────────────────────

export const X402_PRICES = {
  /** Reserve attestation: 0.0005 SOL (~$0.07 at $142/SOL) */
  reserve_attestation: 500_000,
  /** Gold price feed: 0.0001 SOL (~$0.014) */
  price_feed: 100_000,
  /** Mint authorization: 0.001 SOL (~$0.14) - highest value call */
  mint_authorize: 1_000_000,
} as const;

export type X402Endpoint = keyof typeof X402_PRICES;

// ── Payment Requirements object (returned with 402) ────────────────────────

export interface X402PaymentRequirements {
  x402Version: number;
  accepts: Array<{
    scheme: "exact";
    network: string;
    maxAmountRequired: string;
    resource: string;
    description: string;
    mimeType: string;
    payTo: string;
    maxTimeoutSeconds: number;
    asset: string;
    extra: { name: string; version: string };
  }>;
  error: string;
}

export function buildPaymentRequirements(
  endpoint: X402Endpoint,
  resourceUrl: string
): X402PaymentRequirements {
  const lamports = X402_PRICES[endpoint];
  const descriptions: Record<X402Endpoint, string> = {
    reserve_attestation: "Obsidian Protocol reserve attestation data",
    price_feed:          "AGX gold spot price feed",
    mint_authorize:      "xGOLD mint authorization from AGX reserve",
  };

  return {
    x402Version: 1,
    accepts: [
      {
        scheme:              "exact",
        network:             X402_NETWORK,
        maxAmountRequired:   lamports.toString(),
        resource:            resourceUrl,
        description:         descriptions[endpoint],
        mimeType:            "application/json",
        payTo:               PROTOCOL_TREASURY,
        maxTimeoutSeconds:   60,
        asset:               "SOL",
        extra:               { name: "Obsidian Protocol", version: "1.0.0" },
      },
    ],
    error: "Payment required",
  };
}

// ── Server-side payment verification ──────────────────────────────────────

export interface X402PaymentProof {
  x402Version: number;
  scheme: "exact";
  network: string;
  payload: {
    serializedTransaction: string; // base64
  };
}

export async function verifyX402Payment(
  xPaymentHeader: string,
  endpoint: X402Endpoint
): Promise<{ valid: boolean; signature?: string; error?: string }> {
  let proof: X402PaymentProof;
  try {
    proof = JSON.parse(
      Buffer.from(xPaymentHeader, "base64").toString("utf-8")
    ) as X402PaymentProof;
  } catch {
    return { valid: false, error: "Malformed X-Payment header" };
  }

  const connection = new Connection(RPC_URL, "confirmed");
  const txBuffer = Buffer.from(proof.payload.serializedTransaction, "base64");

  let tx: Transaction;
  try {
    tx = Transaction.from(txBuffer);
  } catch {
    return { valid: false, error: "Invalid transaction" };
  }

  // Verify the payment goes to the protocol treasury
  const treasuryPubkey = new PublicKey(PROTOCOL_TREASURY);
  const requiredLamports = X402_PRICES[endpoint];
  const hasValidTransfer = tx.instructions.some((ix) => {
    // System program transfer
    if (ix.programId.toBase58() === "11111111111111111111111111111111") {
      const toKey = ix.keys[1]?.pubkey;
      return toKey?.equals(treasuryPubkey);
    }
    return false;
  });

  if (!hasValidTransfer && PROTOCOL_TREASURY !== "11111111111111111111111111111111") {
    return { valid: false, error: `Payment must go to protocol treasury. Required: ${requiredLamports} lamports` };
  }

  try {
    // Simulate first
    const sim = await connection.simulateTransaction(tx);
    if (sim.value.err) {
      return { valid: false, error: `Simulation failed: ${JSON.stringify(sim.value.err)}` };
    }

    // Submit
    const signature = await connection.sendRawTransaction(txBuffer, {
      skipPreflight: false,
    });
    await connection.confirmTransaction(signature, "confirmed");

    return { valid: true, signature };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : "Transaction failed",
    };
  }
}

// ── Next.js helper: wrap a route handler with 402 gate ────────────────────

export function withX402Gate(
  endpoint: X402Endpoint,
  handler: (req: Request, paymentSignature: string) => Promise<Response>
) {
  return async (req: Request): Promise<Response> => {
    const xPaymentHeader = req.headers.get("X-Payment");
    const resourceUrl = req.url;

    if (!xPaymentHeader) {
      return Response.json(
        buildPaymentRequirements(endpoint, resourceUrl),
        { status: 402, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = await verifyX402Payment(xPaymentHeader, endpoint);
    if (!result.valid) {
      return Response.json(
        { error: result.error, code: "PAYMENT_INVALID" },
        { status: 402 }
      );
    }

    return handler(req, result.signature!);
  };
}
