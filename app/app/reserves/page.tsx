"use client";

import { ReserveCard } from "../components/reserve-card";
import { OBSIDIAN_TOKENS, totalReserveUsd } from "../lib/tokens";
import { FintechIcon, type FintechIconName } from "../components/fintech-icon";

const ZK_PROOF_HASH = "0x7f4a9c8b2e6d1f3a8b9c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a";
const ZK_PROOF_TIME = "2026-04-25T03:48:00Z";

const ATTESTATION_STEPS = [
  {
    step:  "01",
    icon:  "safe" as FintechIconName,
    title: "AGX vault read",
    desc:  "Daily, AGX exports a signed manifest of physical reserves across all 5 metals from UPMA's vault systems.",
  },
  {
    step:  "02",
    icon:  "lock" as FintechIconName,
    title: "Light Protocol compression",
    desc:  "Manifest is compressed into a Merkle commitment via Light's ZK-proof program on Solana. Single account, verifiable.",
  },
  {
    step:  "03",
    icon:  "dollar_shield" as FintechIconName,
    title: "On-chain attestation",
    desc:  "Reserve attestor publishes hash + signature to the Obsidian program. Anyone can verify backing without revealing AGX's full ledger.",
  },
] as const;

// 30-day reserve ratio mock, always 100%+ with light noise
const RATIO_HISTORY = Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i / 3) * 0.6 + (i % 7 === 0 ? 0.3 : 0));

export default function ReservesPage() {
  const total = totalReserveUsd();
  const min = Math.min(...RATIO_HISTORY);
  const max = Math.max(...RATIO_HISTORY);
  const range = max - min || 1;
  const points = RATIO_HISTORY
    .map((v, i) => `${(i / (RATIO_HISTORY.length - 1)) * 100},${100 - ((v - min) / range) * 80 - 10}`)
    .join(" ");

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:py-14 space-y-6">
      {/* Page header */}
      <header className="relative mb-2">
        <span className="kanji-watermark text-[140px] -top-6 -left-2" aria-hidden="true">𓂀𓅓</span>
        <p
          className="font-display text-[10px] uppercase tracking-[0.3em] mb-2 font-bold relative"
          style={{ color: "var(--gold)" }}
        >
          AGX TRUST LAYER
        </p>
        <h1
          className="font-display text-4xl md:text-5xl font-black tracking-[0.02em] relative"
          style={{ color: "var(--foreground)" }}
        >
          PROVABLE{" "}
          <span
            style={{
              background: "linear-gradient(135deg, var(--vault-gold) 0%, var(--gold-light) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            BACKING.
          </span>
        </h1>
        <p className="text-sm mt-3 max-w-2xl relative" style={{ color: "var(--gray)" }}>
          Every Obsidian token is backed 1:1 by physical metal in AGX's insured vault network.
          Reserve ratio is attested daily via Light Protocol ZK proofs and published on-chain.
        </p>
      </header>

      {/* ZK proof block */}
      <section
        className="border corner-brackets p-6 relative"
        style={{ background: "var(--void)", borderColor: "var(--carbon)" }}
      >
        <span className="kanji-watermark text-[100px] -top-4 right-4" aria-hidden="true">𓂀𓇳</span>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: "var(--gray)" }}>
              Latest ZK Proof
            </p>
            <p className="font-mono text-xs break-all leading-relaxed" style={{ color: "var(--gold-light)" }}>
              {ZK_PROOF_HASH}
            </p>
          </div>
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: "var(--gray)" }}>
              Attested
            </p>
            <p className="font-display text-2xl font-black tabular-nums" style={{ color: "var(--parchment)" }}>
              12m
              <span className="text-sm font-normal ml-1" style={{ color: "var(--gray)" }}>ago</span>
            </p>
            <p className="text-xs mt-1 font-mono" style={{ color: "var(--gray)" }}>
              {new Date(ZK_PROOF_TIME).toUTCString()}
            </p>
          </div>
          <div className="flex md:justify-end items-end">
            <a
              href={`https://explorer.solana.com/?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display chamfer inline-flex items-center justify-center gap-2 px-5 py-3 text-[10px] font-black tracking-[0.25em] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: "linear-gradient(135deg, var(--vault-gold) 0%, var(--gold-light) 100%)",
                color: "var(--obsidian)",
                outlineColor: "var(--vault-gold)",
              }}
            >
              VERIFY ON-CHAIN
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        {/* Reserve ratio chart */}
        <div
          className="relative p-4"
          style={{ background: "var(--dark2)", border: "1px solid var(--carbon)" }}
        >
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <p className="font-display text-[10px] uppercase tracking-[0.25em]" style={{ color: "var(--gray)" }}>
              Reserve Ratio · 30 Days
            </p>
            <p className="font-display text-xl font-black tabular-nums" style={{ color: "var(--mint-green)" }}>
              100.00%
              <span className="text-[10px] font-normal ml-1" style={{ color: "var(--gray)" }}>fully collateralized</span>
            </p>
          </div>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-24" aria-label="30-day reserve ratio chart">
            <line x1="0" y1="50" x2="100" y2="50" stroke="var(--carbon)" strokeWidth="0.3" strokeDasharray="1 1" />
            <polyline
              fill="none"
              stroke="var(--vault-gold)"
              strokeWidth="0.8"
              points={points}
              vectorEffect="non-scaling-stroke"
            />
            <polygon
              fill="rgba(200,150,12,0.12)"
              points={`0,100 ${points} 100,100`}
            />
          </svg>
          <div className="flex justify-between mt-2 text-[10px] font-mono" style={{ color: "var(--gray)" }}>
            <span>30d ago</span>
            <span>15d ago</span>
            <span>today</span>
          </div>
        </div>
      </section>

      {/* Per-token reserve summary */}
      <section
        className="border corner-brackets p-6 relative"
        style={{ background: "var(--void)", borderColor: "var(--carbon)" }}
      >
        <span className="kanji-watermark text-[100px] -top-4 right-4" aria-hidden="true">𓅓𓇳</span>

        <div className="relative flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <p
              className="font-display text-[10px] uppercase tracking-[0.3em] font-bold"
              style={{ color: "var(--gold)" }}
            >
              Reserve Allocation · All 5 Tokens
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--gray)" }}>
              Physical metal held by AGX, denominated in troy oz, USD-equivalent at Pyth spot.
            </p>
          </div>
          <p className="font-display text-2xl font-black tabular-nums" style={{ color: "var(--gold-light)" }}>
            ${(total / 1_000_000).toFixed(2)}M
            <span className="text-xs font-normal ml-1" style={{ color: "var(--gray)" }}>USD</span>
          </p>
        </div>

        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {OBSIDIAN_TOKENS.map((t) => {
            const val = t.reserveQty * t.priceUsd;
            const pct = (val / total) * 100;
            return (
              <div
                key={t.symbol}
                className="p-3 flex flex-col gap-1.5"
                style={{ background: t.color + "12", border: `1px solid ${t.color}40` }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-[10px] font-black tracking-[0.15em]" style={{ color: t.color }}>
                    {t.metalSymbol}
                  </span>
                  <span
                    className="font-display text-[9px] font-black tracking-[0.15em] px-1 py-0.5"
                    style={{
                      background: "rgba(0,255,136,0.12)",
                      color: "var(--mint-green)",
                      border: "1px solid rgba(0,255,136,0.3)",
                    }}
                  >
                    LIVE
                  </span>
                </div>
                <p className="font-display text-sm font-bold tracking-[0.05em]" style={{ color: "var(--parchment)" }}>
                  {t.symbol}
                </p>
                <p className="font-display text-base font-black tabular-nums" style={{ color: t.color }}>
                  {t.reserveQty.toLocaleString()} <span className="text-[10px] font-normal" style={{ color: "var(--gray)" }}>{t.unitShort}</span>
                </p>
                <p className="text-[10px]" style={{ color: "var(--gray)" }}>
                  ${(val / 1_000_000).toFixed(2)}M · {pct.toFixed(1)}%
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Physical redemption · Goldback distribution */}
      <section
        className="relative grid grid-cols-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-px"
        style={{ background: "var(--carbon)" }}
      >
        {/* Image side */}
        <div
          className="relative aspect-[4/3] md:aspect-auto overflow-hidden"
          style={{ background: "var(--obsidian)" }}
        >
          <span aria-hidden="true" className="absolute" style={{ width: 18, height: 18, top: -1, left: -1, borderTop: "1.5px solid var(--vault-gold)", borderLeft: "1.5px solid var(--vault-gold)", zIndex: 3 }} />
          <span aria-hidden="true" className="absolute" style={{ width: 18, height: 18, bottom: -1, right: -1, borderBottom: "1.5px solid var(--vault-gold)", borderRight: "1.5px solid var(--vault-gold)", zIndex: 3 }} />
          <img
            src="/assets/stack-xgldb.webp"
            alt="Florida Goldback notes · physical redemption stack"
            className="w-full h-full object-cover"
            style={{ filter: "saturate(1.1) contrast(1.05)" }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(180deg, transparent 60%, rgba(8,8,8,0.85) 100%)" }}
          />
          <span
            className="absolute font-display font-black tracking-[0.2em] uppercase"
            style={{
              top: 16,
              left: 16,
              fontSize: 9,
              padding: "4px 10px",
              background: "rgba(8,8,8,0.7)",
              color: "var(--gold)",
              border: "1px solid var(--gold-border)",
              backdropFilter: "blur(6px)",
              zIndex: 2,
            }}
          >
            xGLDB · GBK · 1/1000 oz
          </span>
        </div>

        {/* Copy side */}
        <div className="relative p-6 md:p-8" style={{ background: "var(--void)" }}>
          <span className="kanji-watermark text-[110px] -top-2 right-3" aria-hidden="true">𓂋𓏥</span>
          <p
            className="font-display text-[10px] uppercase tracking-[0.3em] mb-3 font-bold relative"
            style={{ color: "var(--gold)" }}
          >
            Physical Redemption
          </p>
          <h2
            className="font-display text-2xl md:text-3xl font-black tracking-[0.02em] relative"
            style={{ color: "var(--foreground)" }}
          >
            Burn the token,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--vault-gold) 0%, var(--gold-light) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ship the metal.
            </span>
          </h2>
          <p className="text-sm mt-3 leading-relaxed relative" style={{ color: "var(--parchment)" }}>
            Every Obsidian token is one-for-one redeemable for the underlying physical
            asset. Burn xGLDB on-chain and the equivalent stack of Goldbacks ships
            from AGX&apos;s Florida UPMA vault. Bullion bars (xGOLD / xSLVR) and
            dollar coins (xGLDD / xSLVD) follow the same flow.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-px relative" style={{ background: "var(--carbon)" }}>
            {[
              { label: "REDEEM TIME", value: "3-5d" },
              { label: "REDEEM FEE",  value: "0.25%" },
              { label: "MIN AMOUNT",  value: "$50"  },
            ].map((s) => (
              <div key={s.label} className="px-3 py-3" style={{ background: "var(--void)" }}>
                <p
                  className="font-display font-black tabular-nums"
                  style={{ fontSize: 16, color: "var(--gold-light)", lineHeight: 1 }}
                >
                  {s.value}
                </p>
                <p
                  className="font-display font-bold uppercase mt-1.5"
                  style={{ fontSize: 7, letterSpacing: "0.25em", color: "var(--gray)" }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How attestation works */}
      <section
        className="border corner-brackets p-6 relative"
        style={{ background: "var(--void)", borderColor: "var(--carbon)" }}
      >
        <span className="kanji-watermark text-[100px] -top-4 right-4" aria-hidden="true">𓂀𓏏</span>

        <p
          className="font-display text-[10px] uppercase tracking-[0.3em] mb-5 font-bold relative"
          style={{ color: "var(--gold)" }}
        >
          How Attestation Works
        </p>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-3">
          {ATTESTATION_STEPS.map(({ step, icon, title, desc }) => (
            <div
              key={step}
              className="flex flex-col gap-3 p-5 corner-brackets relative overflow-hidden"
              style={{ background: "var(--dark2)", border: "1px solid var(--carbon)" }}
            >
              <div
                aria-hidden="true"
                className="absolute -right-3 -top-3 opacity-20"
              >
                <FintechIcon name={icon} size={88} />
              </div>
              <div className="flex items-center justify-between relative">
                <FintechIcon name={icon} size={36} glow />
                <span className="font-display text-xs font-black tracking-[0.25em]" style={{ color: "var(--gold)" }}>
                  {step}
                </span>
              </div>
              <p className="font-display text-sm font-bold tracking-[0.1em] relative" style={{ color: "var(--parchment)" }}>
                {title}
              </p>
              <p className="text-xs leading-relaxed relative" style={{ color: "var(--gray)" }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Existing reserve card with full integration status + branches */}
      <ReserveCard />
    </div>
  );
}
