"use client";

import { useState } from "react";
import { X402_PRICES } from "../lib/x402";
import { usePrices } from "../lib/price-context";

const ENDPOINTS = [
  {
    method:   "GET",
    path:     "/api/reserve/attestation",
    label:    "Reserve Attestation",
    desc:     "Live AGX reserve oz, ZK proof hash, circulating supply, reserve ratio",
    price:    X402_PRICES.reserve_attestation,
    callers:  "DeFi protocols verifying xGOLD collateral",
    color:    "var(--vault-gold)",
    calls_day: 8_400,
  },
  {
    method:   "GET",
    path:     "/api/price/metals",
    label:    "Metals Price Feed",
    desc:     "AGX spot XAU / XAG / AUD / AGD / GBK with spread. AI agent & trading bot friendly",
    price:    X402_PRICES.price_feed,
    callers:  "AI agents, trading bots, DeFi oracles",
    color:    "var(--purple)",
    calls_day: 28_800,
  },
  {
    method:   "POST",
    path:     "/api/mint/authorize",
    label:    "Mint Authorization",
    desc:     "AGX-signed authorization for a wallet to mint against their reserve allocation",
    price:    X402_PRICES.mint_authorize,
    callers:  "Partner apps integrating Obsidian minting",
    color:    "var(--mint-green)",
    calls_day: 420,
  },
] as const;

const FALLBACK_SOL_USD = 142.8;

function lamportsToSol(lamports: number) {
  return (lamports / 1e9).toFixed(4);
}

function lamportsToUsd(lamports: number, solUsd: number) {
  return ((lamports / 1e9) * solUsd).toFixed(4);
}

function dailyRevenue(pricelamports: number, callsDay: number, solUsd: number) {
  const solPerDay  = (pricelamports / 1e9) * callsDay;
  const usdPerDay  = solPerDay * solUsd;
  const usdPerYear = usdPerDay * 365;
  return { solPerDay, usdPerDay, usdPerYear };
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET:    "var(--mint-green)",
    POST:   "var(--purple)",
    PUT:    "#fb923c",
    DELETE: "var(--burn-red)",
  };
  return (
    <span
      className="font-display px-1.5 py-0.5 text-[10px] font-black font-mono tracking-[0.15em]"
      style={{ background: `color-mix(in oklab, ${colors[method]} 15%, transparent)`, color: colors[method], border: `1px solid ${colors[method]}` }}
    >
      {method}
    </span>
  );
}

export function X402Gateway() {
  const [activeEndpoint, setActiveEndpoint] = useState(0);
  const { solUsd } = usePrices();
  const liveSolUsd = solUsd > 0 ? solUsd : FALLBACK_SOL_USD;

  const ep  = ENDPOINTS[activeEndpoint];
  const rev = dailyRevenue(ep.price, ep.calls_day, liveSolUsd);

  const totalAnnual = ENDPOINTS.reduce(
    (sum, e) => sum + dailyRevenue(e.price, e.calls_day, liveSolUsd).usdPerYear,
    0
  );

  return (
    <section
      className="w-full border corner-brackets p-6 relative"
      style={{ background: "var(--void)", borderColor: "var(--carbon)" }}
    >
      <span className="kanji-watermark text-[100px] -top-4 right-4" aria-hidden="true">𓂋𓈖</span>

      {/* Header */}
      <div className="relative flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <p className="font-display text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: "var(--gold)" }}>
              x402 Payment Gateway
            </p>
            <span
              className="font-display px-2 py-0.5 text-[10px] font-black tracking-[0.2em] flex items-center gap-1.5"
              style={{ background: "rgba(0,255,136,0.12)", color: "var(--mint-green)", border: "1px solid rgba(0,255,136,0.3)" }}
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--mint-green)" }} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "var(--mint-green)" }} />
              </span>
              LIVE ON SOLANA
            </span>
          </div>
          <h2 className="font-display text-2xl font-black tracking-tight" style={{ color: "var(--parchment)" }}>
            Every API call is a
            <span
              className="ml-2"
              style={{
                background: "linear-gradient(135deg, var(--vault-gold) 0%, var(--gold-light) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              revenue event.
            </span>
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--gray)" }}>
            AI agents, DeFi protocols, and trading bots pay per call via HTTP 402.
            No subscriptions. No invoices. Settlement in &lt;400ms on Solana.
          </p>
        </div>
        <div
          className="shrink-0 px-4 py-3 text-right"
          style={{ background: "rgba(200,150,12,0.08)", border: "1px solid var(--gold-border)" }}
        >
          <p className="font-display text-[10px] uppercase tracking-[0.2em] mb-0.5" style={{ color: "var(--gray)" }}>API Revenue / yr</p>
          <p className="font-display text-2xl font-black tabular-nums" style={{ color: "var(--gold-light)" }}>
            ${Math.round(totalAnnual).toLocaleString()}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--gray)" }}>est. at projected call volume</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left: endpoint list */}
        <div className="space-y-2">
          <p className="font-display text-[10px] uppercase tracking-[0.25em] font-bold mb-3" style={{ color: "var(--gray)" }}>
            Gated Endpoints
          </p>
          {ENDPOINTS.map((e, i) => (
            <button
              key={e.path}
              onClick={() => setActiveEndpoint(i)}
              className="w-full p-4 text-left transition-all"
              style={{
                background: i === activeEndpoint ? "rgba(200,150,12,0.08)" : "var(--dark2)",
                border: `1px solid ${i === activeEndpoint ? "var(--vault-gold)" : "var(--carbon)"}`,
                outline: "none",
              }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <MethodBadge method={e.method} />
                <code className="text-xs font-mono" style={{ color: i === activeEndpoint ? "var(--gold-light)" : "var(--parchment)" }}>
                  {e.path}
                </code>
              </div>
              <p className="text-xs mb-2" style={{ color: "var(--gray)" }}>{e.desc}</p>
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold tracking-[0.1em]" style={{ color: e.color }}>
                  {lamportsToSol(e.price)} SOL / call
                </span>
                <span className="text-xs" style={{ color: "var(--gray)" }}>
                  ≈ ${lamportsToUsd(e.price, liveSolUsd)} USD
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Right: selected endpoint detail */}
        <div className="space-y-3">
          <p className="font-display text-[10px] uppercase tracking-[0.25em] font-bold mb-3" style={{ color: "var(--gray)" }}>
            {ep.label} · Revenue Detail
          </p>

          {/* How x402 works */}
          <div className="p-4 space-y-3" style={{ background: "var(--dark2)", border: "1px solid var(--carbon)" }}>
            <p className="font-display text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: "var(--gray)" }}>How x402 works</p>
            {[
              { step: "1", text: "Client hits endpoint · no payment header" },
              { step: "2", text: "Server returns HTTP 402 + payment requirements" },
              { step: "3", text: "Client signs SOL transfer, retries with X-Payment header" },
              { step: "4", text: "Server verifies on-chain, returns data in <400ms" },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <span
                  className="hex-clip shrink-0 flex h-5 w-5 items-center justify-center font-display text-xs font-black"
                  style={{ background: "linear-gradient(135deg, var(--vault-gold), #8B6914)", color: "var(--obsidian)" }}
                >
                  {step}
                </span>
                <span className="text-xs leading-relaxed" style={{ color: "var(--parchment)" }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Revenue projection */}
          <div className="p-4" style={{ background: "rgba(200,150,12,0.08)", border: "1px solid var(--gold-border)" }}>
            <p className="font-display text-[10px] uppercase tracking-[0.25em] font-bold mb-3" style={{ color: "var(--gold)" }}>
              Projected Revenue
            </p>
            <div className="space-y-2">
              {[
                { label: "Price per call",      val: `${lamportsToSol(ep.price)} SOL ($${lamportsToUsd(ep.price, liveSolUsd)})` },
                { label: "Est. calls / day",    val: ep.calls_day.toLocaleString() },
                { label: "Revenue / day",       val: `$${rev.usdPerDay.toFixed(0)}` },
                { label: "Revenue / year",      val: `$${Math.round(rev.usdPerYear).toLocaleString()}` },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--gray)" }}>{label}</span>
                  <span className="font-display text-xs font-bold tabular-nums" style={{ color: "var(--parchment)" }}>{val}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-3 pt-3" style={{ borderColor: "var(--gold-border)" }}>
              <p className="text-xs" style={{ color: "var(--gray)" }}>
                <span className="font-display font-black tracking-[0.1em]" style={{ color: "var(--gold)" }}>WHO PAYS:</span>{" "}
                {ep.callers}
              </p>
            </div>
          </div>

          {/* Live response preview */}
          <div className="p-4" style={{ background: "var(--obsidian)", border: "1px solid var(--carbon)" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-mono" style={{ color: "var(--gray)" }}>
                curl -H &quot;X-Payment: &lt;proof&gt;&quot; {ep.path}
              </p>
              <span className="font-display text-[10px] font-black tracking-[0.2em]" style={{ color: "var(--mint-green)" }}>200 OK</span>
            </div>
            <pre className="text-xs leading-relaxed overflow-hidden" style={{ color: "var(--gold-light)", fontFamily: "monospace" }}>
{ep.path === "/api/reserve/attestation" ? `{
  "reserve": {
    "custodian": "AGX / UPMA",
    "xGOLD_oz": 10000,
    "xSLVR_oz": 500000,
    "xGLDD_coins": 60000,
    "xSLVD_coins": 300000,
    "xGLDB_notes": 2500000,
    "totalValueUsd": 46935000
  },
  "token_supply": { "circulating": 0, "reserve_ratio": "∞" },
  "payment": { "verified": true }
}` : ep.path === "/api/price/metals" ? `{
  "prices": {
    "XAU": { "usd": 3178.50 },
    "XAG": { "usd": 31.42 },
    "AUD": { "usd": 154.88 },
    "AGD": { "usd": 24.26 },
    "GBK": { "usd": 4.25 }
  },
  "source": "AGX spot · Pyth oracle",
  "payment": { "verified": true }
}` : `{
  "authorized": true,
  "wallet": "5Vug...dD6",
  "max_xgold": 3.1400,
  "agx_holdings_oz": 3.14,
  "signature": "3xK8...mNp",
  "expires_at": "2026-04-14T22:00:00Z"
}`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
