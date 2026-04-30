"use client";

import { useEffect, useState, useRef } from "react";
import { OBSIDIAN_TOKENS, totalReserveUsd } from "../lib/tokens";
import { FintechIcon } from "./fintech-icon";

const TOTAL_AGX_ACCOUNTS = 60_000;
const ADDRESSABLE_TVL    = TOTAL_AGX_ACCOUNTS * 8_500;

function useCountUp(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(e * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration, start]);
  return value;
}

export function ProtocolStats() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const accounts  = useCountUp(TOTAL_AGX_ACCOUNTS, 1600, visible);
  const tvlM      = useCountUp(Math.round(ADDRESSABLE_TVL / 1_000_000), 1800, visible);
  const reserveM  = useCountUp(Math.round(totalReserveUsd() / 1_000_000), 1500, visible);

  return (
    <section ref={ref} className="w-full space-y-4">

      {/* Live protocol status bar */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-px"
        style={{ background: "var(--carbon)" }}
      >
        {[
          {
            icon: "safe_open_coins" as const,
            label: "CONTRACTS LIVE",
            value: "5 / 5",
            sub: "SPL Token 2022 · Solana",
            accent: "var(--mint-green)",
          },
          {
            icon: "goldbar" as const,
            label: "BACKED BY",
            value: "AGX VAULT",
            sub: "1:1 physical metal · UPMA insured",
            accent: "var(--gold-light)",
          },
          {
            icon: "lock" as const,
            label: "ZK ATTESTED",
            value: "DAILY",
            sub: "Light Protocol · on-chain proof",
            accent: "var(--gold)",
          },
          {
            icon: "laptop_trading" as const,
            label: "SETTLEMENT",
            value: "400MS",
            sub: "Solana devnet · mainnet Q3",
            accent: "var(--cyan)",
          },
        ].map(({ icon, label, value, sub, accent }) => (
          <div
            key={label}
            className="flex items-center gap-3 px-4 py-3"
            style={{ background: "rgba(0,255,136,0.04)" }}
          >
            <FintechIcon name={icon} size={32} glow />
            <div className="min-w-0">
              <p className="font-display text-[9px] uppercase tracking-[0.25em] font-bold" style={{ color: "var(--gray)" }}>
                {label}
              </p>
              <p className="font-display text-sm font-black tracking-[0.1em] tabular-nums" style={{ color: accent }}>
                {value}
              </p>
              <p className="text-[9px] truncate" style={{ color: "var(--gray)" }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main stats panel */}
      <div className="border corner-brackets p-6 relative" style={{ background: "var(--void)", borderColor: "var(--carbon)" }}>
        <span className="kanji-watermark text-[120px] -top-4 right-4" aria-hidden="true">𓂀𓆣𓃭</span>

        {/* Hero line */}
        <div className="relative flex items-start justify-between mb-6 gap-4">
          <div>
            <p className="font-display text-[10px] uppercase tracking-[0.3em] font-bold mb-2" style={{ color: "var(--gold)" }}>
              AGX Network · Tokenization Opportunity
            </p>
            <h2 className="font-display text-2xl font-black tracking-tight" style={{ color: "var(--parchment)" }}>
              60,000+ Members.
              <span
                className="ml-2"
                style={{
                  background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Zero on-chain presence.
              </span>
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Every AGX member holds physical precious metals today. Obsidian Protocol brings that value on-chain.
            </p>
          </div>
          <span
            className="font-display shrink-0 px-3 py-1 text-[10px] font-black tracking-[0.2em] flex items-center gap-1.5"
            style={{ background: "rgba(0,255,136,0.12)", color: "var(--mint-green)", border: "1px solid rgba(0,255,136,0.3)" }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute h-full w-full rounded-full opacity-75" style={{ background: "var(--mint-green)" }} />
              <span className="relative rounded-full h-1.5 w-1.5" style={{ background: "var(--mint-green)" }} />
            </span>
            DEVNET LIVE
          </span>
        </div>

        {/* 5 deployed tokens */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-5">
          {OBSIDIAN_TOKENS.map((token) => (
            <div
              key={token.symbol}
              className="flex flex-col corner-brackets overflow-hidden"
              style={{ background: "var(--void)", border: `1px solid var(--carbon)` }}
            >
              {/* Asset visual */}
              <div
                className="relative aspect-square overflow-hidden"
                style={{ background: "var(--obsidian)", borderBottom: "1px solid var(--carbon)" }}
              >
                <img
                  src={token.image}
                  alt={`${token.name} (${token.symbol})`}
                  className="w-full h-full object-cover"
                  style={{ filter: "saturate(1.1) contrast(1.05)" }}
                  loading="lazy"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{ background: "linear-gradient(180deg, transparent 50%, rgba(8,8,8,0.7) 100%)" }}
                />
                <span
                  className="absolute top-2 left-2 font-display font-black tracking-[0.15em] px-1.5 py-0.5"
                  style={{
                    fontSize: 8,
                    background: "rgba(8,8,8,0.7)",
                    color: "var(--gold)",
                    border: "1px solid var(--gold-border)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {token.metalSymbol}
                </span>
                <span
                  className="absolute top-2 right-2 font-display font-black tracking-[0.1em] px-1 py-0.5"
                  style={{
                    fontSize: 8,
                    background: "rgba(0,255,136,0.18)",
                    color: "var(--mint-green)",
                    border: "1px solid rgba(0,255,136,0.4)",
                  }}
                >
                  LIVE
                </span>
              </div>

              {/* Card data */}
              <div className="p-3 flex flex-col gap-1">
                <p className="text-sm font-display font-bold tracking-[0.1em]" style={{ color: "var(--parchment)" }}>
                  {token.symbol}
                </p>
                <p className="text-[10px]" style={{ color: "var(--gray)" }}>{token.name}</p>
                <p className="text-sm font-display font-black tabular-nums" style={{ color: "var(--gold)" }}>
                  ${token.priceUsd >= 1000
                    ? (token.priceUsd / 1000).toFixed(2) + "k"
                    : token.priceUsd.toFixed(2)}
                  <span className="text-[9px] font-normal ml-1" style={{ color: "var(--gray)" }}>/ {token.unitShort}</span>
                </p>
                <p className="text-xs font-display tabular-nums" style={{ color: token.change24h.startsWith("+") ? "var(--mint-green)" : "var(--burn-red)" }}>
                  {token.change24h}
                </p>
                <p className="font-mono truncate" style={{ color: "var(--gray)", fontSize: "9px" }}>
                  {token.mintAddress.slice(0, 12)}…
                </p>
                <p className="text-[10px]" style={{ color: "var(--gray)" }}>
                  {token.reserveQty.toLocaleString()} {token.unitShort} reserve
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Network stats */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "AGX Members",       value: visible ? accounts.toLocaleString() + "+" : "—", sub: "Tokenization-ready",       gold: true  },
            { label: "Addressable TVL",   value: visible ? `$${tvlM}M` : "—",                    sub: "At $8,500 avg holding",     gold: false },
            { label: "Reserve (Devnet)",  value: visible ? `$${reserveM}M` : "—",                sub: "All 5 vaults allocated",    gold: false },
            { label: "Tokens Deployed",   value: "5 / 5",                                        sub: "SPL Token 2022 · Devnet",   gold: false },
          ].map(({ label, value, sub, gold }) => (
            <div
              key={label}
              className="p-4"
              style={{
                background: gold ? "rgba(200,150,12,0.08)" : "var(--dark2)",
                border: `1px solid ${gold ? "var(--gold-border)" : "var(--carbon)"}`,
              }}
            >
              <p className="font-display text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: "var(--gray)" }}>{label}</p>
              <p className="font-display text-2xl font-black tabular-nums" style={{ color: gold ? "var(--gold-light)" : "var(--parchment)" }}>
                {value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--gray)" }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Adoption bar */}
        <div className="p-4 mt-3" style={{ background: "var(--dark2)", border: "1px solid var(--carbon)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="font-display text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: "var(--gray)" }}>
              Tokenization Adoption Target
            </p>
            <p className="font-display text-[10px] font-black tracking-[0.15em]" style={{ color: "var(--gold)" }}>
              Y1 GOAL · 20% → $102M TVL
            </p>
          </div>
          <div className="relative h-3 overflow-hidden" style={{ background: "var(--carbon)" }}>
            <div
              className="absolute left-0 top-0 h-full transition-all duration-1000"
              style={{ width: visible ? "0.5%" : "0%", background: "linear-gradient(90deg, var(--vault-gold), var(--gold-light))" }}
            />
            <div className="absolute top-0 h-full w-0.5" style={{ left: "20%", background: "rgba(200,150,12,0.5)" }} />
            <div className="absolute top-0 h-full w-0.5" style={{ left: "50%", background: "rgba(200,150,12,0.25)" }} />
          </div>
          <div className="flex justify-between mt-1.5 font-display text-[10px] tracking-[0.15em]" style={{ color: "var(--gray)" }}>
            <span>0%</span>
            <span style={{ color: "var(--gold)" }}>20% Y1</span>
            <span>50% Y2</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
