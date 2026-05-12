"use client";

import { OBSIDIAN_TOKENS, totalReserveUsd } from "../lib/tokens";
import { GoldTopLine, Scanlines } from "../components/primitives";
import { FintechIcon, type FintechIconName } from "../components/fintech-icon";
import { usePrices } from "../lib/price-context";
import { RevenueModel, FEES } from "../components/revenue-model";
import Link from "next/link";

const ZK_PROOF_HASH = "0x7f4a9c8b2e6d1f3a8b9c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a";

const AVG_HOLDING_USD = 8_500;
const YEAR1_ACCOUNTS  = 12_000;
const YEAR1_VELOCITY  = 2.0;

function calcYear1Agx() {
  const tvl      = YEAR1_ACCOUNTS * AVG_HOLDING_USD;
  const mint     = tvl * (FEES.mint.bps     / 10_000);
  const burn     = tvl * (FEES.burn.bps     / 10_000) * 0.3;
  const transfer = tvl * (FEES.transfer.bps / 10_000) * YEAR1_VELOCITY;
  const custody  = tvl * (FEES.custody.bps  / 10_000);
  return (mint + burn + transfer + custody) * 0.20;
}

function fmtMoney(n: number) {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000)     return "$" + (n / 1_000).toFixed(0) + "K";
  return "$" + n.toLocaleString();
}

const COMPARISON = [
  { dimension: "Revenue from metal",   delta: "Multiple new layers"    },
  { dimension: "Member reach",         delta: "Distribution × 100"     },
  { dimension: "Liquidity",            delta: "Days to milliseconds"   },
  { dimension: "Audit & trust",        delta: "Quarterly to daily"     },
  { dimension: "Developer surface",    delta: "Net-new revenue"        },
] as const;

const TRANCHES = [
  { phase: "Phase 1 · Foundation",     icon: "safe_open_coins" as FintechIconName, status: "complete" as const, note: "5 contracts deployed · AGX partnership signed · ZK attestation live", when: "Apr 2026"  },
  { phase: "Phase 2 · Mainnet Bridge", icon: "key"             as FintechIconName, status: "pending"  as const, note: "Security audit · mainnet deploy · liquidity bootstrapping",           when: "Q3 · 2026" },
  { phase: "Phase 3 · Scale",          icon: "bar_chart"       as FintechIconName, status: "future"   as const, note: "x402 API gateway · 60K AGX member onboarding · DeFi integrations",   when: "Q1 · 2027" },
] as const;

export default function VaultAndReturnsPage() {
  const { tokenPrices } = usePrices();
  const total      = totalReserveUsd();
  const agxYear1   = calcYear1Agx();
  const completed  = TRANCHES.filter((t) => t.status === "complete").length;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 md:py-14 space-y-8">

      {/* Header */}
      <header className="relative mb-2">
        <span className="kanji-watermark text-[140px] -top-6 -left-2" aria-hidden="true">𓂀𓇳𓏥</span>
        <p className="font-display text-[10px] uppercase tracking-[0.3em] mb-2 font-bold relative" style={{ color: "var(--gold)" }}>
          PARTNERSHIP ECONOMICS
        </p>
        <h1 className="font-display text-4xl md:text-6xl font-black tracking-[0.02em] relative leading-[0.95]" style={{ color: "var(--foreground)" }}>
          ALIGNED.{" "}
          <span style={{ background: "linear-gradient(135deg, var(--vault-gold) 0%, var(--gold-light) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            PROVABLE BACKING.
          </span>
        </h1>
        <p className="text-sm mt-4 max-w-xl relative leading-relaxed" style={{ color: "var(--gray)" }}>
          Backed 1:1 by AGX vault metal, attested daily on-chain. Every fee splits 80/20 between Obsidian and AGX. Same metal, more revenue layers.
        </p>
        <div className="flex flex-wrap gap-3 mt-5 relative">
          <a
            href="/obsidian-whitepaper.pdf"
            className="font-display chamfer inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-black tracking-[0.25em] transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, var(--vault-gold) 0%, var(--gold-light) 100%)", color: "var(--obsidian)" }}
          >
            DOWNLOAD WHITEPAPER <span aria-hidden="true">↓</span>
          </a>
          <Link
            href="/developers"
            className="font-display inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-black tracking-[0.25em] border transition-colors hover:bg-[var(--gold-muted)]"
            style={{ borderColor: "var(--gold-border)", color: "var(--gold)" }}
          >
            READ API SPEC <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>

      {/* Quick stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px" style={{ background: "var(--carbon)" }}>
        {[
          { label: "Reserve Ratio",     value: "100%",                       sub: "Fully collateralized",     accent: "var(--mint-green)" },
          { label: "AGX Share · Year 1",value: fmtMoney(agxYear1),           sub: "20% of protocol fees",     accent: "var(--gold-light)" },
          { label: "Tokens Backed",     value: "5 / 5",                      sub: "SPL Token 2022 · Devnet",  accent: "var(--gold)"       },
          { label: "ZK Attested",       value: "Daily",                      sub: "Light Protocol on-chain",  accent: "var(--cyan)"       },
        ].map(({ label, value, sub, accent }) => (
          <div key={label} className="px-4 py-4" style={{ background: "var(--void)" }}>
            <p className="font-display text-[9px] uppercase tracking-[0.25em] mb-1" style={{ color: "var(--gray)" }}>{label}</p>
            <p className="font-display text-2xl font-black tabular-nums" style={{ color: accent }}>{value}</p>
            <p className="text-[9px] mt-0.5" style={{ color: "var(--gray)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ZK proof + verify */}
      <section className="border corner-brackets p-5 relative" style={{ background: "var(--void)", borderColor: "var(--carbon)" }}>
        <GoldTopLine />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: "var(--gray)" }}>Latest ZK Proof</p>
            <p className="font-mono text-xs break-all leading-relaxed" style={{ color: "var(--gold-light)" }}>{ZK_PROOF_HASH}</p>
          </div>
          <a
            href="https://explorer.solana.com/?cluster=devnet"
            target="_blank"
            rel="noopener noreferrer"
            className="font-display chamfer inline-flex items-center justify-center gap-2 px-5 py-3 text-[10px] font-black tracking-[0.25em] transition-opacity hover:opacity-90 shrink-0"
            style={{ background: "linear-gradient(135deg, var(--vault-gold) 0%, var(--gold-light) 100%)", color: "var(--obsidian)" }}
          >
            VERIFY ON-CHAIN <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      {/* Per-token reserve grid */}
      <section className="border corner-brackets p-5 relative" style={{ background: "var(--void)", borderColor: "var(--carbon)" }}>
        <span className="kanji-watermark text-[100px] -top-4 right-4" aria-hidden="true">𓇳𓅓</span>
        <div className="relative flex items-center justify-between mb-4 flex-wrap gap-2">
          <p className="font-display text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: "var(--gold)" }}>
            Reserve Allocation · All 5 Tokens
          </p>
          <p className="font-display text-xl font-black tabular-nums" style={{ color: "var(--gold-light)" }}>
            ${(total / 1_000_000).toFixed(2)}M <span className="text-xs font-normal" style={{ color: "var(--gray)" }}>USD</span>
          </p>
        </div>
        <div className="relative grid grid-cols-2 sm:grid-cols-5 gap-2">
          {OBSIDIAN_TOKENS.map((t) => {
            const val = t.reserveQty * t.priceUsd;
            const livePrice = tokenPrices[t.symbol] > 0 ? tokenPrices[t.symbol] : t.priceUsd;
            const pct = (val / total) * 100;
            return (
              <div key={t.symbol} className="p-3 flex flex-col gap-1.5" style={{ background: t.color + "12", border: `1px solid ${t.color}40` }}>
                <div className="flex items-center justify-between">
                  <span className="font-display text-[10px] font-black tracking-[0.15em]" style={{ color: t.color }}>{t.metalSymbol}</span>
                  <span className="font-display text-[9px] font-black px-1 py-0.5" style={{ background: "rgba(0,255,136,0.12)", color: "var(--mint-green)", border: "1px solid rgba(0,255,136,0.3)" }}>LIVE</span>
                </div>
                <p className="font-display text-sm font-bold" style={{ color: "var(--parchment)" }}>{t.symbol}</p>
                <p className="font-display text-base font-black tabular-nums" style={{ color: t.color }}>
                  {t.reserveQty.toLocaleString()} <span className="text-[10px] font-normal" style={{ color: "var(--gray)" }}>{t.unitShort}</span>
                </p>
                <p className="text-[10px]" style={{ color: "var(--gray)" }}>
                  ${livePrice >= 1000 ? (livePrice / 1000).toFixed(2) + "k" : livePrice.toFixed(2)} · {pct.toFixed(1)}%
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* AGX comparison table */}
      <section className="border corner-brackets p-5 relative" style={{ background: "var(--void)", borderColor: "var(--carbon)" }}>
        <span className="kanji-watermark text-[100px] -top-4 right-4" aria-hidden="true">𓇳𓏥</span>
        <p className="font-display text-[10px] uppercase tracking-[0.3em] mb-3 font-bold relative" style={{ color: "var(--gold)" }}>
          AGX Today vs AGX × Obsidian
        </p>
        <div className="relative grid grid-cols-2 gap-px" style={{ background: "var(--carbon)" }}>
          {COMPARISON.map((row) => (
            <div key={row.dimension} className="flex items-center justify-between px-4 py-2.5 gap-4" style={{ background: "var(--void)" }}>
              <span className="font-display font-bold tracking-[0.05em] text-xs" style={{ color: "var(--parchment)" }}>{row.dimension}</span>
              <span className="font-display font-bold tracking-[0.1em] shrink-0 text-right" style={{ color: "var(--mint-green)", fontSize: 11 }}>{row.delta}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Fee structure + revenue projections */}
      <RevenueModel />

      {/* Tranche tracker */}
      <section className="border corner-brackets p-5 relative" style={{ background: "var(--void)", borderColor: "var(--carbon)" }}>
        <span className="kanji-watermark text-[100px] -top-4 right-4" aria-hidden="true">𓆣𓇳</span>
        <div className="relative flex items-center justify-between mb-5 flex-wrap gap-3">
          <p className="font-display text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: "var(--gold)" }}>
            Funding Tranches · AGX SOW
          </p>
          <p className="font-display font-black tabular-nums" style={{ color: "var(--gold-light)", fontSize: 18 }}>
            {completed} <span className="text-xs font-normal" style={{ color: "var(--gray)" }}>/ {TRANCHES.length} complete</span>
          </p>
        </div>
        <div className="relative space-y-3">
          {TRANCHES.map((t, i) => {
            const isComplete = t.status === "complete";
            const isPending  = t.status === "pending";
            const accent = isComplete ? "var(--mint-green)" : isPending ? "var(--vault-gold)" : "var(--gray)";
            const label  = isComplete ? "COMPLETE" : isPending ? "IN MOTION" : "UPCOMING";
            return (
              <div
                key={t.phase}
                className="relative p-4 flex items-start justify-between flex-wrap gap-3"
                style={{ background: isComplete ? "rgba(0,255,136,0.04)" : "var(--dark2)", border: `1px solid ${isComplete ? "rgba(0,255,136,0.25)" : "var(--carbon)"}` }}
              >
                <GoldTopLine />
                <Scanlines opacity={0.02} />
                <div className="relative flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center shrink-0" style={{ background: isComplete ? "rgba(0,255,136,0.08)" : "var(--gold-muted)", border: `1px solid ${isComplete ? "rgba(0,255,136,0.35)" : "var(--gold-border)"}` }}>
                    <FintechIcon name={t.icon} size={28} glow={isComplete || isPending} />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold tracking-[0.1em]" style={{ color: "var(--parchment)" }}>{t.phase.toUpperCase()}</p>
                    <p className="text-xs mt-0.5 max-w-md leading-relaxed" style={{ color: "var(--gray)" }}>{t.note}</p>
                    <p className="font-display text-[10px] tracking-[0.2em] mt-1.5 font-bold" style={{ color: accent }}>{t.when.toUpperCase()}</p>
                  </div>
                </div>
                <span className="relative font-display px-3 py-1.5 text-[10px] font-black tracking-[0.2em]" style={{ background: isComplete ? "rgba(0,255,136,0.15)" : isPending ? "var(--gold-muted)" : "rgba(102,102,102,0.15)", color: accent, border: `1px solid ${accent}` }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
