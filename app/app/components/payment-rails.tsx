"use client";

import { useState } from "react";
import { OBSIDIAN_TOKENS } from "../lib/tokens";
import { FintechIcon } from "./fintech-icon";
import { GoldTopLine, Scanlines } from "./primitives";

const TOKENS = OBSIDIAN_TOKENS.map((t) => ({
  symbol: t.symbol,
  name:   t.name,
  price:  t.priceUsd,
  color:  t.color,
  unit:   t.unitShort,
}));

type Rail = "stripe" | "venmo";

export function PaymentRails() {
  const [rail, setRail]         = useState<Rail>("stripe");
  const [token, setToken]       = useState(TOKENS[0]);
  const [usdAmount, setUsdAmount] = useState("");

  const parsed   = parseFloat(usdAmount) || 0;
  const metalQty = parsed > 0 ? (parsed / token.price).toFixed(6) : "—";
  const fee      = parsed > 0 ? (parsed * 0.0029 + 0.30).toFixed(2) : null; // Stripe ~2.9% + $0.30
  const total    = parsed > 0 && fee ? (parsed + parseFloat(fee)).toFixed(2) : null;

  return (
    <section
      className="border corner-brackets relative overflow-hidden"
      style={{ background: "var(--void)", borderColor: "var(--carbon)" }}
    >
      <GoldTopLine />
      <Scanlines opacity={0.02} />
      <span className="kanji-watermark text-[120px] -top-4 right-4" aria-hidden="true">𓆣𓏥</span>

      <div className="relative p-6 md:p-8">
        {/* Preview banner — always visible, first thing users read */}
        <div
          className="flex items-center gap-3 px-4 py-3 mb-6"
          style={{ background: "rgba(200,150,12,0.08)", border: "1px solid rgba(200,150,12,0.35)" }}
        >
          <FintechIcon name="calendar" size={28} glow />
          <div>
            <p className="font-display text-xs font-black tracking-[0.2em]" style={{ color: "var(--gold)" }}>
              LAUNCHING Q3 2026 · MAINNET
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--gray)" }}>
              This is a live preview. Payments are not processed yet. Connect a Solana wallet today to mint on devnet.
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="mb-6">
          <p
            className="font-display text-[10px] uppercase tracking-[0.35em] font-bold mb-2"
            style={{ color: "var(--gold)" }}
          >
            INSTANT BUY · CARD OR VENMO
          </p>
          <h2
            className="font-display text-2xl md:text-3xl font-black tracking-[0.02em]"
            style={{ color: "var(--foreground)" }}
          >
            PAY FIAT.{" "}
            <span
              style={{
                background: "linear-gradient(135deg, var(--vault-gold) 0%, var(--gold-light) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              RECEIVE METAL.
            </span>
          </h2>
          <p className="text-sm mt-2" style={{ color: "var(--gray)" }}>
            Buy tokenized precious metals with a credit card or Venmo. Metal is minted on-chain and delivered to your wallet in 400ms.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: form */}
          <div className="space-y-4">

            {/* Rail selector */}
            <div>
              <p className="font-display text-[10px] uppercase tracking-[0.25em] mb-2 font-bold" style={{ color: "var(--gray)" }}>
                Payment method
              </p>
              <div className="grid grid-cols-2 gap-px" style={{ background: "var(--carbon)" }}>
                {(["stripe", "venmo"] as Rail[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRail(r)}
                    className="flex items-center justify-center gap-2.5 py-3 px-4 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      background: rail === r ? "rgba(200,150,12,0.10)" : "var(--void)",
                      borderBottom: rail === r ? "2px solid var(--vault-gold)" : "2px solid transparent",
                      outlineColor: "var(--vault-gold)",
                    }}
                    aria-pressed={rail === r}
                  >
                    {r === "stripe" ? (
                      <StripeWordmark active={rail === "stripe"} />
                    ) : (
                      <VenmoWordmark active={rail === "venmo"} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Token selector */}
            <div>
              <p className="font-display text-[10px] uppercase tracking-[0.25em] mb-2 font-bold" style={{ color: "var(--gray)" }}>
                You receive
              </p>
              <div className="grid grid-cols-5 gap-px" style={{ background: "var(--carbon)" }}>
                {TOKENS.map((t) => (
                  <button
                    key={t.symbol}
                    type="button"
                    onClick={() => setToken(t)}
                    className="flex flex-col items-center gap-1 py-2.5 px-1 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      background: token.symbol === t.symbol ? `${t.color}18` : "var(--void)",
                      borderBottom: token.symbol === t.symbol ? `2px solid ${t.color}` : "2px solid transparent",
                      outlineColor: "var(--vault-gold)",
                    }}
                    aria-pressed={token.symbol === t.symbol}
                  >
                    <span className="font-display text-[9px] font-black tracking-[0.1em]" style={{ color: token.symbol === t.symbol ? t.color : "var(--gray)" }}>
                      {t.symbol}
                    </span>
                    <span className="font-mono text-[8px]" style={{ color: "var(--gray)" }}>
                      ${t.price >= 1000 ? (t.price / 1000).toFixed(1) + "k" : t.price.toFixed(0)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* USD amount input */}
            <div>
              <p className="font-display text-[10px] uppercase tracking-[0.25em] mb-2 font-bold" style={{ color: "var(--gray)" }}>
                Amount (USD)
              </p>
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ background: "var(--dark2)", border: "1px solid var(--carbon)" }}
              >
                <span className="font-display text-lg font-black" style={{ color: "var(--gray)" }}>$</span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="10"
                  step="1"
                  placeholder="0.00"
                  value={usdAmount}
                  onChange={(e) => setUsdAmount(e.target.value)}
                  className="flex-1 bg-transparent text-2xl font-bold outline-none tabular-nums placeholder:opacity-25 font-display"
                  style={{ color: "var(--parchment)" }}
                  aria-label="USD amount to spend"
                />
                <span
                  className="font-display text-xs font-black tracking-[0.15em] px-2 py-1"
                  style={{ background: "var(--gold-muted)", color: "var(--gold)", border: "1px solid var(--gold-border)" }}
                >
                  USD
                </span>
              </div>
            </div>

            {/* Fee breakdown */}
            {parsed > 0 && fee && (
              <div
                className="space-y-1.5 px-3 py-3 text-xs font-mono"
                style={{ background: "var(--dark2)", border: "1px solid var(--carbon)" }}
              >
                <div className="flex justify-between">
                  <span style={{ color: "var(--gray)" }}>You spend</span>
                  <span style={{ color: "var(--parchment)" }}>${parsed.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--gray)" }}>
                    {rail === "stripe" ? "Card fee (2.9% + $0.30)" : "Venmo fee (3.0%)"}
                  </span>
                  <span style={{ color: "var(--burn-red)" }}>+${fee}</span>
                </div>
                <div
                  className="flex justify-between pt-1.5 border-t font-bold"
                  style={{ borderColor: "var(--carbon)" }}
                >
                  <span style={{ color: "var(--gray)" }}>Total charged</span>
                  <span style={{ color: "var(--gold-light)" }}>${total}</span>
                </div>
                <div
                  className="flex justify-between pt-1.5 border-t"
                  style={{ borderColor: "var(--carbon)" }}
                >
                  <span style={{ color: "var(--gray)" }}>You receive</span>
                  <span style={{ color: token.color }}>
                    {metalQty} {token.symbol}
                  </span>
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              type="button"
              disabled
              className="w-full py-3.5 font-display text-xs font-black tracking-[0.3em] opacity-40 cursor-not-allowed chamfer relative"
              style={{
                background: "linear-gradient(135deg, var(--vault-gold) 0%, var(--gold-light) 100%)",
                color: "var(--obsidian)",
              }}
              aria-label="Payment not yet live"
              title="Launches Q3 2026"
            >
              {rail === "stripe" ? "PAY WITH CARD" : "PAY WITH VENMO"} · Q3 2026
            </button>
            <p className="text-[10px] text-center font-mono" style={{ color: "var(--gray)" }}>
              Preview only · no charges processed · mainnet launches Q3 2026
            </p>
          </div>

          {/* Right: receipt preview */}
          <div
            className="relative p-5 flex flex-col gap-4"
            style={{ background: "var(--dark2)", border: "1px solid var(--carbon)" }}
          >
            <span aria-hidden="true" className="absolute" style={{ width: 12, height: 12, top: 0, left: 0, borderTop: "1.5px solid var(--vault-gold)", borderLeft: "1.5px solid var(--vault-gold)" }} />
            <span aria-hidden="true" className="absolute" style={{ width: 12, height: 12, bottom: 0, right: 0, borderBottom: "1.5px solid var(--vault-gold)", borderRight: "1.5px solid var(--vault-gold)" }} />

            <p className="font-display text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: "var(--gold)" }}>
              What you get
            </p>

            {/* Token preview */}
            <div className="flex items-center gap-4">
              <FintechIcon
                name={
                  token.symbol === "xGOLD" ? "goldbar" :
                  token.symbol === "xSLVR" ? "silverbar" :
                  token.symbol === "xGLDD" ? "coin_stack_gold" :
                  token.symbol === "xSLVD" ? "coin_stack_silver" :
                  "cash"
                }
                size={56}
                glow
              />
              <div>
                <p className="font-display text-2xl font-black tabular-nums" style={{ color: token.color }}>
                  {metalQty}
                </p>
                <p className="font-display text-xs font-bold tracking-[0.15em]" style={{ color: "var(--parchment)" }}>
                  {token.symbol} · {token.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--gray)" }}>
                  ${token.price >= 1000 ? (token.price / 1000).toFixed(2) + "k" : token.price.toFixed(2)} / {token.unit}
                </p>
              </div>
            </div>

            {/* What happens next */}
            <div className="space-y-2 mt-2">
              {[
                { step: "01", text: "Payment settled via " + (rail === "stripe" ? "Stripe" : "Venmo") },
                { step: "02", text: "AGX vault confirms metal allocation" },
                { step: "03", text: token.symbol + " minted to your wallet in 400ms" },
                { step: "04", text: "Burn anytime to redeem physical metal" },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-start gap-3">
                  <span
                    className="font-display text-[9px] font-black tracking-[0.1em] px-1.5 py-0.5 shrink-0 mt-0.5"
                    style={{ background: "var(--gold-muted)", color: "var(--gold)", border: "1px solid var(--gold-border)" }}
                  >
                    {step}
                  </span>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--gray)" }}>{text}</p>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div
              className="grid grid-cols-3 gap-px mt-auto"
              style={{ background: "var(--carbon)" }}
            >
              {[
                { icon: "lock"         as const, label: "Encrypted" },
                { icon: "safe"         as const, label: "AGX Insured" },
                { icon: "dollar_shield" as const, label: "1:1 Backed" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 py-2.5" style={{ background: "var(--void)" }}>
                  <FintechIcon name={icon} size={20} />
                  <span className="font-display text-[8px] font-bold tracking-[0.15em]" style={{ color: "var(--gray)" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Inline wordmarks ──────────────────────────────────────── */
function StripeWordmark({ active }: { active: boolean }) {
  return (
    <svg
      width="48" height="20" viewBox="0 0 48 20"
      fill={active ? "#635BFF" : "#555"}
      aria-label="Stripe"
      role="img"
    >
      <path d="M5.6 7.2c0-.8.7-1.1 1.8-1.1 1.6 0 3.6.5 5.2 1.4V3.4C11 2.6 9.2 2.3 7.4 2.3 3.2 2.3.5 4.4.5 7.4c0 4.6 6.3 3.8 6.3 5.8 0 .9-.8 1.2-2 1.2-1.7 0-3.9-.7-5.7-1.7v4.2c1.9.8 3.9 1.2 5.7 1.2 4.3 0 7.3-2.1 7.3-5.2-.1-4.9-6.5-4-6.5-5.7zM26.8 2.6l-2.7 12.7-2.7-12.7H17l4.2 15.7h5.7l4.3-15.7h-4.4zm8.8 0v15.7h4.4V2.6h-4.4zm0-2.6h4.4V.3l-4.4-.3v2.6zm8.3 8.1V2.6h-4.3v15.7h4.3V12c0-2.2 1.5-2.9 3.7-2.9V4.9c-2 0-3.3.9-3.7 3.2z" />
    </svg>
  );
}

function VenmoWordmark({ active }: { active: boolean }) {
  return (
    <svg
      width="64" height="20" viewBox="0 0 80 22"
      aria-label="Venmo"
      role="img"
    >
      <text
        x="0" y="17"
        fontFamily="'Arial Black', sans-serif"
        fontWeight="900"
        fontSize="18"
        fill={active ? "#3D95CE" : "#555"}
        letterSpacing="1"
      >
        venmo
      </text>
    </svg>
  );
}
