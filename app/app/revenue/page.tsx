"use client";

import { RevenueModel, FEES } from "../components/revenue-model";
import { SectionEyebrow, StatCard, GoldTopLine, Scanlines } from "../components/primitives";
import { FintechIcon, type FintechIconName } from "../components/fintech-icon";

const AVG_HOLDING_USD = 8_500;
const YEAR1_ACCOUNTS = 12_000;
const YEAR1_VELOCITY = 2.0;

// AGX revenue share at Year 1 target
function calcYear1Agx() {
  const tvl = YEAR1_ACCOUNTS * AVG_HOLDING_USD;
  const mint     = tvl * (FEES.mint.bps     / 10_000);
  const burn     = tvl * (FEES.burn.bps     / 10_000) * 0.3;
  const transfer = tvl * (FEES.transfer.bps / 10_000) * YEAR1_VELOCITY;
  const custody  = tvl * (FEES.custody.bps  / 10_000);
  const total    = mint + burn + transfer + custody;
  return total * 0.20;
}

const TRANCHES = [
  { phase: "Phase 1 · Foundation",     icon: "safe_open_coins" as FintechIconName, amount: 45_000,  status: "received" as const, note: "Apr 9 – Apr 25 · 5 SPL Token 2022 contracts deployed",   when: "Apr 25 · 2026" },
  { phase: "Phase 2 · Mainnet Bridge", icon: "key"             as FintechIconName, amount: 250_000, status: "pending"  as const, note: "Audit · mainnet deploy · liquidity bootstrapping",        when: "Q3 · 2026" },
  { phase: "Phase 3 · Scale",          icon: "bar_chart"       as FintechIconName, amount: 500_000, status: "future"   as const, note: "x402 gateway · partner SDK · 60K member onboarding",      when: "Q1 · 2027" },
] as const;

const COMPARISON = [
  {
    dimension: "Revenue from physical metal",
    today:     "Custody fees only (~50bps/yr on stored metal)",
    obsidian:  "Custody fees + 20% of all protocol fees + API revenue share",
    delta:     "Same metal · multiple revenue layers",
  },
  {
    dimension: "Member reach",
    today:     "60,000 members · single touchpoint per quarter",
    obsidian:  "Same 60,000 + every wallet on Solana that touches an Obsidian token",
    delta:     "Distribution × 100",
  },
  {
    dimension: "Liquidity for AGX members",
    today:     "Sell metal back to AGX, wait days for cash",
    obsidian:  "Mint xGOLD on-chain, send / spend / swap in 400ms",
    delta:     "Days → milliseconds",
  },
  {
    dimension: "Audit & trust",
    today:     "Quarterly audit reports, manual reconciliation",
    obsidian:  "Daily ZK-attested reserve proofs, on-chain verifiable",
    delta:     "Quarterly → daily, manual → cryptographic",
  },
  {
    dimension: "Developer surface",
    today:     "None",
    obsidian:  "x402-gated APIs · pay-per-call · AI-agent native",
    delta:     "Net-new revenue line",
  },
] as const;

function fmtMoney(n: number): string {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000)     return "$" + (n / 1_000).toFixed(0) + "K";
  return "$" + n.toLocaleString();
}

export default function RevenuePage() {
  const agxYear1 = calcYear1Agx();
  const totalTranches = TRANCHES.reduce((s, t) => s + t.amount, 0);
  const receivedTranches = TRANCHES.filter((t) => t.status === "received").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 md:py-14 space-y-8">
      {/* Page header */}
      <header className="relative mb-2">
        <span className="kanji-watermark text-[140px] -top-6 -left-2" aria-hidden="true">𓂀𓃭</span>
        <p
          className="font-display text-[10px] uppercase tracking-[0.3em] mb-2 font-bold relative"
          style={{ color: "var(--gold)" }}
        >
          PARTNERSHIP ECONOMICS
        </p>
        <h1
          className="font-display text-4xl md:text-5xl font-black tracking-[0.02em] relative"
          style={{ color: "var(--foreground)" }}
        >
          ALIGNED.{" "}
          <span
            style={{
              background: "linear-gradient(135deg, var(--vault-gold) 0%, var(--gold-light) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ON BOTH SIDES.
          </span>
        </h1>
        <p className="text-sm mt-3 max-w-2xl relative" style={{ color: "var(--gray)" }}>
          Obsidian doesn't compete with AGX. It tokenizes AGX. Every fee streams 80/20
          to the Obsidian treasury and AGX as custodian. Same metal, more revenue layers.
        </p>
      </header>

      {/* AGX revenue share hero */}
      <section>
        <SectionEyebrow label="AGX REVENUE SHARE" status="YEAR 1 PROJECTED" statusColor="var(--gold)" />
        <div className="flex gap-px" style={{ background: "var(--carbon)" }}>
          <StatCard
            label="AGX SHARE"
            sublabel="Year 1 · 20% of protocol fees"
            value={fmtMoney(agxYear1)}
            delta="20% of all flow"
            deltaPositive
          />
          <StatCard
            label="TVL UNLOCKED"
            sublabel="At Year 1 adoption"
            value={fmtMoney(YEAR1_ACCOUNTS * AVG_HOLDING_USD)}
            description={`${YEAR1_ACCOUNTS.toLocaleString()} AGX members · $${AVG_HOLDING_USD.toLocaleString()} avg holding`}
          />
          <StatCard
            label="VELOCITY"
            sublabel="Annual turns"
            value={`${YEAR1_VELOCITY.toFixed(1)}×`}
            description="Conservative · Solana DeFi avg is 4-6× on stablecoins"
          />
          <StatCard
            label="REVENUE LAYERS"
            sublabel="Net-new for AGX"
            value="3"
            description="Mint/burn · transfer hook · custody · all on top of existing physical custody"
          />
        </div>
      </section>

      {/* Comparison table */}
      <section
        className="border corner-brackets p-6 relative"
        style={{ background: "var(--void)", borderColor: "var(--carbon)" }}
      >
        <span className="kanji-watermark text-[100px] -top-4 right-4" aria-hidden="true">𓇳𓏥</span>

        <SectionEyebrow label="AGX TODAY VS AGX WITH OBSIDIAN" />

        <div className="relative overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: "var(--gray)" }}>
                <th className="font-display text-[10px] tracking-[0.25em] text-left py-3 pr-4 font-bold uppercase">Dimension</th>
                <th className="font-display text-[10px] tracking-[0.25em] text-left py-3 pr-4 font-bold uppercase">AGX Today</th>
                <th
                  className="font-display text-[10px] tracking-[0.25em] text-left py-3 pr-4 font-bold uppercase"
                  style={{ color: "var(--gold)" }}
                >
                  AGX × Obsidian
                </th>
                <th
                  className="font-display text-[10px] tracking-[0.25em] text-right py-3 font-bold uppercase"
                  style={{ color: "var(--mint-green)" }}
                >
                  Δ
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.dimension} className="border-t" style={{ borderColor: "var(--carbon)" }}>
                  <td className="py-4 pr-4 align-top">
                    <span className="font-display font-bold tracking-[0.05em]" style={{ color: "var(--parchment)" }}>
                      {row.dimension}
                    </span>
                  </td>
                  <td className="py-4 pr-4 align-top leading-relaxed" style={{ color: "var(--gray)" }}>
                    {row.today}
                  </td>
                  <td className="py-4 pr-4 align-top leading-relaxed" style={{ color: "var(--parchment)" }}>
                    {row.obsidian}
                  </td>
                  <td className="py-4 align-top text-right">
                    <span
                      className="font-display font-bold inline-block tracking-[0.1em]"
                      style={{ color: "var(--mint-green)", fontSize: 11 }}
                    >
                      {row.delta}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Tranche tracker */}
      <section
        className="border corner-brackets p-6 relative"
        style={{ background: "var(--void)", borderColor: "var(--carbon)" }}
      >
        <span className="kanji-watermark text-[100px] -top-4 right-4" aria-hidden="true">𓆣𓇳</span>

        <div className="relative flex items-center justify-between mb-7 flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" style={{ width: 24, height: 1.5, background: "var(--vault-gold)", display: "inline-block" }} />
            <span
              className="font-display font-bold uppercase"
              style={{ fontSize: 9, letterSpacing: "0.4em", color: "var(--gold)" }}
            >
              FUNDING TRANCHES · AGX SOW
            </span>
          </div>
          <div className="text-right">
            <p className="font-display text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--gray)" }}>
              Received / Total
            </p>
            <p className="font-display text-xl font-black tabular-nums" style={{ color: "var(--gold-light)" }}>
              {fmtMoney(receivedTranches)} <span className="text-xs font-normal" style={{ color: "var(--gray)" }}>/ {fmtMoney(totalTranches)}</span>
            </p>
          </div>
        </div>

        <div className="relative space-y-3">
          {TRANCHES.map((t, i) => {
            const isReceived = t.status === "received";
            const isPending = t.status === "pending";
            const accentColor =
              isReceived ? "var(--mint-green)" :
              isPending  ? "var(--vault-gold)" :
                           "var(--gray)";
            return (
              <div
                key={t.phase}
                className="relative p-5 flex items-center justify-between flex-wrap gap-4"
                style={{
                  background: isReceived ? "rgba(0,255,136,0.04)" : "var(--dark2)",
                  border: `1px solid ${isReceived ? "rgba(0,255,136,0.25)" : "var(--carbon)"}`,
                }}
              >
                <GoldTopLine />
                <Scanlines opacity={0.02} />
                <div className="relative flex items-start gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center shrink-0 relative"
                    style={{
                      background: isReceived ? "rgba(0,255,136,0.08)" : "var(--gold-muted)",
                      border: `1px solid ${isReceived ? "rgba(0,255,136,0.35)" : "var(--gold-border)"}`,
                    }}
                  >
                    <FintechIcon name={t.icon} size={36} glow={isReceived || isPending} />
                    <span
                      className="absolute font-display font-black tabular-nums"
                      style={{
                        bottom: -1,
                        right: -1,
                        fontSize: 8,
                        letterSpacing: "0.05em",
                        color: accentColor,
                        background: "var(--obsidian)",
                        padding: "1px 4px",
                        border: `1px solid ${accentColor}`,
                      }}
                    >
                      0{i + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold tracking-[0.1em]" style={{ color: "var(--parchment)" }}>
                      {t.phase.toUpperCase()}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--gray)" }}>{t.note}</p>
                    <p className="font-display text-[10px] tracking-[0.2em] mt-2 font-bold" style={{ color: accentColor }}>
                      {t.when.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="relative flex items-center gap-3 shrink-0">
                  <p className="font-display text-2xl font-black tabular-nums" style={{ color: isReceived ? "var(--mint-green)" : "var(--gold-light)" }}>
                    {fmtMoney(t.amount)}
                  </p>
                  <span
                    className="font-display px-2.5 py-1 text-[10px] font-black tracking-[0.2em]"
                    style={{
                      background: isReceived ? "rgba(0,255,136,0.15)" : isPending ? "var(--gold-muted)" : "rgba(102,102,102,0.15)",
                      color: accentColor,
                      border: `1px solid ${accentColor}`,
                    }}
                  >
                    {t.status.toUpperCase()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Detailed fee model */}
      <RevenueModel />
    </div>
  );
}
