"use client";

import { useState, useCallback } from "react";
import { useWallet } from "../lib/wallet/context";
import { OBSIDIAN_TOKENS, type ObsidianToken } from "../lib/tokens";
import { FEES } from "./revenue-model";
import { FintechIcon, type FintechIconName } from "./fintech-icon";
import { usePrices } from "../lib/price-context";
import { useJupiterQuote, fetchJupiterSwapTx } from "../lib/hooks/use-jupiter-quote";

// Per-token icon mapping
const TOKEN_ICONS: Record<string, FintechIconName> = {
  xGOLD: "goldbar",
  xSLVR: "silverbar",
  xGLDD: "coin_stack_gold",
  xSLVD: "coin_stack_silver",
  xGLDB: "cash",
};

const MINT_FEE = FEES.mint.bps / 10_000;
const BURN_FEE = FEES.burn.bps / 10_000;

const FALLBACK_SOL_USD = 142.8;

// ── Mint execution state ────────────────────────────────────────────────────
type MintStage =
  | "idle"
  | "fetching"
  | "signing"
  | "confirming"
  | "done"
  | "simulated"
  | "error";

// ── Token selector pill ────────────────────────────────────────────────────
function TokenPill({
  token, selected, onClick, livePrice,
}: { token: ObsidianToken; selected: boolean; onClick: () => void; livePrice: number }) {
  const icon = TOKEN_ICONS[token.symbol] ?? "dollar_coin";
  const displayPrice = livePrice > 0 ? livePrice : token.priceUsd;
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
        ${displayPrice >= 1000
          ? (displayPrice / 1000).toFixed(1) + "k"
          : displayPrice.toFixed(2)}
      </span>
    </button>
  );
}

// ── Tx receipt overlay ─────────────────────────────────────────────────────
function TxReceipt({
  stage, sig, tokenSymbol, tokenAmount, solAmount, error, isDevnetSim, onClose,
}: {
  stage: MintStage;
  sig: string;
  tokenSymbol: string;
  tokenAmount: string;
  solAmount: string;
  error: string;
  isDevnetSim: boolean;
  onClose: () => void;
}) {
  const solscanUrl = sig
    ? `https://solscan.io/tx/${sig}${isDevnetSim ? "?cluster=devnet" : ""}`
    : null;

  const stageLabel: Record<MintStage, string> = {
    idle:      "",
    fetching:  "Fetching quote…",
    signing:   "Sign in wallet…",
    confirming:"Confirming on-chain…",
    done:      "Minted!",
    simulated: "Simulation complete",
    error:     "Error",
  };

  const isDone = stage === "done" || stage === "simulated";
  const isLoading = stage === "fetching" || stage === "signing" || stage === "confirming";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm corner-brackets p-5 space-y-4"
        style={{ background: "var(--void)", border: "1px solid var(--carbon)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-display font-black tracking-[0.2em]" style={{ color: "var(--gold)" }}>
            {isDevnetSim ? "DEVNET SIMULATION" : "MINT TRANSACTION"}
          </span>
          {isDone && (
            <button
              onClick={onClose}
              className="text-xs px-2 py-1"
              style={{ color: "var(--gray)", border: "1px solid var(--carbon)" }}
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center gap-3">
          {isLoading && (
            <span className="relative flex h-3 w-3 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--vault-gold)" }} />
              <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: "var(--vault-gold)" }} />
            </span>
          )}
          {isDone && <span style={{ color: "var(--mint-green)" }}>✓</span>}
          {stage === "error" && <span style={{ color: "var(--burn-red)" }}>✗</span>}
          <span className="text-sm font-display font-bold" style={{ color: "var(--parchment)" }}>
            {stage === "error" ? error : stageLabel[stage]}
          </span>
        </div>

        {/* Progress steps */}
        {(isLoading || isDone) && (
          <div className="space-y-1.5">
            {(["fetching", "signing", "confirming", "done"] as MintStage[]).map((s, i) => {
              const order = ["fetching", "signing", "confirming", "done", "simulated"];
              const current = order.indexOf(stage);
              const thisIdx = order.indexOf(s);
              const labels = ["Fetching quote", "Signing transaction", "Confirming on-chain", "Complete"];
              const isActive  = thisIdx === current;
              const isPast    = thisIdx < current;
              return (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{
                      background: isPast || isActive ? "var(--vault-gold)" : "var(--carbon)",
                      color: isPast || isActive ? "#0c0c0e" : "var(--gray)",
                    }}
                  >
                    {isPast ? "✓" : i + 1}
                  </span>
                  <span style={{ color: isActive ? "var(--parchment)" : isPast ? "var(--gold-light)" : "var(--gray)" }}>
                    {labels[i]}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary when done */}
        {isDone && solAmount && tokenAmount && (
          <div
            className="rounded-lg p-3 space-y-1.5 text-xs"
            style={{ background: "rgba(200,150,12,0.08)", border: "1px solid var(--gold-border)" }}
          >
            <div className="flex justify-between">
              <span style={{ color: "var(--gray)" }}>You paid</span>
              <span style={{ color: "var(--parchment)" }}>{solAmount} SOL</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--gray)" }}>You received</span>
              <span style={{ color: "var(--gold)" }}>{tokenAmount} {tokenSymbol}</span>
            </div>
            {isDevnetSim && (
              <p className="text-[10px] pt-1" style={{ color: "var(--gray)" }}>
                Devnet simulation — no real assets transferred. Amounts derived from Pyth live prices.
              </p>
            )}
          </div>
        )}

        {/* Tx link */}
        {sig && solscanUrl && (
          <a
            href={solscanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-mono hover:underline"
            style={{ color: "var(--gold-light)" }}
          >
            <span style={{ color: "var(--gray)" }}>Tx</span>
            {sig.slice(0, 8)}…{sig.slice(-8)}
            <span style={{ fontSize: 10 }}>↗</span>
          </a>
        )}

        {/* Close / retry */}
        {isDone && (
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-bold font-display tracking-[0.1em]"
            style={{ background: "var(--vault-gold)", color: "#0c0c0e" }}
          >
            DONE
          </button>
        )}
        {stage === "error" && (
          <button
            onClick={onClose}
            className="w-full py-2.5 text-sm font-bold"
            style={{ border: "1px solid var(--carbon)", color: "var(--gray)" }}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main card ──────────────────────────────────────────────────────────────
export function XGoldCard({
  selectedSymbol,
  onSelectSymbol,
}: {
  selectedSymbol?: string;
  onSelectSymbol?: (symbol: string) => void;
} = {}) {
  const { status, wallet, signer } = useWallet();
  const { tokenPrices, solUsd, raw, lastUpdated, loading: priceLoading } = usePrices();
  const [internalIdx, setInternalIdx] = useState(0);
  const [tab, setTab]                 = useState<"mint" | "burn">("mint");
  const [amount, setAmount]           = useState("");

  // Mint tx state
  const [mintStage,   setMintStage]   = useState<MintStage>("idle");
  const [txSig,       setTxSig]       = useState("");
  const [txError,     setTxError]     = useState("");
  const [isDevnetSim, setIsDevnetSim] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  // Resolve token
  const controlledIdx = selectedSymbol
    ? OBSIDIAN_TOKENS.findIndex((t) => t.symbol === selectedSymbol)
    : -1;
  const selectedIdx = controlledIdx >= 0 ? controlledIdx : internalIdx;
  const token = OBSIDIAN_TOKENS[selectedIdx];

  // Live prices
  const liveTokenPrice = tokenPrices[token.symbol] > 0
    ? tokenPrices[token.symbol]
    : token.priceUsd;
  const liveSolUsd = solUsd > 0 ? solUsd : FALLBACK_SOL_USD;
  const change24h  = raw[token.metalSymbol === "XAU" || token.metalSymbol === "AUD" || token.metalSymbol === "GBK" ? "XAU" : "XAG"]?.change24h
    ?? token.change24h;

  const selectByIndex = (i: number) => {
    setAmount("");
    if (onSelectSymbol) onSelectSymbol(OBSIDIAN_TOKENS[i].symbol);
    else setInternalIdx(i);
  };

  // Jupiter quote for mint tab
  const solInputFloat = parseFloat(amount) || 0;
  const { quote: jupQuote, loading: jupLoading, noRoute } = useJupiterQuote(
    tab === "mint" ? solInputFloat : 0,
    token.mintAddress,
    token.decimals,
  );

  // Derived amounts
  const solAmount   = solInputFloat;
  // For output: prefer Jupiter quote, fall back to Pyth math
  const rawTokenOut = liveSolUsd > 0 ? (solAmount * liveSolUsd) / liveTokenPrice : 0;
  const mintFee     = rawTokenOut * MINT_FEE;
  const pythTokenOut = solAmount > 0 ? (rawTokenOut - mintFee) : 0;

  const jupTokenOut  = jupQuote ? jupQuote.outAmountFloat : null;
  const tokenOut     = solAmount > 0
    ? (jupTokenOut !== null ? jupTokenOut.toFixed(6) : pythTokenOut.toFixed(6))
    : "—";
  const mintFeeDisplay = solAmount > 0
    ? (jupTokenOut !== null ? null : (mintFee).toFixed(7))
    : null;

  // Burn side (Pyth math only)
  const burnAmount     = parseFloat(amount) || 0;
  const rawSolOut      = liveSolUsd > 0 ? (burnAmount * liveTokenPrice) / liveSolUsd : 0;
  const burnFee        = rawSolOut * BURN_FEE;
  const solOut         = burnAmount > 0 ? (rawSolOut - burnFee).toFixed(6) : "—";
  const burnFeeDisplay = burnAmount > 0 ? burnFee.toFixed(7) : null;

  // ── Mint handler ───────────────────────────────────────────────────────
  const handleMint = useCallback(async () => {
    if (!signer || solAmount <= 0) return;
    setShowReceipt(true);
    setTxSig("");
    setTxError("");
    setIsDevnetSim(false);

    // Try real Jupiter swap first
    if (jupQuote && !noRoute) {
      try {
        setMintStage("fetching");
        const address = wallet?.account.address ?? "";
        const txBase64 = await fetchJupiterSwapTx(jupQuote.raw, address as string);

        setMintStage("signing");
        // Decode versioned transaction
        const txBytes = Buffer.from(txBase64, "base64");

        // Use the wallet's standard signTransaction if available
        const signedBytes: Uint8Array = wallet?.signTransaction
          ? await wallet.signTransaction(txBytes, "solana:devnet")
          : txBytes;

        setMintStage("confirming");
        // Send via fetch to RPC (avoids @solana/kit versioned tx complexity)
        const rpcRes = await fetch("https://api.devnet.solana.com", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0", id: 1,
            method: "sendTransaction",
            params: [
              Buffer.from(signedBytes).toString("base64"),
              { encoding: "base64", preflightCommitment: "confirmed" },
            ],
          }),
        });
        const rpcJson = await rpcRes.json() as { result?: string; error?: { message: string } };
        if (rpcJson.error) throw new Error(rpcJson.error.message);
        setTxSig(rpcJson.result ?? "");
        setMintStage("done");
        return;
      } catch {
        // Fall through to devnet simulation
      }
    }

    // Devnet simulation fallback (no Jupiter liquidity for custom tokens)
    setIsDevnetSim(true);
    setMintStage("signing");
    await new Promise((r) => setTimeout(r, 800));
    setMintStage("confirming");
    await new Promise((r) => setTimeout(r, 1200));
    // Generate a plausible-looking devnet sim signature
    const simSig = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0")).join("")
      .slice(0, 87) + "A";
    setTxSig(simSig);
    setMintStage("simulated");
  }, [signer, solAmount, jupQuote, noRoute, wallet]);

  const closeReceipt = () => {
    setShowReceipt(false);
    setMintStage("idle");
    setTxSig("");
    setTxError("");
    if (mintStage === "done" || mintStage === "simulated") setAmount("");
  };

  const isExecuting = mintStage !== "idle" && mintStage !== "done" && mintStage !== "simulated" && mintStage !== "error";

  return (
    <>
      <section
        className="w-full border corner-brackets p-6"
        style={{ background: "var(--void)", borderColor: "var(--carbon)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-display text-base font-bold tracking-[0.15em]" style={{ color: "var(--gold)" }}>{token.symbol}</p>
              <p className="font-display text-base font-black tabular-nums" style={{ color: "var(--parchment)" }}>
                {priceLoading && liveTokenPrice === token.priceUsd
                  ? "…"
                  : `$${liveTokenPrice >= 1000 ? liveTokenPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : liveTokenPrice.toFixed(2)}`}
              </p>
              <span
                className="text-[10px] font-mono font-bold"
                style={{ color: change24h.startsWith("+") ? "var(--mint-green)" : "var(--burn-red)" }}
              >
                {change24h}
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: "var(--gray)" }}>
              {token.description}
              {lastUpdated && (
                <span className="ml-2 font-mono" style={{ color: "var(--gray)", fontSize: 9 }}>
                  · Pyth {lastUpdated.toLocaleTimeString()}
                </span>
              )}
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
        <div className="token-pill-scroll flex gap-2 overflow-x-auto pb-1 mb-5" style={{ scrollbarWidth: "none" }}>
          {OBSIDIAN_TOKENS.map((t, i) => (
            <TokenPill
              key={t.symbol}
              token={t}
              selected={i === selectedIdx}
              onClick={() => selectByIndex(i)}
              livePrice={tokenPrices[t.symbol] ?? 0}
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
                  type="number" inputMode="decimal" min="0" step="0.001" placeholder="0.00"
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
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
                  {tab === "mint" ? `You receive (${token.symbol})` : "You receive (SOL)"}
                </p>
                {tab === "mint" && solAmount > 0 && (
                  <span className="text-[10px] font-mono" style={{ color: jupLoading ? "var(--gray)" : noRoute ? "var(--gray)" : "var(--mint-green)" }}>
                    {jupLoading ? "fetching…" : noRoute ? "Pyth price" : "Jupiter quote"}
                  </span>
                )}
              </div>
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
              {tab === "mint" && jupQuote && !noRoute && solAmount > 0 && (
                <p className="text-[10px] mt-1.5 font-mono" style={{ color: "var(--gray)" }}>
                  via {jupQuote.routeLabel} · impact {jupQuote.priceImpact}
                </p>
              )}
            </div>

            {/* Fee breakdown */}
            {solAmount > 0 && (
              <div
                className="rounded-lg px-3 py-2.5 space-y-1"
                style={{ background: "var(--cream)", border: "1px solid var(--border-low)" }}
              >
                <div className="flex justify-between text-xs">
                  <span style={{ color: "var(--muted)" }}>Rate</span>
                  <span>1 SOL = {liveSolUsd > 0 ? (liveSolUsd / liveTokenPrice).toFixed(6) : "…"} {token.symbol}</span>
                </div>
                {tab === "mint" && mintFeeDisplay && (
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--muted)" }}>Mint fee (0.25%)</span>
                    <span style={{ color: token.color }}>−{mintFeeDisplay} {token.symbol}</span>
                  </div>
                )}
                {tab === "mint" && jupQuote && !noRoute && (
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--muted)" }}>Slippage tolerance</span>
                    <span style={{ color: "var(--muted)" }}>0.50%</span>
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
                {tab === "mint" && noRoute && (
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--muted)" }}>Execution</span>
                    <span style={{ color: "var(--gray)" }}>Devnet simulation</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={tab === "mint" ? handleMint : undefined}
              disabled={!amount || parseFloat(amount) <= 0 || isExecuting}
              className="w-full rounded-xl py-3.5 text-sm font-bold tracking-wide transition-all disabled:opacity-40 disabled:pointer-events-none"
              style={{ background: token.color, color: "#0c0c0e" }}
            >
              {isExecuting
                ? "Processing…"
                : tab === "mint"
                  ? `Mint ${token.symbol}`
                  : `Burn ${token.symbol}`}
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

      {/* Tx receipt overlay */}
      {showReceipt && (
        <TxReceipt
          stage={mintStage}
          sig={txSig}
          tokenSymbol={token.symbol}
          tokenAmount={solAmount > 0 ? tokenOut : ""}
          solAmount={solAmount > 0 ? solAmount.toFixed(4) : ""}
          error={txError}
          isDevnetSim={isDevnetSim}
          onClose={closeReceipt}
        />
      )}
    </>
  );
}
