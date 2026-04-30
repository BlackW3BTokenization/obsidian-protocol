"use client";

import Link from "next/link";
import { FintechIcon, type FintechIconName } from "./fintech-icon";

const COLS = [
  {
    label: "PROTOCOL",
    items: [
      { label: "BLKW3B",      href: "/",           icon: "dollar_shield"    as FintechIconName },
      { label: "Live dApp",   href: "/protocol",   icon: "laptop_trading"   as FintechIconName },
      { label: "Reserves",    href: "/reserves",   icon: "safe"             as FintechIconName },
      { label: "Revenue",     href: "/revenue",    icon: "bar_chart"        as FintechIconName },
      { label: "Developers",  href: "/developers", icon: "laptop_security"  as FintechIconName },
    ],
  },
  {
    label: "INFRASTRUCTURE",
    items: [
      { label: "SPL Token 2022", href: "https://spl.solana.com/token-2022", external: true, icon: "dollar_contract" as FintechIconName },
      { label: "Light Protocol", href: "https://lightprotocol.com",           external: true, icon: "lock"           as FintechIconName },
      { label: "AGX / UPMA",     href: "https://upma.org",                    external: true, icon: "safe_open_coins" as FintechIconName },
      { label: "Pyth Network",   href: "https://pyth.network",                external: true, icon: "candles"        as FintechIconName },
    ],
  },
  {
    label: "BUILD",
    items: [
      { label: "GitHub",  href: "https://github.com/BlackW3BTokenization/obsidian-protocol", external: true, icon: "key"           as FintechIconName },
      { label: "Devnet",  href: "https://explorer.solana.com/?cluster=devnet",               external: true, icon: "dollar_shield" as FintechIconName },
      { label: "x402",    href: "/developers",                                                               icon: "wallet"        as FintechIconName },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer
      className="relative mt-20 border-t"
      style={{ background: "var(--obsidian)", borderColor: "var(--carbon)" }}
    >
      <span
        className="kanji-watermark text-[160px] -top-8 right-6 hidden md:inline"
        aria-hidden="true"
      >
        𓂋𓆣
      </span>

      <div className="mx-auto max-w-6xl px-6 py-12 relative">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand block */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/assets/blkw3b-crest.webp"
                alt="BLKW3B crest"
                width={28}
                height={28}
                style={{
                  width: 28,
                  height: 28,
                  objectFit: "contain",
                  filter: "drop-shadow(0 0 6px rgba(200,150,12,0.45))",
                  opacity: 0.85,
                }}
              />
              <p className="font-display text-base font-black tracking-[0.25em]" style={{ color: "var(--gold)" }}>
                BLKW3B
              </p>
            </div>
            <p className="font-display text-[9px] font-bold tracking-[0.3em]" style={{ color: "var(--gray)" }}>
              OBSIDIAN PROTOCOL
            </p>
            <p className="text-xs leading-relaxed pt-2" style={{ color: "var(--gray)" }}>
              Tokenized precious metals on Solana. Backed 1:1 by AGX vault reserves.
              ZK-attested daily. Forged on devnet, audited for mainnet.
            </p>
          </div>

          {COLS.map((col) => (
            <div key={col.label}>
              <p
                className="font-display text-[10px] font-black tracking-[0.3em] mb-4"
                style={{ color: "var(--gold)" }}
              >
                {col.label}
              </p>
              <ul className="space-y-2">
                {col.items.map((item) => (
                  <li key={item.label}>
                    {"external" in item && item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs transition-opacity hover:opacity-80 inline-flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={{ color: "var(--parchment)", outlineColor: "var(--vault-gold)" }}
                      >
                        {"icon" in item && <FintechIcon name={item.icon} size={16} className="opacity-60 shrink-0" />}
                        {item.label}
                        <span aria-hidden="true" style={{ color: "var(--gray)" }}>↗</span>
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-xs transition-opacity hover:opacity-80 inline-flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                        style={{ color: "var(--parchment)", outlineColor: "var(--vault-gold)" }}
                      >
                        {"icon" in item && <FintechIcon name={item.icon} size={16} className="opacity-60 shrink-0" />}
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t text-xs"
          style={{ borderColor: "var(--carbon)", color: "var(--gray)" }}
        >
          <p className="font-display tracking-[0.15em]">
            © {new Date().getFullYear()} BLKW3B INC · FORGED, NOT DESIGNED
          </p>
          <p className="font-mono">
            Phase 1 · Foundation Complete · Phase 2 · In Motion
          </p>
        </div>
      </div>
    </footer>
  );
}
