/**
 * AGX / UPMA API Client
 * Base docs: https://documenter.getpostman.com/view/9282480/2sAY55bJRN
 *
 * Environments:
 *   dev  → dev.member.upma.org
 *   qa   → qa.member.upma.org
 *   prod → member.upma.org
 */

export type AgxEnv = "dev" | "qa" | "prod";

const BASE_URLS: Record<AgxEnv, string> = {
  dev: "https://dev.member.upma.org",
  qa: "https://qa.member.upma.org",
  prod: "https://member.upma.org",
};

function getBaseUrl(): string {
  const env = (process.env.NEXT_PUBLIC_AGX_ENV ?? "dev") as AgxEnv;
  return BASE_URLS[env] ?? BASE_URLS.dev;
}

function getApiKey(): string {
  return process.env.NEXT_PUBLIC_AGX_API_KEY ?? "";
}

async function agxFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const apiKey = getApiKey();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (apiKey) {
    headers["X-Api-Key"] = apiKey;
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    throw new AgxApiError(res.status, body);
  }

  return res.json() as Promise<T>;
}

export class AgxApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown
  ) {
    const msg =
      typeof body === "object" &&
      body !== null &&
      "message" in body
        ? String((body as { message: string }).message)
        : `AGX API error ${status}`;
    super(msg);
    this.name = "AgxApiError";
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AgxBranch {
  name: string;
  uuid: string;
}

export interface AgxSignupPayload {
  firstName: string;
  lastName: string;
  legalName: string;
  email: string;
  password: string;
  street_1: string;
  street_2?: string;
  city: string;
  state_region: string;
  country: string;
  postal_code: string;
  securityQuestion: string;
  securityAnswer: string;
  birthDate: string; // "YYYY-MM-DD"
  primaryPhoneNumber: string;
  memberAgreement: boolean;
  wantsEmails?: boolean;
  hasBusiness?: boolean;
  recruiter?: string;
  referralSourceUuid?: string;
  referralSourceAdditionalInfo?: string;
  branchUuid?: string;
  rcpToken: string;
  ipAddress?: string;
}

export interface AgxSignupResponse {
  message?: string;
  validationErrors?: Record<string, string[]> | null;
  // Success fields (TBD from authenticated response)
  token?: string;
  user?: {
    uuid: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

/**
 * GET /api/referral_sources/branches
 * Proxied through Next.js API route (/api/agx/branches) to avoid CORS.
 * Falls back to mock data server-side if AGX is unreachable.
 */
export async function getBranches(): Promise<AgxBranch[]> {
  const res = await fetch("/api/agx/branches");
  if (!res.ok) throw new AgxApiError(res.status, await res.text());
  const { data } = await res.json() as { source: string; data: AgxBranch[] };
  return data;
}

/**
 * POST /api/auth/signup
 * Requires API key in X-Api-Key header.
 * Creates a new UPMA member account.
 */
export async function signup(
  payload: AgxSignupPayload
): Promise<AgxSignupResponse> {
  return agxFetch<AgxSignupResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
