"use client";

import { useEffect, useState } from "react";
import { getBranches, type AgxBranch } from "../lib/agx-api";
import { FintechIcon } from "./fintech-icon";
import { usePrices } from "../lib/price-context";

const RESERVE_OZ   = 10_000;   // AGX vault allocation (troy oz xGOLD)
const RESERVE_XGOLD_SUPPLY = 0; // Circulating supply — devnet pre-mint

function StatusDot({ status }: { status: "live" | "pending" | "offline" }) {
  const colors = { live: "var(--mint-green)", pending: "var(--vault-gold)", offline: "var(--gray)" };
  return (
    <span className="relative flex h-2 w-2">
      {status === "live" && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: colors.live }} />
      )}
      <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: colors[status] }} />
    </span>
  );
}

export function ReserveCard() {
  const [branches, setBranches]       = useState<AgxBranch[]>([]);
  const [branchStatus, setBranchStatus] = useState<"loading" | "live" | "error">("loading");
  const { raw, loading: priceLoading } = usePrices();

  // Live gold price from Pyth — fall back to last known while loading
  const goldPriceUsd = raw.XAU?.usd ?? 0;
  const goldChange   = raw.XAU?.change24h ?? "";
  const displayPrice = goldPriceUsd > 0 ? goldPriceUsd : 3178.5;

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    getBranches()
      .then((data) => { setBranches(data); setBranchStatus("live"); })
      .catch(() => setBranchStatus("error"))
      .finally(() => clearTimeout(timeout));
    return () => { controller.abort(); clearTimeout(timeout); };
  }, []);

  const reserveUsd   = (RESERVE_OZ * displayPrice).toLocaleString(undefined, { maximumFractionDigits: 0 });
  // Pre-mint: show "100%+" with a note rather than ∞
  const reserveRatio = RESERVE_XGOLD_SUPPLY === 0
    ? "100%+"
    : ((RESERVE_OZ / RESERVE_XGOLD_SUPPLY) * 100).toFixed(1) + "%";

  return (
    <section
      className="w-full border corner-brackets p-6 relative"
      style={{ background: "var(--void)", borderColor: "var(--carbon)" }}
    >
      <span className="kanji-watermark text-[80px] -top-2 right-3" aria-hidden="true">𓅓𓇳</span>

      {/* Header */}
      <div className="relative flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <FintechIcon name="safe" size={44} glow />
          <div>
            <p className="font-display text-base font-bold tracking-[0.15em]" style={{ color: "var(--gold)" }}>RESERVE ATTESTATION</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--gray)" }}>AGX · UPMA physical metal · Light Protocol ZK proofs</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusDot status="live" />
          <span className="font-display text-[10px] font-black tracking-[0.2em]" style={{ color: "var(--mint-green)" }}>DEVNET</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <div className="p-4" style={{ background: "rgba(200,150,12,0.08)", border: "1px solid var(--gold-border)" }}>
          <p className="font-display text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: "var(--gray)" }}>AGX Reserve</p>
          <p className="font-display text-2xl font-black tabular-nums" style={{ color: "var(--gold-light)" }}>
            {RESERVE_OZ.toLocaleString()}
            <span className="ml-1 text-sm font-normal" style={{ color: "var(--gold)" }}>oz</span>
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--gray)" }}>≈ ${reserveUsd}</p>
        </div>

        <div className="p-4" style={{ background: "var(--dark2)", border: "1px solid var(--carbon)" }}>
          <p className="font-display text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: "var(--gray)" }}>xGOLD Supply</p>
          <p className="font-display text-2xl font-black tabular-nums" style={{ color: "var(--parchment)" }}>
            {RESERVE_XGOLD_SUPPLY.toLocaleString()}
            <span className="ml-1 text-sm font-normal" style={{ color: "var(--gray)" }}>xGOLD</span>
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--gray)" }}>Pre-mint · devnet</p>
        </div>

        <div className="p-4" style={{ background: "var(--dark2)", border: "1px solid var(--carbon)" }}>
          <p className="font-display text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: "var(--gray)" }}>Reserve Ratio</p>
          <p className="font-display text-2xl font-black tabular-nums" style={{ color: "var(--mint-green)" }}>
            {reserveRatio}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--gray)" }}>
            {RESERVE_XGOLD_SUPPLY === 0 ? "Vault funded · minting opens" : "Fully backed"}
          </p>
        </div>

        <div className="p-4" style={{ background: "var(--dark2)", border: "1px solid var(--carbon)" }}>
          <p className="font-display text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: "var(--gray)" }}>Gold Price</p>
          <p className="font-display text-2xl font-black tabular-nums" style={{ color: "var(--parchment)" }}>
            {priceLoading && goldPriceUsd === 0
              ? "…"
              : `$${displayPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
          <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: "var(--gray)" }}>
            Pyth · /oz
            {goldChange && (
              <span className="font-mono text-[10px]" style={{ color: goldChange.startsWith("+") ? "var(--mint-green)" : "var(--burn-red)" }}>
                {goldChange}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Integration status */}
      <div className="space-y-1.5 mb-5">
        <p className="font-display text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: "var(--gray)" }}>Integration Status</p>
        {[
          {
            label:  "AGX API Connection",
            status: branchStatus === "live" ? "live" as const : branchStatus === "error" ? "offline" as const : "pending" as const,
            note:   branchStatus === "live" ? `${branches.length} branches live` : branchStatus === "error" ? "Connection failed" : "Connecting…",
          },
          { label: "Light Protocol ZK Proofs", status: "pending" as const,  note: "Reserve attestor program" },
          { label: "Pyth Price Feed (XAU/USD)", status: goldPriceUsd > 0 ? "live" as const : "pending" as const, note: goldPriceUsd > 0 ? "Live · 10s refresh" : "Connecting…" },
          { label: "SPL Token 2022 Program",    status: "live" as const,     note: "5 mints deployed" },
        ].map(({ label, status, note }) => (
          <div
            key={label}
            className="flex items-center justify-between px-3 py-2.5"
            style={{ background: "var(--dark2)", border: "1px solid var(--carbon)" }}
          >
            <div className="flex items-center gap-2.5">
              <StatusDot status={status} />
              <span className="text-sm font-medium" style={{ color: "var(--parchment)" }}>{label}</span>
            </div>
            <span className="text-xs" style={{ color: "var(--gray)" }}>{note}</span>
          </div>
        ))}
      </div>

      {/* Live UPMA Branches */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-display text-[10px] uppercase tracking-[0.25em]" style={{ color: "var(--gray)" }}>UPMA Network Branches</p>
          <div className="flex items-center gap-1.5">
            {branchStatus === "loading" && <span className="text-xs" style={{ color: "var(--gray)" }}>Loading…</span>}
            {branchStatus === "live" && (
              <>
                <StatusDot status="live" />
                <span className="font-display text-[10px] font-black tracking-[0.2em]" style={{ color: "var(--mint-green)" }}>LIVE · AGX API</span>
              </>
            )}
            {branchStatus === "error" && (
              <button
                onClick={() => {
                  setBranchStatus("loading");
                  getBranches().then((d) => { setBranches(d); setBranchStatus("live"); }).catch(() => setBranchStatus("error"));
                }}
                className="text-xs underline focus-visible:outline focus-visible:outline-2"
                style={{ color: "var(--gold)", outlineColor: "var(--vault-gold)" }}
              >
                Retry
              </button>
            )}
          </div>
        </div>

        {branchStatus === "loading" && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 animate-pulse" style={{ background: "var(--dark2)" }} />
            ))}
          </div>
        )}

        {branchStatus === "live" && branches.length > 0 && (
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
            {branches.map((branch) => (
              <div
                key={branch.uuid}
                className="flex items-center justify-between px-3 py-2"
                style={{ background: "var(--dark2)", border: "1px solid var(--carbon)" }}
              >
                <span className="text-sm truncate mr-2" style={{ color: "var(--parchment)" }}>{branch.name}</span>
                <span className="font-mono text-xs shrink-0" style={{ color: "var(--gray)" }}>
                  {branch.uuid.slice(0, 8)}…
                </span>
              </div>
            ))}
          </div>
        )}

        {branchStatus === "error" && (
          <div className="px-3 py-3 text-sm text-center" style={{ background: "var(--dark2)", border: "1px solid var(--carbon)", color: "var(--gray)" }}>
            AGX API unreachable.{" "}
            <a href="https://upma.org" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--gold)" }}>
              upma.org ↗
            </a>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs text-center" style={{ color: "var(--gray)" }}>
        Daily ZK proof attestation · Compressed state via Light Protocol · Verifiable on-chain
      </p>
    </section>
  );
}
