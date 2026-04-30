"use client";

import { X402Gateway } from "../components/x402-gateway";
import { SectionEyebrow, GoldTopLine, Scanlines } from "../components/primitives";
import { FintechIcon, type FintechIconName } from "../components/fintech-icon";

const WHY_X402 = [
  {
    kanji: "402",
    title: "HTTP 402 · Payment Required",
    desc: "An IETF status code unused since 1997. Coinbase revived it as the open standard for pay-per-call APIs. Obsidian implements it native on Solana.",
  },
  {
    kanji: "AI",
    title: "Built for agents, not humans",
    desc: "AI agents can't sign up, fill forms, or manage subscriptions. They CAN sign a payment header. x402 is the only model an autonomous LLM can use without a human in the loop.",
  },
  {
    kanji: "∞",
    title: "No subscriptions, no minimums",
    desc: "Pay 0.0001 SOL for one call, 100 SOL for a million. No invoicing, no contracts, no monthly minimums. Server returns 200 OK only after on-chain settlement.",
  },
  {
    kanji: "<400",
    title: "Solana-speed settlement",
    desc: "Payment verification + data return in under 400ms. Faster than most paywall checkouts, fast enough to live inside an HTTP request lifecycle.",
  },
] as const;

const WHO_PAYS = [
  {
    audience: "DeFi PROTOCOLS",
    icon:     "dollar_shield" as FintechIconName,
    accent:   "var(--vault-gold)",
    use_case: "Verifying xGOLD / xSLVR collateral before accepting it as backing for loans, perps, or stable issuance.",
    example:  "Marginfi pulls /reserve/attestation every block before counting xGOLD as 95% LTV collateral.",
    volume:   "~8,400 calls/day per integrating protocol",
  },
  {
    audience: "AI AGENTS",
    icon:     "laptop_security" as FintechIconName,
    accent:   "var(--purple)",
    use_case: "Autonomous trading bots and on-chain LLMs pricing trades, sourcing oracle data, and verifying counterparty backing without human prompts.",
    example:  "An OpenAI assistant asks /price/metals while planning a hedge, settles 0.0001 SOL automatically.",
    volume:   "~28,800 calls/day across agent fleets",
  },
  {
    audience: "TRADING BOTS",
    icon:     "candles" as FintechIconName,
    accent:   "var(--mint-green)",
    use_case: "MEV searchers and market-makers pulling fresh xAU/USD spreads at sub-second cadence to arb against CEX prices.",
    example:  "A Jito bundler pre-fetches /price/metals every 2s, paying $0.06/day per pair tracked.",
    volume:   "Burst patterns · 1,000+ calls/min during volatility",
  },
] as const;

export default function DevelopersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 md:py-14 space-y-8">
      {/* Page header */}
      <header className="relative mb-2">
        <span className="kanji-watermark text-[140px] -top-6 -left-2" aria-hidden="true">𓂋𓈖</span>
        <p
          className="font-display text-[10px] uppercase tracking-[0.3em] mb-2 font-bold relative"
          style={{ color: "var(--gold)" }}
        >
          DEVELOPER · INFRASTRUCTURE LAYER
        </p>
        <h1
          className="font-display text-4xl md:text-5xl font-black tracking-[0.02em] relative"
          style={{ color: "var(--foreground)" }}
        >
          PAY-PER-CALL{" "}
          <span
            style={{
              background: "linear-gradient(135deg, var(--vault-gold) 0%, var(--gold-light) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            APIs.
          </span>
        </h1>
        <p className="text-sm mt-3 max-w-2xl relative" style={{ color: "var(--gray)" }}>
          Obsidian isn't just a user product. It's infrastructure. Every API call is a
          settlement event. Every endpoint a revenue line. AI-agent native, payment by
          default, no subscriptions.
        </p>
      </header>

      {/* Why x402 · 4 cards */}
      <section>
        <SectionEyebrow label="WHY x402" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px" style={{ background: "var(--carbon)" }}>
          {WHY_X402.map(({ kanji, title, desc }) => (
            <div
              key={title}
              className="relative p-6 flex flex-col gap-3 min-w-0"
              style={{ background: "var(--void)" }}
            >
              <GoldTopLine />
              <Scanlines opacity={0.025} />
              <span aria-hidden="true" className="absolute" style={{ width: 16, height: 16, top: 0, left: 0, borderTop: "1.5px solid var(--vault-gold)", borderLeft: "1.5px solid var(--vault-gold)", zIndex: 2 }} />
              <span aria-hidden="true" className="absolute" style={{ width: 16, height: 16, bottom: 0, right: 0, borderBottom: "1.5px solid var(--vault-gold)", borderRight: "1.5px solid var(--vault-gold)", zIndex: 2 }} />

              <p
                className="font-display font-black tabular-nums relative"
                style={{
                  fontSize: 32,
                  color: "var(--gold-light)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                  textShadow: "0 0 24px rgba(200,150,12,0.3)",
                  zIndex: 2,
                }}
              >
                {kanji}
              </p>
              <p className="font-display text-sm font-bold tracking-[0.05em] relative" style={{ color: "var(--parchment)", zIndex: 2 }}>
                {title}
              </p>
              <p className="text-xs leading-relaxed relative" style={{ color: "var(--gray)", zIndex: 2 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Existing X402Gateway with 3 endpoints + revenue projections */}
      <X402Gateway />

      {/* Who pays · 3 case studies */}
      <section>
        <SectionEyebrow label="WHO PAYS · CASE STUDIES" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px" style={{ background: "var(--carbon)" }}>
          {WHO_PAYS.map(({ audience, icon, accent, use_case, example, volume }) => (
            <article
              key={audience}
              className="relative p-6 flex flex-col gap-4 min-w-0"
              style={{ background: "var(--void)" }}
            >
              <Scanlines opacity={0.02} />
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${accent} 40%, ${accent} 60%, transparent)`,
                  zIndex: 1,
                }}
              />

              <div className="relative flex items-center justify-between gap-3" style={{ zIndex: 2 }}>
                <p
                  className="font-display font-black tracking-[0.25em]"
                  style={{ fontSize: 11, color: accent }}
                >
                  {audience}
                </p>
                <FintechIcon name={icon} size={40} glow />
              </div>

              <p className="text-sm leading-relaxed relative" style={{ color: "var(--parchment)", zIndex: 2 }}>
                {use_case}
              </p>

              <div
                className="relative p-3 mt-auto"
                style={{ background: "var(--dark2)", border: "1px solid var(--carbon)", zIndex: 2 }}
              >
                <p
                  className="font-display text-[10px] tracking-[0.25em] mb-1.5 font-bold uppercase"
                  style={{ color: "var(--gray)" }}
                >
                  Example
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--parchment)" }}>
                  {example}
                </p>
              </div>

              <div className="relative flex items-center justify-between pt-1" style={{ zIndex: 2 }}>
                <p className="font-display text-[10px] tracking-[0.2em] uppercase" style={{ color: "var(--gray)" }}>
                  Volume
                </p>
                <p className="font-mono text-xs" style={{ color: accent }}>
                  {volume}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Build CTA */}
      <section
        className="relative p-8 border corner-brackets overflow-hidden"
        style={{ background: "var(--void)", borderColor: "var(--carbon)" }}
      >
        <GoldTopLine />
        <Scanlines opacity={0.03} />
        <span className="kanji-watermark text-[120px] -top-4 right-4" aria-hidden="true">𓂋𓃭</span>

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p
              className="font-display text-[10px] uppercase tracking-[0.3em] mb-2 font-bold"
              style={{ color: "var(--gold)" }}
            >
              BUILD ON OBSIDIAN
            </p>
            <h2
              className="font-display text-2xl md:text-3xl font-black tracking-[0.02em]"
              style={{ color: "var(--foreground)" }}
            >
              SDK ships with{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, var(--vault-gold) 0%, var(--gold-light) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Phase 2.
              </span>
            </h2>
            <p className="text-sm mt-3 max-w-md" style={{ color: "var(--gray)" }}>
              Open-source TypeScript + Rust client libraries, plus a hosted x402 facilitator
              for partners who don't want to run their own settlement.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://github.com/BlackW3BTokenization/obsidian-protocol"
              target="_blank"
              rel="noopener noreferrer"
              className="font-display chamfer inline-flex items-center justify-center gap-2 px-6 py-3 text-[10px] font-black tracking-[0.3em] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                background: "linear-gradient(135deg, var(--vault-gold) 0%, var(--gold-light) 100%)",
                color: "var(--obsidian)",
                outlineColor: "var(--vault-gold)",
              }}
            >
              GITHUB <span aria-hidden="true">↗</span>
            </a>
            <a
              href="/protocol"
              className="font-display inline-flex items-center justify-center gap-2 px-6 py-3 text-[10px] font-black tracking-[0.3em] border transition-colors hover:bg-[var(--gold-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ borderColor: "var(--gold-border)", color: "var(--gold)", outlineColor: "var(--vault-gold)" }}
            >
              SEE LIVE dAPP
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
