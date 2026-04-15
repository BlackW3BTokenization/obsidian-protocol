"use client";

import { useState } from "react";

// ── Fee Structure ──────────────────────────────────────────────────────────
export const FEES = {
  mint:     { bps: 25,  label: "Mint Fee",              description: "Charged when xGOLD is issued"                       },
  burn:     { bps: 25,  label: "Redemption Fee",        description: "Charged when xGOLD is burned / redeemed"            },
  transfer: { bps: 10,  label: "Transfer Fee",          description: "SPL Token 2022 on-chain transfer hook, every tx"    },
  custody:  { bps:  5,  label: "Annual Custody Fee",    description: "Annualised reserve attestation & ZK proof costs"    },
} as const;

// AGX revenue share: 20% of all protocol fees
const AGX_SHARE = 0.20;
const PROTOCOL_SHARE = 1 - AGX_SHARE;

const GOLD_PRICE = 3178.5;
const AVG_HOLDING_USD = 8_500;
const TOTAL_MEMBERS = 60_000;

// Adoption tiers
const TIERS = [
  { label: "Conservative",  pct: 0.05,  accounts: 3_000,  color: "var(--gray)",       annualVelocity: 1.5 },
  { label: "Year 1 Target", pct: 0.20,  accounts: 12_000, color: "var(--vault-gold)", annualVelocity: 2.0 },
  { label: "Year 2",        pct: 0.50,  accounts: 30_000, color: "var(--gold-light)", annualVelocity: 2.5 },
  { label: "Full Network",  pct: 1.00,  accounts: 60_000, color: "var(--mint-green)", annualVelocity: 3.0 },
] as const;

function bpsToPercent(bps: number) {
  return (bps / 100).toFixed(2) + "%";
}

function revenue(accounts: number, velocity: number) {
  const tvl = accounts * AVG_HOLDING_USD;
  const mintRev    = tvl * (FEES.mint.bps     / 10_000);       // one-time on entry
  const burnRev    = tvl * (FEES.burn.bps     / 10_000) * 0.3; // ~30% redeem/yr
  const transferRev= tvl * (FEES.transfer.bps / 10_000) * velocity;
  const custodyRev = tvl * (FEES.custody.bps  / 10_000);
  const total      = mintRev + burnRev + transferRev + custodyRev;
  return {
    tvl,
    mint:     mintRev,
    burn:     burnRev,
    transfer: transferRev,
    custody:  custodyRev,
    total,
    protocol: total * PROTOCOL_SHARE,
    agx:      total * AGX_SHARE,
  };
}

function fmt(n: number, short = true): string {
  if (short) {
    if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000)     return "$" + (n / 1_000).toFixed(0) + "K";
  }
  return "$" + Math.round(n).toLocaleString();
}

// ── Sub-components ─────────────────────────────────────────────────────────

function FeeRow({
  label, bps, description, highlight = false,
}: { label: string; bps: number; description: string; highlight?: boolean }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{
        background: highlight ? "rgba(200,150,12,0.08)" : "var(--dark2)",
        border: `1px solid ${highlight ? "var(--gold-border)" : "var(--carbon)"}`,
      }}
    >
      <div>
        <p className="font-display text-sm font-bold tracking-[0.1em]" style={{ color: highlight ? "var(--gold)" : "var(--parchment)" }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--gray)" }}>{description}</p>
      </div>
      <div className="text-right shrink-0 ml-4">
        <p className="font-display text-lg font-black tabular-nums" style={{ color: highlight ? "var(--gold-light)" : "var(--parchment)" }}>
          {bpsToPercent(bps)}
        </p>
        <p className="font-display text-[10px] tracking-[0.15em]" style={{ color: "var(--gray)" }}>{bps} BPS</p>
      </div>
    </div>
  );
}

function TierCard({
  tier, selected, onClick,
}: {
  tier: typeof TIERS[number];
  selected: boolean;
  onClick: () => void;
}) {
  const r = revenue(tier.accounts, tier.annualVelocity);
  return (
    <button
      onClick={onClick}
      className="w-full p-4 text-left transition-all"
      style={{
        background: selected ? "rgba(200,150,12,0.08)" : "var(--dark2)",
        border: `1px solid ${selected ? "var(--vault-gold)" : "var(--carbon)"}`,
        outline: "none",
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-display text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: tier.color }}>
          {tier.label}
        </span>
        <span className="font-display text-[10px] tracking-[0.15em]" style={{ color: "var(--gray)" }}>
          {(tier.pct * 100).toFixed(0)}%
        </span>
      </div>
      <p className="font-display text-2xl font-black tabular-nums" style={{ color: selected ? "var(--gold-light)" : "var(--parchment)" }}>
        {fmt(r.total)}
        <span className="text-sm font-normal ml-1" style={{ color: "var(--gray)" }}>/yr</span>
      </p>
      <p className="text-xs mt-1" style={{ color: "var(--gray)" }}>
        {tier.accounts.toLocaleString()} accounts · {fmt(r.tvl)} TVL
      </p>
    </button>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function RevenueModel() {
  const [selectedTier, setSelectedTier] = useState(1); // Year 1 default
  const tier = TIERS[selectedTier];
  const r = revenue(tier.accounts, tier.annualVelocity);

  return (
    <section
      className="w-full border corner-brackets p-6 relative"
      style={{ background: "var(--void)", borderColor: "var(--carbon)" }}
    >
      <span className="kanji-watermark text-[100px] -top-4 right-4" aria-hidden="true">収益</span>

      {/* Header */}
      <div className="relative mb-6">
        <p className="font-display text-[10px] uppercase tracking-[0.3em] font-bold mb-2" style={{ color: "var(--gold)" }}>
          Revenue Model
        </p>
        <h2 className="font-display text-2xl font-black tracking-tight" style={{ color: "var(--parchment)" }}>
          Fee Structure &amp;
          <span
            className="ml-2"
            style={{
              background: "linear-gradient(135deg, var(--vault-gold) 0%, var(--gold-light) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Projections
          </span>
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--gray)" }}>
          Protocol fees split 80 / 20 between Obsidian treasury and AGX as custodian revenue share.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Fee structure */}
        <div className="space-y-2">
          <p className="font-display text-[10px] uppercase tracking-[0.25em] font-bold mb-3" style={{ color: "var(--gray)" }}>
            Fee Schedule
          </p>
          <FeeRow label={FEES.mint.label}     bps={FEES.mint.bps}     description={FEES.mint.description}     highlight />
          <FeeRow label={FEES.burn.label}     bps={FEES.burn.bps}     description={FEES.burn.description}     />
          <FeeRow label={FEES.transfer.label} bps={FEES.transfer.bps} description={FEES.transfer.description} />
          <FeeRow label={FEES.custody.label}  bps={FEES.custody.bps}  description={FEES.custody.description}  />

          {/* Revenue split */}
          <div className="p-4 mt-2" style={{ background: "var(--dark2)", border: "1px solid var(--carbon)" }}>
            <p className="font-display text-[10px] uppercase tracking-[0.25em] font-bold mb-3" style={{ color: "var(--gray)" }}>
              Revenue Split
            </p>
            <div className="flex gap-0.5 h-3 overflow-hidden mb-2">
              <div className="h-full" style={{ width: "80%", background: "var(--vault-gold)" }} />
              <div className="h-full" style={{ width: "20%", background: "rgba(200,150,12,0.3)" }} />
            </div>
            <div className="flex justify-between text-xs">
              <span><span className="font-display font-black" style={{ color: "var(--gold)" }}>80%</span> <span style={{ color: "var(--gray)" }}>Obsidian treasury</span></span>
              <span><span className="font-display font-black" style={{ color: "var(--gold)" }}>20%</span> <span style={{ color: "var(--gray)" }}>AGX custodian share</span></span>
            </div>
          </div>
        </div>

        {/* Right: Adoption projections */}
        <div className="space-y-3">
          <p className="font-display text-[10px] uppercase tracking-[0.25em] font-bold mb-3" style={{ color: "var(--gray)" }}>
            Annual Revenue by Adoption
          </p>
          <div className="grid grid-cols-2 gap-2">
            {TIERS.map((t, i) => (
              <TierCard key={t.label} tier={t} selected={i === selectedTier} onClick={() => setSelectedTier(i)} />
            ))}
          </div>

          {/* Selected breakdown */}
          <div className="p-4" style={{ background: "rgba(200,150,12,0.08)", border: "1px solid var(--gold-border)" }}>
            <p className="font-display text-[10px] uppercase tracking-[0.25em] font-bold mb-3" style={{ color: "var(--gold)" }}>
              {tier.label} Breakdown
            </p>
            <div className="space-y-2">
              {[
                { label: "Mint revenue (entry)",   val: r.mint     },
                { label: "Redemption revenue",     val: r.burn     },
                { label: "Transfer fee revenue",   val: r.transfer },
                { label: "Annual custody fees",    val: r.custody  },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--gray)" }}>{label}</span>
                  <span className="font-display text-xs font-bold tabular-nums" style={{ color: "var(--parchment)" }}>{fmt(val)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-1 flex items-center justify-between" style={{ borderColor: "var(--gold-border)" }}>
                <span className="font-display text-sm font-black tracking-[0.1em]" style={{ color: "var(--gold)" }}>TOTAL</span>
                <span className="font-display text-sm font-black tabular-nums" style={{ color: "var(--gold-light)" }}>{fmt(r.total)}/yr</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--gray)" }}>→ Obsidian treasury (80%)</span>
                <span className="font-display text-xs font-bold" style={{ color: "var(--parchment)" }}>{fmt(r.protocol)}/yr</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: "var(--gray)" }}>→ AGX revenue share (20%)</span>
                <span className="font-display text-xs font-bold" style={{ color: "var(--gold)" }}>{fmt(r.agx)}/yr</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="relative mt-4 text-xs text-center" style={{ color: "var(--gray)" }}>
        Projections based on {TOTAL_MEMBERS.toLocaleString()} AGX members · ${AVG_HOLDING_USD.toLocaleString()} avg holding · ${GOLD_PRICE.toLocaleString()}/oz gold
      </p>
    </section>
  );
}
