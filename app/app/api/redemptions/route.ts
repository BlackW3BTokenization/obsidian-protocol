/**
 * POST /api/redemptions  - file a physical redemption request
 * GET  /api/redemptions  - list all redemptions (admin use)
 *
 * Persists to Vercel KV (Upstash Redis) under the list key "redemptions".
 * Append-only — `LPUSH` for writes, `LRANGE` for reads (newest first).
 *
 * Required env vars (auto-injected by Vercel when KV is connected to the
 * project — provision via the Vercel dashboard → Storage → KV):
 *   - KV_REST_API_URL
 *   - KV_REST_API_TOKEN
 */

import { NextRequest } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REDIS_KEY = "redemptions";

let redisClient: Redis | null = null;
function getRedis(): Redis {
  if (redisClient) return redisClient;
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    throw new Error(
      "Vercel KV not configured: missing KV_REST_API_URL or KV_REST_API_TOKEN. " +
      "Connect a KV store to this project in the Vercel dashboard, then redeploy."
    );
  }
  redisClient = Redis.fromEnv();
  return redisClient;
}

export interface RedemptionRecord {
  id:          string;        // RDM-XXXXXX
  createdAt:   string;        // ISO 8601
  token:       string;        // xGOLD | xSLVR | xGLDD | xSLVD | xGLDB
  amount:      number;        // token units
  usdValue:    number;        // at time of filing
  burnTxSig:   string;        // devnet tx sig (or sim sig)
  isDevnetSim: boolean;
  wallet:      string;        // truncated public key
  shipping: {
    name:     string;
    email:    string;
    street:   string;
    city:     string;
    state:    string;
    zip:      string;
    country:  string;
  };
  status: "pending" | "processing" | "shipped" | "delivered";
}

function generateId(): string {
  const hex = Array.from(crypto.getRandomValues(new Uint8Array(3)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return `RDM-${hex}`;
}

// ── POST ──────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: Omit<RedemptionRecord, "id" | "createdAt" | "status">;
  try {
    body = await req.json() as Omit<RedemptionRecord, "id" | "createdAt" | "status">;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate required fields
  const required = ["token", "amount", "burnTxSig", "wallet", "shipping"] as const;
  for (const f of required) {
    if (!body[f]) {
      return Response.json({ error: `Missing field: ${f}` }, { status: 400 });
    }
  }
  const s = body.shipping;
  const shippingRequired = ["name", "email", "street", "city", "state", "zip", "country"] as const;
  for (const f of shippingRequired) {
    if (!s[f]?.trim()) {
      return Response.json({ error: `Missing shipping field: ${f}` }, { status: 400 });
    }
  }

  const record: RedemptionRecord = {
    ...body,
    id:        generateId(),
    createdAt: new Date().toISOString(),
    status:    "pending",
    shipping:  { ...s }, // store full shipping for fulfillment
  };

  try {
    // Upstash auto-serializes objects to JSON on lpush.
    await getRedis().lpush(REDIS_KEY, record);
  } catch (err) {
    console.error("[redemptions] persist failed", err);
    return Response.json(
      { error: `Failed to persist redemption: ${(err as Error).message}` },
      { status: 500 },
    );
  }

  return Response.json({
    ok:          true,
    id:          record.id,
    createdAt:   record.createdAt,
    token:       record.token,
    amount:      record.amount,
    status:      record.status,
  }, { status: 201 });
}

// ── GET ───────────────────────────────────────────────────────────────────
export async function GET() {
  let records: RedemptionRecord[];
  try {
    // Upstash auto-deserializes JSON values on lrange.
    records = await getRedis().lrange<RedemptionRecord>(REDIS_KEY, 0, -1);
  } catch (err) {
    console.error("[redemptions] load failed", err);
    return Response.json(
      { error: `Failed to load redemptions: ${(err as Error).message}` },
      { status: 500 },
    );
  }

  // Strip full email from public list response — keep first 2 chars + domain.
  const safe = records.map(({ shipping, ...rest }) => ({
    ...rest,
    shipping: {
      ...shipping,
      email: shipping.email.replace(/(.{2}).*@/, "$1***@"),
    },
  }));
  return Response.json({ count: safe.length, redemptions: safe });
}
