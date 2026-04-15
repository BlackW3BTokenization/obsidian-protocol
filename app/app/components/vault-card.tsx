"use client";

import { OBSIDIAN_TOKENS } from "../lib/tokens";

export function VaultCard() {
  return (
    <section
      className="border corner-brackets p-6 relative"
      style={{ background: "var(--void)", borderColor: "var(--carbon)" }}
    >
      <span className="kanji-watermark text-[80px] -top-2 right-4" aria-hidden="true">金庫</span>

      <div className="relative flex items-center justify-between mb-4">
        <div>
          <p className="font-display text-base font-bold tracking-[0.15em]" style={{ color: "var(--gold)" }}>AGX VAULT</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--gray)" }}>
            Alpine Gold Exchange · Sub-Distributor Agreement §7.1
          </p>
        </div>
        <span
          className="font-display px-2.5 py-1 text-[10px] font-black tracking-[0.2em] flex items-center gap-1.5"
          style={{ background: "rgba(0,255,136,0.12)", color: "var(--mint-green)", border: "1px solid rgba(0,255,136,0.3)" }}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--mint-green)" }} />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "var(--mint-green)" }} />
          </span>
          SIGNED
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {[
          { label: "Vault Operator",  val: "AGX Inc." },
          { label: "SoR API",         val: "§7.2 Enabled" },
          { label: "Token Standard",  val: "SPL Token 2022" },
          { label: "Attestation",     val: "Light Protocol ZK" },
        ].map(({ label, val }) => (
          <div key={label} className="p-3" style={{ background: "var(--dark2)", border: "1px solid var(--carbon)" }}>
            <p className="font-display text-[9px] uppercase tracking-[0.2em]" style={{ color: "var(--gray)" }}>{label}</p>
            <p className="font-display text-sm font-bold mt-1 tracking-wider" style={{ color: "var(--parchment)" }}>{val}</p>
          </div>
        ))}
      </div>

      <p className="font-display text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: "var(--gray)" }}>
        Mint authorities (devnet)
      </p>
      <div className="space-y-1">
        {OBSIDIAN_TOKENS.map((t) => (
          <div
            key={t.symbol}
            className="flex items-center justify-between text-xs px-3 py-2"
            style={{ background: "var(--dark2)", border: "1px solid var(--carbon)" }}
          >
            <span className="font-display font-bold tracking-[0.15em] flex items-center gap-2" style={{ color: "var(--gold)" }}>
              <span
                className="hex-clip flex items-center justify-center font-display font-black"
                style={{
                  width: 18, height: 18,
                  background: "linear-gradient(135deg, var(--vault-gold), #8B6914)",
                  color: "var(--obsidian)",
                  fontSize: 8,
                }}
              >
                {t.iconSymbol}
              </span>
              {t.symbol}
            </span>
            <span className="font-mono" style={{ color: "var(--gray)" }}>
              {t.mintAddress.slice(0, 10)}…{t.mintAddress.slice(-6)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
