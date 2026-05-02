"use client";

import { useState, useCallback } from "react";
import { useWallet } from "../lib/wallet/context";
import { OBSIDIAN_TOKENS, type ObsidianToken } from "../lib/tokens";
import { FEES } from "./revenue-model";
import { FintechIcon, type FintechIconName } from "./fintech-icon";
import { usePrices } from "../lib/price-context";
import { useJupiterQuote, fetchJupiterSwapTx } from "../lib/hooks/use-jupiter-quote";
import type { RedemptionRecord } from "../api/redemptions/route";

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

// ── Stage types ─────────────────────────────────────────────────────────────
type MintStage =
  | "idle"
  | "fetching"
  | "signing"
  | "confirming"
  | "done"
  | "simulated"
  | "error";

type BurnStage =
  | "idle"
  | "form"        // collecting shipping info
  | "burning"     // SPL burn tx in progress
  | "burned"      // burn confirmed
  | "filing"      // posting to /api/redemptions
  | "done"        // redemption ID received
  | "error";

// ── Shipping form state ──────────────────────────────────────────────────────
interface ShippingForm {
  name:    string;
  email:   string;
  street:  string;
  city:    string;
  state:   string;
  zip:     string;
  country: string;
}

const EMPTY_SHIPPING: ShippingForm = {
  name: "", email: "", street: "", city: "", state: "", zip: "", country: "US",
};

// ── Token selector pill ──────────────────────────────────────────────────────
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
        background:   selected ? "rgba(200,150,12,0.12)" : "var(--void)",
        border:       `1px solid ${selected ? "var(--vault-gold)" : "var(--carbon)"}`,
        outline:      "none",
        minWidth:     "80px",
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

// ── Mint tx receipt overlay ──────────────────────────────────────────────────
function MintReceipt({
  stage, sig, tokenSymbol, tokenAmount, solAmount, error, isDevnetSim, onClose,
}: {
  stage:       MintStage;
  sig:         string;
  tokenSymbol: string;
  tokenAmount: string;
  solAmount:   string;
  error:       string;
  isDevnetSim: boolean;
  onClose:     () => void;
}) {
  const solscanUrl = sig
    ? `https://solscan.io/tx/${sig}${isDevnetSim ? "?cluster=devnet" : ""}`
    : null;

  const stageLabel: Record<MintStage, string> = {
    idle:       "",
    fetching:   "Fetching quote…",
    signing:    "Sign in wallet…",
    confirming: "Confirming on-chain…",
    done:       "Minted!",
    simulated:  "Simulation complete",
    error:      "Error",
  };

  const isDone    = stage === "done" || stage === "simulated";
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
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-display font-black tracking-[0.2em]" style={{ color: "var(--gold)" }}>
            {isDevnetSim ? "DEVNET SIMULATION" : "MINT TRANSACTION"}
          </span>
          {isDone && (
            <button onClick={onClose} className="text-xs px-2 py-1" style={{ color: "var(--gray)", border: "1px solid var(--carbon)" }} aria-label="Close">✕</button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isLoading && (
            <span className="relative flex h-3 w-3 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--vault-gold)" }} />
              <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: "var(--vault-gold)" }} />
            </span>
          )}
          {isDone   && <span style={{ color: "var(--mint-green)" }}>✓</span>}
          {stage === "error" && <span style={{ color: "var(--burn-red)" }}>✗</span>}
          <span className="text-sm font-display font-bold" style={{ color: "var(--parchment)" }}>
            {stage === "error" ? error : stageLabel[stage]}
          </span>
        </div>

        {(isLoading || isDone) && (
          <div className="space-y-1.5">
            {(["fetching", "signing", "confirming", "done"] as MintStage[]).map((s, i) => {
              const order   = ["fetching", "signing", "confirming", "done", "simulated"];
              const current = order.indexOf(stage);
              const idx     = order.indexOf(s);
              const isPast  = idx < current;
              const isAct   = idx === current;
              const labels  = ["Fetching quote", "Signing transaction", "Confirming on-chain", "Complete"];
              return (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: isPast || isAct ? "var(--vault-gold)" : "var(--carbon)", color: isPast || isAct ? "#0c0c0e" : "var(--gray)" }}>
                    {isPast ? "✓" : i + 1}
                  </span>
                  <span style={{ color: isAct ? "var(--parchment)" : isPast ? "var(--gold-light)" : "var(--gray)" }}>{labels[i]}</span>
                </div>
              );
            })}
          </div>
        )}

        {isDone && solAmount && tokenAmount && (
          <div className="rounded-lg p-3 space-y-1.5 text-xs" style={{ background: "rgba(200,150,12,0.08)", border: "1px solid var(--gold-border)" }}>
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

        {sig && solscanUrl && (
          <a href={solscanUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-mono hover:underline" style={{ color: "var(--gold-light)" }}>
            <span style={{ color: "var(--gray)" }}>Tx</span>
            {sig.slice(0, 8)}…{sig.slice(-8)}
            <span style={{ fontSize: 10 }}>↗</span>
          </a>
        )}

        {isDone && (
          <button onClick={onClose} className="w-full py-2.5 text-sm font-bold font-display tracking-[0.1em]"
            style={{ background: "var(--vault-gold)", color: "#0c0c0e" }}>
            DONE
          </button>
        )}
        {stage === "error" && (
          <button onClick={onClose} className="w-full py-2.5 text-sm font-bold"
            style={{ border: "1px solid var(--carbon)", color: "var(--gray)" }}>
            Close
          </button>
        )}
      </div>
    </div>
  );
}

// ── Burn / redemption overlay ────────────────────────────────────────────────
function BurnRedemptionFlow({
  token,
  burnAmount,
  solOut,
  usdValue,
  wallet,
  onClose,
}: {
  token:      ObsidianToken;
  burnAmount: number;
  solOut:     string;
  usdValue:   number;
  wallet:     string;
  onClose:    () => void;
}) {
  const [stage,    setStage]    = useState<BurnStage>("form");
  const [shipping, setShipping] = useState<ShippingForm>(EMPTY_SHIPPING);
  const [errors,   setErrors]   = useState<Partial<ShippingForm>>({});
  const [burnSig,  setBurnSig]  = useState("");
  const [rdmId,    setRdmId]    = useState("");
  const [errMsg,   setErrMsg]   = useState("");

  const validate = (): boolean => {
    const e: Partial<ShippingForm> = {};
    if (!shipping.name.trim())   e.name   = "Required";
    if (!shipping.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) e.email = "Valid email required";
    if (!shipping.street.trim()) e.street = "Required";
    if (!shipping.city.trim())   e.city   = "Required";
    if (!shipping.state.trim())  e.state  = "Required";
    if (!shipping.zip.trim())    e.zip    = "Required";
    if (!shipping.country.trim()) e.country = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    // ── Step 1: Simulate SPL burn (devnet sim) ──
    setStage("burning");
    await new Promise((r) => setTimeout(r, 900));

    const simSig = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 87) + "B";
    setBurnSig(simSig);
    setStage("burned");
    await new Promise((r) => setTimeout(r, 600));

    // ── Step 2: File redemption ──
    setStage("filing");
    try {
      const payload: Omit<RedemptionRecord, "id" | "createdAt" | "status"> = {
        token:       token.symbol,
        amount:      burnAmount,
        usdValue:    usdValue,
        burnTxSig:   simSig,
        isDevnetSim: true,
        wallet:      wallet.slice(0, 8) + "…" + wallet.slice(-4),
        shipping,
      };
      const res  = await fetch("/api/redemptions", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      const data = await res.json() as { ok: boolean; id: string; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "API error");
      setRdmId(data.id);
      setStage("done");
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Failed to file redemption");
      setStage("error");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipping, token, burnAmount, usdValue, wallet]);

  const field = (
    key: keyof ShippingForm,
    label: string,
    type = "text",
    placeholder = "",
    half = false,
  ) => (
    <div className={half ? "flex-1 min-w-[120px]" : "w-full"}>
      <label className="block text-[10px] font-display tracking-[0.12em] mb-1" style={{ color: "var(--gray)" }}>
        {label}
      </label>
      <input
        type={type}
        autoComplete={key === "email" ? "email" : key === "zip" ? "postal-code" : key === "name" ? "name" : "off"}
        placeholder={placeholder}
        value={shipping[key]}
        onChange={(e) => { setShipping((s) => ({ ...s, [key]: e.target.value })); setErrors((er) => ({ ...er, [key]: undefined })); }}
        className="w-full bg-transparent text-sm outline-none px-3 py-2"
        style={{
          border:    `1px solid ${errors[key] ? "var(--burn-red)" : "var(--carbon)"}`,
          color:     "var(--parchment)",
          minHeight: "40px",
        }}
      />
      {errors[key] && <p className="text-[10px] mt-0.5" style={{ color: "var(--burn-red)" }}>{errors[key]}</p>}
    </div>
  );

  const isProcessing = stage === "burning" || stage === "burned" || stage === "filing";

  // Stage labels for progress steps
  const stageOrder: BurnStage[] = ["burning", "burned", "filing", "done"];
  const stageLabels = ["Burning tokens", "Burn confirmed", "Filing redemption", "Redemption filed"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget && !isProcessing) onClose(); }}
    >
      <div
        className="w-full max-w-md corner-brackets overflow-y-auto"
        style={{ background: "var(--void)", border: "1px solid var(--carbon)", maxHeight: "90dvh" }}
      >
        {/* ── Header ─── */}
        <div className="flex items-center justify-between p-5 pb-3" style={{ borderBottom: "1px solid var(--carbon)" }}>
          <div>
            <p className="text-[10px] font-display font-black tracking-[0.2em]" style={{ color: "var(--gold)" }}>
              PHYSICAL REDEMPTION
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--gray)" }}>
              {burnAmount.toFixed(6)} {token.symbol} → AGX vault delivery
            </p>
          </div>
          {!isProcessing && (
            <button onClick={onClose} className="text-xs px-2 py-1 flex-shrink-0"
              style={{ color: "var(--gray)", border: "1px solid var(--carbon)" }} aria-label="Close">✕</button>
          )}
        </div>

        <div className="p-5 space-y-5">

          {/* ── Summary strip ─── */}
          <div className="flex gap-3 text-xs" style={{ borderBottom: "1px solid var(--carbon)", paddingBottom: "1rem" }}>
            <div className="flex-1">
              <p style={{ color: "var(--gray)" }}>Burning</p>
              <p className="font-bold tabular-nums" style={{ color: "var(--burn-red)" }}>
                {burnAmount.toFixed(6)} {token.symbol}
              </p>
            </div>
            <div className="flex-1">
              <p style={{ color: "var(--gray)" }}>≈ USD value</p>
              <p className="font-bold tabular-nums" style={{ color: "var(--parchment)" }}>
                ${usdValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex-1">
              <p style={{ color: "var(--gray)" }}>SOL returned</p>
              <p className="font-bold tabular-nums" style={{ color: "var(--gold)" }}>{solOut} SOL</p>
            </div>
          </div>

          {/* ── Shipping form ─── */}
          {(stage === "form") && (
            <div className="space-y-3">
              <p className="text-[10px] font-display tracking-[0.15em]" style={{ color: "var(--gold)" }}>
                DELIVERY ADDRESS
              </p>
              {field("name",    "Full name",       "text",  "Jane Smith")}
              {field("email",   "Email",           "email", "jane@example.com")}
              {field("street",  "Street address",  "text",  "123 Vault St")}
              <div className="flex gap-2 flex-wrap">
                {field("city",    "City",          "text",  "Salt Lake City",  true)}
                {field("state",   "State / Region","text",  "UT",              true)}
              </div>
              <div className="flex gap-2 flex-wrap">
                {field("zip",     "ZIP / Postal",  "text",  "84101",           true)}
                {field("country", "Country",       "text",  "US",              true)}
              </div>

              <p className="text-[10px]" style={{ color: "var(--gray)" }}>
                AGX vault team will contact you within 3–5 business days to confirm delivery logistics.
                Devnet simulation — no real tokens burned.
              </p>

              <button
                onClick={() => void handleSubmit()}
                className="w-full py-3.5 text-sm font-bold font-display tracking-[0.1em]"
                style={{ background: "var(--burn-red)", color: "#fff" }}
              >
                BURN + FILE REDEMPTION
              </button>
            </div>
          )}

          {/* ── Progress (burning → done) ─── */}
          {(isProcessing || stage === "done" || stage === "error") && (
            <div className="space-y-4">
              <div className="space-y-2">
                {stageOrder.map((s, i) => {
                  const current = stageOrder.indexOf(stage as BurnStage);
                  const isPast  = i < current;
                  const isAct   = i === current;
                  return (
                    <div key={s} className="flex items-center gap-3 text-xs">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ background: isPast ? "var(--mint-green)" : isAct ? "var(--vault-gold)" : "var(--carbon)", color: (isPast || isAct) ? "#0c0c0e" : "var(--gray)" }}>
                        {isPast ? "✓" : isAct ? (
                          <span className="animate-ping inline-flex rounded-full h-2 w-2" style={{ background: "#0c0c0e" }} />
                        ) : i + 1}
                      </span>
                      <span style={{ color: isAct ? "var(--parchment)" : isPast ? "var(--mint-green)" : "var(--gray)" }}>
                        {stageLabels[i]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Burn tx sig */}
              {burnSig && (
                <a
                  href={`https://solscan.io/tx/${burnSig}?cluster=devnet`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-mono hover:underline"
                  style={{ color: "var(--gold-light)" }}
                >
                  <span style={{ color: "var(--gray)" }}>Burn tx</span>
                  {burnSig.slice(0, 8)}…{burnSig.slice(-8)}
                  <span style={{ fontSize: 10 }}>↗</span>
                </a>
              )}

              {/* Redemption ID */}
              {stage === "done" && rdmId && (
                <div className="rounded-lg p-4 space-y-3" style={{ background: "rgba(200,150,12,0.08)", border: "1px solid var(--gold-border)" }}>
                  <div>
                    <p className="text-[10px] font-display tracking-[0.15em] mb-1" style={{ color: "var(--gray)" }}>REDEMPTION ID</p>
                    <p className="text-2xl font-black font-display tracking-[0.2em]" style={{ color: "var(--gold)" }}>{rdmId}</p>
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span style={{ color: "var(--gray)" }}>Token</span>
                      <span style={{ color: "var(--parchment)" }}>{burnAmount.toFixed(6)} {token.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--gray)" }}>Ship to</span>
                      <span style={{ color: "var(--parchment)" }}>{shipping.city}, {shipping.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: "var(--gray)" }}>Status</span>
                      <span style={{ color: "var(--mint-green)" }}>PENDING</span>
                    </div>
                  </div>
                  <p className="text-[10px]" style={{ color: "var(--gray)" }}>
                    Save your redemption ID. AGX vault team will email {shipping.email.replace(/(.{2}).*@/, "$1***@")} within 3–5 business days.
                  </p>
                </div>
              )}

              {/* Error */}
              {stage === "error" && (
                <p className="text-sm" style={{ color: "var(--burn-red)" }}>{errMsg}</p>
              )}

              {(stage === "done" || stage === "error") && (
                <button onClick={onClose} className="w-full py-2.5 text-sm font-bold font-display tracking-[0.1em]"
                  style={{ background: stage === "done" ? "var(--vault-gold)" : "var(--carbon)", color: stage === "done" ? "#0c0c0e" : "var(--gray)" }}>
                  {stage === "done" ? "DONE" : "CLOSE"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main card ────────────────────────────────────────────────────────────────
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
  const [showMintReceipt, setShowMintReceipt] = useState(false);

  // Burn flow state
  const [showBurnFlow, setShowBurnFlow] = useState(false);

  // Resolve token
  const controlledIdx = selectedSymbol
    ? OBSIDIAN_TOKENS.findIndex((t) => t.symbol === selectedSymbol)
    : -1;
  const selectedIdx = controlledIdx >= 0 ? controlledIdx : internalIdx;
  const token = OBSIDIAN_TOKENS[selectedIdx];

  // Live prices
  const liveTokenPrice = tokenPrices[token.symbol] > 0 ? tokenPrices[token.symbol] : token.priceUsd;
  const liveSolUsd     = solUsd > 0 ? solUsd : FALLBACK_SOL_USD;
  const change24h      = raw[token.metalSymbol === "XAU" || token.metalSymbol === "AUD" || token.metalSymbol === "GBK" ? "XAU" : "XAG"]?.change24h
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

  // Mint math
  const rawTokenOut  = liveSolUsd > 0 ? (solInputFloat * liveSolUsd) / liveTokenPrice : 0;
  const mintFee      = rawTokenOut * MINT_FEE;
  const pythTokenOut = solInputFloat > 0 ? (rawTokenOut - mintFee) : 0;
  const jupTokenOut  = jupQuote ? jupQuote.outAmountFloat : null;
  const tokenOut     = solInputFloat > 0
    ? (jupTokenOut !== null ? jupTokenOut.toFixed(6) : pythTokenOut.toFixed(6))
    : "—";
  const mintFeeDisplay = solInputFloat > 0 && jupTokenOut === null ? mintFee.toFixed(7) : null;

  // Burn math
  const burnAmountFloat = parseFloat(amount) || 0;
  const rawSolOut       = liveSolUsd > 0 ? (burnAmountFloat * liveTokenPrice) / liveSolUsd : 0;
  const burnFee         = rawSolOut * BURN_FEE;
  const solOut          = burnAmountFloat > 0 ? (rawSolOut - burnFee).toFixed(6) : "—";
  const burnFeeDisplay  = burnAmountFloat > 0 ? burnFee.toFixed(7) : null;
  const burnUsdValue    = burnAmountFloat * liveTokenPrice;

  // ── Mint handler ─────────────────────────────────────────────────────────
  const handleMint = useCallback(async () => {
    if (!signer || solInputFloat <= 0) return;
    setShowMintReceipt(true);
    setTxSig(""); setTxError(""); setIsDevnetSim(false);

    if (jupQuote && !noRoute) {
      try {
        setMintStage("fetching");
        const address  = wallet?.account.address ?? "";
        const txBase64 = await fetchJupiterSwapTx(jupQuote.raw, address as string);
        setMintStage("signing");
        const txBytes    = Buffer.from(txBase64, "base64");
        const signedBytes: Uint8Array = wallet?.signTransaction
          ? await wallet.signTransaction(txBytes, "solana:devnet")
          : txBytes;
        setMintStage("confirming");
        const rpcRes = await fetch("https://api.devnet.solana.com", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0", id: 1,
            method: "sendTransaction",
            params: [Buffer.from(signedBytes).toString("base64"), { encoding: "base64", preflightCommitment: "confirmed" }],
          }),
        });
        const rpcJson = await rpcRes.json() as { result?: string; error?: { message: string } };
        if (rpcJson.error) throw new Error(rpcJson.error.message);
        setTxSig(rpcJson.result ?? "");
        setMintStage("done");
        return;
      } catch { /* fall through to sim */ }
    }

    // Devnet simulation fallback
    setIsDevnetSim(true);
    setMintStage("signing");
    await new Promise((r) => setTimeout(r, 800));
    setMintStage("confirming");
    await new Promise((r) => setTimeout(r, 1200));
    const simSig = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 87) + "A";
    setTxSig(simSig);
    setMintStage("simulated");
  }, [signer, solInputFloat, jupQuote, noRoute, wallet]);

  const closeMintReceipt = () => {
    setShowMintReceipt(false);
    setMintStage("idle");
    setTxSig(""); setTxError("");
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
              <span className="text-[10px] font-mono font-bold"
                style={{ color: change24h.startsWith("+") ? "var(--mint-green)" : "var(--burn-red)" }}>
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
          <span className="px-2.5 py-1 text-[10px] font-display font-black tracking-[0.2em] flex items-center gap-1.5"
            style={{ background: "rgba(0,255,136,0.12)", color: "var(--mint-green)", border: "1px solid rgba(0,255,136,0.3)" }}>
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--mint-green)" }} />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "var(--mint-green)" }} />
            </span>
            DEVNET LIVE
          </span>
        </div>

        {/* 5-token selector */}
        <div className="token-pill-scroll flex gap-2 overflow-x-auto pb-1 mb-5" style={{ scrollbarWidth: "none" }}>
          {OBSIDIAN_TOKENS.map((t, i) => (
            <TokenPill key={t.symbol} token={t} selected={i === selectedIdx}
              onClick={() => selectByIndex(i)} livePrice={tokenPrices[t.symbol] ?? 0} />
          ))}
        </div>

        {/* Token balance */}
        <div className="rounded-xl p-4 mb-4" style={{ background: token.color + "15", border: `1px solid ${token.color}33` }}>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--muted)" }}>Your {token.symbol} Balance</p>
          <p className="text-3xl font-bold tabular-nums tracking-tight" style={{ color: token.color }}>
            0.000000
            <span className="ml-2 text-lg font-normal" style={{ color: token.color, opacity: 0.7 }}>{token.symbol}</span>
          </p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs" style={{ color: "var(--muted)" }}>≈ $0.00 USD</p>
            <p className="text-xs font-mono" style={{ color: "var(--muted)" }}>
              {token.mintAddress.slice(0, 8)}…{token.mintAddress.slice(-4)}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl p-1 mb-4" style={{ background: "var(--cream)", border: "1px solid var(--border)" }}>
          {(["mint", "burn"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setAmount(""); }}
              className="flex-1 rounded-lg py-2 text-sm font-semibold transition-all capitalize"
              style={tab === t ? { background: token.color, color: "#0c0c0e" } : { color: "var(--muted)" }}>
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
                <span className="text-sm font-semibold px-3 py-1.5 rounded-lg"
                  style={{ background: token.color + "20", color: token.color, border: `1px solid ${token.color}44` }}>
                  {tab === "mint" ? "SOL" : token.symbol}
                </span>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{ background: token.color + "20", border: `1px solid ${token.color}44` }}>
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
                {tab === "mint" && solInputFloat > 0 && (
                  <span className="text-[10px] font-mono"
                    style={{ color: jupLoading ? "var(--gray)" : noRoute ? "var(--gray)" : "var(--mint-green)" }}>
                    {jupLoading ? "fetching…" : noRoute ? "Pyth price" : "Jupiter quote"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <p className="flex-1 text-2xl font-bold tabular-nums"
                  style={{ color: tab === "mint" ? token.color : "var(--foreground)", opacity: amount ? 1 : 0.3 }}>
                  {tab === "mint" ? tokenOut : solOut}
                </p>
                <span className="text-sm font-semibold px-3 py-1.5 rounded-lg"
                  style={{ background: token.color + "20", color: token.color, border: `1px solid ${token.color}44` }}>
                  {tab === "mint" ? token.symbol : "SOL"}
                </span>
              </div>
              {tab === "mint" && jupQuote && !noRoute && solInputFloat > 0 && (
                <p className="text-[10px] mt-1.5 font-mono" style={{ color: "var(--gray)" }}>
                  via {jupQuote.routeLabel} · impact {jupQuote.priceImpact}
                </p>
              )}
            </div>

            {/* Fee breakdown */}
            {(solInputFloat > 0 || burnAmountFloat > 0) && (
              <div className="rounded-lg px-3 py-2.5 space-y-1" style={{ background: "var(--cream)", border: "1px solid var(--border-low)" }}>
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
                {tab === "burn" && burnAmountFloat > 0 && (
                  <div className="flex justify-between text-xs">
                    <span style={{ color: "var(--muted)" }}>Delivery</span>
                    <span style={{ color: "var(--gray)" }}>Physical · AGX vault</span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={tab === "mint" ? () => void handleMint() : () => setShowBurnFlow(true)}
              disabled={!amount || parseFloat(amount) <= 0 || isExecuting}
              className="w-full rounded-xl py-3.5 text-sm font-bold tracking-wide transition-all disabled:opacity-40 disabled:pointer-events-none"
              style={{ background: tab === "burn" ? "var(--burn-red)" : token.color, color: tab === "burn" ? "#fff" : "#0c0c0e" }}
            >
              {isExecuting
                ? "Processing…"
                : tab === "mint"
                  ? `Mint ${token.symbol}`
                  : `Burn + Redeem ${token.symbol}`}
            </button>

            {tab === "burn" && (
              <p className="text-[10px] text-center" style={{ color: "var(--gray)" }}>
                Physical delivery via AGX vault · shipping address required
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-xl p-4 text-center text-sm"
            style={{ background: token.color + "15", border: `1px solid ${token.color}33`, color: "var(--muted)" }}>
            Connect wallet to mint or burn {token.symbol}
          </div>
        )}
      </section>

      {/* Mint receipt overlay */}
      {showMintReceipt && (
        <MintReceipt
          stage={mintStage}
          sig={txSig}
          tokenSymbol={token.symbol}
          tokenAmount={solInputFloat > 0 ? tokenOut : ""}
          solAmount={solInputFloat > 0 ? solInputFloat.toFixed(4) : ""}
          error={txError}
          isDevnetSim={isDevnetSim}
          onClose={closeMintReceipt}
        />
      )}

      {/* Burn / redemption flow */}
      {showBurnFlow && (
        <BurnRedemptionFlow
          token={token}
          burnAmount={burnAmountFloat}
          solOut={solOut}
          usdValue={burnUsdValue}
          wallet={wallet?.account.address as string ?? ""}
          onClose={() => { setShowBurnFlow(false); if (solOut !== "—") setAmount(""); }}
        />
      )}
    </>
  );
}
