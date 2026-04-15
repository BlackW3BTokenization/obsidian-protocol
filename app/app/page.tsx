"use client";

import { useState } from "react";
import { lamports as sol } from "@solana/kit";
import { toast } from "sonner";
import { useWallet } from "./lib/wallet/context";
import { useBalance } from "./lib/hooks/use-balance";
import { lamportsToSolString } from "./lib/lamports";
import { useSolanaClient } from "./lib/solana-client-context";
import { ellipsify } from "./lib/explorer";
import { XGoldCard } from "./components/xgold-card";
import { ReserveCard } from "./components/reserve-card";
import { VaultCard } from "./components/vault-card";
import { ProtocolStats } from "./components/protocol-stats";
import { RevenueModel } from "./components/revenue-model";
import { X402Gateway } from "./components/x402-gateway";
import { ClusterSelect } from "./components/cluster-select";
import { WalletButton } from "./components/wallet-button";
import { useCluster } from "./components/cluster-context";

const MOCK_GOLD_PRICE = 3178.5;

function ObsidianLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" stroke="var(--gold)" strokeWidth="1.5" fill="var(--gold-muted)" />
      <polygon points="14,6 22,10 22,18 14,22 6,18 6,10" stroke="var(--gold)" strokeWidth="0.75" fill="rgba(201,168,76,0.08)" />
      <circle cx="14" cy="14" r="3" fill="var(--gold)" opacity="0.9" />
    </svg>
  );
}

export default function Home() {
  const { wallet, status } = useWallet();
  const { cluster, getExplorerUrl } = useCluster();
  const client = useSolanaClient();

  const address = wallet?.account.address;
  const balance = useBalance(address);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAirdrop = async () => {
    if (!address) return;
    try {
      toast.info("Requesting airdrop...");
      const sig = await client.airdrop(address, sol(1_000_000_000n));
      toast.success("Airdrop received!", {
        description: sig ? (
          <a href={getExplorerUrl(`/tx/${sig}`)} target="_blank" rel="noopener noreferrer" className="underline">
            View transaction
          </a>
        ) : undefined,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isRateLimited = msg.includes("429") || msg.includes("Internal JSON-RPC error");
      toast.error(
        isRateLimited ? "Devnet faucet rate-limited." : "Airdrop failed.",
        isRateLimited
          ? { description: <a href="https://faucet.solana.com/" target="_blank" rel="noopener noreferrer" className="underline">faucet.solana.com</a> }
          : undefined
      );
    }
  };

  return (
    <div className="relative min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      {/* Obsidian background pattern */}
      <div
        className="pointer-events-none fixed inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(201,168,76,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(201,168,76,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />
      {/* Gold radial glow top */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-96"
        aria-hidden="true"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% -10%, rgba(201,168,76,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <ObsidianLogo />
            <div className="font-display leading-none">
              <div className="text-lg font-black tracking-[0.25em]" style={{ color: "var(--gold)", textShadow: "0 0 30px var(--gold-glow)" }}>
                BLKW3B
              </div>
              <div className="text-[9px] font-bold tracking-[0.3em] mt-1" style={{ color: "var(--gray)" }}>
                OBSIDIAN PROTOCOL
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Live gold price */}
            <div className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium" style={{ background: "var(--gold-muted)", border: "1px solid var(--gold-border)", color: "var(--gold)" }}>
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--gold)" }} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "var(--gold)" }} />
              </span>
              XAU ${MOCK_GOLD_PRICE.toLocaleString()}/oz
            </div>
            <ClusterSelect />
            <WalletButton />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6">
          {/* Hero */}
          <section className="pt-8 pb-16 md:pt-12 md:pb-24">
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="relative">
                <span className="kanji-watermark text-[140px] -top-4 -left-2" aria-hidden="true">黒金庫</span>
                <p className="text-[10px] uppercase tracking-[0.4em] mb-5 font-display font-bold flex items-center gap-3 relative" style={{ color: "var(--gold)" }}>
                  <span>TOKENIZED PRECIOUS METALS</span>
                  <span className="px-2.5 py-0.5 text-[9px] font-black tracking-[0.2em]" style={{ background: "rgba(0,255,136,0.1)", color: "var(--mint-green)", border: "1px solid rgba(0,255,136,0.35)" }}>
                    5 TOKENS LIVE · PHASE 2
                  </span>
                </p>
                <h1 className="font-display font-black tracking-[0.02em] relative" style={{ color: "var(--foreground)" }}>
                  <span className="block text-5xl md:text-6xl leading-[0.9]">OBSIDIAN</span>
                  <span
                    className="block text-6xl md:text-7xl leading-[0.9] mt-1"
                    style={{
                      background: "linear-gradient(135deg, var(--vault-gold) 0%, var(--gold-light) 50%, var(--vault-gold) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      textShadow: "0 0 60px var(--gold-glow)",
                    }}
                  >
                    PROTOCOL
                  </span>
                </h1>
              </div>

              <div className="flex max-w-lg flex-col gap-4">
                <p className="text-base leading-relaxed" style={{ color: "var(--parchment)" }}>
                  Buy, hold, send, spend, or burn to redeem physical precious metals.
                  xGOLD, xSLVR, xGLDD, xSLVD, xGLDB — every token backed 1:1 by insured
                  AGX vault metal. ZK-attested daily. Settled in 400ms on Solana.
                </p>
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: "SPL Token 2022", href: "https://spl.solana.com/token-2022" },
                    { label: "Light Protocol", href: "https://lightprotocol.com" },
                    { label: "AGX Reserve", href: "https://agxlive.com" },
                  ].map(({ label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
                      style={{ color: "var(--gold)" }}
                    >
                      {label}
                      <span aria-hidden="true">↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Content */}
          <div className="space-y-6 pb-24">
            {/* Wallet Balance */}
            {status === "connected" && address && (
              <section
                className="relative w-full overflow-hidden border corner-brackets px-5 py-5"
                style={{ borderColor: "var(--carbon)", background: "var(--void)" }}
              >
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="hex-clip flex h-8 w-8 items-center justify-center"
                      style={{ background: "linear-gradient(135deg, var(--vault-gold), #8B6914)" }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="var(--obsidian)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                        <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                      </svg>
                    </div>
                    <span className="font-display text-sm font-bold tracking-[0.15em]" style={{ color: "var(--gold)" }}>WALLET BALANCE</span>
                    <button
                      onClick={handleCopy}
                      className="flex cursor-pointer items-center gap-1.5 font-mono text-xs transition hover:opacity-80"
                      style={{ color: "var(--muted)" }}
                    >
                      {ellipsify(address, 4)}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                        {copied ? (
                          <path d="M20 6 9 17l-5-5" />
                        ) : (
                          <>
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                  {cluster !== "mainnet" && (
                    <button
                      onClick={handleAirdrop}
                      className="font-display cursor-pointer border px-3 py-1.5 text-[10px] font-black tracking-[0.2em] transition hover:opacity-80"
                      style={{ borderColor: "var(--gold-border)", color: "var(--gold)", background: "rgba(200,150,12,0.08)" }}
                    >
                      AIRDROP
                    </button>
                  )}
                </div>
                <p className="relative mt-4 font-display text-4xl font-black tabular-nums tracking-tight" style={{ color: "var(--parchment)" }}>
                  {balance.lamports != null ? lamportsToSolString(balance.lamports) : "—"}
                  <span className="ml-1.5 text-lg font-normal" style={{ color: "var(--gold)" }}>SOL</span>
                </p>
              </section>
            )}

            {/* Network opportunity — lead with the big number */}
            <ProtocolStats />

            {/* Protocol — mint/burn + reserve side by side */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <XGoldCard />
              <ReserveCard />
            </div>

            {/* AGX vault details */}
            <VaultCard />

            {/* Revenue model — fee structure + projections */}
            <RevenueModel />

            {/* x402 payment gateway */}
            <X402Gateway />

            {/* How it works */}
            <section
              className="border corner-brackets p-6 relative"
              style={{ background: "var(--void)", borderColor: "var(--carbon)" }}
            >
              <span className="kanji-watermark text-[100px] -top-4 right-4" aria-hidden="true">鋳造</span>
              <p className="relative font-display text-[10px] uppercase tracking-[0.3em] mb-5 font-bold" style={{ color: "var(--gold)" }}>
                How it works
              </p>
              <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  {
                    step: "01",
                    title: "Connect & Verify",
                    desc: "Connect your Solana wallet. AGX authenticates your account and confirms your reserve allocation across all 5 metals.",
                  },
                  {
                    step: "02",
                    title: "Mint Your Token",
                    desc: "Deposit SOL as collateral. Obsidian mints xGOLD · xSLVR · xGLDD · xSLVD · xGLDB 1:1 against verified AGX vault units. 0.25% mint fee.",
                  },
                  {
                    step: "03",
                    title: "Burn to Redeem",
                    desc: "Burn your token to unlock collateral or redeem physical metal. Reserve ratio attested daily via Light Protocol ZK proofs. 0.25% burn fee.",
                  },
                ].map(({ step, title, desc }) => (
                  <div
                    key={step}
                    className="flex flex-col gap-2 p-4 corner-brackets"
                    style={{ background: "var(--dark2)", border: "1px solid var(--carbon)" }}
                  >
                    <span className="font-display text-xs font-black tracking-[0.2em]" style={{ color: "var(--gold)" }}>{step}</span>
                    <p className="font-display text-sm font-bold tracking-[0.1em]" style={{ color: "var(--parchment)" }}>{title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--gray)" }}>{desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
