/**
 * POST /api/redemptions  - file a physical redemption request
 * GET  /api/redemptions  - list all redemptions (admin use)
 *
 * Writes to /data/redemptions.json at project root.
 * Each entry is append-only - no deletes, no edits.
 */

import { NextRequest } from "next/server";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_PATH = join(process.cwd(), "data", "redemptions.json");

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

function loadRecords(): RedemptionRecord[] {
  try {
    const raw = readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw) as RedemptionRecord[];
  } catch {
    return [];
  }
}

function saveRecords(records: RedemptionRecord[]): void {
  try {
    mkdirSync(join(process.cwd(), "data"), { recursive: true });
    writeFileSync(DATA_PATH, JSON.stringify(records, null, 2), "utf-8");
  } catch (err) {
    throw new Error(`Failed to write redemptions: ${(err as Error).message}`);
  }
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
    // Redact email to last 2 chars of local part for the stored record
    shipping: {
      ...s,
      email: s.email, // store full email for fulfillment
    },
  };

  try {
    const records = loadRecords();
    records.push(record);
    saveRecords(records);
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 500 });
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
  const records = loadRecords();
  // Strip email from public list response
  const safe = records.map(({ shipping, ...rest }) => ({
    ...rest,
    shipping: {
      ...shipping,
      email: shipping.email.replace(/(.{2}).*@/, "$1***@"),
    },
  }));
  return Response.json({ count: safe.length, redemptions: safe });
}
