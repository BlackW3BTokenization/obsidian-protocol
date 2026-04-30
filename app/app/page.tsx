"use client";

import Link from "next/link";
import { ProtocolStats } from "./components/protocol-stats";
import { GoldTopLine, Scanlines } from "./components/primitives";
import { OBSIDIAN_TOKENS } from "./lib/tokens";
import { FintechIcon, type FintechIconName } from "./components/fintech-icon";

export default function PitchPage() {
  const xgold = OBSIDIAN_TOKENS.find((t) => t.symbol === "xGOLD")!;
  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="pt-10 pb-16 md:pt-16 md:pb-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:items-center">
          <div className="relative">
            <span className="kanji-watermark text-[140px] -top-4 -left-2" aria-hidden="true">
              𓂀𓆣𓃭
            </span>
            <p
              className="text-[10px] uppercase tracking-[0.4em] mb-5 font-display font-bold flex items-center gap-3 relative flex-wrap"
              style={{ color: "var(--gold)" }}
            >
              <span>TOKENIZED PRECIOUS METALS</span>
              <span
                className="px-2.5 py-0.5 text-[9px] font-black tracking-[0.2em]"
                style={{
                  background: "rgba(0,255,136,0.1)",
                  color: "var(--mint-green)",
                  border: "1px solid rgba(0,255,136,0.35)",
                }}
              >
                5 TOKENS LIVE · PHASE 2
              </span>
            </p>
            <h1
              className="font-display font-black tracking-[0.02em] relative"
              style={{ color: "var(--foreground)" }}
            >
              <span className="block text-5xl md:text-6xl leading-[0.9]">OBSIDIAN</span>
              <span
                className="block text-6xl md:text-7xl leading-[0.9] mt-1"
                style={{
                  background:
                    "linear-gradient(135deg, var(--vault-gold) 0%, var(--gold-light) 50%, var(--vault-gold) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "0 0 60px var(--gold-glow)",
                }}
              >
                PROTOCOL
              </span>
            </h1>
            <p
              className="text-base mt-6 max-w-md leading-relaxed relative"
              style={{ color: "var(--parchment)" }}
            >
              Stripe + Venmo for precious metals. Bullion bars, gold &amp; silver dollar coins,
              and Goldback notes, all on Solana. Buy, hold, send, spend, or burn to
              redeem the physical asset. Backed 1:1 by AGX vault reserves. Settled
              in 400ms.
            </p>

            <div className="flex flex-wrap gap-3 mt-6 relative">
              {[
                { label: "SPL Token 2022", href: "https://spl.solana.com/token-2022" },
                { label: "Light Protocol", href: "https://lightprotocol.com" },
                { label: "AGX Reserve",    href: "https://agxlive.com" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{ color: "var(--gold)", outlineColor: "var(--vault-gold)" }}
                >
                  {label}
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 relative">
              <Link
                href="/protocol"
                className="font-display chamfer inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-black tracking-[0.25em] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background: "linear-gradient(135deg, var(--vault-gold) 0%, var(--gold-light) 100%)",
                  color: "var(--obsidian)",
                  outlineColor: "var(--vault-gold)",
                  boxShadow: "0 0 40px var(--gold-glow)",
                }}
              >
                LAUNCH PROTOCOL
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/revenue"
                className="font-display inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-black tracking-[0.25em] border transition-colors hover:bg-[var(--gold-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  borderColor: "var(--gold-border)",
                  color: "var(--gold)",
                  outlineColor: "var(--vault-gold)",
                }}
              >
                SEE THE ECONOMICS
              </Link>
            </div>
          </div>

          {/* Hero asset card · xGOLD bullion */}
          <div className="relative">
            {/* corner brackets */}
            <span aria-hidden="true" className="absolute" style={{ width: 20, height: 20, top: -1, left: -1, borderTop: "1.5px solid var(--vault-gold)", borderLeft: "1.5px solid var(--vault-gold)", zIndex: 3 }} />
            <span aria-hidden="true" className="absolute" style={{ width: 20, height: 20, bottom: -1, right: -1, borderBottom: "1.5px solid var(--vault-gold)", borderRight: "1.5px solid var(--vault-gold)", zIndex: 3 }} />

            <div
              className="relative aspect-square sm:aspect-[4/5] md:aspect-square overflow-hidden"
              style={{ background: "var(--void)", border: "1px solid var(--carbon)" }}
            >
              <GoldTopLine />
              <Scanlines opacity={0.03} />

              <img
                src={xgold.image}
                alt={`${xgold.name} bullion · ${xgold.symbol}`}
                className="w-full h-full object-cover"
                style={{ filter: "saturate(1.1) contrast(1.05)" }}
              />

              {/* Token badge top-left */}
              <span
                className="absolute font-display font-black tracking-[0.2em] uppercase"
                style={{
                  top: 16,
                  left: 16,
                  fontSize: 10,
                  padding: "4px 12px",
                  background: "rgba(8,8,8,0.7)",
                  color: "var(--gold)",
                  border: "1px solid var(--gold-border)",
                  backdropFilter: "blur(6px)",
                  zIndex: 2,
                }}
              >
                {xgold.symbol} · {xgold.iconSymbol}
              </span>

              {/* Spot price + 24H overlay */}
              <div
                className="absolute"
                style={{
                  bottom: 16,
                  left: 16,
                  right: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  zIndex: 2,
                }}
              >
                <div>
                  <p
                    className="font-display font-bold uppercase mb-1"
                    style={{ fontSize: 8, letterSpacing: "0.3em", color: "var(--gray)" }}
                  >
                    Spot price / oz
                  </p>
                  <p
                    className="font-display font-black tabular-nums"
                    style={{
                      fontSize: 28,
                      color: "var(--gold-light)",
                      letterSpacing: "-0.01em",
                      textShadow: "0 0 30px rgba(200,150,12,0.5)",
                      lineHeight: 1,
                    }}
                  >
                    ${xgold.priceUsd.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="font-display font-bold uppercase mb-1"
                    style={{ fontSize: 8, letterSpacing: "0.3em", color: "var(--gray)" }}
                  >
                    24H change
                  </p>
                  <p
                    className="font-display font-black tabular-nums"
                    style={{
                      fontSize: 18,
                      color: xgold.change24h.startsWith("+") ? "var(--mint-green)" : "var(--burn-red)",
                      lineHeight: 1,
                    }}
                  >
                    {xgold.change24h}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats row under the card */}
            <div className="grid grid-cols-3 gap-px mt-px" style={{ background: "var(--carbon)" }}>
              {[
                { label: "AGX RESERVE",  value: "$31.7M" },
                { label: "TOKENS LIVE",  value: "5 / 5" },
                { label: "SETTLEMENT",   value: "400MS" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="px-3 py-3"
                  style={{ background: "var(--void)" }}
                >
                  <p
                    className="font-display font-black tabular-nums"
                    style={{
                      fontSize: 16,
                      color: "var(--gold-light)",
                      letterSpacing: "-0.01em",
                      lineHeight: 1,
                    }}
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
        </div>
      </section>

      {/* Phase 1 banner + 60k stats + 5-token grid + adoption bar */}
      <ProtocolStats />

      {/* Trailing CTA */}
      <section className="my-16 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {([
          { icon: "laptop_trading"  as FintechIconName, title: "Mint live",   sub: "Connect a wallet, mint xGOLD against devnet reserves", href: "/protocol",   cta: "Open dApp" },
          { icon: "safe"            as FintechIconName, title: "Verify",      sub: "Daily ZK-attested AGX reserves across all 5 tokens",   href: "/reserves",   cta: "View reserves" },
          { icon: "dollar_contract" as FintechIconName, title: "Build on it", sub: "x402-gated APIs · pay per call · &lt;400ms settlement", href: "/developers", cta: "Read API spec" },
        ] as const).map(({ icon, title, sub, href, cta }) => (
          <Link
            key={title}
            href={href}
            className="group relative corner-brackets p-5 border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 overflow-hidden"
            style={{
              background: "var(--void)",
              borderColor: "var(--carbon)",
              outlineColor: "var(--vault-gold)",
            }}
          >
            <div
              aria-hidden="true"
              className="absolute -right-4 -top-4 opacity-25 group-hover:opacity-40 transition-opacity"
            >
              <FintechIcon name={icon} size={96} />
            </div>
            <FintechIcon name={icon} size={36} glow className="mb-3" />
            <p
              className="font-display text-[10px] font-black tracking-[0.3em] mb-2 relative"
              style={{ color: "var(--gold)" }}
            >
              {title.toUpperCase()}
            </p>
            <p className="text-sm relative" style={{ color: "var(--parchment)" }} dangerouslySetInnerHTML={{ __html: sub }} />
            <p
              className="font-display text-[10px] font-black tracking-[0.25em] mt-4 inline-flex items-center gap-1.5 relative"
              style={{ color: "var(--gold-light)" }}
            >
              {cta.toUpperCase()} <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
