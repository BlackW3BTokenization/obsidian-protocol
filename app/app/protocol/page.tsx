"use client";

import Link from "next/link";
import { useState } from "react";
import { XGoldCard } from "../components/xgold-card";
import { VaultCard } from "../components/vault-card";
import { ReserveCard } from "../components/reserve-card";
import { WalletBalanceCard } from "../components/wallet-balance-card";
import { OBSIDIAN_TOKENS } from "../lib/tokens";

const MOCK_TX_FEED = [
  { type: "MINT",     token: "xGOLD", amount: "2.5",    wallet: "5Vug…dD6", ago: "12s",     status: "confirmed" },
  { type: "BURN",     token: "xSLVR", amount: "120.0",  wallet: "9aBC…7Tx", ago: "48s",     status: "confirmed" },
  { type: "MINT",     token: "xGLDD", amount: "20",     wallet: "Hrk2…m9P", ago: "1m 04s",  status: "confirmed" },
  { type: "TRANSFER", token: "xGLDB", amount: "1,000",  wallet: "Q4uV…WcB", ago: "2m 17s",  status: "confirmed" },
  { type: "MINT",     token: "xSLVD", amount: "50",     wallet: "TpYM…ML8", ago: "3m 41s",  status: "confirmed" },
] as const;

export default function ProtocolPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(OBSIDIAN_TOKENS[0].symbol);
  const selectedToken =
    OBSIDIAN_TOKENS.find((t) => t.symbol === selectedSymbol) ?? OBSIDIAN_TOKENS[0];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 md:py-14 space-y-6">
      {/* Page header */}
      <header className="relative mb-2 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-6 md:items-center">
        <div className="relative">
          <span className="kanji-watermark text-[140px] -top-6 -left-2" aria-hidden="true">𓂋𓆣</span>
          <p
            className="font-display text-[10px] uppercase tracking-[0.3em] mb-2 font-bold relative"
            style={{ color: "var(--gold)" }}
          >
            THE LIVE dAPP · DEVNET
          </p>
          <h1
            className="font-display text-4xl md:text-5xl font-black tracking-[0.02em] relative"
            style={{ color: "var(--foreground)" }}
          >
            MINT.{" "}
            <span
              style={{
                background:
                  "linear-gradient(135deg, var(--vault-gold) 0%, var(--gold-light) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              BURN. REDEEM.
            </span>
          </h1>
          <p className="text-sm mt-3 max-w-2xl relative" style={{ color: "var(--gray)" }}>
            5 SPL Token 2022 contracts (xGOLD · xSLVR · xGLDD · xSLVD · xGLDB) deployed
            on Solana devnet, backed 1:1 by AGX vault metal. Connect a wallet to mint
            against your reserve allocation.
          </p>
        </div>

        {/* Live token visual · syncs with XGoldCard selection */}
        <div className="relative w-full md:w-48 aspect-square shrink-0 hidden sm:block">
          <span aria-hidden="true" className="absolute" style={{ width: 14, height: 14, top: -1, left: -1, borderTop: "1.5px solid var(--vault-gold)", borderLeft: "1.5px solid var(--vault-gold)", zIndex: 3 }} />
          <span aria-hidden="true" className="absolute" style={{ width: 14, height: 14, bottom: -1, right: -1, borderBottom: "1.5px solid var(--vault-gold)", borderRight: "1.5px solid var(--vault-gold)", zIndex: 3 }} />
          <div
            className="relative w-full h-full overflow-hidden"
            style={{ background: "var(--obsidian)", border: "1px solid var(--carbon)" }}
          >
            <img
              key={selectedToken.symbol}
              src={selectedToken.image}
              alt={`${selectedToken.name} · ${selectedToken.symbol}`}
              className="w-full h-full object-cover transition-opacity duration-300"
              style={{
                filter: "saturate(1.05) contrast(1.05)",
                animation: "fadeIn 0.35s ease-out",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(180deg, transparent 55%, rgba(8,8,8,0.85) 100%)" }}
            />
            <span
              className="absolute font-display font-black tracking-[0.2em] uppercase"
              style={{
                bottom: 8,
                left: 8,
                fontSize: 8,
                padding: "3px 8px",
                background: "rgba(8,8,8,0.75)",
                color: "var(--gold)",
                border: "1px solid var(--gold-border)",
                backdropFilter: "blur(4px)",
              }}
            >
              {selectedToken.symbol} · {selectedToken.iconSymbol}
            </span>
            <span
              className="absolute font-display font-bold tabular-nums"
              style={{
                bottom: 8,
                right: 8,
                fontSize: 10,
                color: "var(--gold-light)",
                textShadow: "0 0 12px rgba(200,150,12,0.5)",
              }}
            >
              ${selectedToken.priceUsd >= 1000
                ? (selectedToken.priceUsd / 1000).toFixed(2) + "k"
                : selectedToken.priceUsd.toFixed(2)}
            </span>
          </div>
        </div>
      </header>

      <WalletBalanceCard />

      {/* Mint/Burn + AGX reserve preview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <XGoldCard
          selectedSymbol={selectedSymbol}
          onSelectSymbol={setSelectedSymbol}
        />
        <ReserveCard />
      </div>

      {/* AGX vault details */}
      <VaultCard />

      {/* Live transaction feed */}
      <section
        className="border corner-brackets p-6 relative"
        style={{ background: "var(--void)", borderColor: "var(--carbon)" }}
      >
        <span className="kanji-watermark text-[100px] -top-4 right-4" aria-hidden="true">𓂋𓈖</span>
        <div className="relative flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <p
              className="font-display text-[10px] uppercase tracking-[0.3em] font-bold"
              style={{ color: "var(--gold)" }}
            >
              Live Transaction Feed
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--gray)" }}>
              Recent mint · burn · transfer activity across all 5 Obsidian tokens
            </p>
          </div>
          <span
            className="font-display flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black tracking-[0.2em]"
            style={{
              background: "rgba(0,255,136,0.12)",
              color: "var(--mint-green)",
              border: "1px solid rgba(0,255,136,0.3)",
            }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--mint-green)" }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "var(--mint-green)" }} />
            </span>
            DEVNET LIVE
          </span>
        </div>

        {/* Desktop table */}
        <div className="relative overflow-x-auto hidden sm:block">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr style={{ color: "var(--gray)" }}>
                <th className="font-display text-[10px] tracking-[0.2em] text-left py-2 pr-4">TYPE</th>
                <th className="font-display text-[10px] tracking-[0.2em] text-left py-2 pr-4">TOKEN</th>
                <th className="font-display text-[10px] tracking-[0.2em] text-right py-2 pr-4">AMOUNT</th>
                <th className="font-display text-[10px] tracking-[0.2em] text-left py-2 pr-4">WALLET</th>
                <th className="font-display text-[10px] tracking-[0.2em] text-right py-2 pr-4">AGE</th>
                <th className="font-display text-[10px] tracking-[0.2em] text-right py-2"></th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TX_FEED.map((tx, i) => {
                const typeColor =
                  tx.type === "MINT"   ? "var(--mint-green)" :
                  tx.type === "BURN"   ? "var(--burn-red)"   :
                                         "var(--purple)";
                return (
                  <tr key={i} className="border-t" style={{ borderColor: "var(--carbon)" }}>
                    <td className="py-2.5 pr-4">
                      <span
                        className="font-display px-1.5 py-0.5 text-[10px] font-black tracking-[0.15em]"
                        style={{
                          background: `color-mix(in oklab, ${typeColor} 12%, transparent)`,
                          color: typeColor,
                          border: `1px solid ${typeColor}`,
                        }}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4" style={{ color: "var(--parchment)" }}>{tx.token}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums" style={{ color: "var(--gold-light)" }}>{tx.amount}</td>
                    <td className="py-2.5 pr-4" style={{ color: "var(--gray)" }}>{tx.wallet}</td>
                    <td className="py-2.5 pr-4 text-right" style={{ color: "var(--gray)" }}>{tx.ago}</td>
                    <td className="py-2.5 text-right">
                      <a
                        href="https://explorer.solana.com/?cluster=devnet"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View ${tx.type.toLowerCase()} of ${tx.amount} ${tx.token} on Explorer`}
                        className="font-display text-[10px] tracking-[0.15em] inline-flex items-center gap-1 transition-opacity hover:opacity-80"
                        style={{ color: "var(--gold)" }}
                      >
                        VIEW <span aria-hidden="true">↗</span>
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-2">
          {MOCK_TX_FEED.map((tx, i) => {
            const typeColor =
              tx.type === "MINT"   ? "var(--mint-green)" :
              tx.type === "BURN"   ? "var(--burn-red)"   :
                                     "var(--purple)";
            return (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-3 gap-3"
                style={{ background: "var(--dark2)", border: "1px solid var(--carbon)" }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="font-display px-1.5 py-0.5 text-[9px] font-black tracking-[0.15em] shrink-0"
                    style={{
                      background: `color-mix(in oklab, ${typeColor} 12%, transparent)`,
                      color: typeColor,
                      border: `1px solid ${typeColor}`,
                    }}
                  >
                    {tx.type}
                  </span>
                  <span className="font-display text-xs font-bold shrink-0" style={{ color: "var(--parchment)" }}>
                    {tx.token}
                  </span>
                  <span className="font-mono text-xs tabular-nums truncate" style={{ color: "var(--gold-light)" }}>
                    {tx.amount}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-[10px]" style={{ color: "var(--gray)" }}>{tx.ago}</span>
                  <a
                    href="https://explorer.solana.com/?cluster=devnet"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View ${tx.type.toLowerCase()} on Explorer`}
                    className="font-display text-[10px] tracking-[0.15em] inline-flex items-center gap-0.5 min-h-[44px] min-w-[44px] justify-end"
                    style={{ color: "var(--gold)" }}
                  >
                    ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] mt-4 font-mono" style={{ color: "var(--gray)" }}>
          Sample feed shown for demo. Live indexer ships in Phase 2 with{" "}
          <Link href="/developers" className="underline" style={{ color: "var(--gold)" }}>
            x402-gated streaming
          </Link>.
        </p>
      </section>
    </div>
  );
}
