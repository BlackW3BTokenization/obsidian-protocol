/**
 * Proxy route: GET /api/agx/branches
 * Forwards to AGX API server-side to avoid CORS.
 * Falls back to mock data if AGX is unreachable.
 */

import { NextResponse } from "next/server";

const MOCK_BRANCHES = [
  { name: "Alpine Gold Exchange NH",                               uuid: "690c9964-a6b3-402e-91c1-df8c56fdb51a" },
  { name: "Alpine Gold Exchange - Ogden Franchise",                uuid: "0c0e31bb-0b1e-453c-a31e-25e09db703a7" },
  { name: "Provo Branch",                                          uuid: "32002ddd-23be-45b2-8c32-2387d41c652b" },
  { name: "Joseph David Schafer (Franchise)",                      uuid: "4d80bbb9-a57c-41db-9594-576b05f90696" },
  { name: "Joseph 2 Schafer, legal owner via non-trust custodial", uuid: "721e0a2f-d086-42c0-94cf-bd276d03620a" },
];

const AGX_ENVS: Record<string, string> = {
  dev:  "https://dev.member.upma.org",
  qa:   "https://qa.member.upma.org",
  prod: "https://member.upma.org",
};

export async function GET() {
  const env = process.env.NEXT_PUBLIC_AGX_ENV ?? "dev";
  const base = AGX_ENVS[env] ?? AGX_ENVS.dev;

  try {
    const res = await fetch(`${base}/api/referral_sources/branches`, {
      next: { revalidate: 300 }, // cache 5 min
    });
    if (!res.ok) throw new Error(`AGX returned ${res.status}`);
    const data = await res.json();
    return NextResponse.json({ source: "live", data });
  } catch {
    // Silently fall back to mock data — keeps demo clean
    return NextResponse.json({ source: "mock", data: MOCK_BRANCHES });
  }
}
