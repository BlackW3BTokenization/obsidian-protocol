"use client";

import { useState } from "react";
import { useWallet } from "../lib/wallet/context";
import { OBSIDIAN_TOKENS, type ObsidianToken } from "../lib/tokens";
import { FEES } from "./revenue-model";
import { FintechIcon, type FintechIconName } from "./fintech-icon";

// Per-token icon mapping (filenames: goldbar_black.png, silverbar_black.png, etc.)
const TOKEN_ICONS: Record<string, FintechIconName> = {
  xGOLD: "goldbar",
  xSLVR: "silverbar",
  xGLDD: "coin_stack_gold",
  xSLVD: "coin_stack_silver",
  xGLDB: "cash",
};

const SOL_PRICE_USD   = 142.8;
const MINT_FEE        = FEES.mint.bps / 10_000;
const BURN_FEE        = FEES.burn.bps / 10_000;

// ── Token selector pill ────────────────────────────────────────────────────
function TokenPill({
  token, selected, onClick,
}: { token: ObsidianToken; selected: boolean; onClick: () => void }) {
  const icon = TOKEN_ICONS[token.symbol] ?? "dollar_coin";
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 px-3 py-2.5 transition-all text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        background:  selected ? "rgba(200,150,12,0.12)" : "var(--void)",
        border:      `1px solid ${selected ? "var(--vault-gold)" : "var(--carbon)"}`,
        outline:     "none",
        minWidth:    "80px",
        outlineColor: "var(--vault-gold)",
      }}
    >
      <span style={{ opacity: selected ? 1 : 0.45, transition: "opacity 0.15s" }}>
        <FintechIcon name={icon} size={32} glow={selected} />
      </span>
      <span className="text-[10px] font-display font-bold tracking-[0.15em]" style={{ color: selected ? "var(--gold)" : "var(--gray)" }}>
        {token.symbol}
      </span>
      <span className="text-[10px] font-display tabular-nums" style={{ color: selected ? "var(--gold-light)" : "var(--gray)" }}>
        ${token.priceUsd >= 1000
          ? (token.priceUsd / 1000).toFixed(1) + "k"
          : token.priceUsd.toFixed(0)}
      </span>
    </button>
  );
}

// ── Main card ──────────────────────────────────────────────────────────────
export function XGoldCard({
  selectedSymbol,
  onSelectSymbol,
}: {
  /** Optional controlled selection. If omitted, the card manages its own state. */
  selectedSymbol?: string;
  onSelectSymbol?: (symbol: string) => void;
} = {}) {
  const { status } = useWallet();
  const [internalIdx, setInternalIdx] = useState(0);
  const [tab, setTab]                 = useState<"mint" | "burn">("mint");
  const [amount, setAmount]           = useState("");

  // Resolve current token from the controlled prop if provided, else internal state.
  const controlledIdx = selectedSymbol
    ? OBSIDIAN_TOKENS.findIndex((t) => t.symbol === selectedSymbol)
    : -1;
  const selectedIdx = controlledIdx >= 0 ? controlledIdx : internalIdx;
  const token = OBSIDIAN_TOKENS[selectedIdx];

  const selectByIndex = (i: number) => {
    setAmount("");
    if (onSelectSymbol) onSelectSymbol(OBSIDIAN_TOKENS[i].symbol);
    else setInternalIdx(i);
  };

  // Conversions
  const solAmount   = parseFloat(amount) || 0;
  const rawTokenOut = (solAmount * SOL_PRICE_USD) / token.priceUsd;
  const mintFee     = rawTokenOut * MINT_FEE;
  const tokenOut    = solAmount > 0 ? (rawTokenOut - mintFee).toFixed(6) : "—";
  const mintFeeDisplay = solAmount > 0 ? mintFee.toFixed(7) : null;

  const burnAmount  = parseFloat(amount) || 0;
  const rawSolOut   = (burnAmount * token.priceUsd) / SOL_PRICE_USD;
  const burnFee     = rawSolOut * BURN_FEE;
  const solOut      = burnAmount > 0 ? (rawSolOut - burnFee).toFixed(6) : "—";
  const burnFeeDisplay = burnAmount > 0 ? burnFee.toFixed(7) : null;

  return (
    <section
      className="w-full border corner-brackets p-6"
      style={{ background: "var(--void)", borderColor: "var(--carbon)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-display text-base font-bold tracking-[0.15em]" style={{ color: "var(--gold)" }}>{token.symbol}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--gray)" }}>
            {token.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-1 text-[10px] font-display font-black tracking-[0.2em] flex items-center gap-1.5"
            style={{ background: "rgba(0,255,136,0.12)", color: "var(--mint-green)", border: "1px solid rgba(0,255,136,0.3)" }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--mint-green)" }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "var(--mint-green)" }} />
            </span>
            DEVNET LIVE
          </span>
        </div>
      </div>

      {/* 5-token selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5" style={{ scrollbarWidth: "none" }}>
        {OBSIDIAN_TOKENS.map((t, i) => (
          <TokenPill
            key={t.symbol}
            token={t}
            selected={i === selectedIdx}
            onClick={() => selectByIndex(i)}
          />
        ))}
      </div>

      {/* Token balance */}
      <div
        className="rounded-xl p-4 mb-4"
        style={{ background: token.color + "15", border: `1px solid ${token.color}33` }}
      >
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--muted)" }}>
          Your {token.symbol} Balance
        </p>
        <p className="text-3xl font-bold tabular-nums tracking-tight" style={{ color: token.color }}>
          0.000000
          <span className="ml-2 text-lg font-normal" style={{ color: token.color, opacity: 0.7 }}>
            {token.symbol}
          </span>
        </p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs" style={{ color: "var(--muted)" }}>≈ $0.00 USD</p>
          <p className="text-xs font-mono" style={{ color: "var(--muted)" }}>
            {token.mintAddress.slice(0, 8)}…{token.mintAddress.slice(-4)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex rounded-xl p-1 mb-4"
        style={{ background: "var(--cream)", border: "1px solid var(--border)" }}
      >
        {(["mint", "burn"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setAmount(""); }}
            className="flex-1 rounded-lg py-2 text-sm font-semibold transition-all capitalize"
            style={
              tab === t
                ? { background: token.color, color: "#0c0c0e" }
                : { color: "var(--muted)" }
            }
          >
            {t}
          </button>
        ))}
      </div>

      {/* Swap form */}
      {status === "connected" ? (
        <div className="space-y-3">
          {/* Input */}
          <div className="rounded-xl p-4" style={{ background: "var(--accent)", border: "1px solid var(--border)" }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>
              {tab === "mint" ? "You pay (SOL)" : `You burn (${token.symbol})`}
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number" min="0" step="0.001" placeholder="0.00"
                value={amount} onChange={(e) => setAmount(e.target.value)}
                className="flex-1 bg-transparent text-2xl font-bold outline-none tabular-nums placeholder:opacity-30"
                style={{ color: "var(--foreground)" }}
              />
              <span
                className="text-sm font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: token.color + "20", color: token.color, border: `1px solid ${token.color}44` }}
              >
                {tab === "mint" ? "SOL" : token.symbol}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{ background: token.color + "20", border: `1px solid ${token.color}44` }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2v8M3 7l3 3 3-3" stroke={token.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Output */}
          <div className="rounded-xl p-4" style={{ background: "var(--accent)", border: "1px solid var(--border)" }}>
            <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--muted)" }}>
              {tab === "mint" ? `You receive (${token.symbol})` : "You receive (SOL)"}
            </p>
            <div className="flex items-center gap-3">
              <p
                className="flex-1 text-2xl font-bold tabular-nums"
                style={{ color: tab === "mint" ? token.color : "var(--foreground)", opacity: amount ? 1 : 0.3 }}
              >
                {tab === "mint" ? tokenOut : solOut}
              </p>
              <span
                className="text-sm font-semibold px-3 py-1.5 rounded-lg"
                style={{ background: token.color + "20", color: token.color, border: `1px solid ${token.color}44` }}
              >
                {tab === "mint" ? token.symbol : "SOL"}
              </span>
            </div>
          </div>

          {/* Fee breakdown */}
          {solAmount > 0 && (
            <div
              className="rounded-lg px-3 py-2.5 space-y-1"
              style={{ background: "var(--cream)", border: "1px solid var(--border-low)" }}
            >
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--muted)" }}>Rate</span>
                <span>1 SOL = {(SOL_PRICE_USD / token.priceUsd).toFixed(6)} {token.symbol}</span>
              </div>
              {tab === "mint" && mintFeeDisplay && (
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--muted)" }}>Mint fee (0.25%)</span>
                  <span style={{ color: token.color }}>−{mintFeeDisplay} {token.symbol}</span>
                </div>
              )}
              {tab === "burn" && burnFeeDisplay && (
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--muted)" }}>Redemption fee (0.25%)</span>
                  <span style={{ color: token.color }}>−{burnFeeDisplay} SOL</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span style={{ color: "var(--muted)" }}>Transfer fee</span>
                <span style={{ color: "var(--muted)" }}>0.10% per tx · SPL Token 2022</span>
              </div>
            </div>
          )}

          <button
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full rounded-xl py-3.5 text-sm font-bold tracking-wide transition-all disabled:opacity-40 disabled:pointer-events-none"
            style={{ background: token.color, color: "#0c0c0e" }}
          >
            {tab === "mint" ? `Mint ${token.symbol}` : `Burn ${token.symbol}`}
          </button>
        </div>
      ) : (
        <div
          className="rounded-xl p-4 text-center text-sm"
          style={{ background: token.color + "15", border: `1px solid ${token.color}33`, color: "var(--muted)" }}
        >
          Connect wallet to mint or burn {token.symbol}
        </div>
      )}
    </section>
  );
}
